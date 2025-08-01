import React, {useEffect, useState} from 'react';
import {
    Alert,
    AppBar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fade,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
    Zoom
} from '@mui/material';
import {
    Add as AddIcon,
    Assessment as StatsIcon,
    Assignment as AssignmentIcon,
    CheckCircle as CheckIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Filter as FilterIcon,
    PlayArrow as StartIcon,
    Quiz as QuizIcon,
    Save as SaveIcon,
    Timer as TimerIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import {api} from "../../../../common";

// Enhanced theme with modern colors and gradients
const theme = createTheme({
    palette: {
        primary: {
            main: '#6366f1',
            light: '#818cf8',
            dark: '#4f46e5',
        },
        secondary: {
            main: '#ec4899',
            light: '#f472b6',
            dark: '#db2777',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
        },
        warning: {
            main: '#f59e0b',
            light: '#fbbf24',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        }
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 20px',
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                }
            }
        }
    }
});

// Styled components for enhanced UI
const GradientCard = styled(Card)(({theme}) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '& .MuiCardContent-root': {
        padding: theme.spacing(3),
    }
}));

const StatCard = styled(Card)(({theme, color}) => ({
    background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
    border: `2px solid ${color}20`,
    borderRadius: 20,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: `0 10px 30px ${color}30`,
    }
}));

