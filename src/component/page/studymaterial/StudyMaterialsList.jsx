import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Box,
    Button,
    Card,
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
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import {deleteMaterial, fetchMaterials} from './redux/studyMaterialActions';
import AddEditMaterial from './AddEditMaterial';
import {selectSchoolDetails, selectUserActualData} from "../../../common";

const StudyMaterialsList = () => {
    const dispatch = useDispatch();
    const materials = useSelector((state) => state.studyMaterial.materials);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMaterials, setFilteredMaterials] = useState(materials);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const schoolId = userData?.id;

    useEffect(() => {
        dispatch(fetchMaterials(schoolId));
    }, [dispatch, schoolId]);

    useEffect(() => {
        if (materials) {
            setFilteredMaterials(
                materials.filter((material) =>
                    (material.title && material.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (material.subject && material.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            );
        }
    }, [searchQuery, materials]);

    const getMimeType = (extension) => {
        if (!extension) return 'application/octet-stream';
        const ext = extension.toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'word': 'application/msword',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'mov': 'video/quicktime',
            'txt': 'text/plain',
            'csv': 'text/csv',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    };

    const getDefaultExtension = (mimeType) => {
        const defaultExtensions = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'video/mp4': 'mp4',
            'video/webm': 'webm',
            'video/quicktime': 'mov',
            'text/plain': 'txt',
            'text/csv': 'csv',
            'application/zip': 'zip',
            'application/x-rar-compressed': 'rar'
        };
        return defaultExtensions[mimeType] || 'bin';
    };

    const handleDownload = (material) => {
        if (!material.fileContent) return;

        let extension = material.fileExtension?.toLowerCase();
        if (!extension || extension === 'undefined') {
            const mimeType = getMimeType(material.fileExtension);
            extension = getDefaultExtension(mimeType);
        }

        if (extension === 'word') {
            extension = 'doc';
        }

        const downloadFileName = material.fileName || `${material.title}.${extension}`;
        const mimeType = getMimeType(extension);

        const byteCharacters = atob(material.fileContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {type: mimeType});

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', downloadFileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleDelete = (id) => {
        dispatch(deleteMaterial(id));
    };

    const handleAddNew = () => {
        setSelectedMaterial(null);
        setIsModalOpen(true);
    };

    const handleEdit = (material) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMaterial(null);
    };

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Box sx={{mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h4" sx={{fontWeight: 600, color: '#1a237e'}}>
                    Study Materials
                </Typography>

                {userActualData?.role !== 'student' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={handleAddNew}
                        sx={{
                            backgroundColor: '#3f51b5',
                            '&:hover': {
                                backgroundColor: '#283593',
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        Add New Material
                    </Button>
                )}
            </Box>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by title or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: '#f5f5f5',
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{color: '#666'}}/>
                        </InputAdornment>
                    ),
                }}
            />

            <Grid container spacing={3}>
                {filteredMaterials.map((material) => (
                    <Grid item xs={12} sm={6} md={4} key={material.id}>
                        <Fade in={true}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                                    },
                                }}
                            >
                                <CardContent sx={{p: 3}}>
                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 2}}>
                                        {material.title}
                                    </Typography>

                                    <Box sx={{mb: 2}}>
                                        <Chip
                                            label={material.subject}
                                            size="small"
                                            sx={{mr: 1, mb: 1, backgroundColor: '#e3f2fd', color: '#1565c0'}}
                                        />
                                        <Chip
                                            label={material.className}
                                            size="small"
                                            sx={{mr: 1, mb: 1, backgroundColor: '#f3e5f5', color: '#7b1fa2'}}
                                        />
                                        <Chip
                                            label={material.fileExtension?.toUpperCase()}
                                            size="small"
                                            sx={{mb: 1, backgroundColor: '#e8f5e9', color: '#2e7d32'}}
                                        />
                                    </Box>

                                    <Box sx={{mb: 3}}>
                                        {material.fileContent && (
                                            <Button
                                                variant="outlined"
                                                startIcon={<DownloadIcon/>}
                                                size="small"
                                                onClick={() => handleDownload(material)}
                                                sx={{
                                                    mb: 1,
                                                    borderRadius: '8px',
                                                    textTransform: 'none',
                                                    borderColor: '#3f51b5',
                                                    color: '#3f51b5',
                                                    '&:hover': {
                                                        borderColor: '#283593',
                                                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                                                    },
                                                }}
                                            >
                                                Download File
                                            </Button>
                                        )}

                                        {material.multipleContent && material.multipleContent.length > 0 && (
                                            <Box sx={{mt: 2}}>
                                                <Typography variant="subtitle2" sx={{mb: 1, color: '#666'}}>
                                                    Additional Attachments:
                                                </Typography>
                                                {material.multipleContent.map((fileContent, index) => (
                                                    <Button
                                                        key={index}
                                                        variant="text"
                                                        startIcon={<DownloadIcon/>}
                                                        size="small"
                                                        href={`data:application/octet-stream;base64,${fileContent}`}
                                                        download={`${material.title}_attachment_${index + 1}.${material.type.toLowerCase()}`}
                                                        sx={{
                                                            display: 'block',
                                                            mb: 1,
                                                            color: '#666',
                                                            textTransform: 'none',
                                                            '&:hover': {
                                                                color: '#3f51b5',
                                                            },
                                                        }}
                                                    >
                                                        Attachment {index + 1}
                                                    </Button>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={() => handleDelete(material.id)}
                                                sx={{
                                                    color: '#ef5350',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(239, 83, 80, 0.04)',
                                                    },
                                                }}
                                            >
                                                <DeleteOutlineIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={() => handleEdit(material)}
                                                sx={{
                                                    color: '#3f51b5',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(63, 81, 181, 0.04)',
                                                    },
                                                }}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        p: 2,
                    },
                }}
            >
                <DialogTitle sx={{p: 2}}>
                    <Typography variant="h5" component="div" sx={{fontWeight: 600}}>
                        {selectedMaterial ? 'Edit Material' : 'Add New Material'}
                    </Typography>
                    <IconButton
                        onClick={handleCloseModal}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: '#666',
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{p: 2}}>
                    <AddEditMaterial
                        existingMaterial={selectedMaterial}
                        onClose={handleCloseModal}
                    />
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default StudyMaterialsList;
