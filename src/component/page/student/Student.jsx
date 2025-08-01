import React, {useEffect, useState} from 'react';
import {
    Alert,
    alpha,
    Avatar,
    Box,
    Button,
    Container,
    createTheme,
    Fade,
    Grid,
    Grow,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    styled,
    TextField,
    ThemeProvider,
    Tooltip,
    Typography
} from '@mui/material';
import {
    Add as AddIcon,
    Clear as ClearIcon,
    Download as DownloadIcon,
    School as SchoolIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import {useDispatch, useSelector} from 'react-redux';
import {useLocation, useNavigate} from 'react-router-dom';
import * as XLSX from 'xlsx';
import StudentForm from './StudentForm';
import StudentList from './StudentList';
import {deleteStudent, fetchStudents, saveStudent} from './redux/studentActions';
import {motion} from 'framer-motion';

// Modern theme configuration with enhanced colors and effects
const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#6d28d9',
            contrastText: '#ffffff'
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff'
        },
        success: {
            main: '#059669',
            light: '#34d399',
            dark: '#047857'
        }
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
        h4: {
            fontWeight: 800,
            letterSpacing: '-0.5px'
        },
        h5: {
            fontWeight: 700,
            letterSpacing: '-0.5px'
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.3px'
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.3px'
        }
    },
    shape: {
        borderRadius: 16
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)'
                    }
                }
            }
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                        },
                        '&.Mui-focused': {
                            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.1)'
                        }
                    }
                }
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    transition: 'all 0.2s ease-in-out'
                }
            }
        }
    }
});

// Enhanced Styled Components
const PageContainer = styled(motion.div)(({theme}) => ({
    minHeight: '100vh',
    padding: theme.spacing(4),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
}));

const SearchContainer = styled(Paper)(({theme}) => ({
    padding: theme.spacing(4),
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    marginBottom: theme.spacing(4),
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
    }
}));

const ActionButton = styled(Button)(({theme}) => ({
    height: '100%',
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.2)',
    '&:hover': {
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)'
    }
}));

const DownloadButton = styled(IconButton)(({theme}) => ({
    height: '100%',
    minHeight: 56,
    width: 56,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderRadius: 16,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.15)'
    }
}));

const StyledAvatar = styled(Avatar)(({theme}) => ({
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)',
    border: '4px solid white',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05) rotate(5deg)'
    }
}));

const Student = () => {
    const dispatch = useDispatch();
    const {students} = useSelector((state) => state.students);
    const navigate = useNavigate();
    const location = useLocation();
    const [openForm, setOpenForm] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    useEffect(() => {
        const filtered = students.filter((student) => {
            const {studentPhoto, fatherPhoto, motherPhoto, ...otherFields} = student;
            return Object.values(otherFields).some((value) =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
        setFilteredStudents(filtered);
    }, [students, searchQuery]);

    useEffect(() => {
        if (location.state?.openForm) {
            setOpenForm(true);
        }
    }, [location.state]);

    const handleSave = (student) => {
        dispatch(saveStudent(student));
        setOpenForm(false);
        setSubmitted(true);
    };

    useEffect(() => {
        if (!openForm && submitted) {
            setSnackbarOpen(true);
            setSubmitted(false);
        }
    }, [openForm, submitted]);

    useEffect(() => {
        return () => {
            setSnackbarOpen(false);
        };
    }, [location]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setSnackbarOpen(false);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const handleEdit = (student) => {
        setEditStudent(student);
        setOpenForm(true);
    };

    const handleDelete = (id) => {
        dispatch(deleteStudent(id));
    };

    const handleView = (student) => {
        navigate(`/student/${student.id}`);
    };

    const handleAddNewStudent = () => {
        setEditStudent(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleDownload = () => {
        const dataToExport = students.map(({studentPhoto, fatherPhoto, motherPhoto, ...otherFields}) => otherFields);
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "students.xlsx");
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <PageContainer
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <Container maxWidth="xl">
                    {/* Enhanced Header Section */}
                    <Box mb={5} display="flex" alignItems="center" gap={3}>
                        <Grow in timeout={800}>
                            <StyledAvatar>
                                <SchoolIcon sx={{fontSize: 32}}/>
                            </StyledAvatar>
                        </Grow>
                        <Fade in timeout={1000}>
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1
                                    }}
                                >
                                    Student Management
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: '1.1rem',
                                        opacity: 0.8
                                    }}
                                >
                                    Efficiently manage and track student information
                                </Typography>
                            </Box>
                        </Fade>
                    </Box>

                    {/* Enhanced Search and Actions Section */}
                    <Fade in timeout={1200}>
                        <SearchContainer elevation={0}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search students by name, mobile, parent name, class, roll number..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" sx={{fontSize: 24}}/>
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchQuery && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleClearSearch}
                                                        edge="end"
                                                        size="small"
                                                        sx={{
                                                            '&:hover': {
                                                                transform: 'rotate(90deg)',
                                                                transition: 'transform 0.3s ease-in-out'
                                                            }
                                                        }}
                                                    >
                                                        <ClearIcon/>
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                height: 56,
                                                fontSize: '1.1rem'
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <ActionButton
                                        variant="contained"
                                        fullWidth
                                        onClick={handleAddNewStudent}
                                        startIcon={<AddIcon sx={{fontSize: 24}}/>}
                                    >
                                        Add New Student
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={12} md={1}>
                                    <Tooltip
                                        title="Download Students Data"
                                        placement="top"
                                        arrow
                                    >
                                        <DownloadButton onClick={handleDownload} color="primary">
                                            <DownloadIcon sx={{fontSize: 24}}/>
                                        </DownloadButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </SearchContainer>
                    </Fade>

                    {/* Enhanced Student List */}
                    <Fade in timeout={1400}>
                        <Box>
                            <StudentList
                                studentList={filteredStudents}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleView={handleView}
                            />
                        </Box>
                    </Fade>

                    {/* Enhanced Success Snackbar */}
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={4000}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                        TransitionComponent={Grow}
                    >
                        <Alert
                            onClose={handleSnackbarClose}
                            severity="success"
                            variant="filled"
                            sx={{
                                minWidth: 350,
                                borderRadius: 3,
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                '& .MuiAlert-icon': {
                                    fontSize: 24
                                },
                                '& .MuiAlert-message': {
                                    fontSize: '1.1rem',
                                    fontWeight: 500
                                }
                            }}
                        >
                            Student added successfully!
                        </Alert>
                    </Snackbar>

                    {/* Student Form Dialog */}
                    <StudentForm
                        open={openForm}
                        handleClose={() => setOpenForm(false)}
                        handleSave={handleSave}
                        studentData={editStudent}
                    />
                </Container>
            </PageContainer>
        </ThemeProvider>
    );
};

export default Student;
