import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {debounce} from 'lodash'; // Move this import to the top
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Grid,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    TextField
} from "@mui/material";
import {
    addSchool,
    clearSelectedSchool,
    resetSchoolForm,
    setSelectedSchool,
    updateSchoolField
} from './redux/schoolActions';
import locations from './locations.json';
import {sessionOptions} from "../../../commonStyle"; // Import the JSON file
import {LOGINAPI} from "../../../common"; // Import lodash debounce function
import CloseIcon from "@mui/icons-material/Close";

const fieldConfig = {
    udiseCode: {label: 'UDISE Code', type: 'text', required: false},  // Set required to false
    name: {label: 'School Name', type: 'text', required: true},  // This field is required
    email: {label: 'Email Address', type: 'text', required: true},
    phone: {label: 'Phone Number', type: 'text', required: true},
    address: {label: 'Address', type: 'text', required: true},
    city: {label: 'City', type: 'text', required: true},
    state: {label: 'State', type: 'select', required: true},
    district: {label: 'District', type: 'select', required: true},
    pincode: {label: 'Pincode', type: 'text', required: true},
    image: {label: 'School Image', type: 'file', required: false},
    logo: {label: 'School Logo', type: 'file', required: false},
    session: {label: 'Academic Year', type: 'select', required: true}
};

const fieldKeys = Object.keys(fieldConfig);
const numberOfFieldsPerSection = Math.ceil(fieldKeys.length / 3);  // Change to 3 columns per row

const generateUniqueCredentials = (udiseCode, schoolName) => {
    const loginId = `${udiseCode}-${schoolName.slice(0, 5).toUpperCase()}`;
    const password = Math.random().toString(36).slice(-8); // Generates a random 8-character string
    return {loginId, password};
};

const School = ({onRegistrationSuccess}) => {
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const {selectedSchool, form} = useSelector((state) => state.school);
    const [selectedState, setSelectedState] = useState('');
    const [imagePreview, setImagePreview] = useState(''); // State for image preview
    const [logoPreview, setLogoPreview] = useState(''); // State for logo preview

    const [openDialog, setOpenDialog] = useState(false); // State for controlling dialog visibility
    const [credentials, setCredentials] = useState({loginId: '', password: ''}); // State for storing login credentials

    useEffect(() => {
        if (selectedSchool) {
            dispatch(setSelectedSchool(selectedSchool));
        } else {
            dispatch(resetSchoolForm());
        }
    }, [selectedSchool, dispatch]);

    const handleChange = (e) => {
        const {name, value, type, checked, files} = e.target;
        if (name === 'state') {
            setSelectedState(value);
        }
        if (type === 'file') {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1]; // Remove the MIME type prefix
                    dispatch(updateSchoolField(name, base64String)); // Store the base64 string of the image without the prefix
                    // Update previews
                    if (name === 'image') {
                        setImagePreview(reader.result);
                    } else if (name === 'logo') {
                        setLogoPreview(reader.result);
                    } // Set image preview
                };
                reader.readAsDataURL(file);
            }
        } else {
            dispatch(updateSchoolField(name, type === 'checkbox' ? checked : value));
        }
        if (name === 'email') {
            checkEmailExists(value);  // Trigger email check on email change
        }
    };

// Debounced function to check if the email already exists
    const checkEmailExists = debounce(async (email) => {
        try {
            const response = await LOGINAPI.get(`/api/master/isUserExist/${email}`);
            const emailExists = response.data === true; // Check if the response is true

            if (emailExists) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: 'This email address is already registered.'
                }));
            } else {
                setErrors({});
            }
        } catch (error) {
            console.error('Error checking email:', error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: 'Error checking email address. Please try again.'
            }));
        }
    }, 500);

    const validateForm = () => {
        console.log("Error ", errors);
        let tempErrors = {...errors}; // Start with existing errors in the state

        // Validate each required field
        fieldKeys.forEach((key) => {
            const field = fieldConfig[key];
            if (field.required && !form[key]) {
                tempErrors[key] = `${field.label} is required`;
            }
        });

        // Custom email validation
        if (!form.email || !/^[^\s@]+@[^\s@]+\.(com|in|co|org|net|edu|gov|mil|info|io|biz|me|name|[a-z]{2,})$/.test(form.email)) {
            tempErrors.email = "Please enter a valid email address (e.g., example@domain.com or example@domain.in)";
        }

        // Custom phone number validation
        if (!form.phone || !/^\d{10}$/.test(form.phone)) {
            tempErrors.phone = "Phone number must be exactly 10 digits.";
        }

        // Custom pincode validation
        if (!form.pincode || !/^\d{6}$/.test(form.pincode)) {
            tempErrors.pincode = "Pincode must be exactly 5 digits.";
        }

        // Log validation errors if any
        if (Object.keys(tempErrors).length > 0) {
            console.log("Form validation failed. Errors:", tempErrors);
            // Optionally, you could trigger a custom error message here
            // showCustomErrorMessage("Please correct the errors in the form.");
        }

        // Set the errors in the state
        setErrors(tempErrors);

        // Focus on the first field with an error if present
        if (Object.keys(tempErrors).length > 0) {
            console.log("Validation errors are set.");
            const firstErrorField = Object.keys(tempErrors)[0];
            document.querySelector(`[name="${firstErrorField}"]`)?.focus();
        }

        // Return true if no errors, false otherwise
        return Object.keys(tempErrors).length === 0;
    };

// Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form is being submitted");

        // Check if email exists first
        await checkEmailExists(form.email);

        // If email is valid, proceed with form validation
        if (validateForm()) {
            const {loginId, password} = generateUniqueCredentials(form.udiseCode, form.name);
            const formWithCredentials = {...form, loginId, password};
            dispatch(addSchool(formWithCredentials));

            // Set login credentials and open dialog
            setCredentials({loginId, password});
            setOpenDialog(true); // Show dialog with credentials on success

            // Clear selected school and trigger success callback
            dispatch(clearSelectedSchool());
            onRegistrationSuccess({loginId, password});
        } else {
            console.log("Form contains errors and cannot be submitted.");
        }
    };


    const handleCloseDialog = () => {
        setOpenDialog(false);

    };

    return (
        <Box sx={{padding: 2, maxWidth: 1200, margin: 'auto'}}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {Array.from({length: 3}).map((_, sectionIndex) => (  // Change to 3 sections
                        <Grid item xs={12} md={4} key={sectionIndex}>  {/* Change to 4 columns per section */}
                            {fieldKeys.slice(sectionIndex * numberOfFieldsPerSection, (sectionIndex + 1) * numberOfFieldsPerSection)
                                .map((key) => (
                                    fieldConfig[key].type === 'select' ? (
                                        <TextField
                                            key={key}
                                            select
                                            fullWidth
                                            name={key}
                                            label={fieldConfig[key].label}
                                            value={form[key] || ''}
                                            onChange={handleChange}
                                            variant="outlined"
                                            margin="normal"
                                            required={fieldConfig[key].required}
                                            error={Boolean(errors[key])}
                                            helperText={errors[key] || ''}
                                        >
                                            {key === 'state' && locations.states.map((state) => (
                                                <MenuItem key={state} value={state}>
                                                    {state}
                                                </MenuItem>
                                            ))}
                                            {key === 'district' && selectedState && locations.districts[selectedState] ? (
                                                locations.districts[selectedState].map((district) => (
                                                    <MenuItem key={district} value={district}>
                                                        {district}
                                                    </MenuItem>
                                                ))) : (
                                                <MenuItem value="" disabled>
                                                    Please select a state first
                                                </MenuItem>
                                            )}

                                            {key === 'session' && sessionOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    ) : fieldConfig[key].type === 'radio' ? (
                                        <FormControl key={key} component="fieldset" required>
                                            <FormLabel component="legend">{fieldConfig[key].label}</FormLabel>
                                            <RadioGroup
                                                name={key}
                                                value={form[key] || ''}
                                                onChange={handleChange}
                                            >
                                                {fieldConfig[key].options.map((option) => (
                                                    <FormControlLabel key={option} value={option} control={<Radio/>}
                                                                      label={option}/>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    ) : fieldConfig[key].type === 'checkbox' ? (
                                        <FormControl key={key} component="fieldset">
                                            <FormGroup>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            name={key}
                                                            checked={form[key] || false}
                                                            onChange={handleChange}
                                                        />
                                                    }
                                                    label={fieldConfig[key].label}
                                                />
                                            </FormGroup>
                                        </FormControl>
                                    ) : fieldConfig[key].type === 'file' ? (
                                        <TextField
                                            key={key}
                                            fullWidth
                                            name={key}
                                            label={fieldConfig[key].label}
                                            onChange={handleChange}
                                            variant="outlined"
                                            margin="normal"
                                            type="file"
                                            InputLabelProps={{shrink: true}}
                                        />
                                    ) : (
                                        <TextField
                                            key={key}
                                            fullWidth
                                            name={key}
                                            label={fieldConfig[key].label}
                                            value={form[key] || ''}
                                            onChange={handleChange}
                                            variant="outlined"
                                            margin="normal"
                                            type={fieldConfig[key].type}
                                            required={fieldConfig[key].required}
                                            error={Boolean(errors[key])}
                                            helperText={errors[key] || ''}
                                        />
                                    )
                                ))}
                        </Grid>
                    ))}
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary" type="submit" fullWidth
                            sx={{mt: 3, mb: 2, color: "whitesmoke", background: '#212121'}}>
                        {selectedSchool ? 'Update School' : 'Registration School'}
                    </Button>
                </Grid>
                {(imagePreview || logoPreview) && (
                    <Grid container spacing={2} justifyContent="center" alignItems="center" style={{marginTop: 20}}>
                        {imagePreview && (
                            <Grid item style={{position: "relative"}}>
                                <img
                                    src={imagePreview}
                                    alt="School"
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setImagePreview(null)} // Replace `setImagePreview` with your handler
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    }}
                                >
                                    <CloseIcon fontSize="small"/>
                                </IconButton>
                            </Grid>
                        )}
                        {logoPreview && (
                            <Grid item style={{position: "relative"}}>
                                <img
                                    src={logoPreview}
                                    alt="Logo"
                                    style={{
                                        width: "60px",
                                        height: "60px",
                                        objectFit: "cover",
                                        borderRadius: "4px",
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setLogoPreview(null)} // Replace `setLogoPreview` with your handler
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                                    }}
                                >
                                    <CloseIcon fontSize="small"/>
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                )}
            </form>
            <Dialog open={openDialog} onClose={handleCloseDialog}
                    PaperProps={{
                        style: {
                            borderRadius: '8px', // Makes the dialog square with slight rounding
                            backgroundColor: '#1a237e', // A stylish color
                            color: 'white',
                        },
                    }}>
                <DialogTitle>School Login Credentials</DialogTitle>
                <DialogContent>
                    <p>Login ID: {credentials.loginId}</p>
                    <p>Password: {credentials.password}</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default School;
