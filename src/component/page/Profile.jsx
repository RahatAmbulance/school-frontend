import React, {useState} from "react";
import {
    Box,
    Button,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {LOGINAPI, selectSchoolDetails, selectUserActualData,} from "../../common";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import {styled} from "@mui/system";
import {fetchUserSuccess} from "./dashboard/redux/userActions";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import "./Profile/Profile.css"

// Custom styling for the form container
const FormContainer = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    borderRadius: "15px",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
}));

const Profile = () => {
    const userData = useSelector(selectSchoolDetails);
    const actualUsrData = useSelector(selectUserActualData);
    const designation = useSelector((state) => state.master.data?.designation);
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        ...userData,
        fatherMobile: userData.fatherMobile || "",
        motherMobile: userData.motherMobile || "",
        fatherEmailAddress: userData.fatherEmailAddress || "",
        motherEmailAddress: userData.motherEmailAddress || "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    // Handle form field change
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (event, fieldName) => {
        const file = event.target.files[0]; // Get the uploaded file
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Update formData with the base64 string or file object
                setFormData((prevData) => ({
                    ...prevData,
                    [fieldName]: reader.result, // Use base64 string for display
                }));
            };
            reader.readAsDataURL(file); // Convert file to base64
        } else {
            // If no file is selected, reset the field
            setFormData((prevData) => ({
                ...prevData,
                [fieldName]: null,
            }));
        }
    };
    const formatCreationDate = (date) => {
        if (!date) return ""; // Handle empty or invalid dates
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    };
    // Handle session dropdown change
    const handlesessionChange = (event) => {
        setFormData({
            ...formData,
            session: event.target.value,
        });
    };

    // Toggle edit mode
    const toggleEdit = () => {
        setIsEditing(!isEditing);
        setFormData(userData); // Reset form data if canceled
    };

    // Handle form submit (API call with Axios)
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const UPDATE_PASSWORD = "/auth/update-pwd";
            const response = await LOGINAPI.put(UPDATE_PASSWORD, {
                id: formData.id,
                session: formData.session,
                email: formData.email,
                password:
                    formData.password == null
                        ? actualUsrData.password
                        : formData.password,
                user: formData
            });
            if (response.status === 200) {
                /*     // Ensure formData contains the correct password
                     const updatedFormData = {
                       ...formData,
                       password: formData.password || actualUsrData.password,
                     };
                     const userResponse = await api.put(
                       `/api/user/update/profile/${formData.userId}`,
                       updatedFormData
                     ); // Replace with your actual API endpoint*/
                console.log("Profile updated successfully:", response.data);
                dispatch(fetchUserSuccess(response.data));
                setSuccess(true);
                setIsEditing(false); // Exit edit mode after submitting
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const convertByteArrayToBase64 = (byteArray) => {
        return `data:image/jpeg;base64,${byteArray}`;
    };

    return (

        <Box
            sx={{
                p: {xs: 2, md: 4},
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "linear-gradient(to right,rgb(161, 95, 232), #2575FC)",
                color: "#fff",
            }}
        >
            <Box
                elevation={4}
                sx={{
                    width: {xs: "95%", md: "80%", lg: "60%"},
                    p: 4,
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    backgroundColor: "#fff",
                    color: "#000",
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    align="center"
                    sx={{
                        fontWeight: "bold",
                        background: "linear-gradient(to right, #6A11CB, #2575FC)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                    }}
                >
                    User Profile
                </Typography>
                <Divider sx={{mb: 3}}/>

                {/* Display error or success messages */}
                {error && (
                    <Typography
                        sx={{
                            mb: 2,
                            color: "#F44336",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <ErrorIcon sx={{mr: 1}}/>
                        {error}
                    </Typography>
                )}
                {success && (
                    <Typography
                        sx={{
                            mb: 2,
                            color: "#4CAF50",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <CheckCircleIcon sx={{mr: 1}}/>
                        Profile updated successfully!
                    </Typography>
                )}

                <Box
                    sx={{
                        borderRadius: "12px",

                        width: "100%",
                        height: "170px", // Adjust height for a better aspect ratio
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundColor: "#f5f5f5", // Fallback color
                        position: "relative",
                        marginBottom: "45px", // Add margin to accommodate the profile logo
                        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0))",
                    }}
                >
                    {/* Background Banner */}
                    <img
                        src={userData?.image ? convertByteArrayToBase64(userData.image) : '/placeholder-image.png'}
                        alt="Background Banner"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "12px",

                        }}
                    />

                    {/* Profile Logo */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: "-40px", // Adjusted to bring the logo closer to the top
                            left: "20px", // Aligned to the left side
                            width: "150px", // Standardized size
                            height: "150px",
                            borderRadius: "50%",
                            backgroundColor: "#fff",
                            overflow: "hidden",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for a professional look
                            border: "3px solid #ddd", // Light border for contrast
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",

                        }}
                    >
                        {userData?.logo ? (
                            <img
                                src={convertByteArrayToBase64(userData.logo)}
                                alt="Profile Logo"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <div className="avatar-placeholder"></div>
                            </div>
                        )}

                    </Box>
                </Box> {/* User Info Section */}
                <Box
                    sx={{
                        mt: 4,
                        textAlign: "center",
                        px: {xs: 2, md: 4},
                        width: "100%",
                        maxWidth: "800px",
                        backgroundColor: "#f4f4f4",
                        p: 3,
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: "bold",
                            marginTop: "12px",
                            textAlign: "left",
                            paddingLeft: "16px", // Optional: Add some padding to the left for better spacing
                            width: "100%", // Ensure the text takes up the full width of its container
                        }}
                    >
                        {userData.name || "User  Name"}
                    </Typography>
                    <Typography variant="body1" sx={{color: "text.secondary", mt: 1}}>
                        {"Personal Details"}
                    </Typography>
                    <Divider sx={{my: 2}}/>

                    {/* Editable Fields */}
                    <Grid container spacing={3}>
                        {Object.keys(userData).map((key) => {
                            if (key === "session") {
                                return (
                                    <Grid container item xs={12} md={6} key={key} alignItems="center">
                                        <Grid item xs={4} sx={{
                                            textAlign: {xs: "left", md: "right"},
                                            pr: {xs: 0, md: 2},
                                            pb: {xs: 1, md: 0}
                                        }}>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", fontSize: "1rem", color: "#333"}}>
                                                Session Year:
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={8}>
                                            {!isEditing ? (
                                                <Typography variant="body2" sx={{
                                                    color: "text.secondary",
                                                    padding: "8px 12px",
                                                    backgroundColor: "#f9f9f9",
                                                    borderRadius: "4px",
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                                }}>
                                                    {userData.session || "N/A"}
                                                </Typography>
                                            ) : (
                                                <FormControl fullWidth>
                                                    <InputLabel>Session Year</InputLabel>
                                                    <Select
                                                        value={formData.session}
                                                        onChange={handleChange}
                                                        label="Session Year"
                                                        sx={{
                                                            backgroundColor: "#fff",
                                                            borderRadius: "4px",
                                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                                        }}
                                                    >
                                                        {/* Replace with actual session options */}
                                                        {["2023", "2024", "2025"].map((option) => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            )}
                                        </Grid>
                                    </Grid>
                                );
                            } else if (key === "password" && isEditing) {
                                return (
                                    <Grid container item xs={12} md={6} key={key} alignItems="center">
                                        <Grid item xs={4} sx={{
                                            textAlign: {xs: "left", md: "right"},
                                            pr: {xs: 0, md: 2},
                                            pb: {xs: 1, md: 0}
                                        }}>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", fontSize: "1rem", color: "#333"}}>
                                                Password:
                                            </Typography>

                                        </Grid>
                                        <Grid item xs={8}>
                                            <TextField
                                                fullWidth
                                                name={key}
                                                type={showPassword ? "text" : "password"}
                                                value={formData[key] || ""}
                                                onChange={handleChange}
                                                variant="outlined"
                                                sx={{
                                                    padding: "10px",
                                                    backgroundColor: "#fff",
                                                    borderRadius: "4px",
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)}
                                                                        edge="end">
                                                                {showPassword ? <Visibility/> : <VisibilityOff/>}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                );
                            } else if (key === "image" || key === "logo") {
                                return (
                                    <Grid container item xs={12} md={6} key={key} alignItems="center">
                                        <Grid item xs={4} sx={{
                                            textAlign: {xs: "left", md: "right"},
                                            pr: {xs: 0, md: 2},
                                            pb: {xs: 1, md: 0}
                                        }}>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", fontSize: "1rem", color: "#333"}}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            {!isEditing ? (
                                                <Typography variant="body2" sx={{
                                                    color: "text.secondary",
                                                    padding: "8px 12px",
                                                    backgroundColor: "#f9f9f9",
                                                    borderRadius: "4px",
                                                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0 .1)"
                                                }}>
                                                    {userData[key] ? "Uploaded" : "Not Uploaded"}
                                                </Typography>
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    name={key}
                                                    type="file"
                                                    onChange={(e) => handleFileChange(e, key)}
                                                    variant="outlined"
                                                    sx={{
                                                        padding: "10px",
                                                        backgroundColor: "#fff",
                                                        borderRadius: "4px",
                                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                                    }}
                                                />
                                            )}
                                        </Grid>
                                    </Grid>
                                );
                            } else if (key === "schoolGroup") {
                                return (
                                    <Grid container item xs={12} md={6} key={key} alignItems="center">
                                        <Grid item xs={4} sx={{
                                            textAlign: {xs: "left", md: "right"},
                                            pr: {xs: 0, md: 2},
                                            pb: {xs: 1, md: 0}
                                        }}>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", fontSize: "1rem", color: "#333"}}>
                                                School Group:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{
                                                color: "text.secondary",
                                                padding: "8px 12px",
                                                backgroundColor: "#f9f9f9",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                            }}>
                                                {userData.schoolGroup || "N/A"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                );
                            } else if (key === "creationDate") {
                                return (
                                    <Grid container item xs={12} md={6} key={key} alignItems="center">
                                        <Grid item xs={4} sx={{
                                            textAlign: {xs: "left", md: "right"},
                                            pr: {xs: 0, md: 2},
                                            pb: {xs: 1, md: 0}
                                        }}>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", fontSize: "1rem", color: "#333"}}>
                                                Creation Date:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{
                                                color: "text.secondary",
                                                padding: "8px 12px",
                                                backgroundColor: "#f9f9f9",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                            }}>
                                                {new Date(userData.creationDate).toLocaleString("en-US", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                );
                            } else {
                                return (
                                    <Grid container item xs={12} md={6} key={key} alignItems="center">
                                        <Grid item xs={4} sx={{
                                            textAlign: {xs: "left", md: "right"},
                                            pr: {xs: 0, md: 2},
                                            pb: {xs: 1, md: 0}
                                        }}>
                                            <Typography variant="body1"
                                                        sx={{fontWeight: "bold", fontSize: "1rem", color: "#333"}}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={8}>
                                            <Typography variant="body2" sx={{
                                                color: "text.secondary",
                                                padding: "8px 12px",
                                                backgroundColor: "#f9f9f9",
                                                borderRadius: "4px",
                                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                                            }}>
                                                {userData[key] || "N/A"}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                );
                            }
                        })}
                    </Grid>
                    {/* Action buttons */}
                    <Box sx={{mt: 4, display: "flex", justifyContent: "center", gap: 2}}>
                        {isEditing ? (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon/>}
                                    onClick={handleSubmit}
                                    sx={{
                                        backgroundColor: "#007BFF",
                                        fontWeight: "bold",
                                        borderRadius: "8px",
                                        "&:hover": {
                                            backgroundColor: "#0056b3",
                                        },
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<CancelIcon/>}
                                    onClick={toggleEdit}
                                    sx={{
                                        borderColor: "#F44336",
                                        color: "#F44336",
                                        fontWeight: "bold",
                                        borderRadius: "8px",
                                        "&:hover": {
                                            backgroundColor: "#F44336",
                                            color: "#fff",
                                        },
                                    }}
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <IconButton
                                onClick={toggleEdit}
                                sx={{
                                    backgroundColor: "#007BFF",
                                    color: "#fff",
                                    borderRadius: "50%",
                                    "&:hover": {
                                        backgroundColor: "#0056b3",
                                    },
                                }}
                            >
                                <EditIcon/>
                            </IconButton>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>


    );

};

export default Profile;
