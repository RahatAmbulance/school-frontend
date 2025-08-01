import React, {useState} from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Fade,
    FormControl,
    Grid,
    IconButton,
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
    TextField,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../common";
import {styled} from "@mui/material/styles";

// Styled components for modern UI
const StyledContainer = styled(Container)(({theme}) => ({
    padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        transform: "translateY(-2px)",
    },
}));

const StyledFormControl = styled(FormControl)(({theme}) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: theme.spacing(1),
        transition: "all 0.2s ease-in-out",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
    },
    "& .MuiInputLabel-root": {
        color: theme.palette.text.secondary,
    },
}));

const StyledTableContainer = styled(TableContainer)(({theme}) => ({
    marginTop: theme.spacing(3),
    borderRadius: theme.spacing(2),
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    "& .MuiTableCell-head": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: "0.95rem",
    },
    "& .MuiTableRow-root": {
        "&:nth-of-type(odd)": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
    },
    "& .MuiTableCell-body": {
        padding: theme.spacing(2),
    },
}));

const StyledTextField = styled(TextField)(({theme}) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
        },
        "&.Mui-focused": {
            backgroundColor: theme.palette.background.paper,
        },
    },
}));

const StyledIconButton = styled(IconButton)(({theme}) => ({
    color: theme.palette.error.main,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.dark,
    },
}));

const StyledButton = styled(Button)(({theme}) => ({
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1.5, 4),
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    "&:hover": {
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
    },
}));

