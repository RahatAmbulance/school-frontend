import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import DateRangeIcon from "@mui/icons-material/DateRange";
import SubjectIcon from "@mui/icons-material/Subject";
import TitleIcon from "@mui/icons-material/Title";
import MessageIcon from "@mui/icons-material/Message";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import ImageIcon from "@mui/icons-material/Image";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import {useDispatch, useSelector} from "react-redux";
import ClearIcon from "@mui/icons-material/Clear";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import {fetchDailyTask} from "../../../page/daily-task/redux/DailyTaskActions";
import {selectSchoolDetails, selectUserActualData} from "../../../../common";

// Enhanced base64 and file utilities with comprehensive extension detection
const isBase64 = (str) => {
    try {
        if (str.startsWith('data:')) {
            return true;
        }
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
};

const getBase64MimeType = (base64String) => {
    if (base64String.startsWith('data:')) {
        const mimeMatch = base64String.match(/data:([^;]+);base64,/);
        return mimeMatch ? mimeMatch[1] : '';
    }

    // For plain base64, try to detect from file signature
    try {
        const actualBase64 = base64String.startsWith('data:') ? base64String.split(',')[1] : base64String;
        const binaryString = atob(actualBase64.substring(0, 50)); // Check first few bytes
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // File signature detection
        // PDF signature
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            return 'application/pdf';
        }

        // ZIP-based Office formats (docx, xlsx, pptx)
        if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
            if (bytes[2] === 0x03 && bytes[3] === 0x04) {
                // Try to detect specific Office format by looking deeper
                const longerBinary = atob(actualBase64.substring(0, 200));
                if (longerBinary.includes('word')) {
                    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                } else if (longerBinary.includes('xl')) {
                    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                } else if (longerBinary.includes('ppt')) {
                    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                } else {
                    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // Default to docx
                }
            }
            return 'application/zip';
        }

        // Old Office formats (doc, xls, ppt)
        if (bytes[0] === 0xD0 && bytes[1] === 0xCF && bytes[2] === 0x11 && bytes[3] === 0xE0) {
            return 'application/msword'; // Default to doc for old Office formats
        }

        // JPEG signature
        if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
            return 'image/jpeg';
        }

        // PNG signature
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
            return 'image/png';
        }

        // GIF signature
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
            return 'image/gif';
        }

        // Text file detection - check if all characters are printable
        const isText = bytes.every(byte =>
            (byte >= 32 && byte <= 126) || // Printable ASCII
            byte === 9 ||  // Tab
            byte === 10 || // Line feed
            byte === 13    // Carriage return
        );
        if (isText) {
            return 'text/plain';
        }

    } catch (e) {
        console.warn('Could not detect file type from base64 signature:', e);
    }

    return 'application/octet-stream'; // Default
};

// Comprehensive MIME type to extension mapping
const getMimeTypeExtension = (mimeType) => {
    const mimeToExt = {
        // PDF
        'application/pdf': 'pdf',

        // Word documents
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',

        // Excel spreadsheets
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/csv': 'csv',

        // PowerPoint
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',

        // Text files
        'text/plain': 'txt',
        'application/rtf': 'rtf',

        // Images
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/bmp': 'bmp',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',

        // Archives
        'application/zip': 'zip',
        'application/x-rar-compressed': 'rar',
        'application/x-7z-compressed': '7z',
        'application/gzip': 'gz',

        // Other common types
        'application/json': 'json',
        'application/xml': 'xml',
        'text/html': 'html',
        'text/css': 'css',
        'application/javascript': 'js',

        // Default
        'application/octet-stream': 'bin'
    };
    return mimeToExt[mimeType.toLowerCase()] || '';
};

const getFileExtensionFromBase64 = (base64String) => {
    if (isBase64(base64String)) {
        const mimeType = getBase64MimeType(base64String);
        if (mimeType) {
            return getMimeTypeExtension(mimeType);
        }
    }
    return '';
};

// Enhanced file extension detection with automatic fallback
const getFileExtension = (url) => {
    if (!url) return '';

    // Handle base64 files
    if (isBase64(url)) {
        const extension = getFileExtensionFromBase64(url);
        if (extension) return extension;

        // Fallback: try to detect from file content
        const mimeType = getBase64MimeType(url);
        return getMimeTypeExtension(mimeType) || 'bin';
    }

    // Handle regular URLs
    const urlWithoutQuery = url.split('?')[0];
    const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
    return extension || '';
};

