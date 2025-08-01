import React, {useEffect, useState} from 'react';
import {
    Alert,
    alpha,
    Box,
    Button,
    Container,
    createTheme,
    Fade,
    Grid,
    Grow,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    TextField,
    ThemeProvider,
    Typography,
    Zoom,
} from '@mui/material';
import {Add as AddIcon, Delete as DeleteIcon, Schedule as ScheduleIcon} from '@mui/icons-material';
import {useDispatch, useSelector} from 'react-redux';
import {createPeriod, deletePeriod, fetchPeriods} from './redux/periodActions';
import {selectSchoolDetails} from '../../../../common';
import {styled} from '@mui/material/styles';
import {motion} from 'framer-motion';

// Modern theme configuration
const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
            light: '#60a5fa',
            dark: '#1d4ed8',
        },
        secondary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#6d28d9',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
        h4: {
            fontWeight: 800,
            letterSpacing: '-0.5px',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.3px',
        },
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
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        },
                        '&.Mui-focused': {
                            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.1)',
                        },
                    },
                },
            },
        },
    },
});

// Styled Components
const PageContainer = styled(motion.div)(({theme}) => ({
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

const StyledListItem = styled(ListItem)(({theme}) => ({
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'scale(1.02)',
        backgroundColor: alpha(theme.palette.primary.light, 0.1),
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
}));

const StyledIconButton = styled(IconButton)(({theme}) => ({
    color: theme.palette.error.main,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(theme.palette.error.main, 0.1),
        transform: 'rotate(8deg)',
    },
}));

function PeriodManagement() {
    const [newPeriod, setNewPeriod] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const dispatch = useDispatch();
    const periods = useSelector((state) => state?.period?.periods || []);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchPeriods(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddPeriod = () => {
        if (!newPeriod.trim()) {
            setSnackbarMessage("Period name cannot be blank.");
            setSnackbarOpen(true);
            return;
        }
        const periodData = {
            name: newPeriod,
            schoolId: schoolId,
            session
        };
        dispatch(createPeriod(periodData));
        setNewPeriod('');
    };

    const handleDeletePeriod = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this period?");
        if (confirmDelete) {
            dispatch(deletePeriod(id))
                .then(() => {
                    setSnackbarMessage("Period deleted successfully.");
                    setSnackbarOpen(true);
                })
                .catch((error) => {
                    console.error('Error deleting period:', error);
                    setSnackbarMessage("Failed to delete the period. Please try again.");
                    setSnackbarOpen(true);
                });
        }
    };

    const handleCloseSnackbar = () => {
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
                    <Box mb={5} display="flex" alignItems="center" gap={3}>
                        <Grow in timeout={800}>
                            <Box
                                sx={{
                                    backgroundColor: 'primary.main',
                                    borderRadius: '50%',
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <ScheduleIcon sx={{fontSize: 32, color: 'white'}}/>
                            </Box>
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
                                    Class Period Management
                                </Typography>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: '1.1rem',
                                        opacity: 0.8
                                    }}
                                >
                                    Manage and organize your class periods efficiently
                                </Typography>
                            </Box>
                        </Fade>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Zoom in timeout={1000}>
                                <StyledPaper elevation={0}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 3
                                        }}
                                    >
                                        <AddIcon color="primary"/>
                                        Add New Period
                                    </Typography>
                                    <TextField
                                        label="Period Name"
                                        value={newPeriod}
                                        onChange={(e) => setNewPeriod(e.target.value)}
                                        fullWidth
                                        variant="outlined"
                                        sx={{mb: 3}}
                                        placeholder="Enter period name..."
                                    />
                                    <Button
                                        onClick={handleAddPeriod}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={<AddIcon/>}
                                    >
                                        Add Period
                                    </Button>
                                </StyledPaper>
                            </Zoom>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Zoom in timeout={1200}>
                                <StyledPaper elevation={0}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            mb: 3
                                        }}
                                    >
                                        <ScheduleIcon color="primary"/>
                                        Existing Periods
                                    </Typography>
                                    <List
                                        sx={{
                                            maxHeight: 400,
                                            overflowY: 'auto',
                                            '&::-webkit-scrollbar': {
                                                width: '8px',
                                            },
                                            '&::-webkit-scrollbar-track': {
                                                background: '#f1f1f1',
                                                borderRadius: '10px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                background: '#888',
                                                borderRadius: '10px',
                                                '&:hover': {
                                                    background: '#555',
                                                },
                                            },
                                        }}
                                    >
                                        {periods.map((period, index) => (
                                            <Fade in key={period.id} timeout={500 + index * 100}>
                                                <StyledListItem>
                                                    <ListItemText
                                                        primary={period.name}
                                                        sx={{
                                                            '& .MuiListItemText-primary': {
                                                                fontWeight: 500,
                                                            },
                                                        }}
                                                    />
                                                    <StyledIconButton
                                                        onClick={() => handleDeletePeriod(period.id)}
                                                        size="small"
                                                    >
                                                        <DeleteIcon/>
                                                    </StyledIconButton>
                                                </StyledListItem>
                                            </Fade>
                                        ))}
                                    </List>
                                </StyledPaper>
                            </Zoom>
                        </Grid>
                    </Grid>

                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    >
                        <Alert
                            onClose={handleCloseSnackbar}
                            severity={snackbarMessage.includes('successfully') ? 'success' : 'error'}
                            sx={{
                                width: '100%',
                                borderRadius: 2,
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Container>
            </PageContainer>
        </ThemeProvider>
    );
}

export default PeriodManagement;