const StyledAppBar = styled(AppBar)(({theme}) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

// API Services
const ExamService = {
    createExam: async (exam) => {
        try {
            const response = await api.post('/api/exam/mcq/create', exam);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create exam');
        }
    },

    getExams: async (filters) => {
        try {
            const response = await api.get('/api/exam/mcq/list', {params: filters});
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch exams');
        }
    },

    getExamById: async (examId) => {
        try {
            const response = await api.get(`/api/exam/mcq/${examId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch exam');
        }
    },

    updateExam: async (examId, exam) => {
        try {
            const response = await api.put(`/api/exam/mcq/${examId}`, exam);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update exam');
        }
    },

    deleteExam: async (examId) => {
        try {
            const response = await api.delete(`/api/exam/mcq/${examId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete exam');
        }
    },

    startExam: async (examId, studentId) => {
        try {
            const response = await api.get(`/api/exam/mcq/${examId}/start`, {
                params: {studentId}
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to start exam');
        }
    },

    submitExam: async (submission) => {
        try {
            const response = await api.post('/api/exam/mcq/submit', submission);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit exam');
        }
    },

    getExamStatistics: async (examId) => {
        try {
            const response = await api.get(`/api/exam/mcq/${examId}/statistics`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
        }
    },

    getSubmissionsByExam: async (examId) => {
        try {
            const response = await api.get(`/api/exam/mcq/${examId}/submissions`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
        }
    },

    getAllStatistics: async (schoolId) => {
        try {
            const response = await api.get(`/api/exam/mcq/statistics/summary`, {
                params: {schoolId}
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch summary statistics');
        }
    }
};

const QuestionService = {
    createQuestion: async (question) => {
        try {
            const response = await api.post('/api/exam/mcq/question/create', question);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create question');
        }
    },

    getQuestions: async (filters) => {
        try {
            const response = await api.get('/api/exam/mcq/list', {params: filters});
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch questions');
        }
    },

    updateQuestion: async (questionId, question) => {
        try {
            const response = await api.put(`/api/exam/mcq/question/${questionId}`, question);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update question');
        }
    },

    deleteQuestion: async (questionId) => {
        try {
            const response = await api.delete(`/api/exam/mcq/question/${questionId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete question');
        }
    }
};

function TabPanel({children, value, index, ...other}) {
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Fade in={value === index} timeout={500}>
                    <Box sx={{p: 3}}>{children}</Box>
                </Fade>
            )}
        </div>
    );
}

export default function EnhancedExamDashboard() {
    const [currentTab, setCurrentTab] = useState(0);
    const [exams, setExams] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const [statistics, setStatistics] = useState({
        totalExams: 0,
        totalQuestions: 0,
        totalSubmissions: 0,
        averageScore: 0
    });

    // Dialog states
    const [examDialog, setExamDialog] = useState({open: false, exam: null});
    const [questionDialog, setQuestionDialog] = useState({open: false, question: null});
    const [examTakingDialog, setExamTakingDialog] = useState({
        open: false,
        exam: null,
        answers: {},
        timeLeft: 0,
        currentQuestion: 0
    });

    // Form states
    const [examForm, setExamForm] = useState({
        examName: '',
        subject: '',
        className: '',
        section: '',
        duration: 60,
        totalMarks: 100,
        description: '',
        schoolId: 1,
        session: '2024-25'
    });

    const [questionForm, setQuestionForm] = useState({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 1,
        topic: '',
        subject: '',
        explanation: '',
        schoolId: 1
    });

    // Filters
    const [examFilters, setExamFilters] = useState({
        schoolId: 1,
        session: '2024-25',
        className: '',
        section: '',
        subject: ''
    });

    const [questionFilters, setQuestionFilters] = useState({
        schoolId: 1,
        subject: '',
        topic: '',
        className: ''
    });

    // Timer ref for cleanup
    const [examTimer, setExamTimer] = useState(null);

    useEffect(() => {
        loadData();
        return () => {
            // Clean up timer if it exists
            if (examTimer) {
                clearInterval(examTimer);
            }
        };
    }, []);

    const loadData = async () => {
        await Promise.all([loadExams(), loadQuestions(), loadStatistics()]);
    };

    const loadExams = async () => {
        setLoading(true);
        try {
            const data = await ExamService.getExams(examFilters);
            setExams(data);
        } catch (error) {
            showSnackbar('Error loading exams: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadQuestions = async () => {
        try {
            const data = await QuestionService.getQuestions(questionFilters);
            setQuestions(data);
        } catch (error) {
            showSnackbar('Error loading questions: ' + error.message, 'error');
        }
    };

    const loadStatistics = async () => {
        try {
            const stats = await ExamService.getAllStatistics(1); // Assuming schoolId = 1
            setStatistics({
                totalExams: stats.totalExams || 0,
                totalQuestions: stats.totalQuestions || 0,
                totalSubmissions: stats.totalSubmissions || 0,
                averageScore: stats.averageScore || 0
            });
        } catch (error) {
            console.error('Error loading statistics:', error);
            // Use default values if API fails
            setStatistics({
                totalExams: exams.length,
                totalQuestions: questions?.length,
                totalSubmissions: 0,
                averageScore: 0
            });
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({open: true, message, severity});
    };

    const handleCreateExam = async () => {
        if (!examForm.title || !examForm.subject || !examForm.className) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const newExam = await ExamService.createExam(examForm);
            setExams(prev => [...prev, newExam]);
            setExamDialog({open: false, exam: null});
            resetExamForm();
            showSnackbar('Exam created successfully');
            loadStatistics(); // Refresh statistics
        } catch (error) {
            showSnackbar('Error creating exam: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateExam = async () => {
        if (!examForm.title || !examForm.subject || !examForm.className) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const updatedExam = await ExamService.updateExam(examDialog.exam.id, examForm);
            setExams(prev => prev.map(e => e.id === examDialog.exam.id ? updatedExam : e));
            setExamDialog({open: false, exam: null});
            resetExamForm();
            showSnackbar('Exam updated successfully');
        } catch (error) {
            showSnackbar('Error updating exam: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async () => {
        if (!questionForm.questionText || !questionForm.optionA || !questionForm.optionB) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            const questionData = {
                ...questionForm,
                options: [
                    questionForm.optionA,
                    questionForm.optionB,
                    questionForm.optionC || '',
                    questionForm.optionD || ''
                ].filter(opt => opt.trim() !== ''),
                correctAnswer: ['A', 'B', 'C', 'D'].indexOf(questionForm.correctAnswer)
            };

            let newQuestion;
            if (questionDialog.question) {
                // Update existing question
                newQuestion = await QuestionService.updateQuestion(questionDialog.question.id, questionData);
                setQuestions(prev => prev.map(q => q.id === questionDialog.question.id ? newQuestion : q));
                showSnackbar('Question updated successfully');
            } else {
                // Create new question
                newQuestion = await QuestionService.createQuestion(questionData);
                setQuestions(prev => [...prev, newQuestion]);
                showSnackbar('Question created successfully');
            }

            setQuestionDialog({open: false, question: null});
            resetQuestionForm();
            loadStatistics(); // Refresh statistics
        } catch (error) {
            showSnackbar('Error with question: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExam = async (examId) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            setLoading(true);
            try {
                await ExamService.deleteExam(examId);
                setExams(prev => prev.filter(e => e.id !== examId));
                showSnackbar('Exam deleted successfully');
                loadStatistics(); // Refresh statistics
            } catch (error) {
                showSnackbar('Error deleting exam: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            setLoading(true);
            try {
                await QuestionService.deleteQuestion(questionId);
                setQuestions(prev => prev.filter(q => q.id !== questionId));
                showSnackbar('Question deleted successfully');
                loadStatistics(); // Refresh statistics
            } catch (error) {
                showSnackbar('Error deleting question: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleStartExam = async (examId) => {
        setLoading(true);
        try {
            // Clean up any existing timer
            if (examTimer) {
                clearInterval(examTimer);
            }

            const examData = await ExamService.startExam(examId, 'student123'); // Replace with actual student ID

            // Check if examData has questions before setting state
            if (!examData || !examData.questions) {
                throw new Error('Exam has no questions');
            }

            setExamTakingDialog({
                open: true,
                exam: examData,
                answers: {},
                timeLeft: examData.duration * 60,
                currentQuestion: 0
            });

            // Start timer
            const timer = setInterval(() => {
                setExamTakingDialog(prev => {
                    if (prev.timeLeft <= 1) {
                        clearInterval(timer);
                        handleSubmitExam();
                        return prev;
                    }
                    return {...prev, timeLeft: prev.timeLeft - 1};
                });
            }, 1000);

            setExamTimer(timer);
        } catch (error) {
            showSnackbar('Error starting exam: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitExam = async () => {
        // Clean up timer
        if (examTimer) {
            clearInterval(examTimer);
            setExamTimer(null);
        }

        setLoading(true);
        try {
            const submission = {
                examId: examTakingDialog.exam.id,
                studentId: 'student123', // Replace with actual student ID
                answers: examTakingDialog.answers,
                timeTaken: (examTakingDialog.exam.duration * 60) - examTakingDialog.timeLeft
            };

            const result = await ExamService.submitExam(submission);
            setExamTakingDialog({open: false, exam: null, answers: {}, timeLeft: 0, currentQuestion: 0});
            showSnackbar(`Exam submitted successfully! Score: ${result.score}/${result.totalMarks}`, 'success');
            loadStatistics(); // Refresh statistics
        } catch (error) {
            showSnackbar('Error submitting exam: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetExamForm = () => {
        setExamForm({
            title: '',
            subject: '',
            className: '',
            section: '',
            duration: 60,
            totalMarks: 100,
            description: '',
            schoolId: 1,
            session: '2024-25'
        });
    };

    const resetQuestionForm = () => {
        setQuestionForm({
            questionText: '',
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
            correctAnswer: 'A',
            marks: 1,
            topic: '',
            subject: '',
            explanation: '',
            schoolId: 1
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const openExamDialog = (exam = null) => {
        if (exam) {
            setExamForm({
                title: exam.title || '',
                subject: exam.subject || '',
                className: exam.className || '',
                section: exam.section || '',
                duration: exam.duration || 60,
                totalMarks: exam.totalMarks || 100,
                description: exam.description || '',
                schoolId: exam.schoolId || 1,
                session: exam.session || '2024-25'
            });
        } else {
            resetExamForm();
        }
        setExamDialog({open: true, exam});
    };

    const openQuestionDialog = (question = null) => {
        if (question) {
            setQuestionForm({
                questionText: question.questionText || '',
                optionA: question.optionA || '',
                optionB: question.optionB || '',
                optionC: question.optionC || '',
                optionD: question.optionD || '',
                correctAnswer: ['A', 'B', 'C', 'D'][question.correctAnswer] || 'A',
                marks: question.marks || 1,
                topic: question.topic || '',
                subject: question.subject || '',
                explanation: question.explanation || '',
                schoolId: question.schoolId || 1
            });
        } else {
            resetQuestionForm();
        }
        setQuestionDialog({open: true, question});
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default'}}>
                <Container maxWidth="xl" sx={{mt: 4, pb: 4}}>
                    {/* Statistics Cards */}
                    <Grid container spacing={3} sx={{mb: 4}}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Zoom in={true} timeout={500}>
                                <StatCard color="#6366f1">
                                    <CardContent sx={{textAlign: 'center'}}>
                                        <AssignmentIcon sx={{fontSize: 40, color: '#6366f1', mb: 1}}/>
                                        <Typography variant="h4" sx={{fontWeight: 700, color: '#6366f1'}}>
                                            {statistics.totalExams}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Exams
                                        </Typography>
                                    </CardContent>
                                </StatCard>
                            </Zoom>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Zoom in={true} timeout={700}>
                                <StatCard color="#10b981">
                                    <CardContent sx={{textAlign: 'center'}}>
                                        <QuizIcon sx={{fontSize: 40, color: '#10b981', mb: 1}}/>
                                        <Typography variant="h4" sx={{fontWeight: 700, color: '#10b981'}}>
                                            {statistics.totalQuestions}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Questions
                                        </Typography>
                                    </CardContent>
                                </StatCard>
                            </Zoom>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Zoom in={true} timeout={900}>
                                <StatCard color="#f59e0b">
                                    <CardContent sx={{textAlign: 'center'}}>
                                        <TrendingUpIcon sx={{fontSize: 40, color: '#f59e0b', mb: 1}}/>
                                        <Typography variant="h4" sx={{fontWeight: 700, color: '#f59e0b'}}>
                                            {statistics.totalSubmissions}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Submissions
                                        </Typography>
                                    </CardContent>
                                </StatCard>
                            </Zoom>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Zoom in={true} timeout={1100}>
                                <StatCard color="#ec4899">
                                    <CardContent sx={{textAlign: 'center'}}>
                                        <StatsIcon sx={{fontSize: 40, color: '#ec4899', mb: 1}}/>
                                        <Typography variant="h4" sx={{fontWeight: 700, color: '#ec4899'}}>
                                            {statistics.averageScore}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Average Score
                                        </Typography>
                                    </CardContent>
                                </StatCard>
                            </Zoom>
                        </Grid>
                    </Grid>

                    <Card sx={{mb: 3, borderRadius: 3}}>
                        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                            <Tabs
                                value={currentTab}
                                onChange={(e, v) => setCurrentTab(v)}
                                sx={{px: 2}}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab
                                    label="Manage Exams"
                                    icon={<AssignmentIcon/>}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="Question Bank"
                                    icon={<QuizIcon/>}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="Take Exam"
                                    icon={<StartIcon/>}
                                    iconPosition="start"
                                />
                                <Tab
                                    label="Results & Analytics"
                                    icon={<StatsIcon/>}
                                    iconPosition="start"
                                />
                            </Tabs>
                        </Box>

                        {/* Exams Tab */}
                        <TabPanel value={currentTab} index={0}>
                            <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h4" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <AssignmentIcon sx={{fontSize: 35}}/>
                                    Exam Management
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon/>}
                                    onClick={() => openExamDialog()}
                                    sx={{
                                        background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                                        px: 3, py: 1.5
                                    }}
                                >
                                    Create New Exam
                                </Button>
                            </Box>

                            {/* Filters */}
                            <Card sx={{mb: 3, p: 2, bgcolor: 'grey.50'}}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Class"
                                            size="small"
                                            value={examFilters.className}
                                            onChange={(e) => setExamFilters({
                                                ...examFilters,
                                                className: e.target.value
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Section"
                                            size="small"
                                            value={examFilters.section}
                                            onChange={(e) => setExamFilters({...examFilters, section: e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Subject"
                                            size="small"
                                            value={examFilters.subject}
                                            onChange={(e) => setExamFilters({...examFilters, subject: e.target.value})}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            variant="contained"
                                            onClick={loadExams}
                                            fullWidth
                                            startIcon={<FilterIcon/>}
                                            sx={{height: 40}}
                                        >
                                            Apply Filters
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Card>

                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                                    <CircularProgress size={50}/>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} sx={{borderRadius: 3}}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{bgcolor: 'primary.main'}}>
                                                <TableCell sx={{color: 'white', fontWeight: 600}}>Title</TableCell>
                                                <TableCell sx={{color: 'white', fontWeight: 600}}>Subject</TableCell>
                                                <TableCell sx={{color: 'white', fontWeight: 600}}>Class</TableCell>
                                                <TableCell sx={{color: 'white', fontWeight: 600}}>Duration</TableCell>
                                                <TableCell sx={{color: 'white', fontWeight: 600}}>Status</TableCell>
                                                <TableCell sx={{color: 'white', fontWeight: 600}}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {exams.map((exam) => (
                                                <TableRow key={exam.id} hover>
                                                    <TableCell>
                                                        <Typography variant="subtitle1" fontWeight={600}>
                                                            {exam.title}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>{exam.subject}</TableCell>
                                                    <TableCell>{exam.className} - {exam.section}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<TimerIcon/>}
                                                            label={`${exam.duration} min`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={exam.status || 'Active'}
                                                            color={(exam.status || 'Active') === 'Active' ? 'success' :
                                                                (exam.status === 'Pending' ? 'warning' :
                                                                    (exam.status === 'Completed' ? 'info' : 'default'))}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{display: 'flex', gap: 1}}>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => openExamDialog(exam)}
                                                            >
                                                                <EditIcon/>
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="secondary"
                                                                onClick={() => handleStartExam(exam.id)}
                                                            >
                                                                <StartIcon/>
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteExam(exam.id)}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {exams.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center" sx={{py: 3}}>
                                                        <Typography variant="body1" color="text.secondary">
                                                            No exams found. Create a new exam to get started.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </TabPanel>

                        {/* Question Bank Tab */}
                        <TabPanel value={currentTab} index={1}>
                            <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h4" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <QuizIcon sx={{fontSize: 35}}/>
                                    Question Bank
                                </Typography>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon/>}
                                    onClick={() => openQuestionDialog(null)}
                                    sx={{
                                        background: 'linear-gradient(45deg, #10b981, #34d399)',
                                        px: 3, py: 1.5
                                    }}
                                >
                                    Add New Question
                                </Button>
                            </Box>

                            {/* Filters */}
                            <Card sx={{mb: 3, p: 2, bgcolor: 'grey.50'}}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Subject"
                                            size="small"
                                            value={questionFilters.subject}
                                            onChange={(e) => setQuestionFilters({
                                                ...questionFilters,
                                                subject: e.target.value
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Topic"
                                            size="small"
                                            value={questionFilters.topic}
                                            onChange={(e) => setQuestionFilters({
                                                ...questionFilters,
                                                topic: e.target.value
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <TextField
                                            fullWidth
                                            label="Class"
                                            size="small"
                                            value={questionFilters.className}
                                            onChange={(e) => setQuestionFilters({
                                                ...questionFilters,
                                                className: e.target.value
                                            })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Button
                                            variant="contained"
                                            onClick={loadQuestions}
                                            fullWidth
                                            startIcon={<FilterIcon/>}
                                            sx={{height: 40}}
                                        >
                                            Apply Filters
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Card>

                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                                    <CircularProgress size={50}/>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {questions?.map((question) => (
                                        <Grid item xs={12} key={question?.id}>
                                            <Card sx={{borderRadius: 2, boxShadow: 2}}>
                                                <CardContent>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        mb: 2
                                                    }}>
                                                        <Typography variant="h6" sx={{fontWeight: 600}}>
                                                            {question?.questionText}
                                                        </Typography>
                                                        <Chip
                                                            label={`${question.marks} ${question.marks > 1 ? 'marks' : 'mark'}`}
                                                            color="primary"
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </Box>

                                                    <Typography variant="body2" sx={{color: 'text.secondary', mb: 2}}>
                                                        Subject: {question?.subject} |
                                                        Topic: {question?.topic || 'General'}
                                                    </Typography>

                                                    <Grid container spacing={2} sx={{mb: 2}}>
                                                        {['A', 'B', 'C', 'D'].map((option, index) => (
                                                            question[`option${option}`] && (
                                                                <Grid item xs={12} sm={6} key={option}>
                                                                    <Paper
                                                                        sx={{
                                                                            p: 1,
                                                                            bgcolor: question.correctAnswer === index ? 'success.light' : 'background.paper',
                                                                            border: '1px solid',
                                                                            borderColor: question.correctAnswer === index ? 'success.main' : 'grey.300',
                                                                            borderRadius: 2,
                                                                            display: 'flex',
                                                                            alignItems: 'center'
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="body2"
                                                                            component="span"
                                                                            sx={{
                                                                                fontWeight: question.correctAnswer === index ? 700 : 400
                                                                            }}
                                                                        >
                                                                            {option}. {question[`option${option}`]}
                                                                        </Typography>
                                                                        {question.correctAnswer === index && (
                                                                            <CheckIcon
                                                                                sx={{
                                                                                    ml: 'auto',
                                                                                    color: 'success.dark',
                                                                                    fontSize: 20
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Paper>
                                                                </Grid>
                                                            )
                                                        ))}
                                                    </Grid>

                                                    {question.explanation && (
                                                        <Box sx={{mt: 1, p: 1.5, bgcolor: 'info.50', borderRadius: 2}}>
                                                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                                                Explanation: {question.explanation}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </CardContent>
                                                <CardActions>
                                                    <Button
                                                        size="small"
                                                        startIcon={<EditIcon/>}
                                                        onClick={() => openQuestionDialog(question)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<DeleteIcon/>}
                                                        color="error"
                                                        onClick={() => handleDeleteQuestion(question.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}

                                    {questions?.length === 0 && (
                                        <Grid item xs={12}>
                                            <Paper sx={{p: 4, textAlign: 'center'}}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No questions found. Add new questions to your bank.
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </TabPanel>

                        {/* Take Exam Tab */}
                        <TabPanel value={currentTab} index={2}>
                            <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h4" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <StartIcon sx={{fontSize: 35}}/>
                                    Available Exams
                                </Typography>
                            </Box>

                            {loading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                                    <CircularProgress size={50}/>
                                </Box>
                            ) : (
                                <Grid container spacing={3}>
                                    {exams.map((exam) => (
                                        <Grid item xs={12} sm={6} md={4} key={exam.id}>
                                            <Zoom in={true} style={{transitionDelay: '100ms'}}>
                                                <Card sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderRadius: 3
                                                }}>
                                                    <GradientCard>
                                                        <CardContent>
                                                            <Typography variant="h5" fontWeight={700}>
                                                                {exam.title}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{opacity: 0.8, mb: 1}}>
                                                                {exam.subject} | Class {exam.className} - {exam.section}
                                                            </Typography>
                                                        </CardContent>
                                                    </GradientCard>
                                                    <CardContent sx={{flexGrow: 1}}>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            mb: 2
                                                        }}>
                                                            <Chip
                                                                icon={<TimerIcon/>}
                                                                label={`${exam.duration} min`}
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                            <Chip
                                                                icon={<AssignmentIcon/>}
                                                                label={`${exam.totalMarks} marks`}
                                                                variant="outlined"
                                                                size="small"
                                                                color="secondary"
                                                            />
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary" paragraph>
                                                            {exam.description || 'No description available.'}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions sx={{p: 2, pt: 0}}>
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            startIcon={<StartIcon/>}
                                                            onClick={() => handleStartExam(exam.id)}
                                                            sx={{
                                                                background: 'linear-gradient(45deg, #6366f1, #ec4899)',
                                                                py: 1
                                                            }}
                                                        >
                                                            Start Exam
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Zoom>
                                        </Grid>
                                    ))}

                                    {exams.length === 0 && (
                                        <Grid item xs={12}>
                                            <Paper sx={{p: 4, textAlign: 'center'}}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No exams available. Please check back later.
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                        </TabPanel>

                        {/* Results Tab */}
                        <TabPanel value={currentTab} index={3}>
                            <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Typography variant="h4" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <StatsIcon sx={{fontSize: 35}}/>
                                    Results & Analytics
                                </Typography>
                            </Box>

                            {/* Analytics charts and tables would go here */}
                            <Paper sx={{p: 3, mb: 3, borderRadius: 3}}>
                                <Typography variant="h6" gutterBottom>
                                    Performance Overview
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Detailed analytics and results will be displayed here.
                                </Typography>
                                <LinearProgress variant="determinate" value={70}
                                                sx={{height: 10, borderRadius: 5, mb: 2}}/>
                            </Paper>
                        </TabPanel>
                    </Card>
                </Container>
            </Box>

            {/* Create/Edit Exam Dialog */}
            <Dialog open={examDialog.open} onClose={() => setExamDialog({open: false, exam: null})} maxWidth="md"
                    fullWidth>
                <DialogTitle sx={{bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center'}}>
                    <AssignmentIcon sx={{mr: 1}}/>
                    {examDialog.exam ? 'Edit Exam' : 'Create New Exam'}
                    <IconButton
                        sx={{ml: 'auto', color: 'white'}}
                        onClick={() => setExamDialog({open: false, exam: null})}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{py: 3}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Exam Title"
                                value={examForm.title}
                                onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Subject"
                                value={examForm.subject}
                                onChange={(e) => setExamForm({...examForm, subject: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Session"
                                value={examForm.session}
                                onChange={(e) => setExamForm({...examForm, session: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Class"
                                value={examForm.className}
                                onChange={(e) => setExamForm({...examForm, className: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Section"
                                value={examForm.section}
                                onChange={(e) => setExamForm({...examForm, section: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Total Marks"
                                type="number"
                                value={examForm.totalMarks}
                                onChange={(e) => setExamForm({...examForm, totalMarks: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Duration (minutes)"
                                type="number"
                                value={examForm.duration}
                                onChange={(e) => setExamForm({...examForm, duration: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={examForm.description}
                                onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button
                        onClick={() => setExamDialog({open: false, exam: null})}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon/>}
                        onClick={examDialog.exam ? handleUpdateExam : handleCreateExam}
                        color="primary"
                    >
                        {examDialog.exam ? 'Update Exam' : 'Create Exam'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create/Edit Question Dialog */}
            <Dialog open={questionDialog.open} onClose={() => setQuestionDialog({open: false, question: null})}
                    maxWidth="md" fullWidth>
                <DialogTitle sx={{bgcolor: 'success.main', color: 'white', display: 'flex', alignItems: 'center'}}>
                    <QuizIcon sx={{mr: 1}}/>
                    {questionDialog.question ? 'Edit Question' : 'Create New Question'}
                    <IconButton
                        sx={{ml: 'auto', color: 'white'}}
                        onClick={() => setQuestionDialog({open: false, question: null})}
                    >
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{py: 3}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Question"
                                multiline
                                rows={2}
                                value={questionForm.questionText}
                                onChange={(e) => setQuestionForm({...questionForm, questionText: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Subject"
                                value={questionForm.subject}
                                onChange={(e) => setQuestionForm({...questionForm, subject: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Topic"
                                value={questionForm.topic}
                                onChange={(e) => setQuestionForm({...questionForm, topic: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Option A"
                                value={questionForm.optionA}
                                onChange={(e) => setQuestionForm({...questionForm, optionA: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Option B"
                                value={questionForm.optionB}
                                onChange={(e) => setQuestionForm({...questionForm, optionB: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Option C"
                                value={questionForm.optionC}
                                onChange={(e) => setQuestionForm({...questionForm, optionC: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Option D"
                                value={questionForm.optionD}
                                onChange={(e) => setQuestionForm({...questionForm, optionD: e.target.value})}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel id="correct-answer-label">Correct Answer</InputLabel>
                                <Select
                                    labelId="correct-answer-label"
                                    value={questionForm.correctAnswer}
                                    label="Correct Answer"
                                    onChange={(e) => setQuestionForm({...questionForm, correctAnswer: e.target.value})}
                                >
                                    <MenuItem value="A">A</MenuItem>
                                    <MenuItem value="B">B</MenuItem>
                                    <MenuItem value="C">C</MenuItem>
                                    <MenuItem value="D">D</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Marks"
                                type="number"
                                value={questionForm.marks}
                                onChange={(e) => setQuestionForm({...questionForm, marks: e.target.value})}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Explanation (Optional)"
                                multiline
                                rows={2}
                                value={questionForm.explanation}
                                onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button
                        onClick={() => setQuestionDialog({open: false, question: null})}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon/>}
                        onClick={handleCreateQuestion}
                        color="success"
                    >
                        {questionDialog.question ? 'Update Question' : 'Create Question'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Exam Taking Dialog */}
            <Dialog
                open={examTakingDialog.open}
                maxWidth="md"
                fullWidth
                disableEscapeKeyDown
                disableBackdropClick
            >
                <DialogTitle sx={{bgcolor: 'primary.main', color: 'white'}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Typography variant="h6">
                            {examTakingDialog.exam?.title}
                        </Typography>
                        <Chip
                            icon={<TimerIcon/>}
                            label={formatTime(examTakingDialog.timeLeft)}
                            color="error"
                            variant="filled"
                            sx={{fontWeight: 700, bgcolor: 'rgba(255,255,255,0.2)'}}
                        />
                    </Box>
                </DialogTitle>
                <DialogContent sx={{py: 3}}>
                    {examTakingDialog?.exam && examTakingDialog?.exam?.questions ? (
                        <>
                            <Box sx={{mb: 3}}>
                                <Typography variant="body2" sx={{mb: 1}}>
                                    Question {examTakingDialog?.currentQuestion + 1} of {examTakingDialog?.exam?.questions.length}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={((examTakingDialog?.currentQuestion + 1) / examTakingDialog?.exam?.questions.length) * 100}
                                    sx={{height: 6, borderRadius: 3}}
                                />
                            </Box>

                            <Typography variant="h6" gutterBottom>
                                {examTakingDialog?.exam?.questions[examTakingDialog?.currentQuestion]?.questionText}
                            </Typography>

                            <RadioGroup
                                value={examTakingDialog.answers[examTakingDialog?.exam?.questions[examTakingDialog?.currentQuestion]?.id] || ''}
                                onChange={(e) => {
                                    const questionId = examTakingDialog?.exam?.questions[examTakingDialog.currentQuestion]?.id;
                                    if (questionId) {
                                        setExamTakingDialog({
                                            ...examTakingDialog,
                                            answers: {
                                                ...examTakingDialog.answers,
                                                [questionId]: e.target.value
                                            }
                                        });
                                    }
                                }}
                            >
                                {['A', 'B', 'C', 'D'].map((option) => {
                                    const question = examTakingDialog?.exam?.questions[examTakingDialog.currentQuestion];
                                    const optionValue = question?.[`option${option}`];

                                    if (!optionValue) return null;

                                    return (
                                        <FormControlLabel
                                            key={option}
                                            value={option}
                                            control={<Radio/>}
                                            label={`${option}. ${optionValue}`}
                                            sx={{
                                                display: 'block',
                                                mt: 1,
                                                p: 1.5,
                                                border: '1px solid',
                                                borderColor: 'grey.300',
                                                borderRadius: 2,
                                                '&:hover': {
                                                    bgcolor: 'action.hover'
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </RadioGroup>
                        </>
                    ) : (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                            <CircularProgress size={50}/>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3, display: 'flex', justifyContent: 'space-between'}}>
                    <Button
                        variant="outlined"
                        disabled={examTakingDialog.currentQuestion === 0}
                        onClick={() => setExamTakingDialog({
                            ...examTakingDialog,
                            currentQuestion: examTakingDialog.currentQuestion - 1
                        })}
                    >
                        Previous
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            if (examTakingDialog?.currentQuestion < examTakingDialog?.exam?.questions?.length - 1) {
                                setExamTakingDialog({
                                    ...examTakingDialog,
                                    currentQuestion: examTakingDialog?.currentQuestion + 1
                                });
                            } else {
                                handleSubmitExam();
                            }
                        }}
                    >
                        {examTakingDialog?.currentQuestion < examTakingDialog?.exam?.questions?.length - 1 ? 'Next' : 'Submit Exam'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