const getFileTypeInfo = (url) => {
    const extension = getFileExtension(url);

    const fileTypes = {
        // PDF files
        'pdf': {
            type: 'PDF Document',
            icon: PictureAsPdfIcon,
            color: '#d32f2f',
            bgColor: 'rgba(211, 47, 47, 0.1)',
            category: 'document'
        },
        // Word documents
        'doc': {
            type: 'Word Document',
            icon: DescriptionIcon,
            color: '#1976d2',
            bgColor: 'rgba(25, 118, 210, 0.1)',
            category: 'document'
        },
        'docx': {
            type: 'Word Document',
            icon: DescriptionIcon,
            color: '#1976d2',
            bgColor: 'rgba(25, 118, 210, 0.1)',
            category: 'document'
        },
        // Excel files
        'xls': {
            type: 'Excel Spreadsheet',
            icon: TableChartIcon,
            color: '#388e3c',
            bgColor: 'rgba(56, 142, 60, 0.1)',
            category: 'spreadsheet'
        },
        'xlsx': {
            type: 'Excel Spreadsheet',
            icon: TableChartIcon,
            color: '#388e3c',
            bgColor: 'rgba(56, 142, 60, 0.1)',
            category: 'spreadsheet'
        },
        'csv': {
            type: 'CSV File',
            icon: TableChartIcon,
            color: '#388e3c',
            bgColor: 'rgba(56, 142, 60, 0.1)',
            category: 'spreadsheet'
        },
        // Text files
        'txt': {
            type: 'Text Document',
            icon: TextSnippetIcon,
            color: '#5f6368',
            bgColor: 'rgba(95, 99, 104, 0.1)',
            category: 'text'
        },
        'rtf': {
            type: 'Rich Text Document',
            icon: TextSnippetIcon,
            color: '#5f6368',
            bgColor: 'rgba(95, 99, 104, 0.1)',
            category: 'text'
        },
        // PowerPoint
        'ppt': {
            type: 'PowerPoint Presentation',
            icon: FileCopyIcon,
            color: '#ff6f00',
            bgColor: 'rgba(255, 111, 0, 0.1)',
            category: 'presentation'
        },
        'pptx': {
            type: 'PowerPoint Presentation',
            icon: FileCopyIcon,
            color: '#ff6f00',
            bgColor: 'rgba(255, 111, 0, 0.1)',
            category: 'presentation'
        },
        // Images
        'jpg': {
            type: 'JPEG Image',
            icon: ImageIcon,
            color: '#e91e63',
            bgColor: 'rgba(233, 30, 99, 0.1)',
            category: 'image'
        },
        'jpeg': {
            type: 'JPEG Image',
            icon: ImageIcon,
            color: '#e91e63',
            bgColor: 'rgba(233, 30, 99, 0.1)',
            category: 'image'
        },
        'png': {
            type: 'PNG Image',
            icon: ImageIcon,
            color: '#e91e63',
            bgColor: 'rgba(233, 30, 99, 0.1)',
            category: 'image'
        },
        'gif': {
            type: 'GIF Image',
            icon: ImageIcon,
            color: '#e91e63',
            bgColor: 'rgba(233, 30, 99, 0.1)',
            category: 'image'
        },
        // Archives
        'zip': {
            type: 'ZIP Archive',
            icon: FolderZipIcon,
            color: '#9c27b0',
            bgColor: 'rgba(156, 39, 176, 0.1)',
            category: 'archive'
        },
        'rar': {
            type: 'RAR Archive',
            icon: FolderZipIcon,
            color: '#9c27b0',
            bgColor: 'rgba(156, 39, 176, 0.1)',
            category: 'archive'
        },
        // Default for unknown types
        'default': {
            type: 'Document',
            icon: InsertDriveFileIcon,
            color: '#616161',
            bgColor: 'rgba(97, 97, 97, 0.1)',
            category: 'unknown'
        }
    };

    return fileTypes[extension] || fileTypes['default'];
};

// Enhanced filename generation with guaranteed extension
const generateFileName = (originalUrl, title = 'document', forceExtension = true) => {
    if (!originalUrl) return 'unknown_file.bin';

    let fileName = '';
    let detectedExtension = '';

    // Get base filename
    if (isBase64(originalUrl)) {
        // For base64, use title and detected extension
        const safeTitle = (title || 'document')
            .replace(/[^a-z0-9\s]/gi, '_')
            .replace(/\s+/g, '_')
            .toLowerCase()
            .substring(0, 50); // Limit length
        fileName = safeTitle;
        detectedExtension = getFileExtension(originalUrl);
    } else {
        // For regular URLs, extract filename
        const urlWithoutQuery = originalUrl.split('?')[0];
        const extractedName = urlWithoutQuery.split('/').pop() || 'document';
        fileName = decodeURIComponent(extractedName);

        // Check if filename already has extension
        const parts = fileName.split('.');
        if (parts.length > 1) {
            detectedExtension = parts.pop().toLowerCase();
            fileName = parts.join('.');
        } else {
            detectedExtension = getFileExtension(originalUrl);
        }
    }

    // Ensure extension is present
    if (forceExtension) {
        if (!detectedExtension) {
            // Try harder to detect extension
            const mimeType = isBase64(originalUrl) ? getBase64MimeType(originalUrl) : '';
            detectedExtension = getMimeTypeExtension(mimeType) || 'bin';
        }

        // Clean filename and add extension
        const cleanFileName = fileName.replace(/\.[^/.]+$/, ''); // Remove any existing extension
        return `${cleanFileName}.${detectedExtension}`;
    }

    return fileName;
};

