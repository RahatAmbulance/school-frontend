import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {fetchSchools} from '../../../MainPage/schools/redux/schoolActions'; // Corrected import path
import {Avatar, Box, Button, Card, CardContent, Container, Divider, Grid, IconButton, Typography,} from '@mui/material';
import {ArrowBack, Print, School} from '@mui/icons-material'; // Added `ArrowBack` and `Print`
import {motion} from 'framer-motion';

import './PrintPage.css'; // <-- Import the CSS here
// Animation variants using Framer Motion
const pageVariants = {
    initial: {opacity: 0, y: 20},
    animate: {opacity: 1, y: 0, transition: {duration: 0.5}},
};

const cardVariants = {
    hidden: {opacity: 0, y: 50},
    visible: {opacity: 1, y: 0, transition: {duration: 0.5, delay: 0.2}},
};

const PrintPage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Initialize useNavigate
    const dispatch = useDispatch();
    const {students = [], exams = []} = location.state || {};
    const [selectedStudent, setSelectedStudent] = useState(null); // Track selected student for printing
    const {schools} = useSelector((state) => state.schoolState || {});
    const schoolData = schools?.[0] || {name: 'Demo Public School', address: '37/52, Sikandra, Agra, Uttar Pradesh'};

    useEffect(() => {
        dispatch(fetchSchools());
    }, [dispatch]);

    // Effect to trigger the print dialog after setting the selected student
    useEffect(() => {
        if (selectedStudent) {
            setTimeout(() => {
                window.print();
                setSelectedStudent(null);
            }, 500); // Small delay to allow rendering before print
        }
    }, [selectedStudent]);

    // Function to handle print per student
    const handlePrint = (student) => {
        setSelectedStudent(student);
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={pageVariants}
        >
            <Container maxWidth="lg" sx={{py: 4}}>
                {/* Back Button - No Print */}
                <Box className="no-print" sx={{mb: 3, display: 'flex', alignItems: 'center'}}>
                    <IconButton onClick={() => navigate(-1)} color="primary" sx={{mr: 1}}>
                        <ArrowBack/>
                    </IconButton>
                    <Typography variant="h6">Back to Selection</Typography>
                </Box>

                {/* Main Content */}
                <Grid container spacing={4}>
                    {students.map((student, index) => (
                        <Grid item xs={12} key={index}>
                            <motion.div variants={cardVariants} initial="hidden" animate="visible">
                                <Card className="admit-card">
                                    {/* School Header */}
                                    <Box className="school-header">
                                        <Avatar
                                            sx={{width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.light'}}>
                                            <School sx={{fontSize: 40}}/>
                                        </Avatar>
                                        <Typography variant="h4" gutterBottom>
                                            {schoolData.name}
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            {schoolData.address}
                                        </Typography>
                                    </Box>

                                    <CardContent className="student-details">
                                        <Typography variant="h5" gutterBottom
                                                    sx={{color: 'primary.main', fontWeight: 600}}>
                                            ADMIT CARD
                                        </Typography>

                                        <Divider sx={{my: 2}}/>

                                        {/* Student Details */}
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <div className="detail-row">
                                                    <span className="detail-label">Student Name:</span>
                                                    <span className="detail-value">{student.studentName}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Father's Name:</span>
                                                    <span className="detail-value">{student.fatherName}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Roll Number:</span>
                                                    <span className="detail-value">{student.rollNo}</span>
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <div className="detail-row">
                                                    <span className="detail-label">Class:</span>
                                                    <span className="detail-value">{student.className}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="detail-label">Section:</span>
                                                    <span className="detail-value">{student.section}</span>
                                                </div>
                                            </Grid>
                                        </Grid>

                                        {/* Exam Schedule */}
                                        <Box className="exam-schedule">
                                            <Typography variant="h6" gutterBottom sx={{color: 'primary.main'}}>
                                                Examination Schedule
                                            </Typography>

                                            {exams.length > 0 ? (
                                                <table className="exam-table">
                                                    <thead>
                                                    <tr>
                                                        <th>Date/Day</th>
                                                        <th>Subject</th>
                                                        <th>Duration</th>
                                                        <th>Time</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {exams.map((exam, idx) => (
                                                        <tr key={idx}>
                                                            <td>{exam.startDateTime}</td>
                                                            <td>{exam.subject}</td>
                                                            <td>{exam.duration}</td>
                                                            <td>{exam.time || 'As per schedule'}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <Typography color="error" sx={{mt: 2}}>
                                                    No examination schedule available
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Print Button - No Print */}
                                        <Box className="no-print" sx={{mt: 3, textAlign: 'center'}}>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                startIcon={<Print/>}
                                                onClick={() => handlePrint(student)}
                                                className="print-button"
                                            >
                                                Print Admit Card
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </Grid>
                    ))}
                </Grid>

                {/* Hidden Print Section */}
                <div style={{display: 'none'}}>
                    {selectedStudent && <PrintSingleStudent student={selectedStudent} exams={exams}/>}
                </div>
            </Container>
        </motion.div>
    );
};

const PrintSingleStudent = ({student, exams}) => {
    return (
        <Container>
            <Card className="admit-card">
                <Box className="school-header">
                    <Typography variant="h4" gutterBottom>
                        Demo Public School
                    </Typography>
                    <Typography variant="h6">
                        37/52, Sikandra, Agra, Uttar Pradesh
                    </Typography>
                </Box>

                <CardContent className="student-details">
                    <Typography variant="h5" gutterBottom sx={{color: 'primary.main', fontWeight: 600}}>
                        ADMIT CARD
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <div className="detail-row">
                                <span className="detail-label">Student Name:</span>
                                <span className="detail-value">{student.studentName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Father's Name:</span>
                                <span className="detail-value">{student.fatherName}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Roll Number:</span>
                                <span className="detail-value">{student.rollNo}</span>
                            </div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <div className="detail-row">
                                <span className="detail-label">Class:</span>
                                <span className="detail-value">{student.className}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Section:</span>
                                <span className="detail-value">{student.section}</span>
                            </div>
                        </Grid>
                    </Grid>

                    <Box className="exam-schedule">
                        <Typography variant="h6" gutterBottom sx={{color: 'primary.main'}}>
                            Examination Schedule
                        </Typography>

                        {exams.length > 0 ? (
                            <table className="exam-table">
                                <thead>
                                <tr>
                                    <th>Date/Day</th>
                                    <th>Subject</th>
                                    <th>Duration</th>
                                    <th>Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {exams.map((exam, idx) => (
                                    <tr key={idx}>
                                        <td>{exam.startDateTime}</td>
                                        <td>{exam.subject}</td>
                                        <td>{exam.duration}</td>
                                        <td>{exam.time || 'As per schedule'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <Typography color="error" sx={{mt: 2}}>
                                No examination schedule available
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PrintPage;
