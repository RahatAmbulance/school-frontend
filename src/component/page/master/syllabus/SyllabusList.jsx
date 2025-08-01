import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Chip,
    Container,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import {motion} from 'framer-motion';
import SyllabusForm from './SyllabusForm';
import {api} from '../../../../common';

const SyllabusList = () => {
    const [syllabi, setSyllabi] = useState([]);
    const [filteredSyllabi, setFilteredSyllabi] = useState([]);
    const [selectedSyllabus, setSelectedSyllabus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const API_URL = `/api/syllabus`;

    useEffect(() => {
        fetchSyllabi();
    }, []);

    useEffect(() => {
        setFilteredSyllabi(
            syllabi.filter((syllabus) =>
                Object.values(syllabus)
                    .join(' ')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            )
        );
    }, [syllabi, searchTerm]);

    const fetchSyllabi = async () => {
        try {
            setLoading(true);
            const response = await api.get(API_URL);
            setSyllabi(response.data);
            setFilteredSyllabi(response.data);
        } catch (error) {
            console.error('Error fetching syllabi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (syllabus) => {
        try {
            await api.post(API_URL, syllabus);
            fetchSyllabi();
            setSelectedSyllabus(null);
        } catch (error) {
            console.error('Error saving syllabus:', error);
        }
    };

    const handleEdit = (syllabus) => {
        setSelectedSyllabus(syllabus);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this syllabus?')) {
            try {
                await api.delete(`${API_URL}/${id}`);
                fetchSyllabi();
            } catch (error) {
                console.error('Error deleting syllabus:', error);
            }
        }
    };

    const handleCancel = () => {
        setSelectedSyllabus(null);
    };

    const handleAdd = () => {
        setSelectedSyllabus({});
    };

    const getStatusColor = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) return theme.palette.info.main; // Upcoming
        if (now > end) return theme.palette.error.main; // Expired
        return theme.palette.success.main; // Active
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{py: 4}}>
                <Fade in timeout={800}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            mb: 4,
                        }}
                    >
                        Syllabus Management
                    </Typography>
                </Fade>

                {selectedSyllabus ? (
                    <SyllabusForm
                        currentSyllabus={selectedSyllabus}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.5}}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    placeholder="Search in all fields..."
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        backgroundColor: 'background.paper',
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main,
                                            },
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddCircleIcon/>}
                                    onClick={handleAdd}
                                    sx={{
                                        height: '56px',
                                        boxShadow: 2,
                                        '&:hover': {
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    Add New Syllabus
                                </Button>
                            </Grid>
                        </Grid>

                        <Paper
                            elevation={3}
                            sx={{
                                mt: 4,
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                backgroundColor: theme.palette.primary.main,
                                            }}
                                        >
                                            <TableCell sx={{color: 'white'}}>Subject</TableCell>
                                            <TableCell sx={{color: 'white'}}>Grade & Term</TableCell>
                                            <TableCell sx={{color: 'white'}}>Teacher</TableCell>
                                            <TableCell sx={{color: 'white'}}>Duration</TableCell>
                                            <TableCell sx={{color: 'white'}}>Status</TableCell>
                                            <TableCell sx={{color: 'white'}}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredSyllabi.map((syllabus) => (
                                            <TableRow
                                                key={syllabus.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover',
                                                    },
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <SchoolIcon
                                                            sx={{
                                                                mr: 1,
                                                                color: theme.palette.primary.main,
                                                            }}
                                                        />
                                                        <Typography variant="body1">
                                                            {syllabus.subjectName}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <Chip
                                                            label={`Grade ${syllabus.gradeLevel}`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                        <Chip
                                                            label={syllabus.term}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                        />
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <PersonIcon sx={{mr: 1}}/>
                                                        {syllabus.teacherName}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                        <CalendarTodayIcon sx={{mr: 1}}/>
                                                        <Typography variant="body2">
                                                            {syllabus.startDate} - {syllabus.endDate}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={
                                                            new Date() < new Date(syllabus.startDate)
                                                                ? 'Upcoming'
                                                                : new Date() > new Date(syllabus.endDate)
                                                                    ? 'Expired'
                                                                    : 'Active'
                                                        }
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(
                                                                syllabus.startDate,
                                                                syllabus.endDate
                                                            ),
                                                            color: 'white',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Edit Syllabus">
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => handleEdit(syllabus)}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor:
                                                                        theme.palette.primary.light,
                                                                    },
                                                                }}
                                                            >
                                                                <EditIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete Syllabus">
                                                            <IconButton
                                                                color="error"
                                                                onClick={() => handleDelete(syllabus.id)}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor:
                                                                        theme.palette.error.light,
                                                                    },
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </motion.div>
                )}
            </Box>
        </Container>
    );
};

export default SyllabusList;