const GradeUpdateForm = () => {
    const [students, setStudents] = useState([]);
    const [examDetails, setExamDetails] = useState([]);
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector((state) => state.master.data.classSections);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [searchCriteria, setSearchCriteria] = useState({
        className: "",
        section: "",
        name: "",
        admissionNo: "",
        studentName: "",
        studentId: "",
        rollNumber: "",
        schoolId: schoolId,
        session,
        subjectName: "",
    });
    const [results, setResults] = useState([]);
    const [allResults, setAllResults] = useState([]); // Store the original list of results
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});

    // Helper function to generate unique IDs
    const generateUniqueId = (examId, subjectName, index) => {
        return `${examId}`;
    };

    const calculateGrade = (total) => {
        if (total >= 90) return "A+";
        if (total >= 80) return "A";
        if (total >= 70) return "B+";
        if (total >= 60) return "B";
        if (total >= 50) return "C";
        if (total >= 40) return "D";
        return "F"; // Fail grade
    };

    const handleInputChange = (id, event) => {
        const {name, value} = event.target;
        console.log("Updating field:", name, "with value:", value, "for ID:", id); // Debug log

        setResults((prevResults) =>
            prevResults.map((result) => {
                if (result.id === id) {
                    const updatedResult = {...result, [name]: value};

                    // Calculate total if theory or practical values are updated
                    if (name === "theory" || name === "practical") {
                        const theory = parseFloat(updatedResult.theory) || 0;
                        const practical = parseFloat(updatedResult.practical) || 0;
                        updatedResult.total = theory + practical; // Calculate the total
                        updatedResult.grade = calculateGrade(updatedResult.total); // Calculate the grade
                        console.log("Calculated total:", updatedResult.total, "Grade:", updatedResult.grade); // Debug log
                    }
                    return updatedResult;
                }
                return result;
            })
        );

        // Also update allResults to maintain consistency when filtering
        setAllResults((prevAllResults) =>
            prevAllResults.map((result) => {
                if (result.id === id) {
                    const updatedResult = {...result, [name]: value};

                    // Calculate total if theory or practical values are updated
                    if (name === "theory" || name === "practical") {
                        const theory = parseFloat(updatedResult.theory) || 0;
                        const practical = parseFloat(updatedResult.practical) || 0;
                        updatedResult.total = theory + practical;
                        updatedResult.grade = calculateGrade(updatedResult.total);
                    }
                    return updatedResult;
                }
                return result;
            })
        );
    };

    const handleDelete = (id) => {
        setResults((prevResults) =>
            prevResults.filter((result) => result.id !== id)
        );
        setAllResults((prevAllResults) =>
            prevAllResults.filter((result) => result.id !== id)
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updatedResults = results.map((result) => {
                // Calculate total and grade for each result before submitting
                const theory = parseFloat(result.theory) || 0;
                const practical = parseFloat(result.practical) || 0;
                const calculatedTotal = theory + practical;
                const calculatedGrade = calculateGrade(calculatedTotal);

                return {
                    ...result,
                    ...searchCriteria,
                    // Use dbId if it exists (for updates), otherwise use the generated id
                    id: result.dbId || result.id,
                    // Ensure total and grade are properly calculated
                    total: calculatedTotal,
                    grade: calculatedGrade,
                    // Ensure numeric values are properly formatted
                    theory: theory,
                    practical: practical,
                    maxMarks: parseFloat(result.maxMarks) || 0,
                    minMarks: parseFloat(result.minMarks) || 0,
                };
            });

            console.log("Data being sent to API:", updatedResults); // Debug log

            await api.post("/api/results/update", updatedResults);
            setSnackbar({
                open: true,
                message: "Grades updated successfully!",
                severity: "success",
            });
            setResults([]);
            setAllResults([]);
            setExamDetails([]);
            setSearchCriteria({
                className: "",
                section: "",
                name: "",
                admissionNo: "",
                studentName: "",
                rollNumber: "",
                studentId: "",
                schoolId: schoolId,
                session,
                subjectName: "",
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Error updating grades. Please try again.",
                severity: "error",
            });
            console.error("Error submitting data:", error);
        } finally {
            setLoading(false);
        }
    };


    async function fetchExamBySession(session) {
        try {
            const response = await api.get("/api/exams/session", {
                params: {
                    session: session,
                    schoolId: schoolId,
                },
            });
            setExamDetails(response.data);
        } catch (error) {
            console.error("Error fetching exam details:", error);
        }
    }

    const fetchExamBySessionByClassAndSection = async (className, section) => {
        try {
            const response = await api.get("/api/exams/class/section/school", {
                params: {
                    className: className || searchCriteria.className,
                    section: section || searchCriteria.section,
                    schoolId: schoolId,
                },
            });
            setExamDetails(response.data);
        } catch (error) {
            console.error("Error fetching exam details:", error);
        }
    };

    const handleCriteriaChange = async (event) => {
        const {name, value} = event.target;
        if (!name) {
            console.error("event.target.name is undefined");
            return;
        }
        setSearchCriteria((prevState) => ({
            ...prevState,
            [name]: value,
        }));

        if (name === "session") {
            await fetchExamBySession(value);
        }

        if (name === "className") {
            setSearchCriteria((prevState) => ({
                ...prevState,
                section: "", // Reset section when class changes
            }));
            await fetchStudents(value, "");
            await fetchExamBySessionByClassAndSection(value, "");
        } else if (name === "section") {
            await fetchStudents(searchCriteria.className, value);
            await fetchExamBySessionByClassAndSection(
                searchCriteria.className,
                value
            );
        } else if (name === "studentName") {
            if (value === "") {
                setResults(allResults); // Reset to the original list of results
            } else {
                const filteredResults = allResults.filter(
                    (result) => result.subject === value
                );
                setResults(filteredResults); // Update results to only show selected subject
            }
            const selectedStudent = students.find(
                (student) => student.studentName === value
            );
            setSearchCriteria((prevState) => ({
                ...prevState,
                admissionNo: selectedStudent?.admissionNo || "",
                studentId: selectedStudent?.id || "",
                rollNumber: selectedStudent?.rollNo || "",
            }));
        } else if (name === "name") { // When selecting the Exam Name
            const updatedCriteria = {...searchCriteria, [name]: value};

            if (
                updatedCriteria.session &&
                updatedCriteria.className &&
                updatedCriteria.section
            ) {
                await fetchExamBySessionByClassAndSectionAndSession(
                    updatedCriteria.className,
                    updatedCriteria.section,
                    updatedCriteria.session
                );
            }

            if (
                updatedCriteria.session &&
                updatedCriteria.className &&
                updatedCriteria.section &&
                updatedCriteria.name &&
                updatedCriteria.studentId
            ) {
                try {
                    // Get all subjects for this exam from examDetails
                    const selectedExam = examDetails.find(exam => exam.name === updatedCriteria.name);

                    if (!selectedExam) {
                        console.error("Selected exam not found in examDetails");
                        return;
                    }

                    // Create base results with all subjects from the exam - FIXED: Unique IDs
                    const allSubjectsResults = selectedExam.subjects.map((subject, index) => ({
                        id: generateUniqueId(selectedExam.id, subject.name, index), // FIXED: Unique ID for each subject
                        subject: subject.name,
                        name: selectedExam.name,
                        maxMarks: subject.maxMarks,
                        minMarks: subject.minMarks,
                        theory: "",
                        practical: "",
                        total: "",
                        grade: "",
                    }));

                    // Try to get existing results to pre-populate
                    const params = {
                        session: updatedCriteria.session,
                        className: updatedCriteria.className,
                        section: updatedCriteria.section,
                        name: updatedCriteria.name,
                        studentId: updatedCriteria.studentId,
                        studentName: updatedCriteria.studentName,
                        schoolId: schoolId,
                    };

                    const response = await api.get("/api/results/exam-details", {params});
                    console.log("Existing Results:", response.data);

                    // If we have existing results, merge them with all subjects
                    if (response.data && response.data.length > 0) {
                        const existingResultsMap = new Map();
                        response.data.forEach(item => {
                            existingResultsMap.set(item.subject, item);
                        });

                        // Merge existing data with all subjects
                        const mergedResults = allSubjectsResults.map(subjectResult => {
                            const existingResult = existingResultsMap.get(subjectResult.subject);
                            if (existingResult) {
                                return {
                                    ...subjectResult,
                                    // Keep the generated unique ID, but store database ID separately
                                    dbId: existingResult.id, // Store database ID separately
                                    theory: existingResult.theory || "",
                                    practical: existingResult.practical || "",
                                    total: existingResult.obtainedMarks || "",
                                    grade: existingResult.grade || "",
                                };
                            }
                            return subjectResult;
                        });

                        setResults(mergedResults);
                        setAllResults(mergedResults);
                    } else {
                        // No existing results, show all subjects with empty fields
                        console.log("No existing results found, showing all subjects with empty fields");
                        setResults(allSubjectsResults);
                        setAllResults(allSubjectsResults);
                    }

                } catch (error) {
                    console.error("Error fetching exam details:", error);
                    // On error, still show all subjects from the exam
                    const selectedExam = examDetails.find(exam => exam.name === updatedCriteria.name);
                    if (selectedExam) {
                        const fallbackResults = selectedExam.subjects.map((subject, index) => ({
                            id: generateUniqueId(selectedExam.id, subject.name, index), // FIXED: Unique ID
                            subject: subject.name,
                            name: selectedExam.name,
                            maxMarks: subject.maxMarks,
                            minMarks: subject.minMarks,
                            theory: "",
                            practical: "",
                            total: "",
                            grade: "",
                        }));
                        setResults(fallbackResults);
                        setAllResults(fallbackResults);
                    }
                }
            }
        } else if (name === "subjectName") { // When selecting a subject
            if (value === "") {
                setResults(allResults); // Reset to show all subjects
            } else {
                const filteredResults = allResults.filter(
                    (result) => result.subject === value
                );
                setResults(filteredResults); // Update results to only show selected subject
            }
        }
    };

    const fetchExamBySessionByClassAndSectionAndSession = async (
        className,
        section,
        session
    ) => {
        try {
            const response = await api.get("/api/exams/class/section/session", {
                params: {
                    className: className,
                    section: section,
                    session: session,
                    schoolId: schoolId,
                },
            });
            setExamDetails(response.data);
        } catch (error) {
            console.error(
                "Error fetching exams by session, class, and section:",
                error
            );
        }
    };

    const fetchStudents = async (className, section) => {
        try {
            const response = await api.get("/api/students/class/section/school", {
                params: {
                    className: className || searchCriteria.className,
                    section: section || searchCriteria.section,
                    schoolId: schoolId,
                    session,
                    grade: "grade",
                },
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    return (
        <StyledContainer>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" sx={{fontWeight: 600, color: "primary.main"}}>
                    Grade Update Form
                </Typography>
            </Box>

            <StyledPaper>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={2}>
                        <StyledFormControl fullWidth>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                name="className"
                                value={searchCriteria.className || ""}
                                onChange={handleCriteriaChange}
                                label="Select Class"
                            >
                                {classSections && classSections.length > 0 ? (
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
                        </StyledFormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <StyledFormControl fullWidth>
                            <InputLabel id="select-section-label">Section</InputLabel>
                            <Select
                                label="section"
                                labelId="select-section"
                                id="select-section"
                                name="section"
                                value={searchCriteria.section || ""}
                                onChange={handleCriteriaChange}
                                disabled={!searchCriteria.className}
                            >
                                {classSections?.find(
                                    (cs) => cs.name === searchCriteria.className
                                )?.sections?.length > 0 ? (
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
                        </StyledFormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <StyledFormControl fullWidth>
                            <InputLabel id="select-student-label">Select Student</InputLabel>
                            <Select
                                labelId="select-student-label"
                                id="select-student"
                                name="studentName"
                                value={searchCriteria.studentName || ""}
                                onChange={handleCriteriaChange}
                                disabled={!students.length}
                                label="Select Student"
                            >
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <MenuItem key={student.id} value={student.studentName}>
                                            {student.studentName}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No Students Available
                                    </MenuItem>
                                )}
                            </Select>
                        </StyledFormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <StyledFormControl fullWidth variant="outlined">
                            <InputLabel id="exam-name-label">Exam Name</InputLabel>
                            <Select
                                labelId="exam-name-label"
                                id="exam-name-select"
                                name="name"
                                value={searchCriteria.name || ""}
                                onChange={handleCriteriaChange}
                                label="Exam Name"
                            >
                                {examDetails.map((exam) => (
                                    <MenuItem key={exam.id} value={exam.name}>
                                        {exam.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <StyledFormControl fullWidth variant="outlined">
                            <InputLabel id="subject-label">Select Subject</InputLabel>
                            <Select
                                labelId="subject-label"
                                id="subject-select"
                                name="subjectName"
                                value={searchCriteria.subjectName || ""}
                                onChange={handleCriteriaChange}
                                label="Select Subject"
                            >
                                <MenuItem value="">All Subjects</MenuItem>
                                {Array.from(new Set(allResults.map(result => result.subject))).map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
                                    </MenuItem>
                                ))}
                            </Select>
                        </StyledFormControl>
                    </Grid>

                    <Grid item xs={12}>
                        {searchCriteria.className &&
                            searchCriteria.section &&
                            searchCriteria.name &&
                            searchCriteria.studentName && (
                                <Fade in timeout={500}>
                                    <StyledPaper
                                        sx={{
                                            mb: 4,
                                            background: "linear-gradient(45deg, #f7f9fc 30%, #eef2f7 90%)",
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: (theme) => theme.palette.primary.main,
                                                        mb: 2,
                                                    }}
                                                >
                                                    Student Details
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body1">
                                                    <Box component="span"
                                                         sx={{fontWeight: 600, color: "text.secondary"}}>
                                                        Student Name:
                                                    </Box>{" "}
                                                    {searchCriteria.studentName || "N/A"}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body1">
                                                    <Box component="span"
                                                         sx={{fontWeight: 600, color: "text.secondary"}}>
                                                        Class:
                                                    </Box>{" "}
                                                    {searchCriteria.className || "N/A"}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body1">
                                                    <Box component="span"
                                                         sx={{fontWeight: 600, color: "text.secondary"}}>
                                                        Section:
                                                    </Box>{" "}
                                                    {searchCriteria.section || "N/A"}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body1">
                                                    <Box component="span"
                                                         sx={{fontWeight: 600, color: "text.secondary"}}>
                                                        Exam Name:
                                                    </Box>{" "}
                                                    {searchCriteria.name || "N/A"}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body1">
                                                    <Box component="span"
                                                         sx={{fontWeight: 600, color: "text.secondary"}}>
                                                        Admission No:
                                                    </Box>{" "}
                                                    {searchCriteria.admissionNo || "N/A"}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </StyledPaper>
                                </Fade>
                            )}

                        <StyledTableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Exam Name</TableCell>
                                        <TableCell>Max Marks</TableCell>
                                        <TableCell>Min Marks</TableCell>
                                        <TableCell>Theory</TableCell>
                                        <TableCell>Practical</TableCell>
                                        <TableCell>Total</TableCell>
                                        {/* <TableCell>Grade</TableCell>*/}
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <StyledTextField
                                                    value={field.subject || ""}
                                                    InputProps={{readOnly: true}}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StyledTextField
                                                    name="name"
                                                    value={field.name || ""}
                                                    onChange={(e) => handleInputChange(field.id, e)}
                                                    InputProps={{readOnly: true}}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StyledTextField
                                                    name="maxMarks"
                                                    value={field.maxMarks || ""}
                                                    onChange={(e) => handleInputChange(field.id, e)}
                                                    InputProps={{readOnly: true}}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StyledTextField
                                                    name="minMarks"
                                                    value={field.minMarks || ""}
                                                    onChange={(e) => handleInputChange(field.id, e)}
                                                    InputProps={{readOnly: true}}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StyledTextField
                                                    name="theory"
                                                    type="number"
                                                    value={field.theory || ""}
                                                    onChange={(e) => handleInputChange(field.id, e)}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StyledTextField
                                                    name="practical"
                                                    type="number"
                                                    value={field.practical || ""}
                                                    onChange={(e) => handleInputChange(field.id, e)}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <StyledTextField
                                                    name="total"
                                                    value={(field.total !== null && field.total !== undefined && field.total !== "") ? field.total : ((parseFloat(field.theory) || 0) + (parseFloat(field.practical) || 0)) || ""}
                                                    InputProps={{readOnly: true}}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>
                                            {/*                  <TableCell>
                                                <StyledTextField
                                                    name="grade"
                                                    value={field.grade || ""}
                                                    InputProps={{readOnly: true}}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </TableCell>*/}
                                            <TableCell align="center">
                                                <StyledIconButton
                                                    aria-label="delete"
                                                    onClick={() => handleDelete(field.id)}
                                                    size="small"
                                                >
                                                    <DeleteIcon/>
                                                </StyledIconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </StyledTableContainer>
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 3,
                        }}
                    >
                        <StyledButton
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={loading || results.length === 0}
                            startIcon={loading && <CircularProgress size={20} color="inherit"/>}
                        >
                            {loading ? "Updating..." : "Update Grades"}
                        </StyledButton>
                    </Grid>
                </Grid>
            </StyledPaper>

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
                    sx={{width: "100%"}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default GradeUpdateForm;