const base64ToBlob = (base64String) => {
    try {
        let actualBase64 = base64String;
        let mimeType = 'application/octet-stream';

        // Handle data URLs
        if (base64String.startsWith('data:')) {
            const parts = base64String.split(',');
            if (parts.length === 2) {
                actualBase64 = parts[1];
                const mimeMatch = base64String.match(/data:([^;]+);base64,/);
                if (mimeMatch) {
                    mimeType = mimeMatch[1];
                }
            }
        } else {
            // For plain base64, detect MIME type
            mimeType = getBase64MimeType(base64String);
        }

        // Convert base64 to binary
        const binaryString = atob(actualBase64);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        return new Blob([bytes], {type: mimeType});
    } catch (error) {
        console.error('Error converting base64 to blob:', error);
        throw new Error('Invalid base64 data');
    }
};

// Custom hook for debounced search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Enhanced Styled Components with modern design
const StyledContainer = styled(Container)(({theme}) => ({
    padding: theme.spacing(3),
    minHeight: '100vh',
    background: `
        radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(120, 219, 226, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
    `,
}));

const ModernSearchContainer = styled(Card)(({theme}) => ({
    marginBottom: theme.spacing(4),
    background: 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: 24,
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
    overflow: 'visible',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        background: 'linear-gradient(145deg, #667eea, #764ba2, #f093fb)',
        borderRadius: 26,
        zIndex: -1,
    },
    '& .MuiTextField-root': {
        '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            borderRadius: 16,
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderWidth: 2,
            },
            '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'white',
                borderWidth: 3,
            },
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 600,
        },
        '& .MuiInputBase-input': {
            color: 'white',
            fontSize: '1.1rem',
        },
    },
}));

const StatsContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(4),
    flexWrap: 'wrap',
}));

const ModernStatCard = styled(Card)(({theme}) => ({
    padding: theme.spacing(3),
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    borderRadius: 20,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    },
}));

const GlassTableContainer = styled(Paper)(({theme}) => ({
    borderRadius: 24,
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
    },
}));

const ModernDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        borderRadius: 24,
        padding: theme.spacing(2),
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    }
}));

const DetailRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
    },
    '& td': {
        padding: theme.spacing(3),
        borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
        fontSize: '1rem',
    }
}));

const ActionIconButton = styled(IconButton)(({theme}) => ({
    margin: theme.spacing(0.5),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'scale(1.2) rotate(10deg)',
    },
}));

// Enhanced download function with automatic extension handling
const downloadFile = async (fileData, providedFilename, title) => {
    try {
        let blob;
        let finalFilename;

        if (isBase64(fileData)) {
            // Handle base64 data
            blob = base64ToBlob(fileData);

            // Generate filename with guaranteed extension
            if (providedFilename) {
                // Use provided filename but ensure it has correct extension
                const detectedExt = getFileExtension(fileData);
                const hasExtension = providedFilename.includes('.');

                if (!hasExtension && detectedExt) {
                    finalFilename = `${providedFilename}.${detectedExt}`;
                } else if (hasExtension) {
                    // Verify the extension matches the detected type
                    const providedExt = providedFilename.split('.').pop().toLowerCase();
                    if (detectedExt && providedExt !== detectedExt) {
                        // Replace with correct extension
                        const nameWithoutExt = providedFilename.substring(0, providedFilename.lastIndexOf('.'));
                        finalFilename = `${nameWithoutExt}.${detectedExt}`;
                        toast.info(`📝 Extension corrected to .${detectedExt}`);
                    } else {
                        finalFilename = providedFilename;
                    }
                } else {
                    finalFilename = providedFilename;
                }
            } else {
                // Generate filename from title and detected extension
                finalFilename = generateFileName(fileData, title, true);
            }
        } else {
            // Handle regular URLs
            try {
                const response = await fetch(fileData);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                blob = await response.blob();

                // Try to get filename from response headers
                const contentDisposition = response.headers.get('content-disposition');
                let headerFilename = '';

                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch) {
                        headerFilename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }

                finalFilename = headerFilename || providedFilename || generateFileName(fileData, title, true);

                // Ensure extension for URL-based files too
                if (!finalFilename.includes('.')) {
                    const urlExtension = getFileExtension(fileData);
                    const contentType = response.headers.get('content-type');
                    const mimeExtension = getMimeTypeExtension(contentType || '');

                    const extension = urlExtension || mimeExtension || 'bin';
                    finalFilename = `${finalFilename}.${extension}`;
                    toast.info(`📝 Extension .${extension} added automatically`);
                }
            } catch (fetchError) {
                console.error('Fetch failed:', fetchError);
                throw fetchError;
            }
        }

        // Create and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        window.URL.revokeObjectURL(url);

        const fileInfo = getFileTypeInfo(fileData);
        toast.success(`📥 ${finalFilename} downloaded successfully!`, {
            icon: '📥',
        });

        return finalFilename;
    } catch (error) {
        console.error('Download error:', error);
        toast.error('❌ Failed to download file. Please try again.');
        throw error;
    }
};

