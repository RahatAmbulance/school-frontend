import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Fade,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Typography
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import {useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../../common";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './PrintDocument.css';

const BonafideCertificate = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const classSections = useSelector((state) => state.master.data.classSections);
    const userData = useSelector(selectSchoolDetails);

    const schoolId = userData?.id;
    const session = userData?.session;
    const [searchCriteria, setSearchCriteria] = useState({
        className: "",
        section: "",
        studentName: "",
        studentId: "",
        schoolId: schoolId,
        session,
    });
    const [students, setStudents] = useState([]);
    const certificateRef = useRef(null);

    useEffect(() => {
        if (searchCriteria.className && searchCriteria.section) {
            fetchStudents(searchCriteria.className, searchCriteria.section);
        }
    }, [searchCriteria.className, searchCriteria.section]);

    const fetchStudents = async (className, section) => {
        setLoading(true);
        try {
            const response = await api.get("/api/students/class/section/school", {
                params: {className, section, schoolId, session},
            });
            setStudents(response.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch students. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        try {
            if (!selectedStudent) return;

            // Create new PDF document
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Add school header
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text(userData?.name || "School Name", 105, 20, {align: "center"});

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(userData?.address?.split(',')[0] || "Location", 105, 30, {align: "center"});

            // Add certificate title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("BONAFIDE CERTIFICATE", 105, 50, {align: "center"});
            doc.setLineWidth(0.5);
            doc.line(70, 52, 140, 52); // Underline the title

            // Add certificate content
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            const content = `This is to certify that Mr./Ms. ${selectedStudent.studentName} S/o D/o of ${selectedStudent.fatherName} is a bonafide student of this school/college, qualified/studying in the class ${selectedStudent.className} admission no. ${selectedStudent.admissionNo} during the academic year ${selectedStudent.session} and his/her D.O.B according to school record is ${selectedStudent.dob} as per the record produced to us.`;

            // Add wrapped text content
            const splitContent = doc.splitTextToSize(content, 170);
            doc.text(splitContent, 20, 70);

            // Add date and signature
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 120);
            doc.text("Principal's Signature", 150, 120, {align: "right"});

            // Save the PDF
            doc.save(`bonafide_certificate_${selectedStudent.studentName.replace(/\s+/g, '_').toLowerCase()}.pdf`);

            setSnackbar({
                open: true,
                message: 'PDF generated successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            setSnackbar({
                open: true,
                message: 'Failed to generate PDF. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleSearch = () => {
        const student = students.find(
            (s) => s.studentName === searchCriteria.studentName
        );

        if (student) {
            setSelectedStudent(student);
            setSnackbar({
                open: true,
                message: 'Student found successfully!',
                severity: 'success'
            });
        } else {
            setSelectedStudent(null);
            setSnackbar({
                open: true,
                message: 'Student not found!',
                severity: 'error'
            });
        }
    };

    const handleCriteriaChange = (event) => {
        const {name, value} = event.target;
        setSearchCriteria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleReset = () => {
        setSearchCriteria({
            className: "",
            section: "",
            studentName: "",
            studentId: "",
            schoolId: schoolId,
            session,
        });
        setSelectedStudent('');
    };

    return (
        <Container maxWidth="lg">
            {/* Search Form Section */}
            <Paper elevation={3} sx={{p: 4, mt: 2, borderRadius: 2}}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                    sx={{mb: 4, textAlign: 'center'}}
                >
                    Bonafide Certificate Generator
                </Typography>

                <Grid container spacing={3} sx={{mb: 4}}>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel id="select-class-label">Select Class</InputLabel>
                            <Select
                                labelId="select-class-label"
                                id="select-class"
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
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel id="select-section-label">Section</InputLabel>
                            <Select
                                label="Section"
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
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel id="select-student-label">Select Student</InputLabel>
                            <Select
                                labelId="select-student-label"
                                id="select-student"
                                name="studentName"
                                value={searchCriteria.studentName || ""}
                                onChange={handleCriteriaChange}
                                label="Select Student"
                                disabled={loading}
                            >
                                {loading ? (
                                    <MenuItem value="" disabled>
                                        Loading students...
                                    </MenuItem>
                                ) : students.length > 0 ? (
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
                        </FormControl>
                    </Grid>
                </Grid>

                <Box sx={{display: 'flex', gap: 2, justifyContent: 'center', mb: 4}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20}/> : <SearchIcon/>}
                        sx={{
                            minWidth: '150px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleReset}
                        startIcon={<RestartAltIcon/>}
                        sx={{
                            minWidth: '150px',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '1rem',
                        }}
                    >
                        Reset
                    </Button>
                </Box>

                {/* Certificate Preview */}
                {selectedStudent && typeof selectedStudent === 'object' && (
                    <Fade in={true}>
                        <Card
                            id="printableArea"
                            sx={{
                                padding: '40px',
                                marginTop: 3,
                                backgroundColor: '#fff',
                                width: '100%',
                                maxWidth: '800px',
                                margin: 'auto',
                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                                borderRadius: '8px',
                                position: 'relative'
                            }}
                        >
                            {/* School Name */}
                            <Typography
                                variant="h4"
                                align="center"
                                sx={{
                                    color: '#2196f3',
                                    fontWeight: 500,
                                    mb: 1
                                }}
                            >
                                {userData?.name || "School Name"}
                            </Typography>

                            {/* School Location */}
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{
                                    color: '#666',
                                    mb: 4
                                }}
                            >
                                {userData?.address?.split(',')[0] || "Location"}
                            </Typography>

                            {/* Certificate Title */}
                            <Typography
                                variant="h5"
                                align="center"
                                sx={{
                                    fontWeight: 'bold',
                                    mb: 4,
                                    textDecoration: 'underline'
                                }}
                            >
                                BONAFIDE CERTIFICATE
                            </Typography>

                            {/* Certificate Content */}
                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    lineHeight: 2,
                                    fontSize: '1rem',
                                    textAlign: 'justify'
                                }}
                            >
                                This is to certify that Mr./Ms. <strong>{selectedStudent.studentName}</strong> S/o D/o
                                of <strong>{selectedStudent.fatherName}</strong> is a
                                bonafide student of this school/college, qualified/studying in the
                                class <strong>{selectedStudent.className}</strong> admission
                                no. <strong>{selectedStudent.admissionNo}</strong> during
                                the academic year <strong>{selectedStudent.session}</strong> and his/her D.O.B according
                                to school record
                                is <strong>{selectedStudent.dob}</strong> as per the record produced to us.
                            </Typography>

                            {/* Date and Signature */}
                            <Box sx={{
                                mt: 6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderTop: '1px solid #eee',
                                pt: 4
                            }}>
                                <Typography>
                                    Date: {new Date().toLocaleDateString('en-GB')}
                                </Typography>
                                <Typography sx={{fontWeight: 500}}>
                                    Principal's Signature
                                </Typography>
                            </Box>

                            {/* Print Button */}
                            <Box sx={{mt: 4, textAlign: 'center'}}>
                                <Button
                                    variant="contained"
                                    startIcon={<PrintIcon/>}
                                    onClick={handlePrint}
                                    sx={{
                                        backgroundColor: '#2196f3',
                                        '&:hover': {
                                            backgroundColor: '#1976d2'
                                        },
                                        minWidth: '200px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    Generate PDF
                                </Button>
                            </Box>
                        </Card>
                    </Fade>
                )}
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
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

export default BonafideCertificate;
