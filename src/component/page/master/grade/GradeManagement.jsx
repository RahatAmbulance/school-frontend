import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Fade,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    TextField,
    Typography,
    Zoom,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {useDispatch, useSelector} from "react-redux";
import {createGrade, deleteGrade, fetchGrades} from "./redux/gradeActions";
import {selectSchoolDetails} from "../../../../common";

function GradeManagement() {
    const [newGrade, setNewGrade] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const dispatch = useDispatch();
    const grades = useSelector((state) => state.grade.grades);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchGrades(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddGrade = () => {
        if (!newGrade.trim()) {
            setSnackbarMessage("Grade name cannot be blank.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        const gradeData = {
            name: newGrade,
            schoolId: schoolId,
            session,
        };
        dispatch(createGrade(gradeData))
            .then(() => {
                setSnackbarMessage("Grade added successfully!");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
                setNewGrade("");
            })
            .catch((error) => {
                setSnackbarMessage("Failed to add grade. Please try again.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            });
    };

    const handleDeleteGrade = (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this grade?"
        );
        if (confirmDelete) {
            dispatch(deleteGrade(id))
                .then(() => {
                    setSnackbarMessage("Grade deleted successfully.");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                })
                .catch((error) => {
                    setSnackbarMessage("Failed to delete the grade. Please try again.");
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Fade in timeout={800}>
                <Box>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: "primary.main",
                            mb: 4,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                        }}
                    >
                        Grade Management
                    </Typography>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Zoom in timeout={500}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 4,
                                        borderRadius: 2,
                                        background: "linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)",
                                        transition: "transform 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 500,
                                            color: "text.primary",
                                            mb: 3,
                                        }}
                                    >
                                        Add New Grade
                                    </Typography>
                                    <TextField
                                        label="New Grade"
                                        value={newGrade}
                                        onChange={(e) => setNewGrade(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        sx={{
                                            mb: 3,
                                            "& .MuiOutlinedInput-root": {
                                                "&:hover fieldset": {
                                                    borderColor: "primary.main",
                                                },
                                            },
                                        }}
                                    />
                                    <Button
                                        onClick={handleAddGrade}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={<AddCircleOutlineIcon/>}
                                        sx={{
                                            py: 1.5,
                                            textTransform: "none",
                                            borderRadius: 2,
                                            boxShadow: 2,
                                            "&:hover": {
                                                transform: "scale(1.02)",
                                                boxShadow: 3,
                                            },
                                            transition: "all 0.2s ease-in-out",
                                        }}
                                    >
                                        Add Grade
                                    </Button>
                                </Paper>
                            </Zoom>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Zoom in timeout={700}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 4,
                                        borderRadius: 2,
                                        background: "linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)",
                                        transition: "transform 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                        },
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 500,
                                            color: "text.primary",
                                            mb: 3,
                                        }}
                                    >
                                        Existing Grades
                                    </Typography>
                                    <List
                                        sx={{
                                            maxHeight: 400,
                                            overflowY: "auto",
                                            padding: 0,
                                            "&::-webkit-scrollbar": {
                                                width: "8px",
                                            },
                                            "&::-webkit-scrollbar-track": {
                                                background: "#f1f1f1",
                                                borderRadius: "10px",
                                            },
                                            "&::-webkit-scrollbar-thumb": {
                                                background: "#888",
                                                borderRadius: "10px",
                                                "&:hover": {
                                                    background: "#555",
                                                },
                                            },
                                        }}
                                    >
                                        {grades.map((grade) => (
                                            <Fade key={grade.id} in timeout={500}>
                                                <ListItem
                                                    sx={{
                                                        mb: 1,
                                                        borderRadius: 1,
                                                        bgcolor: "background.paper",
                                                        "&:hover": {
                                                            bgcolor: "action.hover",
                                                        },
                                                        transition: "all 0.2s ease-in-out",
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={grade.name}
                                                        sx={{
                                                            "& .MuiListItemText-primary": {
                                                                fontWeight: 500,
                                                            },
                                                        }}
                                                    />
                                                    <IconButton
                                                        onClick={() => handleDeleteGrade(grade.id)}
                                                        color="error"
                                                        sx={{
                                                            "&:hover": {
                                                                transform: "scale(1.1)",
                                                            },
                                                            transition: "transform 0.2s ease-in-out",
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </ListItem>
                                            </Fade>
                                        ))}
                                    </List>
                                </Paper>
                            </Zoom>
                        </Grid>
                    </Grid>
                </Box>
            </Fade>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{
                        width: "100%",
                        boxShadow: 3,
                        borderRadius: 2,
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default GradeManagement;