// File preview utility with base64 support and extension handling
const openFilePreview = (fileData, title) => {
    try {
        const fileInfo = getFileTypeInfo(fileData);
        const extension = getFileExtension(fileData);

        if (fileInfo.category === 'document' && extension === 'pdf') {
            let pdfUrl;

            if (isBase64(fileData)) {
                // For base64 PDFs, create blob URL
                const blob = base64ToBlob(fileData);
                pdfUrl = window.URL.createObjectURL(blob);
            } else {
                // For regular URLs
                pdfUrl = fileData;
            }

            // Open in new tab
            const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');

            if (newWindow) {
                // Cleanup blob URL after a delay (for base64 files)
                if (isBase64(fileData)) {
                    setTimeout(() => {
                        window.URL.revokeObjectURL(pdfUrl);
                    }, 1000);
                }
                toast.info('📄 Opening PDF preview...');
            } else {
                toast.warning('⚠️ Popup blocked. Please allow popups for PDF preview.');
                // Fallback to download
                downloadFile(fileData, generateFileName(fileData, title, true), title);
            }
        } else {
            // For other files, download directly with proper extension
            downloadFile(fileData, generateFileName(fileData, title, true), title);
        }
    } catch (error) {
        console.error('Preview error:', error);
        toast.error('❌ Failed to preview file. Downloading instead...');
        downloadFile(fileData, generateFileName(fileData, title, true), title);
    }
};

// Enhanced File Display Component with extension info
const FileDisplay = ({fileUrl, title, showFileName = true, size = 'medium'}) => {
    if (!fileUrl) return null;

    const fileInfo = getFileTypeInfo(fileUrl);
    const autoGeneratedName = generateFileName(fileUrl, title, true);
    const IconComponent = fileInfo.icon;
    const extension = getFileExtension(fileUrl);

    const iconSize = {
        small: 16,
        medium: 20,
        large: 24,
    };

    return (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <IconComponent
                sx={{
                    fontSize: iconSize[size],
                    color: fileInfo.color
                }}
            />
            {showFileName && (
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: fileInfo.color,
                            fontWeight: 500,
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {autoGeneratedName}
                    </Typography>
                    {extension && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{display: 'block', fontSize: '0.7rem'}}
                        >
                            .{extension.toUpperCase()}
                        </Typography>
                    )}
                </Box>
            )}
            {isBase64(fileUrl) && (
                <Chip
                    label="Base64"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{fontSize: '0.7rem', height: 20}}
                />
            )}
        </Box>
    );
};

