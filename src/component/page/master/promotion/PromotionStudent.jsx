import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Typography,
} from "@mui/material";
import {ArrowForward, Class, School} from '@mui/icons-material';
import {fetchStudents} from "../../student/redux/studentActions";
import {useDispatch, useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../../common";
import {sessionOptions} from "../../../../commonStyle";

const PromotionStudent = () => {
    const dispatch = useDispatch();
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [fromClass, setFromClass] = useState("");
    const [fromSection, setFromSection] = useState("");
    const [toClass, setToClass] = useState("");
    const [toSection, setToSection] = useState("");
    const [toSessionYear, setToSessionYear] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const classSections = useSelector((state) => state.master?.data?.classSections || []);
    const {students} = useSelector((state) => state.students || []);

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    useEffect(() => {
        const selectClass = classSections.find((classn) => classn.id === fromClass);
        const selectSection = selectClass?.sections.find((sec) => sec.id === fromSection);

        const filtered = students.filter((student) => {
            const classMatch = fromClass ? student.className === selectClass.name : true;
            const sectionMatch = fromSection ? student.section === selectSection.name : true;
            return classMatch && sectionMatch;
        });
        setFilteredStudents(filtered);
    }, [fromClass, fromSection, students]);

    const handleStudentSelection = (studentId) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(studentId)
                ? prevSelected.filter((id) => id !== studentId)
                : [...prevSelected, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedStudents([]);
        } else {
            const allStudentIds = filteredStudents.map((student) => student.id);
            setSelectedStudents(allStudentIds);
        }
        setSelectAll(!selectAll);
    };

    const handlePromote = async () => {
        try {
            setLoading(true);
            const selClass = classSections.find((classn) => classn.id === toClass);
            const selSection = selClass?.sections.find((sec) => sec.id === toSection);

            await api.post(`/api/promote-students`, {
                studentIds: selectedStudents,
                schoolId,
                session,
                fromClass,
                fromSection,
                toClass,
                toSection,
                toSessionYear,
                className: selClass?.name,
                sectionName: selSection?.name,
                createdBy: userData.name,
            });

            setSnackbar({
                open: true,
                message: "Students promoted successfully!",
                severity: "success"
            });
            setSelectedStudents([]);
        } catch (error) {
            console.error("Error promoting students:", error);
            setSnackbar({
                open: true,
                message: "Failed to promote students.",
                severity: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({...snackbar, open: false});
    };

    return (
        <Box p={3}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 2,
                        background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <School color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" fontWeight={600}>
                                Current Class
                            </Typography>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>From Class</InputLabel>
                                    <Select
                                        value={fromClass}
                                        onChange={(e) => {
                                            setFromClass(e.target.value);
                                            setFromSection("");
                                        }}
                                        disabled={classSections.length === 0}
                                    >
                                        {classSections.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>From Section</InputLabel>
                                    <Select
                                        value={fromSection}
                                        onChange={(e) => setFromSection(e.target.value)}
                                        disabled={!fromClass || !classSections.find((c) => c.id === fromClass)?.sections?.length}
                                    >
                                        {classSections
                                            .find((c) => c.id === fromClass)
                                            ?.sections.map((section) => (
                                                <MenuItem key={section.id} value={section.id}>
                                                    {section.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                            <ArrowForward color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" fontWeight={600}>
                                Promote To
                            </Typography>
                        </Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>To Class</InputLabel>
                                    <Select
                                        value={toClass}
                                        onChange={(e) => {
                                            setToClass(e.target.value);
                                            setToSection("");
                                        }}
                                        disabled={classSections.length === 0}
                                    >
                                        {classSections.map((cls) => (
                                            <MenuItem key={cls.id} value={cls.id}>
                                                {cls.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>To Section</InputLabel>
                                    <Select
                                        value={toSection}
                                        onChange={(e) => setToSection(e.target.value)}
                                        disabled={!toClass || !classSections.find((c) => c.id === toClass)?.sections?.length}
                                    >
                                        {classSections
                                            .find((c) => c.id === toClass)
                                            ?.sections.map((section) => (
                                                <MenuItem key={section.id} value={section.id}>
                                                    {section.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>To Session Year</InputLabel>
                                    <Select
                                        value={toSessionYear}
                                        onChange={(e) => setToSessionYear(e.target.value)}
                                    >
                                        {sessionOptions.map((year) => (
                                            <MenuItem key={year.value} value={year.label}>
                                                {year.value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{
                        p: 3,
                        borderRadius: 2,
                        background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Class color="primary" sx={{mr: 1}}/>
                                <Typography variant="h6" fontWeight={600}>
                                    Students List
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        color="primary"
                                    />
                                }
                                label="Select All"
                            />
                        </Box>

                        <Box sx={{
                            maxHeight: 400,
                            overflowY: 'auto',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                        }}>
                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                    <CircularProgress/>
                                </Box>
                            ) : filteredStudents.length > 0 ? (
                                <List>
                                    {filteredStudents.map((student) => (
                                        <ListItem
                                            key={student.id}
                                            button
                                            onClick={() => handleStudentSelection(student.id)}
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: 'action.hover'
                                                }
                                            }}
                                        >
                                            <Checkbox
                                                checked={selectedStudents.includes(student.id)}
                                                color="primary"
                                            />
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight={500}>
                                                        {student.studentName}
                                                    </Typography>
                                                }
                                                secondary={`Roll No: ${student.rollNo}`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{p: 3, textAlign: 'center'}}>
                                    <Typography color="text.secondary">
                                        No students available.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePromote}
                                disabled={selectedStudents.length === 0 || !toClass || !toSection || !toSessionYear || loading}
                                sx={{
                                    minWidth: 200,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '1rem'
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit"/>
                                ) : (
                                    "Promote Selected Students"
                                )}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

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
    );
};

export default PromotionStudent;
