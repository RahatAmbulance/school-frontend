import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {Print, Refresh, School} from "@mui/icons-material";
import {useSelector} from "react-redux";
import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";
import {Pagination} from "@mui/lab";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./AdmitCard.css";

// Memoized components for better performance
const SearchFilters = React.memo(({
                                      searchCriteria,
                                      onCriteriaChange,
                                      onReset,
                                      classSections,
                                      examDetails,
                                      loading
                                  }) => (
    <Paper elevation={3} className="search-filters" sx={{p: 2}}>
        <Grid container spacing={2} alignItems="center" className="form-controls">
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Exam Name</InputLabel>
                    <Select
                        label="Exam Name"
                        name="name"
                        value={searchCriteria.name || ""}
                        onChange={onCriteriaChange}
                        disabled={loading}>
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
            <Grid item xs={12} md={3} display="flex" alignItems="center">
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onReset}
                    startIcon={<Refresh/>}
                    fullWidth
                    disabled={loading}
                    sx={{height: 56}}>
                    Reset Filters
                </Button>
            </Grid>
        </Grid>
    </Paper>


));

const StudentRow = React.memo(({
                                   student,
                                   isSelected,
                                   onSelect
                               }) => (
    <TableRow hover selected={isSelected}>
        <TableCell padding="checkbox">
            <Checkbox
                checked={isSelected}
                onChange={() => onSelect(student)}
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
));

