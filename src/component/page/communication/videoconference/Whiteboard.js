import React, {useCallback, useEffect, useRef, useState} from "react";
import {DataPacket_Kind} from "livekit-client";
import {
    Backspace as EraseIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    CropSquare as SquareIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    GetApp as DownloadIcon,
    GridOn as GridIcon,
    Image as ImageIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
    PanTool as HandIcon,
    Publish as UploadIcon,
    RadioButtonUnchecked as CircleIcon,
    Save as SaveIcon,
    TextFields as TextIcon
} from "@mui/icons-material";
import {Box, Checkbox, Divider, FormControlLabel, IconButton, Paper, Slider, Tooltip, Typography} from "@mui/material";
import './Whiteboard.css';

export function Whiteboard({roomInfo, room, localParticipant, userRole}) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingData, setDrawingData] = useState([]);
    const [drawingTool, setDrawingTool] = useState('pen');
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [canvasHistory, setCanvasHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Classroom specific states
    const [pages, setPages] = useState([[]]);
    const [currentPage, setCurrentPage] = useState(0);
    const [locked, setLocked] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [studentPermissions, setStudentPermissions] = useState({
        canDraw: true,
        canErase: true,
        canAddText: true,
        canAddShapes: true,
        canChangePages: false
    });

    const startPoint = useRef({x: 0, y: 0});
    const currentPath = useRef([]);
    const imageInputRef = useRef(null);
    const stateFileInputRef = useRef(null);

    // Initialize canvas when component mounts
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';

        // Resize canvas to fit container
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (!container) return;

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            redrawCanvas();
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Setup data channel listener for whiteboard events
        if (room) {
            const handleDataReceived = (payload, participant) => {
                try {
                    const data = JSON.parse(new TextDecoder().decode(payload));
                    if (data.type === 'whiteboard') {
                        handleRemoteAction(data);
                    }
                } catch (e) {
                    console.error('Error parsing whiteboard data:', e);
                }
            };

            room.on('DataReceived', handleDataReceived);

            return () => {
                window.removeEventListener('resize', resizeCanvas);
                room.off('DataReceived', handleDataReceived);
            };
        }

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [room]);

    // Effect to load current page data
    useEffect(() => {
        setDrawingData(pages[currentPage] || []);
        redrawCanvas();
    }, [currentPage, pages]);

    // Redraw canvas with all drawing data
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid if enabled
        if (showGrid) {
            drawGrid(context, canvas.width, canvas.height);
        }

        drawingData.forEach((pathData) => {
            if (pathData.tool === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
            } else {
                context.globalCompositeOperation = 'source-over';
            }

            context.strokeStyle = pathData.color || '#000000';
            context.lineWidth = pathData.width || 3;

            context.beginPath();

            if (pathData.tool === 'rectangle') {
                context.rect(
                    pathData.points[0].x,
                    pathData.points[0].y,
                    pathData.points[1].x - pathData.points[0].x,
                    pathData.points[1].y - pathData.points[0].y
                );
                context.stroke();
            } else if (pathData.tool === 'circle') {
                const dx = pathData.points[1].x - pathData.points[0].x;
                const dy = pathData.points[1].y - pathData.points[0].y;
                const radius = Math.sqrt(dx * dx + dy * dy);

                context.beginPath();
                context.arc(pathData.points[0].x, pathData.points[0].y, radius, 0, Math.PI * 2);
                context.stroke();
            } else if (pathData.tool === 'text' && pathData.text) {
                context.font = `${pathData.width * 5}px Arial`;
                context.fillStyle = pathData.color || '#000000';
                context.fillText(pathData.text, pathData.points[0].x, pathData.points[0].y);
            } else if (pathData.tool === 'image' && pathData.imageData) {
                const img = new Image();
                img.onload = () => {
                    context.drawImage(
                        img,
                        pathData.points[0].x,
                        pathData.points[0].y,
                        pathData.width,
                        pathData.height
                    );
                };
                img.src = pathData.imageData;
            } else if (pathData.points && pathData.points.length > 0) {
                // Pen and eraser
                context.beginPath();
                context.moveTo(pathData.points[0].x, pathData.points[0].y);

                for (let i = 1; i < pathData.points.length; i++) {
                    context.lineTo(pathData.points[i].x, pathData.points[i].y);
                }
                context.stroke();
            }
        });

        // Reset composite operation
        context.globalCompositeOperation = 'source-over';
    }, [drawingData, showGrid]);

    // Draw grid on canvas
    const drawGrid = (context, width, height) => {
        context.save();
        context.strokeStyle = '#ddd';
        context.lineWidth = 0.5;

        // Draw vertical lines
        for (let x = 0; x <= width; x += 20) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += 20) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }

        context.restore();
    };

    // Handle remote actions received
    const handleRemoteAction = useCallback((data) => {
        if (!data || !data.action) return;

        switch (data.action) {
            case 'draw':
                if (data.page === currentPage) {
                    setDrawingData(prevData => {
                        if (!data.pathData) return prevData;
                        const newData = [...prevData, data.pathData];
                        saveToHistory(newData);
                        return newData;
                    });
                }

                // Update the pages array
                setPages(prevPages => {
                    if (!data.pathData || data.page === undefined) return prevPages;
                    const newPages = [...prevPages];
                    while (newPages.length <= data.page) {
                        newPages.push([]);
                    }
                    const pageData = [...(newPages[data.page] || []), data.pathData];
                    newPages[data.page] = pageData;
                    return newPages;
                });
                break;

            case 'clear':
                if (data.page === currentPage) {
                    setDrawingData([]);
                    saveToHistory([]);
                }

                setPages(prevPages => {
                    if (data.page === undefined) return prevPages;
                    const newPages = [...prevPages];
                    if (data.page < newPages.length) {
                        newPages[data.page] = [];
                    }
                    return newPages;
                });
                break;

            case 'changePage':
                if (userRole === 'student' && !studentPermissions.canChangePages && data.pageNumber !== undefined) {
                    setCurrentPage(data.pageNumber);
                }
                break;

            case 'addPage':
                setPages(prevPages => [...prevPages, []]);
                break;

            case 'updatePermissions':
                if (userRole === 'student' && data.permissions) {
                    setStudentPermissions(data.permissions);
                    if (data.permissions.locked !== undefined) {
                        setLocked(data.permissions.locked);
                    }
                }
                break;

            case 'raiseHand':
                // For teacher to see raised hands
                console.log(`Student ${data.sender} raised hand`);
                break;

            case 'toggleGrid':
                if (data.showGrid !== undefined) {
                    setShowGrid(data.showGrid);
                }
                break;

            default:
                console.log(`Unknown whiteboard action: ${data.action}`);
        }
    }, [currentPage, studentPermissions, userRole]);

    // Send action data to other participants
    const sendAction = useCallback((action, data = {}) => {
        if (!room || !localParticipant) return;

        const message = {
            type: 'whiteboard',
            action: action,
            ...data,
            sender: localParticipant.identity,
            role: userRole,
            timestamp: new Date().toISOString()
        };

        try {
            const encodedData = new TextEncoder().encode(JSON.stringify(message));
            room.localParticipant.publishData(encodedData, DataPacket_Kind.RELIABLE);
        } catch (err) {
            console.error("Error sending whiteboard data:", err);
        }
    }, [room, localParticipant, userRole]);

    // Save current drawing state to history
    const saveToHistory = useCallback((newData) => {
        setCanvasHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(JSON.stringify(newData));

            // Update history index
            setHistoryIndex(newHistory.length - 1);

            // Update the current page data in pages array
            setPages(prevPages => {
                const newPages = [...prevPages];
                newPages[currentPage] = newData;
                return newPages;
            });

            return newHistory;
        });
    }, [historyIndex, currentPage]);

    // Handle mouse down event
    const handleMouseDown = useCallback((e) => {
        if (!canvasRef.current || (locked && userRole === 'student')) return;

        // Check student permissions
        if (userRole === 'student') {
            if (!studentPermissions.canDraw && drawingTool !== 'text') return;
            if (!studentPermissions.canErase && drawingTool === 'eraser') return;
            if (!studentPermissions.canAddText && drawingTool === 'text') return;
            if (!studentPermissions.canAddShapes &&
                (drawingTool === 'rectangle' || drawingTool === 'circle')) return;
        }

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        startPoint.current = {x, y};
        currentPath.current = [{x, y}];

        if (drawingTool === 'text') {
            const text = prompt('Enter text:');
            if (text) {
                const newPathData = {
                    tool: 'text',
                    points: [{x, y}],
                    color: strokeColor,
                    width: strokeWidth,
                    text: text
                };

                setDrawingData(prevData => {
                    const newData = [...prevData, newPathData];
                    saveToHistory(newData);
                    return newData;
                });

                sendAction('draw', {pathData: newPathData, page: currentPage});
            }
        }
    }, [
        locked, userRole, studentPermissions, drawingTool,
        strokeColor, strokeWidth, saveToHistory, sendAction, currentPage
    ]);

    // Handle mouse move event
    const handleMouseMove = useCallback((e) => {
        if (!isDrawing || !canvasRef.current || (locked && userRole === 'student')) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const context = canvas.getContext('2d');
        if (!context) return;

        if (drawingTool === 'pen' || drawingTool === 'eraser') {
            currentPath.current.push({x, y});

            // Redraw canvas with current path
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid if enabled
            if (showGrid) {
                drawGrid(context, canvas.width, canvas.height);
            }

            redrawCanvas();

            // Draw current path
            if (drawingTool === 'eraser') {
                context.globalCompositeOperation = 'destination-out';
            } else {
                context.globalCompositeOperation = 'source-over';
            }

            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;

            context.beginPath();
            context.moveTo(currentPath.current[0].x, currentPath.current[0].y);

            for (let i = 1; i < currentPath.current.length; i++) {
                context.lineTo(currentPath.current[i].x, currentPath.current[i].y);
            }
            context.stroke();

            // Reset composite operation
            context.globalCompositeOperation = 'source-over';
        } else if (drawingTool === 'rectangle' || drawingTool === 'circle') {
            // Redraw canvas without the shape
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid if enabled
            if (showGrid) {
                drawGrid(context, canvas.width, canvas.height);
            }

            redrawCanvas();

            // Draw current shape
            context.strokeStyle = strokeColor;
            context.lineWidth = strokeWidth;

            if (drawingTool === 'rectangle') {
                context.beginPath();
                context.rect(
                    startPoint.current.x,
                    startPoint.current.y,
                    x - startPoint.current.x,
                    y - startPoint.current.y
                );
                context.stroke();
            } else if (drawingTool === 'circle') {
                const dx = x - startPoint.current.x;
                const dy = y - startPoint.current.y;
                const radius = Math.sqrt(dx * dx + dy * dy);

                context.beginPath();
                context.arc(startPoint.current.x, startPoint.current.y, radius, 0, Math.PI * 2);
                context.stroke();
            }
        }
    }, [
        isDrawing, locked, userRole, drawingTool,
        strokeColor, strokeWidth, showGrid, redrawCanvas
    ]);

    // Handle mouse up event
    const handleMouseUp = useCallback((e) => {
        if (!isDrawing || !canvasRef.current || (locked && userRole === 'student')) return;

        let x = 0, y = 0;

        if (e?.clientX && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        let newPathData = null;

        if (drawingTool === 'pen' || drawingTool === 'eraser') {
            if (e?.clientX) {
                currentPath.current.push({x, y});
            }

            if (currentPath.current.length > 0) {
                newPathData = {
                    tool: drawingTool,
                    points: [...currentPath.current],
                    color: strokeColor,
                    width: strokeWidth
                };
            }
        } else if ((drawingTool === 'rectangle' || drawingTool === 'circle') && startPoint.current) {
            newPathData = {
                tool: drawingTool,
                points: [startPoint.current, {x, y}],
                color: strokeColor,
                width: strokeWidth
            };
        }

        if (newPathData) {
            setDrawingData(prevData => {
                const newData = [...prevData, newPathData];
                saveToHistory(newData);
                return newData;
            });

            sendAction('draw', {pathData: newPathData, page: currentPage});
        }

        setIsDrawing(false);
    }, [
        isDrawing, locked, userRole, drawingTool,
        strokeColor, strokeWidth, saveToHistory, sendAction, currentPage
    ]);

    // Handle touch events for mobile
    const handleTouchStart = useCallback((e) => {
        if (!e.touches || e.touches.length === 0) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {
            }
        });
    }, [handleMouseDown]);

    const handleTouchMove = useCallback((e) => {
        if (!e.touches || e.touches.length === 0) return;
        e.preventDefault();
        const touch = e.touches[0];
        handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {
            }
        });
    }, [handleMouseMove]);

    const handleTouchEnd = useCallback((e) => {
        e.preventDefault();
        handleMouseUp();
    }, [handleMouseUp]);

    // Clear the whiteboard
    const clearWhiteboard = useCallback(() => {
        setDrawingData([]);
        saveToHistory([]);
        sendAction('clear', {page: currentPage});
    }, [saveToHistory, sendAction, currentPage]);

    // Undo last drawing action
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);

            try {
                const prevState = JSON.parse(canvasHistory[newIndex]);
                setDrawingData(prevState);

                // Update the current page data in pages array
                setPages(prevPages => {
                    const newPages = [...prevPages];
                    newPages[currentPage] = prevState;
                    return newPages;
                });
            } catch (e) {
                console.error("Error parsing history state:", e);
            }
        } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            setDrawingData([]);

            // Update the current page data in pages array
            setPages(prevPages => {
                const newPages = [...prevPages];
                newPages[currentPage] = [];
                return newPages;
            });
        }
    }, [historyIndex, canvasHistory, currentPage]);

    // Redo last undone action
    const handleRedo = useCallback(() => {
        if (historyIndex < canvasHistory.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);

            try {
                const nextState = JSON.parse(canvasHistory[nextIndex]);
                setDrawingData(nextState);

                // Update the current page data in pages array
                setPages(prevPages => {
                    const newPages = [...prevPages];
                    newPages[currentPage] = nextState;
                    return newPages;
                });
            } catch (e) {
                console.error("Error parsing history state:", e);
            }
        }
    }, [historyIndex, canvasHistory, currentPage]);

    // Add a new page
    const handleAddPage = useCallback(() => {
        if (userRole === 'student' && !studentPermissions.canChangePages) return;

        setPages(prevPages => [...prevPages, []]);
        sendAction('addPage');
        // Switch to the new page
        const newPageIndex = pages.length;
        handleChangePage(newPageIndex);
    }, [userRole, studentPermissions, pages.length, sendAction]);

    // Change page
    const handleChangePage = useCallback((pageNumber) => {
        if (userRole === 'student' && !studentPermissions.canChangePages) return;

        if (pageNumber >= 0 && pageNumber < pages.length) {
            setCurrentPage(pageNumber);
            setDrawingData(pages[pageNumber] || []);

            // Reset history for the new page
            try {
                setCanvasHistory([JSON.stringify(pages[pageNumber] || [])]);
                setHistoryIndex(0);
            } catch (e) {
                console.error("Error stringifying page data:", e);
                setCanvasHistory([]);
                setHistoryIndex(-1);
            }

            sendAction('changePage', {pageNumber});
        }
    }, [userRole, studentPermissions, pages, sendAction]);

    // Toggle student lock
    const toggleLock = useCallback(() => {
        if (userRole !== 'teacher') return;

        const newLockedState = !locked;
        setLocked(newLockedState);

        const newPermissions = {
            ...studentPermissions,
            locked: newLockedState
        };

        sendAction('updatePermissions', {permissions: newPermissions});
    }, [userRole, locked, studentPermissions, sendAction]);

    // Update student permissions
    const updatePermissions = useCallback((permission, value) => {
        if (userRole !== 'teacher') return;

        const newPermissions = {...studentPermissions, [permission]: value};
        setStudentPermissions(newPermissions);
        sendAction('updatePermissions', {permissions: newPermissions});
    }, [userRole, studentPermissions, sendAction]);

    // Handle raising hand
    const toggleHandRaise = useCallback(() => {
        if (userRole !== 'student') return;

        const newHandRaised = !handRaised;
        setHandRaised(newHandRaised);
        sendAction('raiseHand', {raised: newHandRaised});
    }, [userRole, handRaised, sendAction]);

    // Toggle grid display
    const toggleGrid = useCallback(() => {
        const newGridState = !showGrid;
        setShowGrid(newGridState);
        sendAction('toggleGrid', {showGrid: newGridState});
        redrawCanvas();
    }, [showGrid, sendAction, redrawCanvas]);

    // Handle image upload
    const handleImageUpload = useCallback((e) => {
        if (!e.target.files || !e.target.files[0] || !canvasRef.current) return;

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            if (!event.target?.result) return;

            const imageData = event.target.result;

            // Create image element to get dimensions
            const img = new Image();
            img.onload = () => {
                // Calculate dimensions to fit within canvas
                const canvas = canvasRef.current;
                if (!canvas) return;

                const maxWidth = canvas.width * 0.5;
                const maxHeight = canvas.height * 0.5;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width *= ratio;
                    height *= ratio;
                }

                if (height > maxHeight) {
                    const ratio = maxHeight / height;
                    width *= ratio;
                    height *= ratio;
                }

                // Position image in center of canvas
                const x = (canvas.width - width) / 2;
                const y = (canvas.height - height) / 2;

                const newPathData = {
                    tool: 'image',
                    points: [{x, y}],
                    imageData,
                    width,
                    height
                };

                setDrawingData(prevData => {
                    const newData = [...prevData, newPathData];
                    saveToHistory(newData);
                    return newData;
                });

                sendAction('draw', {pathData: newPathData, page: currentPage});
            };

            img.src = imageData.toString();
        };

        reader.readAsDataURL(file);
        // Reset file input
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    }, [canvasRef, saveToHistory, sendAction, currentPage]);

    // Export canvas as image
    const exportCanvas = useCallback(() => {
        if (!canvasRef.current) return;

        try {
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `whiteboard-page-${currentPage + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Error exporting canvas:", e);
            alert("Failed to export canvas. Please try again.");
        }
    }, [currentPage]);

    // Save whiteboard state
    const saveWhiteboardState = useCallback(() => {
        try {
            const state = {
                pages,
                currentPage
            };

            const blob = new Blob([JSON.stringify(state)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'whiteboard-state.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Error saving whiteboard state:", e);
            alert("Failed to save whiteboard state. Please try again.");
        }
    }, [pages, currentPage]);

    // Load whiteboard state
    const loadWhiteboardState = useCallback((e) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                if (!event.target?.result) return;
                const state = JSON.parse(event.target.result.toString());

                if (state.pages && Array.isArray(state.pages)) {
                    setPages(state.pages);

                    const pageToLoad = Math.min(
                        state.currentPage !== undefined ? state.currentPage : 0,
                        state.pages.length - 1
                    );
                    setCurrentPage(pageToLoad);
                    setDrawingData(state.pages[pageToLoad] || []);

                    // Reset history
                    try {
                        setCanvasHistory([JSON.stringify(state.pages[pageToLoad] || [])]);
                        setHistoryIndex(0);
                    } catch (e) {
                        console.error("Error creating history from state:", e);
                        setCanvasHistory([]);
                        setHistoryIndex(-1);
                    }
                }
            } catch (e) {
                console.error('Error loading whiteboard state:', e);
                alert('Invalid whiteboard state file');
            }
        };

        reader.readAsText(file);
        // Reset file input
        if (stateFileInputRef.current) {
            stateFileInputRef.current.value = '';
        }
    }, []);

    // Determine if current user can edit the whiteboard
    const canEdit = userRole === 'teacher' || (userRole === 'student' && !locked);

    return (
        <Box className="whiteboard-container flex flex-col h-full" sx={{position: 'relative'}}>
            <Paper elevation={1} className="whiteboard-toolbar p-2 flex flex-wrap items-center gap-2 border-b">
                <Box className="tool-group flex items-center gap-1">
                    <Tooltip title="Pen">
                        <IconButton
                            color={drawingTool === 'pen' ? 'primary' : 'default'}
                            onClick={() => setDrawingTool('pen')}
                            disabled={userRole === 'student' && (!studentPermissions.canDraw || locked)}
                            size="small"
                        >
                            <EditIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eraser">
                        <IconButton
                            color={drawingTool === 'eraser' ? 'primary' : 'default'}
                            onClick={() => setDrawingTool('eraser')}
                            disabled={userRole === 'student' && (!studentPermissions.canErase || locked)}
                            size="small"
                        >
                            <EraseIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Rectangle">
                        <IconButton
                            color={drawingTool === 'rectangle' ? 'primary' : 'default'}
                            onClick={() => setDrawingTool('rectangle')}
                            disabled={userRole === 'student' && (!studentPermissions.canAddShapes || locked)}
                            size="small"
                        >
                            <SquareIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Circle">
                        <IconButton
                            color={drawingTool === 'circle' ? 'primary' : 'default'}
                            onClick={() => setDrawingTool('circle')}
                            disabled={userRole === 'student' && (!studentPermissions.canAddShapes || locked)}
                            size="small"
                        >
                            <CircleIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Text">
                        <IconButton
                            color={drawingTool === 'text' ? 'primary' : 'default'}
                            onClick={() => setDrawingTool('text')}
                            disabled={userRole === 'student' && (!studentPermissions.canAddText || locked)}
                            size="small"
                        >
                            <TextIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider orientation="vertical" flexItem/>

                <Box className="color-width-group flex items-center gap-2">
                    <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        disabled={!canEdit}
                        style={{width: '24px', height: '24px'}}
                    />
                    <Box sx={{width: 100}}>
                        <Tooltip title="Stroke Width">
                            <Slider
                                value={strokeWidth}
                                onChange={(e, value) => setStrokeWidth(value)}
                                min={1}
                                max={20}
                                disabled={!canEdit}
                                size="small"
                            />
                        </Tooltip>
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem/>

                <Box className="history-group flex items-center gap-1">
                    <Tooltip title="Undo">
                        <IconButton
                            onClick={handleUndo}
                            disabled={historyIndex < 0 || !canEdit}
                            size="small"
                        >
                            <ChevronLeftIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Redo">
                        <IconButton
                            onClick={handleRedo}
                            disabled={historyIndex >= canvasHistory.length - 1 || !canEdit}
                            size="small"
                        >
                            <ChevronRightIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear">
                        <IconButton
                            onClick={clearWhiteboard}
                            disabled={!canEdit}
                            size="small"
                        >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider orientation="vertical" flexItem/>

                <Box className="page-navigation flex items-center gap-1">
                    <Typography variant="body2">
                        Page {currentPage + 1} / {pages.length}
                    </Typography>
                    <Tooltip title="Previous Page">
                        <IconButton
                            onClick={() => handleChangePage(currentPage - 1)}
                            disabled={(userRole === 'student' && !studentPermissions.canChangePages) || currentPage === 0}
                            size="small"
                        >
                            <ChevronLeftIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Next Page">
                        <IconButton
                            onClick={() => handleChangePage(currentPage + 1)}
                            disabled={(userRole === 'student' && !studentPermissions.canChangePages) || currentPage === pages.length - 1}
                            size="small"
                        >
                            <ChevronRightIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Page">
                        <IconButton
                            onClick={handleAddPage}
                            disabled={(userRole === 'student' && !studentPermissions.canChangePages)}
                            size="small"
                        >
                            <i className="fas fa-plus"/>
                        </IconButton>
                    </Tooltip>
                </Box>

                <Divider orientation="vertical" flexItem/>

                <Box className="advanced-tools flex items-center gap-1">
                    <Tooltip title="Toggle Grid">
                        <IconButton
                            onClick={toggleGrid}
                            color={showGrid ? "primary" : "default"}
                            size="small"
                        >
                            <GridIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Image">
                        <IconButton
                            onClick={() => imageInputRef.current?.click()}
                            disabled={!canEdit}
                            size="small"
                        >
                            <ImageIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        style={{display: 'none'}}
                        accept="image/*"
                    />
                    <Tooltip title="Save Whiteboard">
                        <IconButton onClick={saveWhiteboardState} size="small">
                            <SaveIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Load Whiteboard">
                        <IconButton onClick={() => stateFileInputRef.current?.click()} size="small">
                            <UploadIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <input
                        type="file"
                        ref={stateFileInputRef}
                        onChange={loadWhiteboardState}
                        style={{display: 'none'}}
                        accept="application/json"
                    />
                    <Tooltip title="Export as Image">
                        <IconButton onClick={exportCanvas} size="small">
                            <DownloadIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                </Box>

                {userRole === 'teacher' && (
                    <>
                        <Divider orientation="vertical" flexItem/>
                        <Box className="teacher-controls flex items-center gap-2">
                            <Tooltip title={locked ? "Unlock Student Access" : "Lock Student Access"}>
                                <IconButton onClick={toggleLock} color={locked ? "primary" : "default"} size="small">
                                    {locked ? <LockIcon fontSize="small"/> : <UnlockIcon fontSize="small"/>}
                                </IconButton>
                            </Tooltip>
                            <Box>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={studentPermissions.canDraw}
                                            onChange={(e) => updatePermissions('canDraw', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Draw</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={studentPermissions.canErase}
                                            onChange={(e) => updatePermissions('canErase', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Erase</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={studentPermissions.canAddText}
                                            onChange={(e) => updatePermissions('canAddText', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Text</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={studentPermissions.canAddShapes}
                                            onChange={(e) => updatePermissions('canAddShapes', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Shapes</Typography>}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={studentPermissions.canChangePages}
                                            onChange={(e) => updatePermissions('canChangePages', e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={<Typography variant="caption">Pages</Typography>}
                                />
                            </Box>
                        </Box>
                    </>
                )}

                {userRole === 'student' && (
                    <>
                        <Divider orientation="vertical" flexItem/>
                        <Box className="student-controls">
                            <Tooltip title={handRaised ? "Lower Hand" : "Raise Hand"}>
                                <IconButton
                                    onClick={toggleHandRaise}
                                    color={handRaised ? "primary" : "default"}
                                    size="small"
                                >
                                    <HandIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </>
                )}
            </Paper>

            <Box className="canvas-container flex-grow relative bg-gray-50" sx={{overflow: 'hidden'}}>
                {locked && userRole === 'student' && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.7)',
                            zIndex: 10
                        }}
                    >
                        <Typography variant="h6" color="textSecondary">
                            <LockIcon/> Whiteboard is locked by teacher
                        </Typography>
                    </Box>
                )}
                <canvas
                    ref={canvasRef}
                    className="whiteboard-canvas"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{width: '100%', height: '100%', touchAction: 'none'}}
                />
            </Box>
        </Box>
    );
}