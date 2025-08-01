import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    Container,
    Fade,
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
import {styled} from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArticleIcon from '@mui/icons-material/Article';
import {useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../../common";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './PrintDocument.css';

// Styled Components
const StyledContainer = styled(Container)(({theme}) => ({
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    backgroundColor: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledButton = styled(Button)(({theme}) => ({
    borderRadius: theme.spacing(1),
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

const LeaveCertificate = () => {
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const classSections = useSelector((state) => state.master.data.classSections);
    const userData = useSelector(selectSchoolDetails);

    const schoolId = userData?.id;
    const session = userData?.session;
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        className: "",
        section: "",
        studentName: "",
        admissionNo: "",
        dateOfLeaving: "",
        reasonForLeaving: "",
        conductAndCharacter: "",
        academicProgress: "",
        anyOtherRemarks: "",
        schoolId: schoolId,
        session,
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
                params: {className, section, schoolId, session},
            });
            setStudents(response.data || []);
            setSnackbar({
                open: true,
                message: 'Students loaded successfully',
                severity: 'success'
            });
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

        if (name === 'className') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                section: '',
                studentName: '',
            }));
            setSelectedStudent(null);
        } else if (name === 'section') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                studentName: '',
            }));
            setSelectedStudent(null);
        } else if (name === 'studentName') {
            const student = students.find(s => s.studentName === value);
            setSelectedStudent(student);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                admissionNo: student?.admissionNo || '',
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleGeneratePDF = () => {
        try {
            if (!selectedStudent) return;

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
            doc.text(userData?.address || "School Address", 105, 30, {align: "center"});

            // Add certificate title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("SCHOOL LEAVING CERTIFICATE", 105, 50, {align: "center"});
            doc.setLineWidth(0.5);
            doc.line(70, 52, 140, 52);

            // Add certificate content
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");

            const content = [
                `This is to certify that ${selectedStudent.studentName}, son/daughter of ${selectedStudent.fatherName},`,
                `bearing admission number ${formData.admissionNo}, was a student of our school.`,
                ``,
                `Date of Leaving: ${formData.dateOfLeaving}`,
                `Reason for Leaving: ${formData.reasonForLeaving}`,
                ``,
                `During their time at our institution:`,
                `Conduct and Character: ${formData.conductAndCharacter}`,
                `Academic Progress: ${formData.academicProgress}`,
                ``,
                `Additional Remarks: ${formData.anyOtherRemarks}`,
            ].join('\n');

            const splitContent = doc.splitTextToSize(content, 170);
            doc.text(splitContent, 20, 70);

            // Add date and signature
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 20, 200);
            doc.text("Principal's Signature", 150, 200, {align: "right"});

            // Save the PDF
            doc.save(`leave_certificate_${selectedStudent.studentName.replace(/\s+/g, '_').toLowerCase()}.pdf`);

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

    const handleReset = () => {
        setFormData({
            className: "",
            section: "",
            studentName: "",
            admissionNo: "",
            dateOfLeaving: "",
            reasonForLeaving: "",
            conductAndCharacter: "",
            academicProgress: "",
            anyOtherRemarks: "",
            schoolId: schoolId,
            session,
        });
        setSelectedStudent(null);
    };

    return (
        <StyledContainer maxWidth="lg">
            <StyledPaper elevation={3}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                    sx={{mb: 4, textAlign: 'center'}}
                >
                    <ArticleIcon sx={{mr: 1, verticalAlign: 'bottom'}}/>
                    School Leaving Certificate Generator
                </Typography>

                <Grid container spacing={3}>
                    {/* Student Selection Section */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                name="className"
                                value={formData.className}
                                onChange={handleChange}
                                label="Select Class"
                            >
                                {classSections?.map((classSection) => (
                                    <MenuItem key={classSection.id} value={classSection.name}>
                                        {classSection.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Section</InputLabel>
                            <Select
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                label="Section"
                                disabled={!formData.className}
                            >
                                {classSections?.find(cs => cs.name === formData.className)?.sections?.map((section) => (
                                    <MenuItem key={section.id} value={section.name}>
                                        {section.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Select Student</InputLabel>
                            <Select
                                name="studentName"
                                value={formData.studentName}
                                onChange={handleChange}
                                label="Select Student"
                                disabled={!formData.section || loading}
                            >
                                {students.map((student) => (
                                    <MenuItem key={student.id} value={student.studentName}>
                                        {student.studentName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Certificate Details Section */}
                    {selectedStudent && (
                        <Grid container item spacing={3} sx={{mt: 2}}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Admission Number"
                                    name="admissionNo"
                                    value={formData.admissionNo}
                                    onChange={handleChange}
                                    disabled
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Date of Leaving"
                                    name="dateOfLeaving"
                                    type="date"
                                    value={formData.dateOfLeaving}
                                    onChange={handleChange}
                                    InputLabelProps={{shrink: true}}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Reason for Leaving"
                                    name="reasonForLeaving"
                                    value={formData.reasonForLeaving}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Conduct and Character"
                                    name="conductAndCharacter"
                                    value={formData.conductAndCharacter}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Academic Progress"
                                    name="academicProgress"
                                    value={formData.academicProgress}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Any Other Remarks"
                                    name="anyOtherRemarks"
                                    value={formData.anyOtherRemarks}
                                    onChange={handleChange}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* Action Buttons */}
                    <Grid item xs={12} sx={{display: 'flex', justifyContent: 'center', gap: 2, mt: 4}}>
                        <StyledButton
                            variant="contained"
                            color="primary"
                            onClick={handleGeneratePDF}
                            disabled={!selectedStudent || loading}
                            startIcon={<PrintIcon/>}
                        >
                            Generate PDF
                        </StyledButton>
                        <StyledButton
                            variant="outlined"
                            color="secondary"
                            onClick={handleReset}
                            startIcon={<RestartAltIcon/>}
                        >
                            Reset
                        </StyledButton>
                    </Grid>
                </Grid>
            </StyledPaper>

            {/* Preview Section */}
            {selectedStudent && (
                <Fade in={true}>
                    <Card
                        id="printableArea"
                        sx={{
                            padding: '40px',
                            marginTop: 3,
                            backgroundColor: '#fff',
                            maxWidth: '800px',
                            margin: '20px auto',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                        }}
                    >
                        <Typography variant="h4" align="center" sx={{color: '#2196f3', fontWeight: 500, mb: 1}}>
                            {userData?.name || "School Name"}
                        </Typography>

                        <Typography variant="h6" align="center" sx={{color: '#666', mb: 4}}>
                            {userData?.address || "School Address"}
                        </Typography>

                        <Typography variant="h5" align="center"
                                    sx={{fontWeight: 'bold', mb: 4, textDecoration: 'underline'}}>
                            SCHOOL LEAVING CERTIFICATE
                        </Typography>

                        <Typography variant="body1" sx={{mb: 3, lineHeight: 2, textAlign: 'justify'}}>
                            This is to certify that <strong>{selectedStudent.studentName}</strong>,
                            son/daughter of <strong>{selectedStudent.fatherName}</strong>,
                            bearing admission number <strong>{formData.admissionNo}</strong>,
                            was a student of our school.
                        </Typography>

                        <Typography variant="body1" sx={{mb: 2}}>
                            <strong>Date of Leaving:</strong> {formData.dateOfLeaving}
                        </Typography>

                        <Typography variant="body1" sx={{mb: 3}}>
                            <strong>Reason for Leaving:</strong> {formData.reasonForLeaving}
                        </Typography>

                        <Typography variant="body1" sx={{mb: 2}}>
                            During their time at our institution:
                        </Typography>

                        <Typography variant="body1" sx={{mb: 2, pl: 2}}>
                            <strong>Conduct and Character:</strong> {formData.conductAndCharacter}
                        </Typography>

                        <Typography variant="body1" sx={{mb: 2, pl: 2}}>
                            <strong>Academic Progress:</strong> {formData.academicProgress}
                        </Typography>

                        {formData.anyOtherRemarks && (
                            <Typography variant="body1" sx={{mb: 4}}>
                                <strong>Additional Remarks:</strong> {formData.anyOtherRemarks}
                            </Typography>
                        )}

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
                    </Card>
                </Fade>
            )}

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
        </StyledContainer>
    );
};

export default LeaveCertificate;