// Enhanced DailyTaskList Component (View Only)
const DailyTaskList = ({dailyTaskList, onView, searchQuery}) => {
    const [viewMode, setViewMode] = useState('table');
    const theme = useTheme();

    const highlightText = (text, query) => {
        if (!query || !text) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.toString().split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} style={{
                    backgroundColor: '#ffeb3b',
                    fontWeight: 'bold',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(255,235,59,0.3)'
                }}>
                    {part}
                </span>
            ) : part
        );
    };

    const handleFileAction = (fileData, dailyTask, action = 'download') => {
        if (!fileData) {
            toast.error('❌ No file available');
            return;
        }

        if (action === 'preview') {
            openFilePreview(fileData, dailyTask.title);
        } else {
            // Pass the task title for better filename generation
            downloadFile(fileData, undefined, dailyTask.title);
        }
    };

    // Card View Component with enhanced file handling (View Only)
    const CardView = () => (
        <Grid container spacing={3}>
            {dailyTaskList.map((dailyTask, index) => {
                const fileInfo = dailyTask.docs ? getFileTypeInfo(dailyTask.docs) : null;

                return (
                    <Grid item xs={12} sm={6} md={4} key={dailyTask.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                                }
                            }}
                        >
                            <CardContent sx={{flexGrow: 1, p: 3}}>
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <Avatar sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        mr: 2,
                                        width: 48,
                                        height: 48,
                                    }}>
                                        <SubjectIcon/>
                                    </Avatar>
                                    <Box sx={{flex: 1}}>
                                        <Chip
                                            label={highlightText(dailyTask.type, searchQuery)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{mb: 1}}
                                        />
                                        <Typography variant="h6" sx={{fontWeight: 700}}>
                                            {highlightText(dailyTask.title, searchQuery)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {highlightText(dailyTask.message, searchQuery)}
                                </Typography>

                                {/* Enhanced File Information */}
                                {dailyTask.docs && (
                                    <Box sx={{mb: 2}}>
                                        <FileDisplay fileUrl={dailyTask.docs} title={dailyTask.title} size="small"/>
                                    </Box>
                                )}

                                <Stack direction="row" spacing={1} sx={{mb: 2}}>
                                    <Chip
                                        icon={<SchoolIcon fontSize="small"/>}
                                        label={dailyTask.className}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={dailyTask.section}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                    />
                                </Stack>

                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <PersonIcon fontSize="small" sx={{mr: 1, color: 'text.secondary'}}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {dailyTask.staffName}
                                    </Typography>
                                </Box>

                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <DateRangeIcon fontSize="small" sx={{mr: 1, color: 'text.secondary'}}/>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(dailyTask.createdDate).toLocaleDateString("en-US", {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Typography>
                                </Box>
                            </CardContent>

                            <CardActions sx={{p: 2, pt: 0}}>
                                <Stack direction="row" spacing={1} sx={{width: '100%', justifyContent: 'center'}}>
                                    <Tooltip title="View Details" arrow>
                                        <ActionIconButton
                                            onClick={() => onView(dailyTask)}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                color: theme.palette.info.main,
                                                '&:hover': {
                                                    backgroundColor: theme.palette.info.light,
                                                    color: 'white',
                                                },
                                            }}
                                        >
                                            <VisibilityIcon fontSize="small"/>
                                        </ActionIconButton>
                                    </Tooltip>

                                    {dailyTask.docs && (
                                        <>
                                            {getFileExtension(dailyTask.docs) === 'pdf' && (
                                                <Tooltip title="Preview PDF" arrow>
                                                    <ActionIconButton
                                                        onClick={() => handleFileAction(dailyTask.docs, dailyTask, 'preview')}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                            color: theme.palette.secondary.main,
                                                            '&:hover': {
                                                                backgroundColor: theme.palette.secondary.light,
                                                                color: 'white',
                                                            },
                                                        }}
                                                    >
                                                        <OpenInNewIcon fontSize="small"/>
                                                    </ActionIconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title={`Download ${fileInfo.type}`} arrow>
                                                <ActionIconButton
                                                    onClick={() => handleFileAction(dailyTask.docs, dailyTask)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                        color: theme.palette.success.main,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.success.light,
                                                            color: 'white',
                                                        },
                                                    }}
                                                >
                                                    <DownloadIcon fontSize="small"/>
                                                </ActionIconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Stack>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );

    // Enhanced Table View (View Only)
    const TableView = () => (
        <GlassTableContainer elevation={0}>
            <TableContainer sx={{maxHeight: 600}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {['Subject', 'Title', 'Message', 'File', 'Date', 'Staff', 'Class', 'Actions'].map((header, index, array) => (
                                <TableCell
                                    key={header}
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        textAlign: 'center',
                                        borderRadius: index === 0 ? '8px 0 0 0' : index === array.length - 1 ? '0 8px 0 0' : '0',
                                    }}
                                >
                                    {header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dailyTaskList.map((dailyTask, index) => {
                            const fileInfo = dailyTask.docs ? getFileTypeInfo(dailyTask.docs) : null;

                            return (
                                <TableRow
                                    key={dailyTask.id}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? 'rgba(102, 126, 234, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            transform: 'scale(1.01)',
                                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.2)',
                                        },
                                    }}
                                >
                                    <TableCell sx={{textAlign: 'center', p: 2}}>
                                        <Chip
                                            label={highlightText(dailyTask.type, searchQuery)}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            icon={<SubjectIcon fontSize="small"/>}
                                        />
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2, maxWidth: '200px'}}>
                                        <Typography variant="body2" sx={{fontWeight: 600}}>
                                            {highlightText(dailyTask.title, searchQuery)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2, maxWidth: '250px'}}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {highlightText(dailyTask.message, searchQuery)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2}}>
                                        {dailyTask.docs ? (
                                            <FileDisplay fileUrl={dailyTask.docs} title={dailyTask.title} size="small"/>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary"
                                                        sx={{fontStyle: 'italic'}}>
                                                No file
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2}}>
                                        <Typography variant="body2">
                                            {new Date(dailyTask.createdDate).toLocaleDateString("en-US", {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <PersonIcon fontSize="small" sx={{mr: 1}}/>
                                            <Typography variant="body2">
                                                {highlightText(dailyTask.staffName, searchQuery)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2}}>
                                        <Stack spacing={1} alignItems="center">
                                            <Chip
                                                label={dailyTask.className}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={dailyTask.section}
                                                size="small"
                                                color="info"
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{textAlign: 'center', p: 2}}>
                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                                            <Tooltip title="View Details" arrow>
                                                <ActionIconButton
                                                    onClick={() => onView(dailyTask)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                        color: theme.palette.info.main,
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small"/>
                                                </ActionIconButton>
                                            </Tooltip>

                                            {dailyTask.docs && (
                                                <>
                                                    {getFileExtension(dailyTask.docs) === 'pdf' && (
                                                        <Tooltip title="Preview PDF" arrow>
                                                            <ActionIconButton
                                                                onClick={() => handleFileAction(dailyTask.docs, dailyTask, 'preview')}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                                                    color: theme.palette.secondary.main,
                                                                }}
                                                            >
                                                                <OpenInNewIcon fontSize="small"/>
                                                            </ActionIconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title={`Download ${fileInfo.type}`} arrow>
                                                        <ActionIconButton
                                                            onClick={() => handleFileAction(dailyTask.docs, dailyTask)}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                                color: theme.palette.success.main,
                                                            }}
                                                        >
                                                            <DownloadIcon fontSize="small"/>
                                                        </ActionIconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </GlassTableContainer>
    );

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{width: '100%'}}>
                {/* View Mode Toggle */}
                <Box sx={{mb: 3, display: 'flex', justifyContent: 'flex-end'}}>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant={viewMode === 'table' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('table')}
                            sx={{borderRadius: 2}}
                        >
                            Table View
                        </Button>
                        <Button
                            variant={viewMode === 'card' ? 'contained' : 'outlined'}
                            onClick={() => setViewMode('card')}
                            sx={{borderRadius: 2}}
                        >
                            Card View
                        </Button>
                    </Stack>
                </Box>

                {viewMode === 'table' ? <TableView/> : <CardView/>}
            </Box>
        </Fade>
    );
};

