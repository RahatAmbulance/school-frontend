import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addMaterial, updateMaterial} from './redux/studyMaterialActions';
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GetAppIcon from '@mui/icons-material/GetApp';
import {selectSchoolDetails} from '../../../common';

const AddEditMaterial = ({existingMaterial, onClose}) => {
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector(state => state.master.data.classSections);
    const subjects = useSelector(state => state.master.data.subjects);

    const [formValues, setFormValues] = useState({
        title: '',
        subject: '',
        type: '',
        description: '',
        className: '',
        staffId: '',
        staffName: '',
        solutionUrl: '',
        session: userData?.session || '',
        schoolId: userData?.id || '',
        isPublished: true,
        createdBy: userData?.username || '',
    });

    const [errors, setErrors] = useState({});
    const [fileContent, setFileContent] = useState(null);
    const [fileExtension, setFileExtension] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        if (existingMaterial) {
            setFormValues({
                ...existingMaterial,
                type: existingMaterial.type || getFileTypeFromExtension(existingMaterial.fileExtension)
            });
        }
    }, [existingMaterial]);

    const getFileTypeFromExtension = (extension) => {
        if (!extension) return '';
        const ext = extension.toLowerCase();
        switch (ext) {
            case 'pdf':
                return 'PDF';
            case 'mp4':
            case 'webm':
            case 'mov':
                return 'VIDEO';
            case 'doc':
            case 'docx':
                return 'DOCUMENT';
            default:
                return ext.toUpperCase();
        }
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormValues({...formValues, [name]: value});
    };

    const normalizeExtension = (extension) => {
        const extensionMap = {
            'word': 'doc',
            'jpeg': 'jpg',
            'htm': 'html',
            'text': 'txt'
        };
        return extensionMap[extension.toLowerCase()] || extension.toLowerCase();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const extension = getFileExtension(file);
            const normalizedExtension = normalizeExtension(extension);

            if (!isValidFileType(normalizedExtension)) {
                setErrors(prev => ({
                    ...prev,
                    file: 'Invalid file type. Please upload a supported file type.'
                }));
                return;
            }

            setFileName(file.name);
            setFileExtension(normalizedExtension);
            const base64Content = await convertFileToBase64(file);
            setFileContent(base64Content);
        }
    };

    const isValidFileType = (extension) => {
        if (!extension) return false;
        const validExtensions = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'jpg', 'jpeg', 'png', 'gif',
            'mp4', 'webm', 'mov',
            'txt', 'csv', 'zip', 'rar'
        ];
        return validExtensions.includes(extension.toLowerCase());
    };

    const getFileExtension = (file) => {
        if (!file) return '';
        const name = file.name || '';
        const lastDot = name.lastIndexOf('.');
        return lastDot === -1 ? '' : name.substring(lastDot + 1).toLowerCase();
    };

    const handleCheckboxChange = (e) => {
        setFormValues({...formValues, isPublished: e.target.checked});
    };

    const removeFile = () => {
        setFileContent(null);
        setFileExtension('');
        setFileName('');
    };

    const validateForm = () => {
        let tempErrors = {};
        if (!formValues.title) tempErrors.title = 'Title is required';
        if (!formValues.subject) tempErrors.subject = 'Subject is required';
        if (!formValues.className) tempErrors.className = 'Class is required';
        if (!fileContent && !existingMaterial?.fileContent) tempErrors.file = 'File is required';

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            const materialData = {
                ...formValues,
                fileContent: fileContent || existingMaterial?.fileContent,
                fileExtension: fileExtension || existingMaterial?.fileExtension,
                fileName: fileName || existingMaterial?.fileName,
                creationDateTime: new Date(),
                updatedBy: userData?.username || ''
            };

            // Remove any undefined or empty values
            Object.keys(materialData).forEach(key => {
                if (materialData[key] === undefined || materialData[key] === '') {
                    delete materialData[key];
                }
            });

            if (existingMaterial) {
                dispatch(updateMaterial(existingMaterial.id, materialData));
            } else {
                dispatch(addMaterial(materialData));
            }
            onClose();
        }
    };

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <Paper elevation={3} sx={{padding: '30px', maxWidth: '700px', margin: '20px auto'}}>
            <Typography variant="h5" gutterBottom align="center">
                {existingMaterial ? 'Edit Study Material' : 'Add New Study Material'}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            name="title"
                            label="Title"
                            value={formValues.title}
                            onChange={handleInputChange}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            error={!!errors.title}
                            helperText={errors.title}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" margin="dense" error={!!errors.className}>
                            <InputLabel>Class Name</InputLabel>
                            <Select
                                name="className"
                                value={formValues.className}
                                onChange={handleInputChange}
                                label="Class Name"
                            >
                                {classSections && classSections.length > 0 ? (
                                    classSections.map((classSection) => (
                                        <MenuItem key={classSection.id} value={classSection.name}>
                                            {classSection.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No Classes Available
                                    </MenuItem>
                                )}
                            </Select>
                            {errors.className && <FormHelperText error>{errors.className}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth variant="outlined" margin="dense" error={!!errors.subject}>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                name="subject"
                                value={formValues.subject}
                                onChange={handleInputChange}
                                label="Subject"
                            >
                                {subjects && subjects.length > 0 ? (
                                    subjects.map((subject) => (
                                        <MenuItem key={subject.id} value={subject.name}>
                                            {subject.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No Subjects Available
                                    </MenuItem>
                                )}
                            </Select>
                            {errors.subject && <FormHelperText error>{errors.subject}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            value={formValues.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            margin="dense"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formValues.isPublished}
                                    onChange={handleCheckboxChange}
                                    name="isPublished"
                                />
                            }
                            label="Published"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box display="flex" alignItems="center" flexDirection="column">
                            <input
                                type="file"
                                id="file-upload"
                                hidden
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm,.mov,.txt,.csv,.zip,.rar"
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<CloudUploadIcon/>}
                                    sx={{mb: 2}}
                                >
                                    Upload File
                                </Button>
                            </label>
                            {errors.file && (
                                <Typography color="error" variant="caption" sx={{mb: 1}}>
                                    {errors.file}
                                </Typography>
                            )}
                            {(fileContent || existingMaterial?.fileContent) && (
                                <Box display="flex" alignItems="center" sx={{mt: 1}}>
                                    <Typography variant="body2" sx={{mr: 2}}>
                                        {fileName || existingMaterial?.fileName}
                                    </Typography>
                                    <IconButton size="small" onClick={removeFile}>
                                        <GetAppIcon/>
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{mt: 3}}
                        >
                            {existingMaterial ? 'Update Material' : 'Add Material'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default AddEditMaterial;
