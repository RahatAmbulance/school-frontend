// src/components/AssignTeacher.js
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {assignClassTeacher, fetchSections, getTeacherAssignments} from "./redux/teacherSlice";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Tooltip,
    Typography
} from "@mui/material";
import {
    Class as ClassIcon,
    Close as CloseIcon,
    PersonAdd as PersonAddIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import {selectSchoolDetails} from "../../../../common";

const AssignTeacher = () => {
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const staff = useSelector(state => state.master.data?.staff || []);
    const classSections = useSelector(state => state.master?.data?.classSections || []);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [assignments, setAssignments] = useState([]);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Styles
    const styles = {
        container: {
            py: 4,
            px: 2
        },
        header: {
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 2
        },
        formCard: {
            p: 3,
            mb: 4,
            boxShadow: 3,
            borderRadius: 2
        },
        formControl: {
            mb: 3
        },
        buttonContainer: {
            mt: 4,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
        },
        assignmentsList: {
            maxHeight: '400px',
            overflow: 'auto'
        }
    };

    useEffect(() => {
        if (selectedTeacher) {
            const teacher = staff.find((staff) => staff.id === selectedTeacher);
            dispatch(
                getTeacherAssignments({
                    schoolId,
                    session,
                    teacherId: teacher?.id,
                    teacherName: teacher?.name,
                    classId: null,
                    sectionId: null,
                    className: null,
                })
            )
                .unwrap()
                .then((data) => {
                    setAssignments(data);
                    setDialogOpen(true);
                })
                .catch((error) => {
                    setSnackbar({
                        open: true,
                        message: 'Error fetching teacher assignments',
                        severity: 'error'
                    });
                });
        }
    }, [selectedTeacher, staff, schoolId, session, dispatch]);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            dispatch(
                getTeacherAssignments({
                    schoolId,
                    session,
                    teacherId: null,
                    teacherName: null,
                    classId: selectedClass,
                    sectionId: selectedSection,
                    className: null,
                })
            )
                .unwrap()
                .then((data) => {
                    setAssignments(data);
                    setDialogOpen(true);
                })
                .catch((error) => {
                    setSnackbar({
                        open: true,
                        message: 'Error fetching class-section assignments',
                        severity: 'error'
                    });
                });
        }
    }, [selectedClass, selectedSection, schoolId, session, dispatch]);

    useEffect(() => {
        if (selectedClass) {
            dispatch(fetchSections(selectedClass));
        }
    }, [selectedClass, dispatch]);

    const handleCloseDialog = () => setDialogOpen(false);
    const handleCloseSnackbar = () => setSnackbar(prev => ({...prev, open: false}));

    const handleAssignTeacher = () => {
        if (selectedTeacher && selectedClass && selectedSection) {
            const teacher = staff.find((staff) => staff.id === selectedTeacher);
            const selectClass = classSections.find((classn) => classn.id === selectedClass);
            const selectSection = selectClass?.sections.find((sec) => sec.id === selectedSection);

            dispatch(assignClassTeacher({
                classId: selectedClass,
                className: selectClass.name,
                sectionId: selectedSection,
                sectionName: selectSection.name,
                teacherId: selectedTeacher,
                teacherName: teacher.name,
                schoolId: schoolId,
                session: session,
            }))
                .then(() => {
                    setSnackbar({
                        open: true,
                        message: 'Teacher assigned successfully!',
                        severity: 'success'
                    });
                    // Reset form
                    setSelectedTeacher("");
                    setSelectedClass("");
                    setSelectedSection("");
                })
                .catch(() => {
                    setSnackbar({
                        open: true,
                        message: 'Error assigning teacher',
                        severity: 'error'
                    });
                });
        } else {
            setSnackbar({
                open: true,
                message: 'Please select all fields before assigning a teacher',
                severity: 'warning'
            });
        }
    };

    const loading = useSelector(state => state.master?.loading);
    const error = useSelector(state => state.master?.error);

    if (loading) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress/>
        </Box>
    );

    if (error) return (
        <Alert severity="error" sx={{m: 2}}>
            Error: {error}
        </Alert>
    );

    return (
        <Container maxWidth="lg">
            <Box sx={styles.container}>
                <Box sx={styles.header}>
                    <SchoolIcon fontSize="large" color="primary"/>
                    <Typography variant="h4" component="h1">
                        Assign Class Teacher
                    </Typography>
                </Box>

                <Paper sx={styles.formCard}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={styles.formControl}>
                                <InputLabel>Select Teacher</InputLabel>
                                <Select
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                    disabled={staff.length === 0}
                                    startAdornment={<PersonAddIcon sx={{mr: 1}}/>}
                                >
                                    {staff.length > 0 ? (
                                        staff.map((teacher) => (
                                            <MenuItem key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No teachers available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={styles.formControl}>
                                <InputLabel>Select Class</InputLabel>
                                <Select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    disabled={classSections.length === 0}
                                    startAdornment={<ClassIcon sx={{mr: 1}}/>}
                                >
                                    {classSections.length > 0 ? (
                                        classSections.map((classSection) => (
                                            <MenuItem key={classSection.id} value={classSection.id}>
                                                {classSection.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No Classes Available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={styles.formControl}>
                                <InputLabel>Select Section</InputLabel>
                                <Select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    disabled={!selectedClass || !classSections.find(c => c.id === selectedClass)?.sections?.length}
                                >
                                    {classSections?.find(cs => cs.id === selectedClass)?.sections?.length > 0
                                        ? classSections
                                            .find(cs => cs.id === selectedClass)
                                            .sections.map((section) => (
                                                <MenuItem key={section.id} value={section.id}>
                                                    {section.name}
                                                </MenuItem>
                                            ))
                                        : (
                                            <MenuItem disabled>No Sections Available</MenuItem>
                                        )
                                    }
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box sx={styles.buttonContainer}>
                        <Tooltip title="View Current Assignments">
                            <Button
                                variant="outlined"
                                onClick={() => setDialogOpen(true)}
                                disabled={!assignments.length}
                            >
                                View Assignments
                            </Button>
                        </Tooltip>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAssignTeacher}
                            disabled={!selectedTeacher || !selectedClass || !selectedSection}
                            startIcon={<PersonAddIcon/>}
                        >
                            Assign Teacher
                        </Button>
                    </Box>
                </Paper>

                {/* Assignments Dialog */}
                <Dialog
                    open={isDialogOpen}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Current Teacher Assignments</Typography>
                            <IconButton onClick={handleCloseDialog} size="small">
                                <CloseIcon/>
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <List sx={styles.assignmentsList}>
                            {assignments.length > 0 ? (
                                assignments.map((assignment, index) => (
                                    <React.Fragment key={assignment.id || index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" color="primary">
                                                        {assignment.teacherName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            Class: {assignment.className}
                                                        </Typography>
                                                        <br/>
                                                        <Typography component="span" variant="body2">
                                                            Section: {assignment.sectionName}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        {index < assignments.length - 1 && <Divider/>}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Typography color="textSecondary" align="center" py={2}>
                                    No assignments found
                                </Typography>
                            )}
                        </List>
                    </DialogContent>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{width: '100%'}}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default AssignTeacher;
