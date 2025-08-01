import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useTheme
} from "@mui/material";
import {Print, Refresh, School} from "@mui/icons-material";
import "./AdmitCard.css";
import {useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../../common";
import {Pagination} from "@mui/lab";
import {useNavigate} from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AdmitCard = ({exam}) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [admitCardData, setAdmitCardData] = useState([]);
    const [students, setStudents] = useState([]);
    const [examDetails, setExamDetails] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "info"});
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector((state) => state.master.data.classSections);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();

    const [searchCriteria, setSearchCriteria] = useState({
        className: "",
        section: "",
        name: "",
        admissionNo: "",
        studentName: "",
        session: "",
        studentId: "",
        schoolId: schoolId,
    });

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                setLoading(true);
                const response = await api.get("/api/exams", {
                    params: {schoolId, session},
                });
                setExams(response.data);
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: "Failed to fetch exam data",
                    severity: "error"
                });
            } finally {
                setLoading(false);
            }
        };
        fetchExamData();
    }, []);

    const handleCriteriaChange = (event) => {
        const {name, value} = event.target;
        if (!name) return;

        setSearchCriteria((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const {className, section, session} = searchCriteria;

                const [examResponse, studentResponse] = await Promise.all([
                    api.get('/api/exams', {
                        params: {
                            className: className || "",
                            section: section || "",
                            session: session || "",
                            schoolId,
                        },
                    }),
                    className || section ? api.get('/api/students/class/section/school/admit', {
                        params: {
                            className: className || "",
                            section: section || "",
                            schoolId,
                            session: session || "",
                        },
                    }) : Promise.resolve({data: []})
                ]);

                setExamDetails(examResponse.data || []);
                setStudents(studentResponse.data || []);
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: "Failed to fetch data",
                    severity: "error"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchCriteria, schoolId]);

    const handleSelectAllChange = (e) => {
        if (e.target.checked) {
            const allOnPage = paginatedStudents.filter((student) => !selectedStudents.includes(student));
            setSelectedStudents((prevSelected) => [...prevSelected, ...allOnPage]);
        } else {
            const remainingStudents = selectedStudents.filter(
                (student) => !paginatedStudents.includes(student)
            );
            setSelectedStudents(remainingStudents);
        }
    };

    const handleReset = async () => {
        setSearchCriteria({
            className: "",
            section: "",
            name: "",
            admissionNo: "",
            studentName: "",
            session: "",
            studentId: "",
            schoolId: schoolId,
        });
        setStudents([]);
        setAdmitCardData([]);
        setSelectedStudents([]);
        setCurrentPage(1);

        try {
            const response = await api.get('/api/exams/admit', {params: {schoolId}});
            setExamDetails(response.data || []);
            setSnackbar({
                open: true,
                message: "Filters reset successfully",
                severity: "success"
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Failed to reset filters",
                severity: "error"
            });
        }
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleSelectStudent = (student) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(student)
                ? prevSelected.filter((s) => s !== student)
                : [...prevSelected, student]
        );
    };

    const paginatedStudents = students.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleGeneratePDF = () => {
        if (selectedStudents.length === 0) {
            setSnackbar({
                open: true,
                message: "Please select students first",
                severity: "warning"
            });
            return;
        }

        const uniqueStudents = [...new Set(selectedStudents)];
        const doc = new jsPDF();

        uniqueStudents.forEach((student, index) => {
            if (index > 0) doc.addPage();

            // Header
            doc.setFontSize(18).setFont("helvetica", "bold");
            doc.text(userData?.name || "Board of Secondary Education", 105, 20, {
                align: "center",
            });
            doc.setFontSize(14).text(
                "HIGHER SECONDARY SCHOOL CERTIFICATE EXAMINATION (10+2)",
                105,
                30,
                {align: "center"}
            );
            doc.text("ADMIT CARD", 105, 40, {align: "center"});

            // Student Details
            const detailsStartY = 50;
            doc.setFontSize(12).setFont("helvetica", "normal");

            // Left column
            doc.text(`Roll Number: ${student.rollNo || "N/A"}`, 10, detailsStartY);
            doc.text(`Candidate's Name: ${student.studentName || "N/A"}`, 10, detailsStartY + 10);
            doc.text(`Father's Name: ${student.fatherName || "N/A"}`, 10, detailsStartY + 20);
            doc.text(`D.O.B: ${student.dob || "N/A"}`, 10, detailsStartY + 30);

            // Right column
            doc.text(`Admission No: ${student.admissionNo || "N/A"}`, 105, detailsStartY);
            doc.text(`Class: ${student.className || "N/A"}`, 105, detailsStartY + 10);
            doc.text(`Section: ${student.section || "N/A"}`, 105, detailsStartY + 20);
            doc.text(`Gender: ${student.gender || "N/A"}`, 105, detailsStartY + 30);

            // Exam Details
            const studentExamDetails = examDetails.filter(
                (exam) =>
                    exam.className === student.className &&
                    exam.section === student.section
            );

            if (studentExamDetails.length > 0) {
                doc.text("Exam Details:", 10, detailsStartY + 40);
                const tableData = studentExamDetails.flatMap((exam) =>
                    exam.subjects.map((subject) => [
                        subject.name || "N/A",
                        subject.startDate
                            ? new Date(subject.startDate).toLocaleDateString()
                            : "N/A",
                        subject.startDate
                            ? new Date(subject.startDate).toLocaleTimeString()
                            : "N/A",
                        subject.roomNo || "N/A",
                    ])
                );

                doc.autoTable({
                    startY: detailsStartY + 50,
                    head: [["Subject", "Date", "Time", "Hall Number"]],
                    body: tableData,
                    theme: "grid",
                    styles: {fontSize: 10, cellPadding: 3},
                });
            } else {
                doc.text("No Exam Details Available.", 10, detailsStartY + 40);
            }

            // Footer
            const footerY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : detailsStartY + 60;
            doc.setFontSize(10).setFont("helvetica", "italic");
            doc.text("This is a system-generated admit card.", 105, footerY, {align: "center"});
        });

        doc.save("Admit_Cards.pdf");
        setSnackbar({
            open: true,
            message: "PDF generated successfully",
            severity: "success"
        });
    };

    return (
        <Container className="admit-card-container">
            <Box className="header-section">
                <Typography variant="h5" className="header-title">
                    <School sx={{mr: 1, verticalAlign: "middle"}}/>
                    Admit Card Generation
                </Typography>
            </Box>

            <Paper elevation={3} className="search-filters">
                <Grid container spacing={3} className="form-controls">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                label="Select Class"
                                name="className"
                                value={searchCriteria.className || ""}
                                onChange={handleCriteriaChange}
                            >
                                {classSections?.length > 0 ? (
                                    classSections.map((classSection) => (
                                        <MenuItem key={classSection.id} value={classSection.name}>
                                            {classSection.name}
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

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Section</InputLabel>
                            <Select
                                label="Section"
                                name="section"
                                value={searchCriteria.section || ""}
                                onChange={handleCriteriaChange}
                                disabled={!searchCriteria.className}
                            >
                                {classSections
                                    ?.find((cs) => cs.name === searchCriteria.className)
                                    ?.sections?.length > 0 ? (
                                    classSections
                                        .find((cs) => cs.name === searchCriteria.className)
                                        .sections.map((section) => (
                                        <MenuItem key={section.id} value={section.name}>
                                            {section.name}
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

                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Exam Name</InputLabel>
                            <Select
                                label="Exam Name"
                                name="name"
                                value={searchCriteria.name || ""}
                                onChange={handleCriteriaChange}
                            >
                                {examDetails.length > 0 ? (
                                    examDetails.map((exam) => (
                                        <MenuItem key={exam.id} value={exam.name}>
                                            {exam.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No Exam Available
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleReset}
                            startIcon={<Refresh/>}
                            fullWidth
                            sx={{height: "100%"}}
                        >
                            Reset Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={3} className="admit-card-display-paper">
                <Box className="select-all-section">
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={
                                    paginatedStudents.length > 0 &&
                                    paginatedStudents.every((student) => selectedStudents.includes(student))
                                }
                                indeterminate={
                                    paginatedStudents.some((student) => selectedStudents.includes(student)) &&
                                    !paginatedStudents.every((student) => selectedStudents.includes(student))
                                }
                                onChange={handleSelectAllChange}
                            />
                        }
                        label={`Select All (${selectedStudents.length} selected)`}
                    />
                </Box>

                <TableContainer className="table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">Select</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Roll Number</TableCell>
                                <TableCell>Admission No</TableCell>
                                <TableCell>Father Name</TableCell>
                                <TableCell>Gender</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedStudents.map((student, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    selected={selectedStudents.includes(student)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedStudents.includes(student)}
                                            onChange={() => handleSelectStudent(student)}
                                        />
                                    </TableCell>
                                    <TableCell>{student.studentName}</TableCell>
                                    <TableCell>{student.className}</TableCell>
                                    <TableCell>{student.section}</TableCell>
                                    <TableCell>{student.rollNo}</TableCell>
                                    <TableCell>{student.admissionNo}</TableCell>
                                    <TableCell>{student.fatherName}</TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className="action-buttons">
                    <Pagination
                        count={Math.ceil(students.length / itemsPerPage)}
                        page={currentPage}
                        onChange={handleChangePage}
                        color="primary"
                        size="large"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGeneratePDF}
                        startIcon={<Print/>}
                        disabled={selectedStudents.length === 0}
                    >
                        Generate Admit Cards
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdmitCard;