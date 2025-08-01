import React, {useEffect, useState} from 'react';
import {useSelector} from "react-redux";
import {
    Alert,
    alpha,
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import {api, selectSchoolDetails} from "../../../../common";
import './PrintDocument.css';
import {styled} from '@mui/material/styles';
import ArticleIcon from '@mui/icons-material/Article';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

// Styled Components
const PageContainer = styled(Box)(({theme}) => ({
    minHeight: '100vh',
    padding: theme.spacing(4),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
}));

const StyledPaper = styled(Paper)(({theme}) => ({
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    padding: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const GradientTypography = styled(Typography)(({theme}) => ({
    fontWeight: 800,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(4),
    textAlign: 'center',
}));

const StyledFormControl = styled(FormControl)(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
    },
}));

const StyledButton = styled(Button)(({theme}) => ({
    borderRadius: 12,
    padding: '10px 24px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    },
}));

const CharacterCertificateForm = () => {
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector((state) => state.master.data.classSections);
    const [students, setStudents] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const schoolId = userData?.id;
    const session = userData?.session;
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        className: "",
        section: "",
        studentName: "",
        certificateNo: '',
        sessionFrom: '',
        sessionTo: '',
        behavior: '',
        place: '',
        issueDate: '',
        classPassed: '',
        session: session,
    });

    useEffect(() => {
        if (formData.className && formData.section) {
            fetchStudents(formData.className, formData.section);
        }
    }, [formData.className, formData.section]);

    const fetchStudents = async (className, section) => {
        setLoading(true);
        try {
            const response = await api.get("/api/students/class/section/school", {
                params: {
                    className,
                    section,
                    schoolId,
                    session
                },
            });

            if (response.data?.length > 0) {
                setStudents(response.data);
                setSnackbar({
                    open: true,
                    message: 'Students loaded successfully',
                    severity: 'success'
                });
            } else {
                setStudents([]);
                setSnackbar({
                    open: true,
                    message: 'No students found in this class',
                    severity: 'info'
                });
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch students. Please try again.',
                severity: 'error'
            });
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const {name, value} = event.target;

        // Reset student-related data when class or section changes
        if (name === 'className') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                section: '',
                studentName: '',
            }));
            setSelectedStudent(null);
            setStudents([]);
        } else if (name === 'section') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                studentName: '',
            }));
            setSelectedStudent(null);
        } else if (name === 'studentName') {
            const student = students.find(s => s.studentName === value);
            setSelectedStudent(student || null);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Pre-fill some fields based on student data
                certificateNo: student?.admissionNo || '',
                sessionFrom: prev.sessionFrom || new Date().toISOString().split('T')[0],
                sessionTo: prev.sessionTo || new Date().toISOString().split('T')[0],
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleReset = () => {
        setFormData({
            className: "",
            section: "",
            studentName: "",
            certificateNo: '',
            sessionFrom: '',
            sessionTo: '',
            behavior: '',
            place: '',
            issueDate: '',
            classPassed: '',
            session: session,
        });
        setSelectedStudent(null);
        setStudents([]);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        const student = students.find((s) => s.studentName === formData.studentName);
        if (student) {
            setSelectedStudent(student);
            setOpenPopup(true);
            setSnackbar({
                open: true,
                message: 'Certificate generated successfully!',
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: 'Please select a student first',
                severity: 'warning'
            });
        }
    };

    return (
        <PageContainer>
            <Container maxWidth="lg">
                <GradientTypography variant="h4">
                    <ArticleIcon sx={{mr: 1, verticalAlign: 'bottom'}}/>
                    Character Certificate Generator
                </GradientTypography>

                <StyledPaper elevation={0}>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <StyledFormControl fullWidth>
                                    <InputLabel>Select Class</InputLabel>
                                    <Select
                                        name="className"
                                        value={formData.className}
                                        onChange={handleChange}
                                    >
                                        {classSections?.length > 0 ? (
                                            classSections.map((classSection) => (
                                                <MenuItem key={classSection.id} value={classSection.name}>
                                                    {classSection.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>No Classes Available</MenuItem>
                                        )}
                                    </Select>
                                </StyledFormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledFormControl fullWidth>
                                    <InputLabel>Select Section</InputLabel>
                                    <Select
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        disabled={!formData.className}
                                    >
                                        {classSections?.find(cs => cs.name === formData.className)?.sections?.length > 0 ? (
                                            classSections.find(cs => cs.name === formData.className).sections.map((section) => (
                                                <MenuItem key={section.id} value={section.name}>
                                                    {section.name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>No Sections Available</MenuItem>
                                        )}
                                    </Select>
                                </StyledFormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledFormControl fullWidth>
                                    <InputLabel>Select Student</InputLabel>
                                    <Select
                                        name="studentName"
                                        value={formData.studentName}
                                        onChange={handleChange}
                                        disabled={!formData.section || loading}
                                    >
                                        {loading ? (
                                            <MenuItem value="" disabled>Loading students...</MenuItem>
                                        ) : students?.length > 0 ? (
                                            students.map((student) => (
                                                <MenuItem key={student.id} value={student.studentName}>
                                                    {student.studentName} - Roll No: {student.rollNo || 'N/A'}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>No Students Available</MenuItem>
                                        )}
                                    </Select>
                                </StyledFormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Certificate No."
                                    name="certificateNo"
                                    value={formData.certificateNo}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Session From"
                                    name="sessionFrom"
                                    type="date"
                                    InputLabelProps={{shrink: true}}
                                    value={formData.sessionFrom}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Session To"
                                    name="sessionTo"
                                    type="date"
                                    InputLabelProps={{shrink: true}}
                                    value={formData.sessionTo}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Behaviour"
                                    name="behavior"
                                    value={formData.behavior}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Place"
                                    name="place"
                                    value={formData.place}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Issue Date"
                                    name="issueDate"
                                    type="date"
                                    InputLabelProps={{shrink: true}}
                                    value={formData.issueDate}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Class Passed and Year Statement"
                                    name="classPassed"
                                    value={formData.classPassed}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center', gap: 2, mt: 2}}>
                                <StyledButton
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    startIcon={<ArticleIcon/>}
                                    disabled={loading}
                                >
                                    Generate Certificate
                                </StyledButton>
                                <StyledButton
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleReset}
                                    startIcon={<RestartAltIcon/>}
                                >
                                    Reset Form
                                </StyledButton>
                            </Grid>
                        </Grid>
                    </form>

                    {loading && (
                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                            <CircularProgress/>
                        </Box>
                    )}
                </StyledPaper>

                <Dialog
                    open={openPopup}
                    onClose={() => setOpenPopup(false)}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }
                    }}
                >
                    <DialogContent>
                        <Card
                            id="printableArea"
                            sx={{
                                p: 4,
                                background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                position: 'relative',
                                overflow: 'visible',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '8px',
                                    background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                                    borderTopLeftRadius: 8,
                                    borderTopRightRadius: 8,
                                },
                            }}
                        >
                            <Typography
                                variant="h4"
                                align="center"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    mb: 1,
                                }}
                            >
                                {userData?.name || "School Name"}
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                align="center"
                                sx={{
                                    color: 'text.secondary',
                                    mb: 4,
                                }}
                            >
                                {userData?.address || "School Address"}
                            </Typography>

                            <Typography
                                variant="h5"
                                align="center"
                                sx={{
                                    fontWeight: 600,
                                    mb: 4,
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: -8,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '60px',
                                        height: '3px',
                                        background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                                        borderRadius: '2px',
                                    },
                                }}
                            >
                                Character Certificate
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 3,
                                    lineHeight: 2,
                                    textAlign: 'justify',
                                    color: 'text.primary',
                                }}
                            >
                                This is to certify that <strong>{formData.studentName}</strong>, son/daughter
                                of <strong>{selectedStudent?.fatherName}</strong>,
                                with Registration No. <strong>{formData.certificateNo}</strong>, was a student at this
                                school from
                                <strong> {formData.sessionFrom}</strong> to <strong>{formData.sessionTo}</strong>.
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    mb: 4,
                                    lineHeight: 2,
                                    textAlign: 'justify',
                                    color: 'text.primary',
                                }}
                            >
                                The student's behaviour was <strong>{formData.behavior}</strong>.
                                We wish them success in their future endeavors.
                            </Typography>

                            <Box
                                sx={{
                                    mt: 6,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                }}
                            >
                                <Typography sx={{color: 'text.secondary'}}>
                                    <strong>Place:</strong> {formData.place}
                                </Typography>
                                <Typography sx={{color: 'text.secondary'}}>
                                    <strong>Date:</strong> {formData.issueDate}
                                </Typography>
                            </Box>

                            <Typography
                                variant="h6"
                                align="right"
                                sx={{
                                    mt: 6,
                                    pt: 2,
                                    borderTop: '2px solid #eee',
                                    fontWeight: 600,
                                }}
                            >
                                Principal/Headmaster
                            </Typography>
                        </Card>
                    </DialogContent>

                    <DialogActions sx={{p: 3, justifyContent: 'center'}}>
                        <StyledButton
                            onClick={handlePrint}
                            variant="contained"
                            color="primary"
                            startIcon={<PrintIcon/>}
                        >
                            Print Certificate
                        </StyledButton>
                        <StyledButton
                            onClick={() => setOpenPopup(false)}
                            variant="outlined"
                            color="secondary"
                        >
                            Close
                        </StyledButton>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(prev => ({...prev, open: false}))}
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({...prev, open: false}))}
                        severity={snackbar.severity}
                        sx={{width: '100%'}}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </PageContainer>
    );
};

export default CharacterCertificateForm;