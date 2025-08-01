import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Fade,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from "@mui/material";
import {useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../common";
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Marksheet = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        passedStudents: 0,
        averageScore: 0,
    });

    // Get user details and school info from Redux
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const classSections = useSelector((state) => state.master.data.classSections);

    // State for search criteria and fetched data
    const [searchCriteria, setSearchCriteria] = useState({
        className: "",
        section: "",
        examName: "",
        studentId: "",
        studentName: "",
        schoolId: schoolId,
        session: session,
    });
    const [examDetails, setExamDetails] = useState([]); // for exam dropdown
    const [students, setStudents] = useState([]); // for student dropdown
    const [marks, setMarks] = useState([]); // marks data to display in table

    // Fetch exam details when the session changes
    useEffect(() => {
        if (session) {
            fetchExamDetails(session);
        }
    }, [session]);

    // When class and section are selected, fetch the list of students
    useEffect(() => {
        if (searchCriteria.className && searchCriteria.section) {
            fetchStudents(searchCriteria.className, searchCriteria.section);
        }
    }, [searchCriteria.className, searchCriteria.section]);

    // Calculate stats when marks change
    useEffect(() => {
        if (marks.length > 0) {
            const totalStudents = new Set(marks.map(m => m.studentName)).size;
            const passedStudents = new Set(marks.filter(m => m.obtainedMarks >= m.minMarks).map(m => m.studentName)).size;
            const avgScore = marks.reduce((acc, curr) => acc + (curr.obtainedMarks / curr.maxMarks) * 100, 0) / marks.length;

            setStats({
                totalStudents,
                passedStudents,
                averageScore: Math.round(avgScore * 10) / 10,
            });
        }
    }, [marks]);

    // --- API CALLS ---

    // Fetch exam details for a given session
    const fetchExamDetails = async (sessionVal) => {
        setLoading(true);
        try {
            const response = await api.get("/api/exams/session", {
                params: {session: sessionVal, schoolId},
            });
            setExamDetails(response.data || []);
        } catch (error) {
            console.error("Error fetching exam details:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch students for the selected class and section
    const fetchStudents = async (className, section) => {
        setLoading(true);
        try {
            const response = await api.get("/api/students/class/section/school", {
                params: {className, section, schoolId, session},
            });
            setStudents(response.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    // Update search criteria when an input value changes
    const handleCriteriaChange = (event) => {
        const {name, value} = event.target;
        setSearchCriteria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // When user clicks "Search", fetch marks using the search criteria
    const handleSearch = async () => {
        setLoading(true);
        try {
            // Adjust the endpoint and parameters as needed.
            const response = await api.get("/api/results/search", {
                params: searchCriteria,
            });
            setMarks(response.data || []);
        } catch (error) {
            console.error("Error fetching marks:", error);
        } finally {
            setLoading(false);
        }
    };

    // Print handler with PDF generation
    const handlePrint = async () => {
        const {jsPDF} = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const pdf = new jsPDF({orientation: 'landscape', unit: 'pt', format: 'a4'});

        // Table columns
        const columns = [
            {header: 'Student Name', dataKey: 'studentName'},
            {header: 'Admission No', dataKey: 'admissionNo'},
            {header: 'Roll Number', dataKey: 'rollNumber'},
            {header: 'Subject', dataKey: 'subject'},
            {header: 'Max Marks', dataKey: 'maxMarks'},
            {header: 'Min Marks', dataKey: 'minMarks'},
            {header: 'Obtained Marks', dataKey: 'obtainedMarks'},
            {header: 'Theory', dataKey: 'theory'},
            {header: 'Practical', dataKey: 'practical'},
            {header: 'Total', dataKey: 'total'},
            {header: 'Grade', dataKey: 'grade'},
            {header: 'Status', dataKey: 'status'},
        ];

        // Table rows
        const rows = marks.map(mark => ({
            ...mark,
            subject: mark.subject || mark.name,
            status: mark.obtainedMarks >= mark.minMarks ? 'Pass' : 'Fail'
        }));

        // Add title and details
        pdf.setFontSize(18);
        pdf.text('Student Marksheet', pdf.internal.pageSize.getWidth() / 2, 40, {align: 'center'});
        pdf.setFontSize(12);
        if (searchCriteria.studentName) {
            pdf.text(`Student: ${searchCriteria.studentName}`, 40, 65);
        }
        if (searchCriteria.className && searchCriteria.section) {
            pdf.text(`Class: ${searchCriteria.className} - ${searchCriteria.section}`, 40, 85);
        }
        if (searchCriteria.examName) {
            pdf.text(`Exam: ${searchCriteria.examName}`, 40, 105);
        }

        // Add table
        autoTable(pdf, {
            columns,
            body: rows,
            startY: 120,
            styles: {fontSize: 10, cellPadding: 4},
            headStyles: {fillColor: [41, 128, 185]}
        });

        pdf.save(`Marksheet_${searchCriteria.studentName || 'All'}_${searchCriteria.examName || ''}.pdf`);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{
                padding: 3,
                '& .MuiPaper-root': {
                    borderRadius: 2,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }
            }}>
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        mb: 4
                    }}
                >
                    <AssessmentIcon sx={{mr: 1, verticalAlign: 'middle'}}/>
                    Student Marksheet
                </Typography>

                {/* Stats Cards */}
                {marks.length > 0 && (
                    <Fade in={true}>
                        <Grid container spacing={3} sx={{mb: 4}}>
                            <Grid item xs={12} md={4}>
                                <Card sx={{bgcolor: theme.palette.primary.light, color: 'white'}}>
                                    <CardContent>
                                        <Typography variant="h6">Total Students</Typography>
                                        <Typography variant="h3">{stats.totalStudents}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{bgcolor: theme.palette.success.light, color: 'white'}}>
                                    <CardContent>
                                        <Typography variant="h6">Passed Students</Typography>
                                        <Typography variant="h3">{stats.passedStudents}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card sx={{bgcolor: theme.palette.info.light, color: 'white'}}>
                                    <CardContent>
                                        <Typography variant="h6">Average Score</Typography>
                                        <Typography variant="h3">{stats.averageScore}%</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Fade>
                )}

                {/* Search Filters */}
                <Paper sx={{padding: 3, marginBottom: 4}} className="no-print">
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    name="className"
                                    value={searchCriteria.className}
                                    onChange={handleCriteriaChange}
                                    label="Class"
                                    sx={{'& .MuiOutlinedInput-notchedOutline': {borderRadius: 2}}}
                                >
                                    {classSections && classSections.length > 0 ? (
                                        classSections.map((cs) => (
                                            <MenuItem key={cs.id} value={cs.name}>
                                                {cs.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>
                                            No Classes Available
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Section Selector */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Section</InputLabel>
                                <Select
                                    name="section"
                                    value={searchCriteria.section}
                                    onChange={handleCriteriaChange}
                                    label="Section"
                                    disabled={!searchCriteria.className}
                                    sx={{'& .MuiOutlinedInput-notchedOutline': {borderRadius: 2}}}
                                >
                                    {classSections &&
                                    classSections.find(
                                        (cs) => cs.name === searchCriteria.className
                                    ) &&
                                    classSections
                                        .find((cs) => cs.name === searchCriteria.className)
                                        .sections?.map((sec) => (
                                        <MenuItem key={sec.id} value={sec.name}>
                                            {sec.name}
                                        </MenuItem>
                                    )) ? (
                                        classSections
                                            .find((cs) => cs.name === searchCriteria.className)
                                            .sections.map((sec) => (
                                            <MenuItem key={sec.id} value={sec.name}>
                                                {sec.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>
                                            No Sections Available
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Exam Selector */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Exam Name</InputLabel>
                                <Select
                                    name="examName"
                                    value={searchCriteria.examName}
                                    onChange={handleCriteriaChange}
                                    label="Exam Name"
                                    sx={{'& .MuiOutlinedInput-notchedOutline': {borderRadius: 2}}}
                                >
                                    {examDetails && examDetails.length > 0 ? (
                                        examDetails.map((exam) => (
                                            <MenuItem key={exam.id} value={exam.name}>
                                                {exam.name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>
                                            No Exams Available
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        {/* Student Selector */}
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Student Name</InputLabel>
                                <Select
                                    name="studentId"
                                    value={searchCriteria.studentId}
                                    onChange={(event) => {
                                        const selectedId = event.target.value;
                                        const selectedStudent = students.find(s => s.id === selectedId);
                                        setSearchCriteria(prev => ({
                                            ...prev,
                                            studentId: selectedId,
                                            studentName: selectedStudent ? selectedStudent.studentName : ""
                                        }));
                                    }}
                                    label="Student Name"
                                    disabled={!students || students.length === 0}
                                    sx={{'& .MuiOutlinedInput-notchedOutline': {borderRadius: 2}}}
                                >
                                    {students && students.length > 0 ? (
                                        students.map((student) => (
                                            <MenuItem key={student.id} value={student.id}>
                                                {student.studentName}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>
                                            No Students Available
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{marginTop: 3, textAlign: "center"}}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSearch}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SearchIcon/>}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1,
                                mr: 2
                            }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                        {marks.length > 0 && (
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handlePrint}
                                startIcon={<PrintIcon/>}
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1
                                }}
                                className="no-print"
                            >
                                Print Marksheet
                            </Button>
                        )}
                    </Box>
                </Paper>
                {/* Marks Table */}
                {marks.length > 0 && (
                    <Fade in={true}>
                        <TableContainer component={Paper} sx={{mb: 4}}>
                            <Table className="marksheet-table-pdf">
                                <TableHead>
                                    <TableRow sx={{
                                        bgcolor: theme.palette.primary.main,
                                        '& .MuiTableCell-head': {
                                            color: 'white',
                                            fontWeight: 600
                                        }
                                    }}>
                                        <TableCell>Student Name</TableCell>
                                        <TableCell>Admission No</TableCell>
                                        <TableCell>Roll Number</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell align="center">Max Marks</TableCell>
                                        <TableCell align="center">Min Marks</TableCell>
                                        <TableCell align="center">Obtained Marks</TableCell>
                                        <TableCell align="center">Theory</TableCell>
                                        <TableCell align="center">Practical</TableCell>
                                        <TableCell align="center">Total</TableCell>
                                        <TableCell align="center">Grade</TableCell>
                                        <TableCell align="center">Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {marks.map((mark) => (
                                        <TableRow
                                            key={mark.id}
                                            sx={{
                                                '&:nth-of-type(odd)': {bgcolor: theme.palette.action.hover},
                                                '&:hover': {bgcolor: theme.palette.action.selected}
                                            }}
                                        >
                                            <TableCell>{mark.studentName}</TableCell>
                                            <TableCell>{mark.admissionNo}</TableCell>
                                            <TableCell>{mark.rollNumber}</TableCell>
                                            <TableCell>{mark.subject || mark.name}</TableCell>
                                            <TableCell align="center">{mark.maxMarks}</TableCell>
                                            <TableCell align="center">{mark.minMarks}</TableCell>
                                            <TableCell align="center">{mark.obtainedMarks}</TableCell>
                                            <TableCell align="center">{mark.theory}</TableCell>
                                            <TableCell align="center">{mark.practical}</TableCell>
                                            <TableCell align="center">{mark.total}</TableCell>
                                            <TableCell align="center">{mark.grade}</TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: mark.obtainedMarks >= mark.minMarks ? 'success.main' : 'error.main',
                                                        fontWeight: 600,
                                                        bgcolor: mark.obtainedMarks >= mark.minMarks ? 'success.light' : 'error.light',
                                                        py: 0.5,
                                                        px: 2,
                                                        borderRadius: 1,
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {mark.obtainedMarks >= mark.minMarks ? "Pass" : "Fail"}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Fade>
                )}
            </Box>
        </Container>
    );
};

export default Marksheet;