import React, {useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fade,
    FormControl,
    FormControlLabel,
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
    styled,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {addEnquiry} from "./redux/enquiryActions.js";
import MasterJson from "../../masterfile/MasterJson.json";
import {selectSchoolDetails} from "../../../common";
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Styled components
const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({theme}) => ({
    background: theme.palette.primary.main,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
}));

const FormSection = styled(Box)(({theme}) => ({
    padding: theme.spacing(3),
    background: '#fff',
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
}));

const StyledTextField = styled(TextField)(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
        '&.Mui-focused': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
    },
}));

const steps = [
    {label: 'Personal Details', icon: <PersonIcon/>},
    {label: 'Parents Details', icon: <FamilyRestroomIcon/>},
    {label: 'School Details', icon: <SchoolIcon/>},
    {label: 'Address & Status', icon: <LocationOnIcon/>},
];

const AddEnquiryForm = ({
                            open,
                            handleClose,
                            refreshData,
                            mode,
                            initialValues,
                            onSubmit,
                        }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [activeStep, setActiveStep] = useState(0);
    // State to manage form data
    const initialState = {
        studentName: '', className: '',
    };
    const classSections = useSelector(state => state.master.data.classSections);
    const [student, setStudent] = useState(initialState);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dob, setDob] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [enquiryStatusValue, setEnquiryStatusValue] = useState("");
    const [remark, setRemark] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("female");
    const [motherName, setMotherName] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [motherOccupation, setMotherOccupation] = useState("");
    const [fatherOccupation, setFatherOccupation] = useState("");
    const [motherMobile, setMotherMobile] = useState("");
    const [fatherMobile, setFatherMobile] = useState("");
    const [motherIncome, setMotherIncome] = useState("");
    const [fatherIncome, setFatherIncome] = useState("");

    // School fields
    const [schoolName, setSchoolName] = useState(""); // State for school name
    const [schoolAddress, setSchoolAddress] = useState(""); // State for school address
    const [nationality, setNationality] = useState("INDIAN"); // State for nationality
    const [lastSchoolAffiliation, setLastSchoolAffiliation] = useState("");

    // Address fields
    const [pincode, setPinCode] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [country, setCountry] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState({
        student: "",
        firstName: "",
        phoneNumber: "",
        email: "",
        motherName: "",
        fatherName: "",
        pincode: "",
        city: "",
        fatherMobile: "",
        lastSchoolAffiliation: "", // Add this line
        studentClass: "", // Add this line
        enquiryStatus: "", // Add this line
    });
    const validateForm = () => {
        let tempErrors = {};
        tempErrors.firstName = firstName ? "" : "First name is required";
        tempErrors.studentClass = studentClass ? "" : "class name is required";
        tempErrors.phoneNumber = /^\d{10}$/.test(phoneNumber)
            ? ""
            : "Invalid phone number";
        tempErrors.email = /\S+@\S+\.\S+/.test(email)
            ? ""
            : "Invalid email address";
        tempErrors.motherName = motherName ? "" : "Mother's name is required";
        tempErrors.fatherName = fatherName ? "" : "Father's name is required";
        tempErrors.pincode = /^\d{6}$/.test(pincode) ? "" : "Invalid pincode";
        tempErrors.city = city ? "" : "City is required";
        tempErrors.fatherMobile = /^\d{10}$/.test(fatherMobile)
            ? ""
            : "Invalid father's mobile number"; // Add this line
        tempErrors.lastSchoolAffiliation = lastSchoolAffiliation
            ? ""
            : "Last school affiliation is required"; // Add this line
        tempErrors.studentClass = studentClass ? "" : "Class is required"; // Add this line
        tempErrors.enquiryStatus = enquiryStatusValue
            ? ""
            : "Enquiry status is required"; // Add this line

        setErrors(tempErrors);
        return Object.values(tempErrors).every((x) => x === "");
    };
    const updateError = (field, value) => {
        setErrors((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    // Handle form submission
    const handleSubmit = async () => {
        if (validateForm()) {
            const enquiryData = {
                student,
                firstName,
                schoolId: schoolId,
                session: session,
                lastName,
                phoneNumber,
                dob,
                studentClass,
                enquiryStatus: enquiryStatusValue,
                remark,
                email,
                gender,
                nationality,
                name: schoolName,
                address: schoolAddress,
                pincode,
                city,
                state,
                country,
                motherName,
                motherOccupation,
                motherMobile, // Include mother's mobile
                motherIncome,
                fatherName,
                fatherOccupation,
                fatherMobile, // Include father's mobile
                fatherIncome,
            };
            try {
                setSuccessMessage("Enquiry added successfully!");
                dispatch(addEnquiry(enquiryData));
                handleClose();
                refreshData();

                // Reset form values to empty or initial values
                setStudent({studentName: "", className: ""});
                setFirstName("");
                setLastName("");
                setPhoneNumber("");
                setDob("");
                setStudentClass("");
                setEnquiryStatusValue("");
                setRemark("");
                setEmail("");
                setGender("female");
                setNationality("INDIAN");
                setSchoolName("");
                setSchoolAddress("");
                setPinCode("");
                setCity("");
                setState("");
                setCountry("");
                setMotherName("");
                setFatherName("");
                setMotherOccupation("");
                setFatherOccupation("");
                setMotherMobile("");
                setFatherMobile("");
                setMotherIncome("");
                setFatherIncome("");
            } catch (error) {
                console.error("Error submitting enquiry:", error);
                setSuccessMessage(""); // Clear any previous success message
            }
        }
    };

    const qualifications = ["High School", "Bachelor's", "Master's", "PhD"];
    const resetForm = () => {
        setStudent({studentName: "", className: ""});
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
        setDob("");
        setStudentClass("");
        setEnquiryStatusValue("");
        setRemark("");
        setEmail("");
        setGender("female");
        setNationality("INDIAN");
        setSchoolName("");
        setSchoolAddress("");
        setPinCode("");
        setCity("");
        setState("");
        setCountry("");
        setMotherName("");
        setFatherName("");
        setMotherOccupation("");
        setFatherOccupation("");
        setMotherMobile("");
        setFatherMobile("");
        setMotherIncome("");
        setFatherIncome("");
        setErrors({}); // Clear validation errors
    };
    const handleCloseDialog = () => {
        resetForm(); // Reset form before closing
        handleClose();
    };

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Fade in={true}>
                        <FormSection>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Personal Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="First Name"
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value);
                                            updateError("firstName", e.target.value ? "" : "First name is required");
                                        }}
                                        error={Boolean(errors.firstName)}
                                        helperText={errors.firstName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            setPhoneNumber(e.target.value);
                                            updateError("phoneNumber", /^\d{10}$/.test(e.target.value) ? "" : "Invalid phone number");
                                        }}
                                        error={Boolean(errors.phoneNumber)}
                                        helperText={errors.phoneNumber}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="Email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            updateError("email", /\S+@\S+\.\S+/.test(e.target.value) ? "" : "Invalid email address");
                                        }}
                                        error={Boolean(errors.email)}
                                        helperText={errors.email}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        type="date"
                                        label="Date of Birth"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        InputLabelProps={{shrink: true}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset">
                                        <Typography variant="subtitle2" gutterBottom>
                                            Gender
                                        </Typography>
                                        <RadioGroup
                                            row
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                        >
                                            <FormControlLabel value="male" control={<Radio/>} label="Male"/>
                                            <FormControlLabel value="female" control={<Radio/>} label="Female"/>
                                            <FormControlLabel value="other" control={<Radio/>} label="Other"/>
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FormSection>
                    </Fade>
                );
            case 1:
                return (
                    <Fade in={true}>
                        <FormSection>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Parents Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="Mother's Name"
                                        value={motherName}
                                        onChange={(e) => {
                                            setMotherName(e.target.value);
                                            updateError("motherName", e.target.value ? "" : "Mother's name is required");
                                        }}
                                        error={Boolean(errors.motherName)}
                                        helperText={errors.motherName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="Father's Name"
                                        value={fatherName}
                                        onChange={(e) => {
                                            setFatherName(e.target.value);
                                            updateError("fatherName", e.target.value ? "" : "Father's name is required");
                                        }}
                                        error={Boolean(errors.fatherName)}
                                        helperText={errors.fatherName}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Mother's Occupation"
                                        value={motherOccupation}
                                        onChange={(e) => setMotherOccupation(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Father's Occupation"
                                        value={fatherOccupation}
                                        onChange={(e) => setFatherOccupation(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Mother's Mobile"
                                        value={motherMobile}
                                        onChange={(e) => setMotherMobile(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="Father's Mobile"
                                        value={fatherMobile}
                                        onChange={(e) => {
                                            setFatherMobile(e.target.value);
                                            updateError("fatherMobile", /^\d{10}$/.test(e.target.value) ? "" : "Invalid mobile number");
                                        }}
                                        error={Boolean(errors.fatherMobile)}
                                        helperText={errors.fatherMobile}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Mother's Annual Income"
                                        value={motherIncome}
                                        onChange={(e) => setMotherIncome(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Father's Annual Income"
                                        value={fatherIncome}
                                        onChange={(e) => setFatherIncome(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </Fade>
                );
            case 2:
                return (
                    <Fade in={true}>
                        <FormSection>
                            <Typography variant="h6" color="primary" gutterBottom>
                                School Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <StyledTextField
                                        fullWidth
                                        label="Previous School Name"
                                        value={schoolName}
                                        onChange={(e) => setSchoolName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <StyledTextField
                                        fullWidth
                                        label="School Address"
                                        value={schoolAddress}
                                        onChange={(e) => setSchoolAddress(e.target.value)}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Class</InputLabel>
                                        <Select
                                            value={studentClass}
                                            onChange={(e) => {
                                                setStudentClass(e.target.value);
                                                updateError("studentClass", e.target.value ? "" : "Class is required");
                                            }}
                                            error={Boolean(errors.studentClass)}
                                        >
                                            {MasterJson.SchoolClasses.map((status) => (
                                                <MenuItem key={status.name} value={status.name}>
                                                    {status.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Last School Affiliation</InputLabel>
                                        <Select
                                            value={lastSchoolAffiliation}
                                            onChange={(e) => setLastSchoolAffiliation(e.target.value)}
                                        >
                                            <MenuItem value="CBSE">CBSE</MenuItem>
                                            <MenuItem value="ICSE">ICSE</MenuItem>
                                            <MenuItem value="State Board">State Board</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </FormSection>
                    </Fade>
                );
            case 3:
                return (
                    <Fade in={true}>
                        <FormSection>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Address & Status
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="Pincode"
                                        value={pincode}
                                        onChange={(e) => {
                                            setPinCode(e.target.value);
                                            updateError("pincode", /^\d{6}$/.test(e.target.value) ? "" : "Invalid pincode");
                                        }}
                                        error={Boolean(errors.pincode)}
                                        helperText={errors.pincode}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        label="City"
                                        value={city}
                                        onChange={(e) => {
                                            setCity(e.target.value);
                                            updateError("city", e.target.value ? "" : "City is required");
                                        }}
                                        error={Boolean(errors.city)}
                                        helperText={errors.city}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="State"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Enquiry Status</InputLabel>
                                        <Select
                                            value={enquiryStatusValue}
                                            onChange={(e) => {
                                                setEnquiryStatusValue(e.target.value);
                                                updateError("enquiryStatus", e.target.value ? "" : "Enquiry status is required");
                                            }}
                                            error={Boolean(errors.enquiryStatus)}
                                        >
                                            {MasterJson.enquiry.map((status) => (
                                                <MenuItem key={status.name} value={status.name}>
                                                    {status.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Remarks"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                            </Grid>
                        </FormSection>
                    </Fade>
                );
            default:
                return null;
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <StyledDialogTitle>
                <Typography variant="h6">New Enquiry</Typography>
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleClose}
                    aria-label="close"
                >
                    <CloseIcon/>
                </IconButton>
            </StyledDialogTitle>

            <DialogContent sx={{p: 3}}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{mb: 4}}>
                    {steps.map((step, index) => (
                        <Step key={step.label}>
                            <StepLabel StepIconComponent={() => (
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: activeStep >= index ? theme.palette.primary.main : '#eee',
                                    color: activeStep >= index ? '#fff' : '#666',
                                }}>
                                    {step.icon}
                                </Box>
                            )}>
                                {step.label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions sx={{p: 3, justifyContent: 'space-between'}}>
                <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 4,
                    }}
                >
                    Back
                </Button>
                <Box>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            mr: 2,
                        }}
                    >
                        Cancel
                    </Button>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 4,
                                background: theme.palette.primary.main,
                                '&:hover': {
                                    background: theme.palette.primary.dark,
                                },
                            }}
                        >
                            Submit
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 4,
                            }}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </StyledDialog>
    );
};

export default AddEnquiryForm;