const StudentTable = React.memo(({
                                     students,
                                     selectedStudents,
                                     onSelectStudent,
                                     onSelectAll,
                                     currentPage,
                                     itemsPerPage,
                                     loading
                                 }) => {
    const paginatedStudents = useMemo(() =>
            students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [students, currentPage, itemsPerPage]
    );

    const isAllSelected = useMemo(() =>
            paginatedStudents.length > 0 &&
            paginatedStudents.every((student) => selectedStudents.includes(student)),
        [paginatedStudents, selectedStudents]
    );

    const isIndeterminate = useMemo(() =>
            paginatedStudents.some((student) => selectedStudents.includes(student)) && !isAllSelected,
        [paginatedStudents, selectedStudents, isAllSelected]
    );

    if (loading) {
        return (
            <TableContainer className="table-container">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Skeleton variant="rectangular" width={20} height={20}/>
                            </TableCell>
                            {['Name', 'Class', 'Section', 'Roll Number', 'Admission No', 'Father Name', 'Gender'].map((header) => (
                                <TableCell key={header}>
                                    <Skeleton variant="text"/>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.from({length: 5}).map((_, index) => (
                            <TableRow key={index}>
                                {Array.from({length: 8}).map((_, cellIndex) => (
                                    <TableCell key={cellIndex}>
                                        <Skeleton variant="text"/>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <>
            <Box className="select-all-section">
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={onSelectAll}
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
                            <StudentRow
                                key={`${student.admissionNo}-${index}`}
                                student={student}
                                isSelected={selectedStudents.includes(student)}
                                onSelect={onSelectStudent}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
});

// Custom hooks for better logic separation
const useAdmitCardData = (schoolId, session) => {
    const [examDetails, setExamDetails] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchExamData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get("/api/exams", {
                params: {schoolId, session},
            });
            setExamDetails(response.data || []);
        } catch (error) {
            setError("Failed to fetch exam data");
            console.error("Exam fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [schoolId, session]);

    const fetchStudentData = useCallback(async (searchCriteria) => {
        const {className, section} = searchCriteria;
        if (!className && !section) {
            setStudents([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const [examResponse, studentResponse] = await Promise.all([
                api.get('/api/exams', {
                    params: {
                        className: className || "",
                        section: section || "",
                        session: session || "",
                        schoolId,
                    },
                }),
                api.get('/api/students/class/section/school/admit', {
                    params: {
                        className: className || "",
                        section: section || "",
                        schoolId,
                        session: session || "",
                    },
                })
            ]);

            setExamDetails(examResponse.data || []);
            setStudents(studentResponse.data || []);
        } catch (error) {
            setError("Failed to fetch student data");
            console.error("Student fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [schoolId, session]);

    return {
        examDetails,
        students,
        loading,
        error,
        fetchExamData,
        fetchStudentData
    };
};

const usePDFGeneration = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = useCallback(async (selectedStudents, examDetails, userData) => {
        if (selectedStudents.length === 0) {
            throw new Error("Please select students first");
        }

        setIsGenerating(true);

        try {
            // Use requestIdleCallback for better performance
            await new Promise((resolve) => {
                const generatePDFContent = () => {
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
                    resolve();
                };

                if (window.requestIdleCallback) {
                    window.requestIdleCallback(generatePDFContent);
                } else {
                    setTimeout(generatePDFContent, 0);
                }
            });
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {generatePDF, isGenerating};
};

const StudentAdmitCard = () => {
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const classSections = useSelector((state) => state.master.data.classSections);
    const schoolId = userData?.id;
    const session = userData?.session;

    const [selectedStudents, setSelectedStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "info"});
    const itemsPerPage = 10;

    const [searchCriteria, setSearchCriteria] = useState({
        className: userActualData.className,
        section: userActualData.section,
        name: userActualData.name,
        admissionNo: userActualData.admissionNo,
        studentName: userActualData.name,
        session: session,
        studentId: userActualData.tableId,
        schoolId: schoolId,
    });

    const {
        examDetails,
        students,
        loading,
        error,
        fetchExamData,
        fetchStudentData
    } = useAdmitCardData(schoolId, session);

    const {generatePDF, isGenerating} = usePDFGeneration();

    // Initialize data
    useEffect(() => {
        fetchExamData();
    }, [fetchExamData]);

    // Fetch student data when criteria changes
    useEffect(() => {
        fetchStudentData(searchCriteria);
    }, [searchCriteria, fetchStudentData]);

    // Show error snackbar
    useEffect(() => {
        if (error) {
            setSnackbar({
                open: true,
                message: error,
                severity: "error"
            });
        }
    }, [error]);

    const handleCriteriaChange = useCallback((event) => {
        const {name, value} = event.target;
        if (!name) return;

        setSearchCriteria((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setCurrentPage(1); // Reset to first page when criteria changes
    }, []);

    const handleSelectAllChange = useCallback((e) => {
        const paginatedStudents = students.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        if (e.target.checked) {
            const allOnPage = paginatedStudents.filter((student) => !selectedStudents.includes(student));
            setSelectedStudents((prevSelected) => [...prevSelected, ...allOnPage]);
        } else {
            const remainingStudents = selectedStudents.filter(
                (student) => !paginatedStudents.includes(student)
            );
            setSelectedStudents(remainingStudents);
        }
    }, [students, currentPage, itemsPerPage, selectedStudents]);

    const handleReset = useCallback(async () => {
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
        setSelectedStudents([]);
        setCurrentPage(1);

        try {
            await fetchExamData();
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
    }, [schoolId, fetchExamData]);

    const handleChangePage = useCallback((event, newPage) => {
        setCurrentPage(newPage);
    }, []);

    const handleSelectStudent = useCallback((student) => {
        setSelectedStudents((prevSelected) =>
            prevSelected.includes(student)
                ? prevSelected.filter((s) => s !== student)
                : [...prevSelected, student]
        );
    }, []);

    const handleGeneratePDF = useCallback(async () => {
        try {
            await generatePDF(selectedStudents, examDetails, userData);
            setSnackbar({
                open: true,
                message: "PDF generated successfully",
                severity: "success"
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || "Failed to generate PDF",
                severity: "error"
            });
        }
    }, [generatePDF, selectedStudents, examDetails, userData]);

    const totalPages = useMemo(() =>
            Math.ceil(students.length / itemsPerPage),
        [students.length, itemsPerPage]
    );

    return (
        <Container className="admit-card-container">
            <Box className="header-section">
                <Typography variant="h5" className="header-title">
                    <School sx={{mr: 1, verticalAlign: "middle"}}/>
                    Admit Card Generation
                </Typography>
            </Box>

            <SearchFilters
                searchCriteria={searchCriteria}
                onCriteriaChange={handleCriteriaChange}
                onReset={handleReset}
                classSections={classSections}
                examDetails={examDetails}
                loading={loading}
            />

            <Paper elevation={3} className="admit-card-display-paper">
                <StudentTable
                    students={students}
                    selectedStudents={selectedStudents}
                    onSelectStudent={handleSelectStudent}
                    onSelectAll={handleSelectAllChange}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    loading={loading}
                />

                <Box className="action-buttons">
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handleChangePage}
                        color="primary"
                        size="large"
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGeneratePDF}
                        startIcon={isGenerating ? <CircularProgress size={20}/> : <Print/>}
                        disabled={selectedStudents.length === 0 || isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate Admit Cards"}
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

export default StudentAdmitCard;
