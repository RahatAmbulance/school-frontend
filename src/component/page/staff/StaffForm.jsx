import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useDispatch, useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {roles} from "../../../common";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {motion} from 'framer-motion';

// Styled components
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const StyledCard = styled(Card)(({theme}) => ({
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
    },
}));

const StyledButton = styled(Button)(({theme}) => ({
    borderRadius: theme.spacing(2),
    textTransform: 'none',
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
}));

const AnimatedContainer = styled(motion.div)({
    width: '100%',
});

const StyledUploadButton = styled(Button)(({theme}) => ({
    width: '100%',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    border: `2px dashed ${theme.palette.primary.main}`,
    '&:hover': {
        border: `2px dashed ${theme.palette.primary.dark}`,
    },
}));

const steps = [
    'Basic Information',
    'Contact Details',
    'Professional Details',
    'Bank Details',
    'Documents'
];

const StaffForm = ({staff, onSubmit, onCancel}) => {
    const theme = useTheme();
    const designation = useSelector(state => state.master.data?.designation || []);
    const [activeStep, setActiveStep] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [routes, setRoutes] = useState([]);
    const [errors, setErrors] = useState({});
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const {vehicles} = useSelector(state => state.vehicles);

    const [formData, setFormData] = useState({
        name: '',
        post: '',
        phone: '',
        email: '',
        role: '',
        staffType: 'Non-Teaching',
        dateOfBirth: 'null',
        cAddress1: '',
        cAddress2: '',
        cCity: '',
        pAddress1: '',
        pAddress2: '',
        pCity: '',
        mobile1: '',
        mobile2: '',
        gender: 'Male',
        qualification: '',
        expertIn: '',
        father: '',
        mother: '',
        married: 'No',
        spouseName: '',
        joiningDate: 'null',
        aadharNo: '',
        monthSalary: '',
        bankAccountNumber: '',
        bankIfsc: '',
        bankAccountName: '',
        photo: null,
        identificationDocuments: null,
        educationalCertificate: null,
        professionalQualifications: null,
        experienceCertificates: null,
        bankAccount: null,
        previousEmployer: null,
        loginId: '',
        password: '',
        userId: '',
        imageRefId: '',
        vehicleId: '',
        routeId: '',
        creationDateTime: null,
        staffId: '',
    });

    useEffect(() => {
        if (staff) {
            setFormData((prevData) => ({
                ...prevData,
                ...staff,
                // dateOfBirth: staff.dateOfBirth ? dayjs(staff.dateOfBirth) : null,
                // joiningDate: staff.joiningDate ? dayjs(staff.joiningDate) : null,
                staffType: staff.staffType || prevData.staffType,
                creationDateTime: staff.creationDateTime ? dayjs(staff.creationDateTime) : null,
                staffId: staff.staffId, // Add this line


            }));
        }
    }, [staff]);

    const validateEmail = (email) => {
        if (!email) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
        return '';
    };

    const handleChange = (e) => {
        const {name, value} = e.target;

        // Special validation for email field
        if (name === 'email') {
            const emailError = validateEmail(value);
            setErrors(prev => ({...prev, email: emailError}));
        }

        setFormData(prev => ({...prev, [name]: value}));

        // Clear other errors when field is changed
        if (errors[name]) {
            setErrors((prevErrors) => ({...prevErrors, [name]: undefined}));
        }
    };

    const handleFileChange = (e) => {
        const {name, files} = e.target;
        setFormData({...formData, [name]: files[0]});
    };


    const handleDateChange = (name, date) => {
        setFormData({...formData, [name]: date ? dayjs(date) : null});
    };

    const handleNext = () => {
        const stepValidation = validateStep(activeStep);
        if (stepValidation) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };
    const handleClose = () => {
        setOpen(false);
        if (onCancel) onCancel();
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            if (!(file instanceof Blob)) {
                return reject(new TypeError('Expected file to be a Blob'));
            }

            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);

            reader.readAsDataURL(file);
        });
    };


    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 0: // Basic Information
                if (!formData.name) newErrors.name = 'Name is required';
                if (!formData.post) newErrors.post = 'Designation is required';
                if (!formData.dateOfBirth || !dayjs(formData.dateOfBirth).isValid()) {
                    newErrors.dateOfBirth = 'Date of Birth is required and must be valid';
                } else if (dayjs(formData.dateOfBirth).isAfter(dayjs())) {
                    newErrors.dateOfBirth = 'Date of Birth must be a past date';
                }
                if (!formData.qualification) newErrors.qualification = 'Qualification is required';
                break;

            case 1: // Contact Details
                if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
                    newErrors.phone = 'Phone must be exactly 10 digits';
                }
                const emailError = validateEmail(formData.email);
                if (emailError) newErrors.email = emailError;

                if (!formData.role) newErrors.role = 'Role is required';
                if (!formData.cAddress1) newErrors.cAddress1 = 'Current Address is required';
                if (!formData.cCity) newErrors.cCity = 'Current City is required';
                if (!formData.pAddress1) newErrors.pAddress1 = 'Permanent Address is required';
                if (!formData.pCity) newErrors.pCity = 'Permanent City is required';
                break;

            case 2: // Professional Details
                if (!formData.mobile1 || formData.mobile1.length !== 10) newErrors.mobile1 = 'Mobile1 must be 10 digits';
                if (formData.mobile2 && !/^\d{10}$/.test(formData.mobile2)) {
                    newErrors.mobile2 = 'Mobile2 must be exactly 10 digits';
                }
                if (!formData.expertIn) newErrors.expertIn = 'Expert In is required';
                if (!formData.father) newErrors.father = 'Father\'s Name is required';
                if (!formData.mother) newErrors.mother = 'Mother\'s Name is required';
                if (!formData.joiningDate || !dayjs(formData.joiningDate).isValid()) {
                    newErrors.joiningDate = 'Date of Joining is required';
                }
                if (!formData.aadharNo || formData.aadharNo.length !== 12) newErrors.aadharNo = 'Aadhar number must be 12 digits';
                if (!formData.monthSalary || isNaN(formData.monthSalary)) newErrors.monthSalary = 'Monthly Salary must be a number';
                break;

            case 3: // Bank Details
                if (!formData.bankAccountNumber) newErrors.bankAccountNumber = 'Bank Account Number is required';
                if (!formData.bankIfsc) newErrors.bankIfsc = 'Bank IFSC Code is required';
                if (!formData.bankAccountName) newErrors.bankAccountName = 'Bank Account Holder Name is required';
                break;

            case 4: // Documents
                // Document validation is optional
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all steps before final submission
        let isValid = true;
        for (let i = 0; i < steps.length; i++) {
            if (!validateStep(i)) {
                setActiveStep(i);
                isValid = false;
                break;
            }
        }

        if (!isValid) {
            return;
        }

        try {
            formData['vehicleId'] = selectedVehicle;

            const data = {...formData};
            const fileFields = [
                'photo',
                'identificationDocuments',
                'educationalCertificate',
                'professionalQualifications',
                'experienceCertificates',
                'bankAccount',
                'previousEmployer'
            ];

            for (const field of fileFields) {
                if (formData[field]) {
                    if (formData[field] instanceof Blob) {
                        data[field] = await fileToBase64(formData[field]);
                    } else {
                        data[field] = formData[field];
                    }
                }
            }

            const formDataWithType = {
                ...data,
                type: formData.staffType || 'teaching'
            };

            await onSubmit(formDataWithType);

            // Only reset form if submission was successful
            setFormData({
                name: '',
                post: '',
                phone: '',
                email: '',
                role: '',
                staffType: 'Non-Teaching',
                dateOfBirth: '',
                cAddress1: '',
                cAddress2: '',
                cCity: '',
                pAddress1: '',
                pAddress2: '',
                pCity: '',
                mobile1: '',
                mobile2: '',
                gender: 'Male',
                qualification: '',
                expertIn: '',
                father: '',
                mother: '',
                married: 'No',
                spouseName: '',
                joiningDate: '',
                aadharNo: '',
                monthSalary: '',
                bankAccountNumber: '',
                bankIfsc: '',
                bankAccountName: '',
                photo: null,
                identificationDocuments: null,
                educationalCertificate: null,
                professionalQualifications: null,
                experienceCertificates: null,
                bankAccount: null,
                previousEmployer: null,
                loginId: '',
                password: '',
                userId: '',
                imageRefId: '',
                vehicleId: '',
                routeId: '',
                creationDateTime: null,
                staffId: '',
            });
            setActiveStep(0);
            setErrors({});

        } catch (error) {
            // Handle any errors that occur during submission
            console.error('Error submitting form:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'An error occurred while submitting the form'
            }));
        }
    };


    const renderFilePreview = (name) => {
        const file = formData[name];
        const existingFile = staff && staff[name];

        const handleRemoveFile = () => {
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: null
            }));
        };

        if (!file && existingFile) {
            return (
                <Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                    {existingFile.startsWith('data:image') ? (
                        <img src={existingFile} alt={name}
                             style={{width: 100, height: 100, objectFit: 'cover', borderRadius: 8}}/>
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            Existing file
                        </Typography>
                    )}
                    <IconButton onClick={handleRemoveFile} color="error" size="small">
                        <DeleteIcon/>
                    </IconButton>
                </Box>
            );
        }

        if (!file) return null;

        if (file instanceof File) {
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                return (
                    <Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                        <img src={url} alt={name}
                             style={{width: 100, height: 100, objectFit: 'cover', borderRadius: 8}}/>
                        <IconButton onClick={handleRemoveFile} color="error" size="small">
                            <DeleteIcon/>
                        </IconButton>
                    </Box>
                );
            }
            return (
                <Box sx={{mt: 2, display: 'flex', alignItems: 'center', gap: 2}}>
                    <Typography variant="body2" color="textSecondary">
                        {file.name}
                    </Typography>
                    <IconButton onClick={handleRemoveFile} color="error" size="small">
                        <DeleteIcon/>
                    </IconButton>
                </Box>
            );
        }
        return null;
    };


    // Handler for vehicle selection
    const handleVehicleChange = (e) => {
        const vehicleId = e.target.value;
        setSelectedVehicle(vehicleId);
        // Fetch routes for the selected vehicle (e.g., from an API or Redux state)
        const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
        const vehicleRoutes = selectedVehicle?.routes || [];
        setRoutes(vehicleRoutes);

        // Clear the route selection if vehicle changes
        setFormData((prevFormData) => ({
            ...prevFormData,
            vehicleId,
            routeId: '' // Clear route selection
        }));
    };
    const handleRouteChange = (e) => {
        const routeId = e.target.value;
        setFormData((prevFormData) => ({
            ...prevFormData,
            routeId // Update routeId in formData
        }));
    };
    const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    return (
        <Container maxWidth="md">
            <Box sx={{width: '100%', mb: 4}}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Box>

            {errors.submit && (
                <Alert severity="error" sx={{mb: 2}}>
                    {errors.submit}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <AnimatedContainer
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -20}}
                    transition={{duration: 0.3}}
                >
                    <StyledCard>
                        <CardContent>
                            {activeStep === 0 && (
                                <>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Basic Information
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>Staff Type</InputLabel>
                                                <Select
                                                    name="staffType"
                                                    value={formData?.staffType || ''}
                                                    onChange={handleChange}
                                                    label="Staff Type"
                                                >
                                                    <MenuItem value="Teaching">Teaching</MenuItem>
                                                    <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Name"
                                                name="name"
                                                value={formData?.name || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.name}
                                                helperText={errors.name}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth error={!!errors.post}>
                                                <InputLabel>Designation</InputLabel>
                                                <Select
                                                    name="post"
                                                    value={formData?.post || ''}
                                                    onChange={handleChange}
                                                    label="Designation"
                                                    required
                                                >
                                                    {designation.map((d, index) => (
                                                        <MenuItem key={index} value={d?.name || ''}>
                                                            {d.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.post && <FormHelperText>{errors.post}</FormHelperText>}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                name="dateOfBirth"
                                                label="Date of Birth"
                                                type="date"
                                                value={formData?.dateOfBirth || ''}
                                                onChange={handleChange}
                                                InputLabelProps={{shrink: true}}
                                                required
                                                error={!!errors.dateOfBirth}
                                                helperText={errors.dateOfBirth}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth required error={!!errors.qualification}>
                                                <InputLabel>Qualification</InputLabel>
                                                <Select
                                                    name="qualification"
                                                    value={formData?.qualification || ''}
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="High School Diploma">High School Diploma</MenuItem>
                                                    <MenuItem value="Secondary School Certificate">Secondary School
                                                        Certificate</MenuItem>
                                                    <MenuItem value="Senior Secondary School Certificate">Senior
                                                        Secondary School Certificate</MenuItem>
                                                    <MenuItem value="Bachelor of Education (B.Ed)">Bachelor of Education
                                                        (B.Ed)</MenuItem>
                                                    <MenuItem value="Master of Education (M.Ed)">Master of Education
                                                        (M.Ed)</MenuItem>
                                                    <MenuItem value="Diploma in Education (D.Ed)">Diploma in Education
                                                        (D.Ed)</MenuItem>
                                                    <MenuItem value="Bachelor's Degree">Bachelor's Degree</MenuItem>
                                                    <MenuItem value="Master's Degree">Master's Degree</MenuItem>
                                                    <MenuItem value="PhD in Education">PhD in Education</MenuItem>
                                                    <MenuItem value="Certified Teaching Certificate">Certified Teaching
                                                        Certificate</MenuItem>
                                                    <MenuItem value="SSC">SSC</MenuItem>
                                                    <MenuItem value="OTHER">OTHER</MenuItem>
                                                </Select>
                                                {errors.qualification && (
                                                    <FormHelperText>{errors.qualification}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {activeStep === 1 && (
                                <>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Contact Details
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Phone"
                                                name="phone"
                                                value={formData?.phone || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.phone}
                                                helperText={errors.phone}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                value={formData?.email || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                inputProps={{
                                                    'aria-label': 'Email address'
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth error={!!errors.role}>
                                                <InputLabel>Role</InputLabel>
                                                <Select
                                                    name="role"
                                                    value={formData?.role || ''}
                                                    onChange={handleChange}
                                                    label="Role"
                                                    required
                                                >
                                                    {roles.map((role) => (
                                                        <MenuItem key={role} value={role}>
                                                            {role.replace('_', ' ')}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Current Address
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Address Line 1"
                                                name="cAddress1"
                                                value={formData?.cAddress1 || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.cAddress1}
                                                helperText={errors.cAddress1}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Address Line 2"
                                                name="cAddress2"
                                                value={formData?.cAddress2 || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                name="cCity"
                                                value={formData?.cCity || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.cCity}
                                                helperText={errors.cCity}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Permanent Address
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Address Line 1"
                                                name="pAddress1"
                                                value={formData?.pAddress1 || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.pAddress1}
                                                helperText={errors.pAddress1}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Address Line 2"
                                                name="pAddress2"
                                                value={formData?.pAddress2 || ''}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                name="pCity"
                                                value={formData?.pCity || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.pCity}
                                                helperText={errors.pCity}
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {activeStep === 2 && (
                                <>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Professional Details
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Mobile Number 1"
                                                name="mobile1"
                                                value={formData?.mobile1 || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.mobile1}
                                                helperText={errors.mobile1}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Mobile Number 2"
                                                name="mobile2"
                                                value={formData?.mobile2 || ''}
                                                onChange={handleChange}
                                                error={!!errors.mobile2}
                                                helperText={errors.mobile2}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <FormLabel>Gender</FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="gender"
                                                    value={formData?.gender || ''}
                                                    onChange={handleChange}
                                                >
                                                    <FormControlLabel value="Male" control={<Radio/>} label="Male"/>
                                                    <FormControlLabel value="Female" control={<Radio/>} label="Female"/>
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Expert In"
                                                name="expertIn"
                                                value={formData?.expertIn || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.expertIn}
                                                helperText={errors.expertIn}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Father's Name"
                                                name="father"
                                                value={formData?.father || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.father}
                                                helperText={errors.father}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Mother's Name"
                                                name="mother"
                                                value={formData?.mother || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.mother}
                                                helperText={errors.mother}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControl fullWidth>
                                                <FormLabel>Marital Status</FormLabel>
                                                <RadioGroup
                                                    row
                                                    name="married"
                                                    value={formData?.married || ''}
                                                    onChange={handleChange}
                                                >
                                                    <FormControlLabel value="Yes" control={<Radio/>} label="Yes"/>
                                                    <FormControlLabel value="No" control={<Radio/>} label="No"/>
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                        {formData.married === 'Yes' && (
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Spouse Name"
                                                    name="spouseName"
                                                    value={formData?.spouseName || ''}
                                                    onChange={handleChange}
                                                />
                                            </Grid>
                                        )}
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                name="joiningDate"
                                                label="Joining Date"
                                                type="date"
                                                value={formData?.joiningDate || ''}
                                                onChange={handleChange}
                                                InputLabelProps={{shrink: true}}
                                                required
                                                error={!!errors.joiningDate}
                                                helperText={errors.joiningDate}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Aadhaar Number"
                                                name="aadharNo"
                                                value={formData?.aadharNo || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.aadharNo}
                                                helperText={errors.aadharNo}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Monthly Salary"
                                                name="monthSalary"
                                                value={formData?.monthSalary || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.monthSalary}
                                                helperText={errors.monthSalary}
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {activeStep === 3 && (
                                <>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Bank Details
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Bank Account Number"
                                                name="bankAccountNumber"
                                                value={formData?.bankAccountNumber || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.bankAccountNumber}
                                                helperText={errors.bankAccountNumber}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="IFSC Code"
                                                name="bankIfsc"
                                                value={formData?.bankIfsc || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.bankIfsc}
                                                helperText={errors.bankIfsc}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Account Holder Name"
                                                name="bankAccountName"
                                                value={formData?.bankAccountName || ''}
                                                onChange={handleChange}
                                                required
                                                error={!!errors.bankAccountName}
                                                helperText={errors.bankAccountName}
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                            {activeStep === 4 && (
                                <>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Upload Documents
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Photo
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="photo"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('photo')}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Identification Documents
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="identificationDocuments"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('identificationDocuments')}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Educational Certificate
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="educationalCertificate"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('educationalCertificate')}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Professional Qualifications
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="professionalQualifications"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('professionalQualifications')}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Experience Certificates
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="experienceCertificates"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('experienceCertificates')}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Bank Account Details
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="bankAccount"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('bankAccount')}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <StyledUploadButton
                                                component="label"
                                                startIcon={<CloudUploadIcon/>}
                                            >
                                                Upload Previous Employer Documents
                                                <VisuallyHiddenInput
                                                    type="file"
                                                    name="previousEmployer"
                                                    accept="application/pdf,image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </StyledUploadButton>
                                            {renderFilePreview('previousEmployer')}
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </CardContent>
                    </StyledCard>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 3}}>
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            startIcon={<NavigateBeforeIcon/>}
                        >
                            Back
                        </Button>
                        <Box>
                            <Button
                                onClick={handleClose}
                                sx={{mr: 1}}
                            >
                                Cancel
                            </Button>
                            {activeStep === steps.length - 1 ? (
                                <StyledButton
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                    endIcon={<CheckCircleIcon/>}
                                >
                                    Submit
                                </StyledButton>
                            ) : (
                                <StyledButton
                                    variant="contained"
                                    onClick={handleNext}
                                    endIcon={<NavigateNextIcon/>}
                                >
                                    Next
                                </StyledButton>
                            )}
                        </Box>
                    </Box>
                </AnimatedContainer>
            </form>

            {successMessage && (
                <Alert
                    severity="success"
                    sx={{
                        position: 'fixed',
                        top: '20%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        minWidth: 300,
                        boxShadow: 4,
                    }}
                >
                    {successMessage}
                </Alert>
            )}
        </Container>
    );
};

export default StaffForm;