// Main StudentAssigment Component (View Only)
const StudentAssigment = ({items = []}) => {
    const [selectedDailyTask, setSelectedDailyTask] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {dailyTaskList, loading, error} = useSelector(
        (state) => state.dailyTask
    );

    // Debounced search query
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchDailyTask(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleViewDailyTask = (dailyTask) => {
        setSelectedDailyTask(dailyTask);
        setOpenDetails(true);
    };

    const handleSearch = useCallback((e) => {
        setSearchQuery(e.target.value);
    }, []);

    // Enhanced filtering logic focusing on subject, title, and message
    const filteredDailyTaskList = useMemo(() => {
        if (!Array.isArray(dailyTaskList)) return [];

        return dailyTaskList.filter((dailyTask) => {
            // First filter by user's class and section if userActualData exists
            if (userActualData?.className && dailyTask.className) {
                if (dailyTask.className !== userActualData.className) {
                    return false;
                }

                if (userActualData?.section && dailyTask.section &&
                    dailyTask.section !== userActualData.section) {
                    return false;
                }
            }

            // Enhanced search filtering - specifically for subject (type), title, and message
            if (!debouncedSearchQuery) return true;

            const searchFields = [
                dailyTask.type,    // Subject
                dailyTask.title,   // Title
                dailyTask.message, // Message
            ];

            const query = debouncedSearchQuery.toLowerCase();

            return searchFields.some(field =>
                field?.toLowerCase().includes(query)
            );
        });
    }, [dailyTaskList, userActualData, debouncedSearchQuery]);

    // Enhanced statistics with file type breakdown
    const stats = useMemo(() => {
        const total = filteredDailyTaskList.length;
        const withFiles = filteredDailyTaskList.filter(task => task.docs).length;
        const subjects = [...new Set(filteredDailyTaskList.map(task => task.type))].length;
        const recent = filteredDailyTaskList.filter(task => {
            const taskDate = new Date(task.createdDate);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return taskDate >= weekAgo;
        }).length;

        // Enhanced file type breakdown with base64 detection
        const fileTypes = filteredDailyTaskList
            .filter(task => task.docs)
            .reduce((acc, task) => {
                const fileInfo = getFileTypeInfo(task.docs);
                const isBase64File = isBase64(task.docs);
                const category = isBase64File ? `${fileInfo.category}_base64` : fileInfo.category;
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

        return {total, withFiles, subjects, recent, fileTypes};
    }, [filteredDailyTaskList]);

    return (
        <StyledContainer maxWidth="xl">
            <Box sx={{minHeight: '200px'}}>
                {loading ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
                        <Skeleton variant="rectangular" width="100%" height={150} sx={{borderRadius: 4}}/>
                        <Skeleton variant="rectangular" width="100%" height={100} sx={{borderRadius: 4}}/>
                        <Skeleton variant="rectangular" width="100%" height={600} sx={{borderRadius: 4}}/>
                    </Box>
                ) : error ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="60vh"
                    >
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 4,
                                boxShadow: '0 8px 32px rgba(244, 67, 54, 0.2)',
                                fontSize: '1.1rem',
                                p: 3,
                            }}
                        >
                            {error}
                        </Alert>
                    </Box>
                ) : (
                    <>
                        {/* Enhanced Search Container */}
                        <ModernSearchContainer>
                            <CardContent sx={{p: 4}}>
                                <Typography variant="h4" sx={{mb: 3, fontWeight: 700, textAlign: 'center'}}>
                                    📚 Daily Activities Hub
                                </Typography>
                                <TextField
                                    label="🔍 Search by Subject, Title, or Message"
                                    variant="outlined"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    fullWidth
                                    size="large"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{color: 'rgba(255,255,255,0.9)', fontSize: '1.5rem'}}/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={handleClearSearch}
                                                    size="large"
                                                    sx={{color: 'rgba(255,255,255,0.9)'}}
                                                >
                                                    <ClearIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {borderRadius: 3, fontSize: '1.2rem'}
                                    }}
                                />
                                <Box sx={{display: 'flex', gap: 2, mt: 3, justifyContent: 'center', flexWrap: 'wrap'}}>
                                    <Chip icon={<SubjectIcon/>} label="Subject" color="primary" variant="filled"/>
                                    <Chip icon={<TitleIcon/>} label="Title" color="secondary" variant="filled"/>
                                    <Chip icon={<MessageIcon/>} label="Message" color="success" variant="filled"/>
                                    <Chip icon={<AttachFileIcon/>} label="Smart File Extension Detection"
                                          color="warning" variant="filled"/>
                                </Box>
                            </CardContent>
                        </ModernSearchContainer>

                        {/* Enhanced Statistics Cards */}
                        <StatsContainer>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ModernStatCard>
                                        <Typography variant="h3" sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 800,
                                            mb: 1,
                                        }}>
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{fontWeight: 600}}>
                                            📋 Total Tasks
                                        </Typography>
                                    </ModernStatCard>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ModernStatCard>
                                        <Typography variant="h3" sx={{
                                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 800,
                                            mb: 1,
                                        }}>
                                            {stats.withFiles}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{fontWeight: 600}}>
                                            📎 With Files
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {Object.entries(stats.fileTypes).map(([type, count]) =>
                                                `${type.replace('_base64', ' (B64)')}: ${count}`
                                            ).join(', ')}
                                        </Typography>
                                    </ModernStatCard>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ModernStatCard>
                                        <Typography variant="h3" sx={{
                                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 800,
                                            mb: 1,
                                        }}>
                                            {stats.subjects}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{fontWeight: 600}}>
                                            📚 Subjects
                                        </Typography>
                                    </ModernStatCard>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <ModernStatCard>
                                        <Typography variant="h3" sx={{
                                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            fontWeight: 800,
                                            mb: 1,
                                        }}>
                                            {stats.recent}
                                        </Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{fontWeight: 600}}>
                                            🕒 This Week
                                        </Typography>
                                    </ModernStatCard>
                                </Grid>
                            </Grid>
                        </StatsContainer>

                        {/* Search Results Summary */}
                        {debouncedSearchQuery && (
                            <Box sx={{mb: 3}}>
                                <Card sx={{
                                    p: 2,
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    borderRadius: 3,
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                }}>
                                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                        <FilterListIcon color="primary"/>
                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                            Found {filteredDailyTaskList.length} results for "{debouncedSearchQuery}"
                                        </Typography>
                                        <Chip
                                            label={`${stats.withFiles} with files`}
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                        />
                                        {Object.entries(stats.fileTypes).map(([type, count]) => (
                                            <Chip
                                                key={type}
                                                label={`${count} ${type.replace('_base64', ' (B64)')}`}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                            />
                                        ))}
                                    </Stack>
                                </Card>
                            </Box>
                        )}

                        {/* Enhanced Task List (View Only) */}
                        <DailyTaskList
                            dailyTaskList={filteredDailyTaskList}
                            onView={handleViewDailyTask}
                            searchQuery={debouncedSearchQuery}
                        />

                        {/* Enhanced Details Dialog */}
                        <ModernDialog
                            open={openDetails}
                            onClose={() => setOpenDetails(false)}
                            fullWidth
                            maxWidth="lg"
                        >
                            <DialogTitle sx={{
                                textAlign: "center",
                                position: "relative",
                                pb: 3,
                                borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
                                typography: 'h4',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}>
                                📋 Daily Activity Details
                                <IconButton
                                    onClick={() => setOpenDetails(false)}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: 8,
                                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                        }
                                    }}
                                >
                                    <CloseIcon/>
                                </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{mt: 3, p: 4}}>
                                {selectedDailyTask ? (
                                    <Box>
                                        {/* Enhanced File Management Section for Base64 */}
                                        {selectedDailyTask.docs && (
                                            <Box sx={{
                                                mb: 4,
                                                p: 3,
                                                backgroundColor: 'rgba(102, 126, 234, 0.05)',
                                                borderRadius: 3
                                            }}>
                                                <Typography variant="h6"
                                                            sx={{mb: 2, fontWeight: 600, color: '#667eea'}}>
                                                    📎 Attached File {isBase64(selectedDailyTask.docs) && '(Base64)'}
                                                </Typography>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                                    <FileDisplay fileUrl={selectedDailyTask.docs}
                                                                 title={selectedDailyTask.title}/>
                                                </Box>
                                                <Stack direction="row" spacing={2}>
                                                    {getFileExtension(selectedDailyTask.docs) === 'pdf' && (
                                                        <Button
                                                            variant="outlined"
                                                            color="secondary"
                                                            startIcon={<OpenInNewIcon/>}
                                                            onClick={() => openFilePreview(selectedDailyTask.docs, selectedDailyTask.title)}
                                                            sx={{borderRadius: 3}}
                                                        >
                                                            Preview PDF
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<DownloadIcon/>}
                                                        onClick={() => downloadFile(selectedDailyTask.docs, undefined, selectedDailyTask.title)}
                                                        sx={{
                                                            borderRadius: 3,
                                                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                                                        }}
                                                    >
                                                        Download {getFileTypeInfo(selectedDailyTask.docs).type}
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        )}

                                        <Table>
                                            <TableBody>
                                                {[
                                                    {label: "📋 Subject", value: selectedDailyTask.type},
                                                    {label: "📝 Title", value: selectedDailyTask.title},
                                                    {
                                                        label: "📎 File Details",
                                                        value: selectedDailyTask.docs ? (
                                                            <Box>
                                                                <Stack spacing={2}>
                                                                    <FileDisplay fileUrl={selectedDailyTask.docs}
                                                                                 title={selectedDailyTask.title}/>
                                                                    <Box>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary"
                                                                                    display="block">
                                                                            Type: {getFileTypeInfo(selectedDailyTask.docs).type}
                                                                        </Typography>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary"
                                                                                    display="block">
                                                                            Format: {isBase64(selectedDailyTask.docs) ? 'Base64 Encoded' : 'Regular File'}
                                                                        </Typography>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary"
                                                                                    display="block">
                                                                            File: {generateFileName(selectedDailyTask.docs, selectedDailyTask.title, true)}
                                                                        </Typography>
                                                                        <Typography variant="caption"
                                                                                    color="text.secondary"
                                                                                    display="block">
                                                                            Extension:
                                                                            .{getFileExtension(selectedDailyTask.docs).toUpperCase()}
                                                                        </Typography>
                                                                    </Box>
                                                                </Stack>
                                                            </Box>
                                                        ) : (
                                                            <Typography color="text.secondary"
                                                                        sx={{fontStyle: 'italic'}}>
                                                                📭 No file attached
                                                            </Typography>
                                                        ),
                                                    },
                                                    {label: "💬 Message", value: selectedDailyTask.message},
                                                    {label: "👤 Staff Name", value: selectedDailyTask.staffName},
                                                    {label: "🎓 Class Name", value: selectedDailyTask.className},
                                                    {label: "📚 Section", value: selectedDailyTask.section},
                                                    {
                                                        label: "📅 Date Created",
                                                        value: new Date(selectedDailyTask.createdDate).toLocaleDateString("en-US", {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    },
                                                ].map((item, index) => (
                                                    <DetailRow key={item.label}>
                                                        <TableCell sx={{
                                                            fontWeight: 700,
                                                            width: '35%',
                                                            fontSize: '1.1rem',
                                                            color: '#667eea'
                                                        }}>
                                                            {item.label}
                                                        </TableCell>
                                                        <TableCell sx={{fontSize: '1.1rem'}}>
                                                            {item.value || (
                                                                <Typography color="text.secondary"
                                                                            sx={{fontStyle: 'italic'}}>
                                                                    ❌ Not available
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    </DetailRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Skeleton variant="rectangular" width="100%" height={400} sx={{borderRadius: 4}}/>
                                )}
                            </DialogContent>
                        </ModernDialog>
                    </>
                )}
            </Box>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                toastStyle={{
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 500,
                }}
            />
        </StyledContainer>
    );
};

export default StudentAssigment;
