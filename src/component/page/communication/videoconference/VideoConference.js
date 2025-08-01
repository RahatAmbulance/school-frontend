import {
    ControlBar,
    GridLayout,
    ParticipantTile,
    RoomAudioRenderer,
    useConnectionState,
    useLocalParticipant,
    useParticipants,
    useRoomContext,
    useTracks
} from "@livekit/components-react";
import './VideoConference.css';
import React, {useEffect, useRef, useState} from "react";
import {DataPacket_Kind, RoomEvent, Track} from "livekit-client";
import {format} from "date-fns";
import {Whiteboard} from "./Whiteboard";
import {ParticipantUsers} from "./participantUsers";
import {VirtualHand} from "./VirtualHand";
import {PollsQuizzes} from "./PollsQuizzes";
import {AttendanceTracker} from "./AttendanceTracker";
import "./AttendanceTracker.css";
import {PermissionControls} from "./PermissionControls";

export function VideoConference({userName, roomInfo, userRole}) {
    const connectionState = useConnectionState();
    const participants = useParticipants();
    const {localParticipant} = useLocalParticipant();
    const room = useRoomContext();
    const videoContainerRef = useRef(null);

    const [chatMessages, setChatMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [activeTab, setActiveTab] = useState('video'); // 'video', 'whiteboard', 'hand', 'attendance', 'polls', 'participantUsers'
    const [layoutType, setLayoutType] = useState('grid'); // 'grid' or 'screenShare'
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [handRaisedCount, setHandRaisedCount] = useState(0);
    const [viewMode, setViewMode] = useState('gallery'); // 'gallery' or 'speaker'
    const [activeSpeaker, setActiveSpeaker] = useState(null);

    // Permission state
    const [permissions, setPermissions] = useState({
        userPermissions: {}, // User-specific permissions
        globalPermissions: {} // Global room permissions
    });

    // Maximum file size (25MB in bytes)
    const MAX_FILE_SIZE = 25 * 1024 * 1024;

    // Separate tracks for screen share and participants
    const screenShareTrack = useTracks([
        {source: Track.Source.ScreenShare, withPlaceholder: false}
    ]).find(track => track.source === Track.Source.ScreenShare && track.participant);

    const participantTracks = useTracks([
        {source: Track.Source.Camera, withPlaceholder: true}
    ]).filter(track => track.participant);

    // Detect screen share and update layout
    useEffect(() => {
        if (screenShareTrack && screenShareTrack.participant) {
            setLayoutType('screenShare');
        } else {
            setLayoutType('grid');
        }
    }, [screenShareTrack]);

    // Setup permissions listener
    useEffect(() => {
        if (!room || !localParticipant) return;

        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === 'permission_update') {
                    // Update permissions state
                    setPermissions(prevPermissions => {
                        const newPermissions = {...prevPermissions};

                        // Update user-specific permissions
                        if (data.userPermissions && data.userPermissions[localParticipant.identity]) {
                            newPermissions.userPermissions = {
                                ...prevPermissions.userPermissions,
                                [localParticipant.identity]: data.userPermissions[localParticipant.identity]
                            };
                        }

                        // Update global permissions
                        if (data.globalPermissions) {
                            newPermissions.globalPermissions = {
                                ...prevPermissions.globalPermissions,
                                ...data.globalPermissions
                            };
                        }

                        return newPermissions;
                    });
                }
            } catch (e) {
                console.error('Error parsing permission update:', e);
            }
        };

        room.on(RoomEvent.DataReceived, handleDataReceived);

        return () => {
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [room, localParticipant]);

    // Setup chat message and hand raise listener
    useEffect(() => {
        if (!room || !localParticipant) return;

        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));

                if (data.type === 'chat') {
                    // Check if user has permission to see chat messages
                    if (!hasPermission('canSeeChat')) {
                        return;
                    }

                    const newMessage = {
                        id: Date.now().toString(),
                        sender: participant.identity,
                        senderRole: data.role || 'unknown',
                        text: data.message,
                        timestamp: new Date(),
                        isLocal: participant.identity === localParticipant.identity,
                        fileInfo: data.fileInfo
                    };

                    setChatMessages(prev => [...prev, newMessage]);
                } else if (data.type === 'hand_action') {
                    // Update hand raised count for badge display
                    if (data.action === 'raise') {
                        setHandRaisedCount(prev => prev + 1);
                    } else if (data.action === 'lower' || data.action === 'answer') {
                        setHandRaisedCount(prev => Math.max(0, prev - 1));
                    } else if (data.action === 'clear_all') {
                        setHandRaisedCount(0);
                    }
                }
            } catch (e) {
                console.error('Error parsing data message:', e);
            }
        };

        room.on(RoomEvent.DataReceived, handleDataReceived);

        return () => {
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [room, localParticipant]);

    // Auto-scroll chat to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current && activeTab === 'chat') {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages, activeTab]);

    // Check if user has a specific permission
    const hasPermission = (permissionName) => {
        // Teachers and admins typically have all permissions
        if (userRole === 'teacher' || userRole === 'admin') {
            return true;
        }

        // Check for globally disabled features
        if (permissions.globalPermissions &&
            permissions.globalPermissions[permissionName] === false) {
            return false;
        }

        // Check user-specific permissions
        const userPerms = permissions.userPermissions[localParticipant?.identity];
        if (userPerms && userPerms[permissionName] === false) {
            return false;
        }

        // Default to allowed if not explicitly restricted
        return true;
    };

    const sendChatMessage = async () => {
        if ((!messageText.trim() && !attachedFile) || !room || !localParticipant) return;

        // Check if user has permission to send chat messages
        if (!hasPermission('canSendChat')) {
            alert("You don't have permission to send chat messages.");
            return;
        }

        let fileInfo = null;

        // Handle file upload if a file is attached
        if (attachedFile) {
            // Check if user has permission to share files
            if (!hasPermission('canShareFiles')) {
                alert("You don't have permission to share files.");
                return;
            }

            setIsUploading(true);

            try {
                // Simulate file upload with progress
                for (let i = 0; i <= 100; i += 10) {
                    setUploadProgress(i);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // Create a data URL for preview (for demonstration purposes)
                // In a real app, you would upload to a server and get a URL back
                fileInfo = {
                    name: attachedFile.name,
                    size: attachedFile.size,
                    type: attachedFile.type,
                    // In a real implementation, this would be a URL from your server
                    dataUrl: filePreview,
                    timestamp: new Date().toISOString()
                };

            } catch (e) {
                console.error('Error uploading file:', e);
                alert('File upload failed. Please try again.');
                setIsUploading(false);
                setUploadProgress(0);
                return;
            }

            setIsUploading(false);
            setUploadProgress(0);
        }

        const message = {
            type: 'chat',
            message: messageText,
            sender: userName,
            role: userRole,
            timestamp: new Date().toISOString(),
            fileInfo: fileInfo
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);

        // Add message to local state
        const newMessage = {
            id: Date.now().toString(),
            sender: userName,
            senderRole: userRole,
            text: messageText,
            timestamp: new Date(),
            isLocal: true,
            fileInfo: fileInfo
        };

        setChatMessages(prev => [...prev, newMessage]);
        setMessageText('');
        setAttachedFile(null);
        setFilePreview(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    const formatTime = (date) => {
        return format(date, 'HH:mm');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check if user has permission to share files
        if (!hasPermission('canShareFiles')) {
            alert("You don't have permission to share files.");
            return;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            return;
        }

        setAttachedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            // For non-image files, just show the file name and icon
            setFilePreview(null);
        }
    };

    const cancelFileAttachment = () => {
        setAttachedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return '📷';
        if (fileType.startsWith('video/')) return '🎬';
        if (fileType.startsWith('audio/')) return '🎵';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('word') || fileType.includes('document')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📊';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const handleDownload = (fileInfo) => {
        // In a real implementation, this would download from your server
        // For this demo, we're just using the data URL directly
        const link = document.createElement('a');
        link.href = fileInfo.dataUrl;
        link.download = fileInfo.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Check if user should show permission controls (only for teachers/admins)
    const canManagePermissions = () => {
        return userRole === 'teacher' || userRole === 'admin';
    };

    // Handle full screen changes
    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(document.fullscreenElement !== null);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    // Toggle full screen
    const toggleFullScreen = async () => {
        try {
            if (!isFullScreen) {
                await videoContainerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    };

    // Add these state variables at the top with other useState declarations
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // Add active speaker detection
    useEffect(() => {
        if (!room) return;

        const handleSpeakingChanged = (participant, speaking) => {
            if (speaking) {
                setActiveSpeaker(participant);
            } else if (activeSpeaker === participant) {
                setActiveSpeaker(null);
            }
        };

        participants.forEach(participant => {
            participant.on('isSpeakingChanged', handleSpeakingChanged);
        });

        return () => {
            participants.forEach(participant => {
                participant.off('isSpeakingChanged', handleSpeakingChanged);
            });
        };
    }, [participants, room, activeSpeaker]);

    // Add this component for the side panel toggle button
    const SidePanelToggleButton = () => (
        <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: '8px',
                height: '40px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#fff',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
            title={isSidePanelOpen ? "Hide menu" : "Show menu"}
        >
            {isSidePanelOpen ? (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    Close Menu
                </>
            ) : (
                <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    Menu
                </>
            )}
        </button>
    );

    // Add this component for the side panel
    const SidePanel = () => {
        const tabButtons = [
            {
                id: 'video', label: 'Video', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 7l-7 5 7 5V7z"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                )
            },
            {
                id: 'whiteboard', label: 'Whiteboard', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 3h20v14H2z"/>
                        <path d="M8 21h8"/>
                        <path d="M12 17v4"/>
                    </svg>
                ), disabled: !hasPermission('canUseWhiteboard')
            },
            {
                id: 'hand', label: 'Raise Hand', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v6M12 8v6"/>
                        <path d="M8 12l4 4 4-4"/>
                    </svg>
                ), disabled: !hasPermission('canRaiseHand'), badge: handRaisedCount
            },
            {
                id: 'polls', label: 'Polls & Quizzes', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2z"/>
                        <path d="M7 10h10M7 14h10"/>
                    </svg>
                )
            },
            {
                id: 'participantUsers', label: 'Participants', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                )
            },
            {
                id: 'attendance', label: 'Attendance', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                ), disabled: !hasPermission('canViewAttendance') && userRole !== 'teacher' && userRole !== 'admin'
            }
        ];

        if (canManagePermissions()) {
            tabButtons.push({
                id: 'permissions',
                label: 'Permissions',
                icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                )
            });
        }

        return (
            <div style={{
                position: 'absolute',
                top: 0,
                right: isSidePanelOpen ? 0 : '-320px',
                width: '320px',
                height: '100%',
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(10px)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 900
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: '500'
                    }}>
                        Menu
                    </h2>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px'
                }}>
                    {tabButtons.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (window.innerWidth < 1200) {
                                    setIsSidePanelOpen(false);
                                }
                            }}
                            disabled={tab.disabled}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#fff',
                                cursor: tab.disabled ? 'not-allowed' : 'pointer',
                                opacity: tab.disabled ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.badge > 0 && (
                                <span style={{
                                    marginLeft: 'auto',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    borderRadius: '10px',
                                    padding: '2px 8px',
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Update the main return statement
    return (
        <div className={`conference ${isFullScreen ? 'fullscreen' : ''}`} ref={videoContainerRef}>
            <div className="conference-content">
                <div className={`main-content ${isChatOpen ? 'with-chat' : ''}`}>
                    <SidePanelToggleButton/>

                    {activeTab === 'video' && (
                        <div className="video-grid">
                            <button
                                className="view-toggle"
                                onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
                            >
                                {viewMode === 'gallery' ? (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <path d="M3 9h18"/>
                                            <path d="M9 3v18"/>
                                        </svg>
                                        Gallery View
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                                            <path d="M3 12h18"/>
                                        </svg>
                                        Speaker View
                                    </>
                                )}
                            </button>

                            {layoutType === 'screenShare' && screenShareTrack && screenShareTrack.participant ? (
                                <div className="screen-share-layout">
                                    <div className="screen-share-main">
                                        <GridLayout
                                            tracks={[screenShareTrack]}
                                            style={{'--lk-grid-gap': '0px'}}
                                        >
                                            <ParticipantTile/>
                                        </GridLayout>
                                    </div>
                                    <div className="screen-share-strip">
                                        <GridLayout
                                            tracks={participantTracks}
                                            style={{
                                                '--lk-grid-gap': '8px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <ParticipantTile className="participant-tile strip"/>
                                        </GridLayout>
                                    </div>
                                </div>
                            ) : viewMode === 'speaker' ? (
                                <div className="speaker-view">
                                    <div className="speaker-main">
                                        <GridLayout
                                            tracks={[activeSpeaker ?
                                                participantTracks.find(track => track.participant === activeSpeaker) :
                                                participantTracks[0]
                                            ].filter(Boolean)}
                                            style={{'--lk-grid-gap': '0px'}}
                                        >
                                            <ParticipantTile className="participant-tile main-speaker"/>
                                        </GridLayout>
                                    </div>
                                    <div className="speaker-strip">
                                        <GridLayout
                                            tracks={participantTracks.filter(track =>
                                                track.participant !== (activeSpeaker || participantTracks[0]?.participant)
                                            )}
                                            style={{
                                                '--lk-grid-gap': '8px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <ParticipantTile
                                                className="participant-tile strip"
                                            />
                                        </GridLayout>
                                    </div>
                                </div>
                            ) : (
                                <div className="gallery-view">
                                    <GridLayout
                                        tracks={participantTracks}
                                        style={{
                                            '--lk-grid-gap': '8px'
                                        }}
                                    >
                                        <ParticipantTile
                                            className={`participant-tile ${
                                                track => track.participant === activeSpeaker ? 'active-speaker' : ''
                                            }`}
                                        />
                                    </GridLayout>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'whiteboard' &&
                        <Whiteboard roomInfo={roomInfo} room={room} localParticipant={localParticipant}
                                    userRole={userRole}/>}
                    {activeTab === 'hand' &&
                        <VirtualHand room={room} localParticipant={localParticipant} userName={userName}
                                     userRole={userRole}/>}
                    {activeTab === 'polls' &&
                        <PollsQuizzes room={room} localParticipant={localParticipant} userName={userName}
                                      userRole={userRole}/>}
                    {activeTab === 'participantUsers' &&
                        <ParticipantUsers roomInfo={roomInfo} userName={userName} userRole={userRole}
                                          participants={participants}/>}
                    {activeTab === 'attendance' &&
                        <AttendanceTracker room={room} localParticipant={localParticipant} userName={userName}
                                           userRole={userRole} roomInfo={roomInfo}/>}
                    {activeTab === 'permissions' && canManagePermissions() &&
                        <PermissionControls room={room} localParticipant={localParticipant} participants={participants}
                                            userRole={userRole}/>}
                </div>

                {/* Chat Side Panel */}
                {isChatOpen && hasPermission('canSeeChat') && (
                    <div className="chat-panel">
                        <div className="chat-header">
                            <h3>Chat</h3>
                            <button onClick={() => setIsChatOpen(false)}>✕</button>
                        </div>

                        <div className="chat-messages" ref={chatContainerRef}>
                            {chatMessages.length === 0 ? (
                                <div className="empty-chat">
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                chatMessages.map((msg) => (
                                    <div key={msg.id} className={`message ${msg.isLocal ? 'local' : 'remote'}`}>
                                        <div className="message-header">
                                            <span
                                                className={msg.isLocal ? 'sender-local' : 'sender-remote'}>{msg.sender}</span>
                                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                                        </div>

                                        {msg.text && (
                                            <div className="message-content">{msg.text}</div>
                                        )}

                                        {msg.fileInfo && (
                                            <div className="file-attachment"
                                                 onClick={() => handleDownload(msg.fileInfo)}>
                                                {msg.fileInfo.type.startsWith('image/') ? (
                                                    <img src={msg.fileInfo.dataUrl} alt={msg.fileInfo.name}/>
                                                ) : (
                                                    <div className="file-info">
                                                        <span
                                                            className="file-icon">{getFileIcon(msg.fileInfo.type)}</span>
                                                        <div className="file-details">
                                                            <div className="file-name">{msg.fileInfo.name}</div>
                                                            <div
                                                                className="file-size">{formatFileSize(msg.fileInfo.size)}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="chat-input">
                            <div className="input-container">
                                {attachedFile && (
                                    <div className="file-preview">
                                        <div className="file-preview-content">
                                            <span className="file-icon">{getFileIcon(attachedFile.type)}</span>
                                            <div className="file-info">
                                                <div className="file-name">{attachedFile.name}</div>
                                                <div className="file-size">{formatFileSize(attachedFile.size)}</div>
                                            </div>
                                        </div>
                                        <button className="remove-file" onClick={cancelFileAttachment}
                                                title="Remove file">×
                                        </button>
                                    </div>
                                )}

                                {isUploading && (
                                    <div className="upload-progress">
                                        <div className="upload-progress-bar" style={{width: `${uploadProgress}%`}}/>
                                    </div>
                                )}

                                <textarea
                                    className="chat-textarea"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={hasPermission('canSendChat') ? "Type your message..." : "You don't have permission to send messages"}
                                    disabled={isUploading || !hasPermission('canSendChat')}
                                    rows={2}
                                />

                                <div className="chat-controls">
                                    <button
                                        className="attach-button"
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={isUploading || attachedFile || !hasPermission('canShareFiles')}
                                        title={hasPermission('canShareFiles') ? "Attach file (max 25MB)" : "File sharing disabled"}
                                    >
                                        📎
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="file-input"
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                                    />

                                    <button
                                        className="send-button"
                                        onClick={sendChatMessage}
                                        disabled={isUploading || (!messageText.trim() && !attachedFile) || !hasPermission('canSendChat')}
                                    >
                                        {isUploading ? (
                                            <span>Uploading... {uploadProgress}%</span>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                     stroke="currentColor" strokeWidth="2">
                                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                                </svg>
                                                Send
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Side Panel */}
                <SidePanel/>

                <RoomAudioRenderer/>

                {/* Controls */}
                <div className="controls-container">
                    <ControlBar
                        className="control-bar"
                        controls={{
                            camera: true,
                            microphone: true,
                            screenShare: hasPermission('canShareScreen'),
                            leave: true
                        }}
                        variation="minimal"
                    />

                    {hasPermission('canSeeChat') && (
                        <button
                            className="control-button chat-toggle"
                            onClick={() => setIsChatOpen(!isChatOpen)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            {!isChatOpen && chatMessages.length > 0 && (
                                <span className="message-badge">{chatMessages.length}</span>
                            )}
                        </button>
                    )}

                    <button
                        className="control-button fullscreen-toggle"
                        onClick={toggleFullScreen}
                    >
                        {isFullScreen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                                <path
                                    d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                            </svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                                <path
                                    d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}