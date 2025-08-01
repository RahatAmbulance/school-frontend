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
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import AssessmentIcon from '@mui/icons-material/Assessment';
import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";

const StudentMarkSheet = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalStudents: 0,
        passedStudents: 0,
        averageScore: 0,
    });

    // Get user details and school info from Redux
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;
    const classSections = useSelector((state) => state.master.data.classSections);

    // State for search criteria and fetched data
    const [searchCriteria, setSearchCriteria] = useState({
        className: userActualData.className,
        section: userActualData.section,
        examName: "",
        studentId: userActualData.tableId,
        studentName: userActualData.name,
        schoolId: schoolId,
        session: session,
    });
    const [examDetails, setExamDetails] = useState([]); // for exam dropdown
    const [students, setStudents] = useState([]); // for student dropdown
    const [marks, setMarks] = useState([]); // marks data to display in table

    // Fetch exam details when the session changes
    useEffect(() => {
        console.log("useEffect triggered with session:", session);
        if (session) {
            fetchExamDetails(session);
            console.log("fetchExamDetails called with session:", session);
        } else {
            console.log("Session not available, skipping fetchExamDetails");
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
            const passedStudents = new Set(marks.filter(m => m.total >= m.minMarks).map(m => m.studentName)).size;
            const avgScore = marks.reduce((acc, curr) => acc + (curr.total / curr.maxMarks) * 100, 0) / marks.length;

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

    // Enhanced Print handler with detailed table in PDF
    const handlePrint = async () => {
        try {
            const {jsPDF} = await import('jspdf');
            const autoTable = (await import('jspdf-autotable')).default;

            if (marks.length === 0) {
                alert('No marks data available to print.');
                return;
            }

            console.log('Marks data for PDF:', marks);

            const pdf = new jsPDF({orientation: 'portrait', unit: 'pt', format: 'a4'});

            // Page dimensions and layout constants
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 30;
            const contentWidth = pageWidth - (2 * margin);
            const centerX = pageWidth / 2;

            // Color palette
            const colors = {
                primary: [41, 128, 185],
                secondary: [52, 73, 94],
                success: [46, 204, 113],
                danger: [231, 76, 60],
                warning: [243, 156, 18],
                lightGray: [248, 249, 250],
                darkGray: [108, 117, 125],
                white: [255, 255, 255],
                blue: [52, 152, 219]
            };

            // Typography settings
            const fonts = {
                title: {size: 18, style: 'bold'},
                subtitle: {size: 14, style: 'bold'},
                heading: {size: 12, style: 'bold'},
                subheading: {size: 10, style: 'bold'},
                body: {size: 9, style: 'normal'},
                small: {size: 8, style: 'normal'},
                tiny: {size: 7, style: 'normal'}
            };

            // Helper function to set font
            const setFont = (fontConfig, color = colors.secondary) => {
                pdf.setFontSize(fontConfig.size);
                pdf.setFont('helvetica', fontConfig.style);
                pdf.setTextColor(...color);
            };

            // Group marks by student
            const studentGroups = {};
            marks.forEach(mark => {
                const studentKey = mark.studentName || 'Unknown Student';
                if (!studentGroups[studentKey]) {
                    studentGroups[studentKey] = {
                        studentInfo: {
                            name: mark.studentName || 'Unknown Student',
                            admissionNo: mark.admissionNo || 'N/A',
                            rollNumber: mark.rollNumber || 'N/A'
                        },
                        subjects: []
                    };
                }
                studentGroups[studentKey].subjects.push(mark);
            });

            let pageNumber = 1;

            // Generate marksheet for each student
            Object.entries(studentGroups).forEach(([studentName, studentData], studentIndex) => {
                if (studentIndex > 0) {
                    pdf.addPage();
                    pageNumber++;
                }

                let yPos = 0;

                // === HEADER SECTION ===
                // Main header background
                pdf.setFillColor(...colors.primary);
                pdf.rect(0, 0, pageWidth, 80, 'F');

                // School logo circle
                pdf.setFillColor(...colors.white);
                pdf.circle(centerX, 30, 18, 'F');
                pdf.setFillColor(...colors.primary);
                setFont(fonts.small, colors.primary);
                pdf.text('LOGO', centerX, 33, {align: 'center'});

                // School name
                setFont(fonts.title, colors.white);
                pdf.text(userData?.schoolName || 'SCHOOL NAME', centerX, 60, {align: 'center'});

                yPos = 95;

                // === DOCUMENT TITLE ===
                pdf.setFillColor(...colors.white);
                pdf.setDrawColor(...colors.primary);
                pdf.setLineWidth(2);
                pdf.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'FD');

                setFont(fonts.subtitle, colors.primary);
                pdf.text('STUDENT MARKSHEET', centerX, yPos + 22, {align: 'center'});

                yPos += 50;

                // === STUDENT INFORMATION SECTION ===
                const infoBoxHeight = 70;
                pdf.setFillColor(...colors.lightGray);
                pdf.setDrawColor(...colors.darkGray);
                pdf.setLineWidth(1);
                pdf.roundedRect(margin, yPos, contentWidth, infoBoxHeight, 3, 3, 'FD');

                // Section headers
                const leftColX = margin + 15;
                const rightColX = centerX + 15;
                const headerY = yPos + 18;

                setFont(fonts.subheading, colors.primary);
                pdf.text('STUDENT INFORMATION', leftColX, headerY);
                pdf.text('EXAMINATION DETAILS', rightColX, headerY);

                // Divider line
                pdf.setDrawColor(...colors.darkGray);
                pdf.setLineWidth(0.5);
                pdf.line(centerX, yPos + 25, centerX, yPos + infoBoxHeight - 5);

                // Student details (left column)
                setFont(fonts.body, colors.secondary);
                let leftY = headerY + 15;
                const lineSpacing = 12;

                pdf.text(`Name: ${studentData.studentInfo.name}`, leftColX, leftY);
                leftY += lineSpacing;
                pdf.text(`Admission No: ${studentData.studentInfo.admissionNo}`, leftColX, leftY);
                leftY += lineSpacing;
                pdf.text(`Roll Number: ${studentData.studentInfo.rollNumber}`, leftColX, leftY);

                // Examination details (right column)
                let rightY = headerY + 15;

                if (searchCriteria.className && searchCriteria.section) {
                    pdf.text(`Class: ${searchCriteria.className} - Section: ${searchCriteria.section}`, rightColX, rightY);
                    rightY += lineSpacing;
                }
                if (searchCriteria.examName) {
                    pdf.text(`Examination: ${searchCriteria.examName}`, rightColX, rightY);
                    rightY += lineSpacing;
                }
                if (session) {
                    pdf.text(`Session: ${session}`, rightColX, rightY);
                }

                yPos += infoBoxHeight + 20;

                // === MARKS TABLE SECTION ===
                // Section header
                pdf.setFillColor(...colors.primary);
                pdf.roundedRect(margin, yPos, contentWidth, 28, 3, 3, 'F');
                setFont(fonts.heading, colors.white);
                pdf.text('SUBJECT-WISE MARKS DETAILS', centerX, yPos + 18, {align: 'center'});

                yPos += 40;

                // Prepare table data with proper calculations
                const tableData = [];
                studentData.subjects.forEach((mark, index) => {
                    const subject = mark.subject || mark.name || `Subject ${index + 1}`;
                    const maxMarks = parseInt(mark.maxMarks) || 0;
                    const minMarks = parseInt(mark.minMarks) || 0;
                    const theory = parseInt(mark.theory) || 0;
                    const practical = parseInt(mark.practical) || 0;
                    const total = parseInt(mark.total) || 0;

                    // Calculate percentage and grade
                    const percentage = maxMarks > 0 ? (total / maxMarks) * 100 : 0;
                    let grade = 'F';
                    if (percentage >= 90) grade = 'A+';
                    else if (percentage >= 80) grade = 'A';
                    else if (percentage >= 70) grade = 'B+';
                    else if (percentage >= 60) grade = 'B';
                    else if (percentage >= 50) grade = 'C';
                    else if (percentage >= 40) grade = 'D';

                    const status = total >= minMarks ? 'PASS' : 'FAIL';

                    tableData.push([
                        subject,
                        maxMarks.toString(),
                        minMarks.toString(),
                        theory.toString(),
                        practical.toString(),
                        total.toString(),
                        percentage.toFixed(1) + '%',
                        grade,
                        status
                    ]);
                });

                // Enhanced marks table
                autoTable(pdf, {
                    startY: yPos,
                    head: [['Subject', 'Max\nMarks', 'Min\nMarks', 'Theory', 'Practical', 'Total\nObtained', 'Percentage', 'Grade', 'Status']],
                    body: tableData,
                    margin: {left: margin, right: margin},
                    tableWidth: contentWidth,
                    theme: 'striped',
                    styles: {
                        fontSize: 8,
                        cellPadding: {top: 5, right: 3, bottom: 5, left: 3},
                        lineColor: [220, 220, 220],
                        lineWidth: 0.5,
                        halign: 'center',
                        valign: 'middle',
                        textColor: colors.secondary
                    },
                    headStyles: {
                        fillColor: colors.primary,
                        textColor: colors.white,
                        fontSize: 9,
                        fontStyle: 'bold',
                        halign: 'center',
                        valign: 'middle',
                        cellPadding: {top: 6, right: 3, bottom: 6, left: 3}
                    },
                    columnStyles: {
                        0: {halign: 'left', cellWidth: 75},    // Subject
                        1: {cellWidth: 45},                    // Max Marks
                        2: {cellWidth: 45},                    // Min Marks
                        3: {cellWidth: 50},                    // Theory
                        4: {cellWidth: 55},                    // Practical
                        5: {cellWidth: 50, fontStyle: 'bold'}, // Total
                        6: {cellWidth: 55},                    // Percentage
                        7: {cellWidth: 45, fontStyle: 'bold'}, // Grade
                        8: {cellWidth: 50, fontStyle: 'bold'}  // Status
                    },
                    alternateRowStyles: {
                        fillColor: [252, 252, 252]
                    },
                    didParseCell: function (data) {
                        // Color code grades
                        if (data.column.index === 7) {
                            const grade = data.cell.raw;
                            if (['A+', 'A'].includes(grade)) {
                                data.cell.styles.fillColor = colors.success;
                                data.cell.styles.textColor = colors.white;
                            } else if (['B+', 'B'].includes(grade)) {
                                data.cell.styles.fillColor = colors.blue;
                                data.cell.styles.textColor = colors.white;
                            } else if (['C', 'D'].includes(grade)) {
                                data.cell.styles.fillColor = colors.warning;
                                data.cell.styles.textColor = colors.white;
                            } else {
                                data.cell.styles.fillColor = colors.danger;
                                data.cell.styles.textColor = colors.white;
                            }
                        }

                        // Color code status
                        if (data.column.index === 8) {
                            const status = data.cell.raw;
                            data.cell.styles.fillColor = status === 'PASS' ? colors.success : colors.danger;
                            data.cell.styles.textColor = colors.white;
                        }

                        // Color code percentage
                        if (data.column.index === 6) {
                            const percentage = parseFloat(data.cell.raw);
                            if (percentage >= 90) {
                                data.cell.styles.fillColor = colors.success;
                                data.cell.styles.textColor = colors.white;
                            } else if (percentage >= 70) {
                                data.cell.styles.fillColor = colors.blue;
                                data.cell.styles.textColor = colors.white;
                            } else if (percentage >= 40) {
                                data.cell.styles.fillColor = colors.warning;
                                data.cell.styles.textColor = colors.white;
                            } else {
                                data.cell.styles.fillColor = colors.danger;
                                data.cell.styles.textColor = colors.white;
                            }
                        }
                    },
                    didFinishTable: function (data) {
                        yPos = data.cursor.y + 25;
                    }
                });

                // === PERFORMANCE SUMMARY ===
                // Calculate comprehensive statistics
                const stats = {
                    totalMaxMarks: studentData.subjects.reduce((sum, mark) => sum + (parseInt(mark.maxMarks) || 0), 0),
                    totalMinMarks: studentData.subjects.reduce((sum, mark) => sum + (parseInt(mark.minMarks) || 0), 0),
                    totalTheory: studentData.subjects.reduce((sum, mark) => sum + (parseInt(mark.theory) || 0), 0),
                    totalPractical: studentData.subjects.reduce((sum, mark) => sum + (parseInt(mark.practical) || 0), 0),
                    totalObtained: studentData.subjects.reduce((sum, mark) => sum + (parseInt(mark.total) || 0), 0),
                    totalSubjects: studentData.subjects.length,
                    passedSubjects: studentData.subjects.filter(mark => (parseInt(mark.total) || 0) >= (parseInt(mark.minMarks) || 0)).length
                };

                stats.overallPercentage = stats.totalMaxMarks > 0 ? (stats.totalObtained / stats.totalMaxMarks * 100).toFixed(2) : 0;
                stats.overallStatus = stats.passedSubjects === stats.totalSubjects ? 'PASS' : 'FAIL';

                // Calculate overall grade
                const percentage = parseFloat(stats.overallPercentage);
                let overallGrade = 'F';
                if (percentage >= 90) overallGrade = 'A+';
                else if (percentage >= 80) overallGrade = 'A';
                else if (percentage >= 70) overallGrade = 'B+';
                else if (percentage >= 60) overallGrade = 'B';
                else if (percentage >= 50) overallGrade = 'C';
                else if (percentage >= 40) overallGrade = 'D';

                // Summary table data
                const summaryData = [
                    ['Total Maximum Marks', stats.totalMaxMarks.toString()],
                    ['Total Minimum Marks', stats.totalMinMarks.toString()],
                    ['Total Theory Marks', stats.totalTheory.toString()],
                    ['Total Practical Marks', stats.totalPractical.toString()],
                    ['Total Marks Obtained', stats.totalObtained.toString()],
                    ['Overall Percentage', stats.overallPercentage + '%'],
                    ['Overall Grade', overallGrade],
                    ['Subjects Passed', `${stats.passedSubjects}/${stats.totalSubjects}`],
                    ['Final Result', stats.overallStatus]
                ];

                // Performance summary table
                autoTable(pdf, {
                    startY: yPos,
                    head: [['PERFORMANCE SUMMARY', 'VALUE']],
                    body: summaryData,
                    margin: {left: margin + 100, right: margin + 100},
                    tableWidth: contentWidth - 200,
                    theme: 'grid',
                    styles: {
                        fontSize: 9,
                        cellPadding: {top: 6, right: 8, bottom: 6, left: 8},
                        lineColor: [200, 200, 200],
                        lineWidth: 0.5,
                        textColor: colors.secondary
                    },
                    headStyles: {
                        fillColor: colors.secondary,
                        textColor: colors.white,
                        fontSize: 10,
                        fontStyle: 'bold',
                        halign: 'center'
                    },
                    columnStyles: {
                        0: {halign: 'left', fontStyle: 'bold', cellWidth: 120},
                        1: {halign: 'center', fontStyle: 'bold', cellWidth: 80}
                    },
                    didParseCell: function (data) {
                        // Color code final result
                        if (data.row.index === 8 && data.column.index === 1) {
                            const result = data.cell.raw;
                            data.cell.styles.fillColor = result === 'PASS' ? colors.success : colors.danger;
                            data.cell.styles.textColor = colors.white;
                        }

                        // Color code overall grade
                        if (data.row.index === 6 && data.column.index === 1) {
                            const grade = data.cell.raw;
                            if (['A+', 'A'].includes(grade)) {
                                data.cell.styles.fillColor = colors.success;
                                data.cell.styles.textColor = colors.white;
                            } else if (['B+', 'B'].includes(grade)) {
                                data.cell.styles.fillColor = colors.blue;
                                data.cell.styles.textColor = colors.white;
                            } else if (['C', 'D'].includes(grade)) {
                                data.cell.styles.fillColor = colors.warning;
                                data.cell.styles.textColor = colors.white;
                            } else {
                                data.cell.styles.fillColor = colors.danger;
                                data.cell.styles.textColor = colors.white;
                            }
                        }
                    },
                    didFinishTable: function (data) {
                        yPos = data.cursor.y + 30;
                    }
                });

                // === REMARKS SECTION ===
                setFont(fonts.body, colors.secondary);
                pdf.text('Remarks:', margin + 10, yPos);
                pdf.setDrawColor(...colors.darkGray);
                pdf.setLineWidth(0.5);
                pdf.line(margin + 60, yPos, pageWidth - margin - 10, yPos);
                pdf.line(margin + 10, yPos + 15, pageWidth - margin - 10, yPos + 15);

                yPos += 40;

                // === SIGNATURE SECTION ===
                const signatureY = Math.max(yPos, pageHeight - 100);

                setFont(fonts.body, colors.secondary);

                // Signature boxes and labels
                const sigBoxWidth = 120;
                const sigBoxHeight = 40;

                // Class Teacher signature
                pdf.setDrawColor(...colors.darkGray);
                pdf.setLineWidth(1);
                pdf.rect(margin + 20, signatureY - 10, sigBoxWidth, sigBoxHeight);
                pdf.text('Class Teacher', margin + 20 + (sigBoxWidth / 2), signatureY + 45, {align: 'center'});
                pdf.text('Date: _______________', margin + 20, signatureY + 58);

                // Principal signature
                pdf.rect(pageWidth - margin - 20 - sigBoxWidth, signatureY - 10, sigBoxWidth, sigBoxHeight);
                pdf.text('Principal', pageWidth - margin - 20 - (sigBoxWidth / 2), signatureY + 45, {align: 'center'});
                pdf.text('Date: _______________', pageWidth - margin - 140, signatureY + 58);

                // School seal
                const sealSize = 60;
                pdf.setDrawColor(...colors.primary);
                pdf.setLineWidth(2);
                pdf.circle(centerX, signatureY + 10, sealSize / 2);
                setFont(fonts.small, colors.primary);
                pdf.text('SCHOOL', centerX, signatureY + 5, {align: 'center'});
                pdf.text('SEAL', centerX, signatureY + 15, {align: 'center'});

                // === FOOTER ===
                setFont(fonts.tiny, colors.darkGray);
                const currentDate = new Date();
                const footerText = `Generated on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()} | Page ${pageNumber} of ${Object.keys(studentGroups).length}`;
                pdf.text(footerText, centerX, pageHeight - 15, {align: 'center'});
            });

            // Save the PDF with a descriptive filename
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const studentName = searchCriteria.studentName ? searchCriteria.studentName.replace(/\s+/g, '_') : 'Students';
            const examName = searchCriteria.examName ? searchCriteria.examName.replace(/\s+/g, '_') : 'Exam';
            const fileName = `Marksheet_${studentName}_${examName}_${timestamp}.pdf`;

            pdf.save(fileName);
            console.log('Enhanced PDF generated successfully:', fileName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(`Error generating PDF: ${error.message}. Please try again.`);
        }
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
                    <Grid container spacing={3} alignItems="center">
                        {/* Exam Name Dropdown */}
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Exam Name</InputLabel>
                                <Select
                                    name="examName"
                                    value={searchCriteria.examName}
                                    onChange={handleCriteriaChange}
                                    label="Exam Name"
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {borderRadius: 2}
                                    }}
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

                        {/* Search Button */}
                        <Grid item xs={12} md={4}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleSearch}
                                disabled={loading}
                                startIcon={
                                    loading ? <CircularProgress size={20} color="inherit"/> : <SearchIcon/>
                                }
                                sx={{borderRadius: 2, py: 1}}
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </Grid>

                        {/* Print Button */}
                        {marks.length > 0 && (
                            <Grid item xs={12} md={4}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                    onClick={handlePrint}
                                    startIcon={<PrintIcon/>}
                                    sx={{borderRadius: 2, py: 1}}
                                    className="no-print"
                                >
                                    Print MarkSheet
                                </Button>
                            </Grid>
                        )}
                    </Grid>
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
                                        <TableCell align="center">Theory</TableCell>
                                        <TableCell align="center">Practical</TableCell>
                                        <TableCell align="center">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {marks.map((mark, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                '&:nth-of-type(odd)': {bgcolor: theme.palette.action.hover},
                                                '&:hover': {bgcolor: theme.palette.action.selected}
                                            }}
                                        >
                                            <TableCell>{mark.studentName || 'N/A'}</TableCell>
                                            <TableCell>{mark.admissionNo || 'N/A'}</TableCell>
                                            <TableCell>{mark.rollNumber || 'N/A'}</TableCell>
                                            <TableCell>{mark.subject || mark.name || 'N/A'}</TableCell>
                                            <TableCell align="center">{mark.maxMarks || 0}</TableCell>
                                            <TableCell align="center">{mark.minMarks || 0}</TableCell>
                                            <TableCell align="center">{mark.theory || 0}</TableCell>
                                            <TableCell align="center">{mark.practical || 0}</TableCell>
                                            <TableCell align="center">{mark.total || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Fade>
                )}

                {/* No Data Message */}
                {marks.length === 0 && !loading && (
                    <Paper sx={{padding: 4, textAlign: 'center'}}>
                        <Typography variant="h6" color="textSecondary">
                            No marks data found. Please select an exam and click search.
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Container>
    );
};

export default StudentMarkSheet;
