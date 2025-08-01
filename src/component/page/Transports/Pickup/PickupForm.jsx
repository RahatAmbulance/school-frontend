import React, {useEffect, useState} from "react";
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {AccessTime, Badge, Event, Person, Phone, PhotoCamera, Search as SearchIcon} from '@mui/icons-material';
import dayjs from "dayjs";

import {api, selectSchoolDetails} from "../../../../common";
import {useSelector} from "react-redux";


const formatDateForBackend = (dateString) => {
    return dayjs(dateString).format("MMM D, YYYY hh:mm:ss A");
};

const relationships = [
    "Parent",
    "Guardian",
    "Relative",
    "Driver",
    "Caretaker",
    "Other"
];

const idProofTypes = [
    "Aadhar",
    "Driving License",
    "Passport",
    "Voter ID",
    "Other"
];

const PickupForm = ({pickup, onCancel, onSubmit}) => {
    const [formData, setFormData] = useState({
        studentId: "",
        studentName: "",
        rollNumber: "",
        className: "",
        section: "",
        classTeacher: "",
        parentId: "",
        fatherName: "",
        motherName: "",
        guardianName: "",
        parentContactNumber: "",
        authorizedPersonName: "",
        relationship: "",
        contactNumber: "",
        idProofType: "Aadhar",
        idProofNumber: "",
        isOneTime: true,
        validFrom: dayjs().format("YYYY-MM-DDTHH:mm"),
        validUntil: dayjs().add(1, 'day').format("YYYY-MM-DDTHH:mm"),
        active: true,
        photo: null,
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [serverError, setServerError] = useState("");
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [studentError, setStudentError] = useState("");
    const [RoleError, setRoleError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [fileName, setFileName] = useState()

    const userData = useSelector(selectSchoolDetails);
    const isSuperAdmin = userData?.role === "super_admin"
    const classSections = useSelector(
        (state) => state.master.data.classSections
    )


// Add these to your existing state
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoError, setPhotoError] = useState('');
    const idProofTypes = ["Aadhar", "PAN", "Driving License", "Passport", "Other"];
    const relationships = ["Parent", "Relative", "Family Friend", "Driver", "Other"];

    const handlePhotoChange = async (e) => {
        const {name, value, files} = e.target;

        // Reset previous photo error
        setPhotoError('');

        if (files) {
            const file = files[0];

            // Client-side file size validation (1MB = 1048576 bytes)
            if (file.size > 1048576) {
                setPhotoError('File size exceeds 1MB. Please choose a smaller file.');
                e.target.value = '';  // Clear the file input
                setFileName('');      // Reset file name display
                return;               // Exit early without processing
            }

            setFileName(file.name);
            const base64 = await convertToBase64(file);
            setFormData({
                ...formData,
                [name]: base64
            });
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }

        const fieldError = validateField(name, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: fieldError
        }));
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    // Fetch students on component mount

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await api.get("/api/students");
                setStudents(response.data);
            } catch (err) {
                setStudentError(err.message);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudent();
    }, []);


    useEffect(() => {
        if (pickup) {
            setFormData({
                ...pickup,
                studentId: pickup.studentId?.toString() || "",
                parentId: pickup.parentId?.toString() || "",
                validFrom: pickup.validFrom ? dayjs(pickup.validFrom).format("YYYY-MM-DDTHH:mm") : "",
                validUntil: pickup.validUntil ? dayjs(pickup.validUntil).format("YYYY-MM-DDTHH:mm") : ""
            });
            if (pickup.photo) {
                setPhotoPreview(`data:image/jpeg;base64,${pickup.photo}`);
            }
        }
    }, [pickup]);

    const handleStudentSelect = (event, value) => {
        if (!value) {
            setFormData(prev => ({
                ...prev,
                studentId: "",
                studentName: "",
                rollNumber: "",
                ...(isSuperAdmin ? {} : {className: "", section: ""}),

                classTeacher: "",
                parentId: "",
                fatherName: "",
                motherName: "",
                guardianName: "",
                parentContactNumber: "",
                photo: null,
            }));
            setPhotoPreview(null);
            return;
        }

        setFormData(prev => ({

            ...prev,
            studentId: value.id.toString(),
            studentName: value.studentName || "",
            rollNumber: value.rollNo || "",

            ...(isSuperAdmin
                ? {}
                : {
                    className: value.className,
                    section: value.section,
                }),
            classTeacher: value.classTeacher || "",
            parentId: value.parentId ? value.parentId.toString() : "",
            fatherName: value.fatherName || "",
            motherName: value.motherName || "",
            guardianName: value.guardianName || "",
            parentContactNumber: value.guardianMobileNo || ""
        }));


        const handlePhotoChange = (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    setPhotoError("File size should not exceed 5MB");
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    setFormData(prev => ({...prev, photo: base64String}));
                    setPhotoPreview(reader.result);
                };
                reader.readAsDataURL(file);
                setFileName(file.name);
                setPhotoError("");
            }
        }
    }

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        let processedValue = value;
        if (name === 'studentId' || name === 'parentId') {
            processedValue = value.replace(/\D/g, '');
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : processedValue
        }));

        validateField(name, type === 'checkbox' ? checked : processedValue);
    };

    const validateField = (name, value) => {
        let error = null;

        switch (name) {
            case 'studentId':
                if (!value) error = "Student ID is required";
                else if (!/^\d+$/.test(value)) error = "Must be a valid number";
                break;
            case 'studentName':
                if (!value.trim()) error = "Student name is required";
                break;
            case 'authorizedPersonName':
                if (!value.trim()) error = "Authorized person name is required";
                break;
            case 'contactNumber':
                if (!/^\d{10}$/.test(value)) error = "Invalid 10-digit phone number";
                break;
            case 'validUntil':
                if (dayjs(value).isBefore(formData.validFrom)) {
                    error = "Must be after start date";
                }
                break;
            case 'parentContactNumber':
                if (value && !/^\d{10}$/.test(value)) error = "Invalid 10-digit phone number";
                break;
        }

        setErrors(prev => ({...prev, [name]: error}));
        return error;
    };

    const validateForm = () => {
        const fieldsToValidate = [
            'studentId',
            'studentName',
            'authorizedPersonName',
            'contactNumber',
            'validUntil'
        ];

        const newErrors = fieldsToValidate.reduce((acc, field) => {
            acc[field] = validateField(field, formData[field]);
            return acc;
        }, {});

        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");

        if (!validateForm()) return;

        try {
            const submissionData = {
                ...formData,
                studentId: Number(formData.studentId),
                parentId: formData.parentId ? Number(formData.parentId) : null,
                validFrom: formatDateForBackend(formData.validFrom),
                validUntil: formatDateForBackend(formData.validUntil)
            };

            await onSubmit(submissionData);
            setSuccessMessage("Authorization saved successfully!");
        } catch (error) {
            setServerError(error.message || "Submission failed. Please try again.");
        }
    };

    return (
        <Container>
            <form onSubmit={handleSubmit}>
                <Box sx={{mb: 4}}>
                    {serverError && (
                        <Alert severity="error" sx={{mb: 2, borderRadius: 2}}>
                            {serverError}
                        </Alert>
                    )}

                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Typography variant="h6" gutterBottom sx={{color: 'primary.main', fontWeight: 600, mb: 3}}>
                            Student Information
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={students}
                                    getOptionLabel={(option) =>
                                        option.studentName ? `${option.studentName} (ID: ${option.id || 'N/A'}, Roll: ${option.rollNo || 'N/A'})` : 'Select student'
                                    }
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    value={students.find(s => s.id?.toString() === formData.studentId) || null}
                                    onChange={handleStudentSelect}
                                    onInputChange={(event, newInputValue) => {
                                        setSearchTerm(newInputValue);
                                    }}
                                    loading={loadingStudents}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Student"
                                            variant="outlined"
                                            error={!!errors.studentId || !!studentError}
                                            helperText={(errors.studentId || studentError) ? (errors.studentId || studentError) : " "}
                                            placeholder="Search by name, ID, or roll number"
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon color="action"/>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <>
                                                        {loadingStudents && (
                                                            <CircularProgress
                                                                size={20}
                                                                sx={{mr: 1}}
                                                            />
                                                        )}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'primary.light',
                                                    },
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>


                            {/* CLASS NAME */}
                            <Grid item xs={12} sm={6}>
                                {isSuperAdmin ? (
                                    <TextField
                                        select
                                        fullWidth
                                        label="Class Name"
                                        name="className"
                                        value={formData.className}
                                        onChange={(e) => {
                                            // reset section when class changes
                                            setFormData((f) => ({
                                                ...f,
                                                className: e.target.value,
                                                section: "",
                                            }))
                                        }}
                                        error={!!errors.className}
                                        helperText={errors.className}
                                    >
                                        {classSections && classSections.length > 0 ? (
                                            classSections.map((classSection) => (
                                                <MenuItem key={classSection.id} value={classSection?.name || ''}>
                                                    {classSection.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                No Classes Available
                                            </MenuItem>
                                        )}

                                    </TextField>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label="Class Name"
                                        name="className"
                                        value={formData.className}
                                        InputProps={{readOnly: true}}
                                    />
                                )}
                            </Grid>

                            {/* SECTION */}
                            <Grid item xs={12} sm={6}>
                                {isSuperAdmin ? (
                                    <TextField
                                        select
                                        fullWidth
                                        label="Section"
                                        name="section"
                                        value={formData.section}
                                        onChange={(e) =>
                                            setFormData((f) => ({...f, section: e.target.value}))
                                        }
                                        error={!!errors.section}
                                        helperText={errors.section}
                                        disabled={!formData.className}
                                    >
                                        {classSections?.find(cs => cs.name === formData.className)?.sections?.length > 0 ? (
                                            classSections
                                                .find(cs => cs.name === formData.className)
                                                .sections.map((section) => (
                                                <MenuItem key={section.id} value={section?.name || ''}>
                                                    {section.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                No Sections Available
                                            </MenuItem>
                                        )}
                                    </TextField>
                                ) : (
                                    <TextField
                                        fullWidth
                                        label="Section"
                                        name="section"
                                        value={formData.section}
                                        InputProps={{readOnly: true}}
                                    />
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Student Name"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    error={!!errors.studentName}
                                    helperText={errors.studentName}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Roll Number"
                                    name="rollNumber"
                                    value={formData.rollNumber}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>


                        </Grid>
                    </Paper>

                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        mt: 3
                    }}>
                        <Typography variant="h6" gutterBottom sx={{color: 'primary.main', fontWeight: 600, mb: 3}}>
                            Authorization Details
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Authorized Person Name"
                                    name="authorizedPersonName"
                                    value={formData.authorizedPersonName}
                                    onChange={handleChange}
                                    error={!!errors.authorizedPersonName}
                                    helperText={errors.authorizedPersonName}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Relationship</InputLabel>
                                    <Select
                                        value={formData.relationship}
                                        onChange={handleChange}
                                        name="relationship"
                                        label="Relationship"
                                        sx={{borderRadius: 2}}
                                    >
                                        {relationships.map(option => (
                                            <MenuItem key={option} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Contact Number"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    error={!!errors.contactNumber}
                                    helperText={errors.contactNumber}
                                    inputProps={{inputMode: 'tel', pattern: '[0-9]{10}'}}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>ID Proof Type</InputLabel>
                                    <Select
                                        value={formData.idProofType}
                                        onChange={handleChange}
                                        name="idProofType"
                                        label="ID Proof Type"
                                        sx={{borderRadius: 2}}
                                    >
                                        {idProofTypes.map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="ID Proof Number"
                                    name="idProofNumber"
                                    value={formData.idProofNumber}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Badge color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Valid From"
                                    type="datetime-local"
                                    name="validFrom"
                                    value={formData.validFrom}
                                    onChange={handleChange}
                                    InputLabelProps={{shrink: true}}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Event color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Valid Until"
                                    type="datetime-local"
                                    name="validUntil"
                                    value={formData.validUntil}
                                    onChange={handleChange}
                                    error={!!errors.validUntil}
                                    helperText={errors.validUntil}
                                    InputLabelProps={{shrink: true}}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccessTime color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    {photoPreview && (
                                        <Avatar
                                            src={photoPreview}
                                            alt="Authorized Person"
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 2,
                                                border: '2px solid',
                                                borderColor: 'primary.main'
                                            }}
                                        />
                                    )}
                                    <Box>
                                        <input
                                            accept="image/*"
                                            style={{display: 'none'}}
                                            id="auth-attachment"
                                            type="file"
                                            onChange={handlePhotoChange}
                                        />
                                        <label htmlFor="auth-attachment">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                startIcon={<PhotoCamera/>}
                                                sx={{
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                        bgcolor: 'primary.lighter'
                                                    }
                                                }}
                                            >
                                                Upload Photo
                                            </Button>
                                        </label>
                                        {fileName && (
                                            <Typography variant="caption" display="block"
                                                        sx={{mt: 1, color: 'text.secondary'}}>
                                                {fileName}
                                            </Typography>
                                        )}
                                        {photoError && (
                                            <Typography color="error" variant="caption" display="block" sx={{mt: 0.5}}>
                                                {photoError}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <Stack direction="row" spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="isOneTime"
                                                checked={formData.isOneTime}
                                                onChange={handleChange}
                                                color="primary"
                                            />
                                        }
                                        label="One-time Authorization"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="active"
                                                checked={formData.active}
                                                onChange={handleChange}
                                                color="primary"
                                            />
                                        }
                                        label="Active"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3}}>
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                '&:hover': {
                                    bgcolor: 'primary.lighter'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                                }
                            }}
                        >
                            {pickup?.id ? "Update" : "Submit"}
                        </Button>
                    </Box>
                </Box>
            </form>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage("")}
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert
                    severity="success"
                    sx={{
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default PickupForm;

