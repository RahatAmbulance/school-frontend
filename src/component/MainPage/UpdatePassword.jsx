import React, {useState} from "react";
import {Alert, Box, Button, IconButton, Modal, Snackbar, TextField, Typography,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Import CloseIcon for the close button
import {LOGINAPI} from "../../common";
import {useNavigate} from "react-router-dom"; // Import useNavigate

const UpdatePassword = ({setTabIndex}) => {
    const [phone, setPhone] = useState("");
    const [otpPassword, setOtpPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate

    // Function to check if passwords match
    const passwordsMatch = otpPassword === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const UPDATE_PASSWORD = "/auth/update-pwd";
        try {
            const response = await LOGINAPI.put(UPDATE_PASSWORD, {
                email: phone,
                password: otpPassword,
            });
            console.log("update api response==", response);
            if (response.status === 200) {
                setSnackbarMessage("Password updated successfully!");
                setOpenSnackbar(true);
                // Clear form fields if needed
                setPhone("");
                setOtpPassword("");
                setConfirmPassword(""); // Clear confirm password
                // Redirect to homepage after success
                //setTabIndex(1);
                setTimeout(() => {
                    navigate("/"); // Navigate to the homepage
                }, 1500); // Close after 1.5 seconds
            }
        } catch (error) {
            console.log("------------------error----------");
            console.error("Error:", error);
            setSnackbarMessage("Failed to update password. Please try again.");
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <>
            <Modal
                open={true} // Always open the modal when this component is rendered
                aria-labelledby="forget-password-title"
                aria-describedby="forget-password-description"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backdropFilter: "blur(3px)", // Optional: add a blur effect to the backdrop
                }}
            >
                <Box
                    sx={{
                        width: {xs: "90%", sm: 400}, // Responsive width
                        bgcolor: "background.paper",
                        p: 3,
                        borderRadius: 2,
                        boxShadow: 3,
                        position: "relative",
                        animation: "fadeIn 0.3s ease-out", // Add fade-in animation
                    }}
                >
                    <IconButton
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "text.secondary",
                        }}
                    >
                        <CloseIcon/>
                    </IconButton>
                    <Typography
                        id="forget-password-title"
                        variant="h6"
                        component="h2"
                        mb={2}
                    >
                        Forgot Password
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{mt: 3}}
                    >
                        <TextField
                            margin="normal"
                            fullWidth
                            value={phone}
                            label="Email Address/Phone Number"
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            label="Password"
                            fullWidth
                            type="password"
                            value={otpPassword}
                            onChange={(e) => setOtpPassword(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            label="Confirm Password"
                            fullWidth
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2, color: "whitesmoke", background: "#212121"}}
                            disabled={!passwordsMatch} // Disable button if passwords do not match
                        >
                            Update Password
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                sx={{
                    // Snackbar styles
                    "& .MuiSnackbarContent-root": {
                        animation: "fadeIn 0.3s ease-out", // Add fade-in animation
                    },
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarMessage.includes("Failed") ? "error" : "success"}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Add CSS for animations */}
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </>
    );
};

export default UpdatePassword;
