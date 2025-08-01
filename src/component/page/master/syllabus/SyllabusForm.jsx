import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Divider,
    Fade,
    Grid,
    IconButton,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import SubjectIcon from '@mui/icons-material/Subject';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {motion} from 'framer-motion';

const SyllabusForm = ({currentSyllabus, onSave, onCancel}) => {
    const [syllabusDetails, setSyllabusDetails] = useState({
        subjectName: '',
        description: '',
        gradeLevel: '',
        term: '',
        teacherName: '',
        section: '',
        startDate: '',
        endDate: '',
    });

    const [topics, setTopics] = useState([]);
    const [formErrors, setFormErrors] = useState({});
    const theme = useTheme();

    useEffect(() => {
        if (currentSyllabus) {
            setSyllabusDetails(currentSyllabus);
            setTopics(currentSyllabus.topics || []);
        }
    }, [currentSyllabus]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setSyllabusDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
        setFormErrors((prev) => ({
            ...prev,
            [name]: '',
        }));
    };

    const handleTopicChange = (index, field, value) => {
        const updatedTopics = topics.map((topic, i) => {
            if (i === index) {
                return {...topic, [field]: value};
            }
            return topic;
        });
        setTopics(updatedTopics);
    };

    const addTopic = () => {
        setTopics([
            ...topics,
            {
                name: '',
                description: '',
                duration: '',
                order: (topics.length + 1).toString(),
            },
        ]);
    };

    const removeTopic = (index) => {
        setTopics(topics.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const errors = {};
        if (!syllabusDetails.subjectName) errors.subjectName = 'Subject name is required';
        if (!syllabusDetails.gradeLevel) errors.gradeLevel = 'Grade level is required';
        if (!syllabusDetails.term) errors.term = 'Term is required';
        if (!syllabusDetails.teacherName) errors.teacherName = 'Teacher name is required';
        if (!syllabusDetails.startDate) errors.startDate = 'Start date is required';
        if (!syllabusDetails.endDate) errors.endDate = 'End date is required';

        if (topics.length === 0) {
            errors.topics = 'At least one topic is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const syllabusData = {
                ...syllabusDetails,
                topics: topics.filter((topic) => topic.name.trim() !== ''),
            };
            onSave(syllabusData);
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Box sx={{mb: 4}}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <SubjectIcon/>
                            {currentSyllabus?.id ? 'Edit Syllabus' : 'Create New Syllabus'}
                        </Typography>
                        <Divider/>
                    </Box>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Subject Name"
                                name="subjectName"
                                value={syllabusDetails.subjectName}
                                onChange={handleInputChange}
                                error={!!formErrors.subjectName}
                                helperText={formErrors.subjectName}
                                InputProps={{
                                    startAdornment: <ClassIcon sx={{mr: 1, color: 'action.active'}}/>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={syllabusDetails.description}
                                onChange={handleInputChange}
                                multiline
                                rows={1}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Grade Level"
                                name="gradeLevel"
                                value={syllabusDetails.gradeLevel}
                                onChange={handleInputChange}
                                error={!!formErrors.gradeLevel}
                                helperText={formErrors.gradeLevel}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Term"
                                name="term"
                                value={syllabusDetails.term}
                                onChange={handleInputChange}
                                error={!!formErrors.term}
                                helperText={formErrors.term}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Teacher Name"
                                name="teacherName"
                                value={syllabusDetails.teacherName}
                                onChange={handleInputChange}
                                error={!!formErrors.teacherName}
                                helperText={formErrors.teacherName}
                                InputProps={{
                                    startAdornment: <PersonIcon sx={{mr: 1, color: 'action.active'}}/>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Section"
                                name="section"
                                value={syllabusDetails.section}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Start Date"
                                name="startDate"
                                value={syllabusDetails.startDate}
                                onChange={handleInputChange}
                                error={!!formErrors.startDate}
                                helperText={formErrors.startDate}
                                InputProps={{
                                    startAdornment: (
                                        <CalendarTodayIcon sx={{mr: 1, color: 'action.active'}}/>
                                    ),
                                }}
                                InputLabelProps={{shrink: true}}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="date"
                                label="End Date"
                                name="endDate"
                                value={syllabusDetails.endDate}
                                onChange={handleInputChange}
                                error={!!formErrors.endDate}
                                helperText={formErrors.endDate}
                                InputProps={{
                                    startAdornment: (
                                        <CalendarTodayIcon sx={{mr: 1, color: 'action.active'}}/>
                                    ),
                                }}
                                InputLabelProps={{shrink: true}}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{mt: 4, mb: 2}}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="h6" color="primary">
                                Topics
                            </Typography>
                            <Tooltip title="Add Topic">
                                <IconButton
                                    color="primary"
                                    onClick={addTopic}
                                    sx={{
                                        backgroundColor: theme.palette.primary.light,
                                        '&:hover': {
                                            backgroundColor: theme.palette.primary.main,
                                            color: 'white',
                                        },
                                    }}
                                >
                                    <AddCircleIcon/>
                                </IconButton>
                            </Tooltip>
                            {formErrors.topics && (
                                <Typography color="error" variant="caption">
                                    {formErrors.topics}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    {topics.map((topic, index) => (
                        <Fade in key={index} timeout={500}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2,
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={11}>
                                        <Stack spacing={2}>
                                            <TextField
                                                fullWidth
                                                label="Topic Name"
                                                value={topic.name}
                                                onChange={(e) =>
                                                    handleTopicChange(index, 'name', e.target.value)
                                                }
                                            />
                                            <TextField
                                                fullWidth
                                                label="Description"
                                                value={topic.description}
                                                onChange={(e) =>
                                                    handleTopicChange(index, 'description', e.target.value)
                                                }
                                                multiline
                                                rows={2}
                                            />
                                            <TextField
                                                fullWidth
                                                label="Duration (in hours)"
                                                value={topic.duration}
                                                onChange={(e) =>
                                                    handleTopicChange(index, 'duration', e.target.value)
                                                }
                                                type="number"
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Tooltip title="Remove Topic">
                                            <IconButton
                                                color="error"
                                                onClick={() => removeTopic(index)}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.error.light,
                                                    },
                                                }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Fade>
                    ))}

                    <Box sx={{mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end'}}>
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            startIcon={<CancelIcon/>}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon/>}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                '&:hover': {
                                    boxShadow: 4,
                                },
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </form>
            </Paper>
        </motion.div>
    );
};

export default SyllabusForm;