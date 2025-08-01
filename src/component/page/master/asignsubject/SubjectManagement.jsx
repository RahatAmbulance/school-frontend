import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    Zoom,
} from '@mui/material';
import {
    Add,
    Assignment,
    CheckCircle,
    Class,
    Delete,
    Edit,
    FilterList,
    Info,
    LibraryBooks,
    MenuBook,
    RadioButtonUnchecked,
    School,
    Search,
    Subject,
} from '@mui/icons-material';
import {AnimatePresence, motion} from 'framer-motion';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {api, selectSchoolDetails} from '../../../../common';
import {useDispatch, useSelector} from "react-redux";
import './SubjectManagement.css';

const SubjectManagement = () => {
    const dispatch = useDispatch();
    const [tabIndex, setTabIndex] = useState(0);
    const [subjectName, setSubjectName] = useState('');
    const [isActivity, setIsActivity] = useState(false);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [editingSubjectId, setEditingSubjectId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState(null);
    const [selectAll, setSelectAll] = useState(false);
    const [open, setOpen] = useState(false);

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterActivity, setFilterActivity] = useState('all');
    const [isLoading, setIsLoading] = useState(false);

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {opacity: 0, y: -20}
    };

    const itemVariants = {
        hidden: {opacity: 0, x: -20},
        visible: {opacity: 1, x: 0},
        exit: {opacity: 0, x: 20}
    };

    // Filter subjects based on search term and activity filter
    const filteredSubjects = subjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterActivity === 'all' ||
            (filterActivity === 'activity' && subject.isActivity) ||
            (filterActivity === 'subject' && !subject.isActivity);
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        fetchClassesAndSubjects();
    }, [schoolId, session]);

    const fetchClassesAndSubjects = async () => {
        if (!schoolId || !session) return;
        setLoading(true);
        try {
            const [classesResponse, subjectsResponse] = await Promise.all([
                api.get('/api/master/class', {params: {schoolId, session}}),
                api.get('/api/master/subject', {params: {schoolId, session}})
            ]);
            setClasses(classesResponse.data);
            setSubjects(subjectsResponse.data);
        } catch (error) {
            toast.error('Error fetching data. Please try again.');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateSubject = async () => {
        if (!subjectName.trim()) {
            toast.warning('Subject name is required!');
            return;
        }
        setLoading(true);
        try {
            if (editingSubjectId) {
                await api.put(`/api/master/subject/${editingSubjectId}`, {
                    name: subjectName,
                    isActivity,
                    schoolId,
                    session
                });
                toast.success('Subject updated successfully!');
            } else {
                await api.post('/api/master/subject/save', {
                    name: subjectName,
                    isActivity,
                    schoolId,
                    session
                });
                toast.success('Subject added successfully!');
            }
            setSubjectName('');
            setIsActivity(false);
            setEditingSubjectId(null);
            await fetchClassesAndSubjects();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error processing request');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignSubjects = async () => {
        if (!selectedClass || !selectedSection || selectedSubjects.length === 0) {
            toast.warning('Please select class, section, and at least one subject!');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/api/master/classes/${selectedClass}/sections/${selectedSection}/subjects`, selectedSubjects);
            toast.success('Subjects assigned successfully!');
            await fetchClassesAndSubjects();
            setSelectedClass('');
            setSelectedSection('');
            setSelectedSubjects([]);
            setOpen(false);
        } catch (error) {
            toast.error('Error assigning subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSubject = async (selectedClass, sectionId, subjectId) => {
        try {
            await api.delete(`/api/master/classes/${selectedClass}/sections/${sectionId}/subjects/${subjectId}`);
            const updatedClasses = classes.map(cls => ({
                ...cls,
                sections: cls.sections.map(section => ({
                    ...section,
                    subjects: section.subjects.filter(subject => subject.id !== subjectId)
                }))
            }));
            setClasses(updatedClasses);
            toast.success('Subject removed successfully!');
        } catch (error) {
            toast.error('Error removing subject');
        }
    };

    const handleToastDelete = async () => {
        if (!assetToDelete) return;
        try {
            await api.delete(`/api/master/subject/${assetToDelete}`);
            setSubjects(prevSubjects => prevSubjects.filter(subject => subject.id !== assetToDelete));
            toast.success("Subject deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete the subject.");
        } finally {
            handleCloseModal();
        }
    };

    const handleEditSubject = (subject) => {
        setSubjectName(subject.name);
        setIsActivity(subject.isActivity);
        setEditingSubjectId(subject.id);
        setTabIndex(0);
    };

    const handleOpenModal = (id) => {
        setAssetToDelete(id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAssetToDelete(null);
    };

    const handleSelectAll = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        setSelectedSubjects(checked ? subjects.map(subject => subject.id) : []);
    };

    if (loading) {
        return (
            <Box className="loading-container">
                <CircularProgress className="loading-spinner"/>
            </Box>
        );
    }

    return (
        <Box className="glass-card" sx={{p: 3}}>
            <Tabs
                value={tabIndex}
                onChange={(e, newValue) => setTabIndex(newValue)}
                aria-label="subject management tabs"
                centered
                sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                        minWidth: 200,
                        fontWeight: 500,
                    },
                }}
            >
                <Tab
                    icon={<Subject sx={{mr: 1}}/>}
                    iconPosition="start"
                    label={tabIndex === 0 ? "Edit Subject" : "Add New Subject"}
                />
                <Tab
                    icon={<Class sx={{mr: 1}}/>}
                    iconPosition="start"
                    label="Assign Subject to Class"
                />
            </Tabs>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tabIndex}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {tabIndex === 0 ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} className="glass-card">
                                    <Typography variant="h6" gutterBottom
                                                sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        {editingSubjectId ? <Edit/> : <Add/>}
                                        {editingSubjectId ? "Edit Subject" : "Add New Subject"}
                                    </Typography>
                                    <Box className="form-control-container">
                                        <TextField
                                            label="Subject Name"
                                            value={subjectName}
                                            onChange={(e) => setSubjectName(e.target.value)}
                                            fullWidth
                                            required
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <MenuBook sx={{mr: 1, color: 'action.active'}}/>,
                                            }}
                                        />
                                    </Box>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={isActivity}
                                                onChange={(e) => setIsActivity(e.target.checked)}
                                                color="primary"
                                                icon={<RadioButtonUnchecked/>}
                                                checkedIcon={<CheckCircle/>}
                                            />
                                        }
                                        label="Select if Subject is Activity"
                                    />
                                    <Box mt={2}>
                                        <Button
                                            onClick={handleAddOrUpdateSubject}
                                            variant="contained"
                                            className="modern-button"
                                            startIcon={editingSubjectId ? <Edit/> : <Add/>}
                                            disabled={loading}
                                        >
                                            {editingSubjectId ? "Update" : "Save"}
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} className="glass-card">
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2
                                    }}>
                                        <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <LibraryBooks/>
                                            Existing Subjects
                                        </Typography>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <TextField
                                                size="small"
                                                placeholder="Search subjects..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <Search sx={{mr: 1, color: 'action.active'}}/>,
                                                }}
                                            />
                                            <FormControl size="small">
                                                <Select
                                                    value={filterActivity}
                                                    onChange={(e) => setFilterActivity(e.target.value)}
                                                    displayEmpty
                                                    startAdornment={<FilterList sx={{mr: 1, color: 'action.active'}}/>}
                                                >
                                                    <MenuItem value="all">All</MenuItem>
                                                    <MenuItem value="subject">Subjects Only</MenuItem>
                                                    <MenuItem value="activity">Activities Only</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Box>
                                    <Box className="custom-scrollbar" sx={{maxHeight: 400, overflowY: 'auto'}}>
                                        <List>
                                            <AnimatePresence>
                                                {filteredSubjects.length > 0 ? (
                                                    filteredSubjects.map((subject) => (
                                                        <motion.div
                                                            key={subject.id}
                                                            variants={itemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            exit="exit"
                                                            layout
                                                        >
                                                            <ListItem className="subject-list-item">
                                                                <ListItemText
                                                                    primary={
                                                                        <Box sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1
                                                                        }}>
                                                                            {subject.isActivity ? <Assignment/> :
                                                                                <MenuBook/>}
                                                                            {subject.name}
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <Chip
                                                                            size="small"
                                                                            label={subject.isActivity ? 'Activity' : 'Subject'}
                                                                            className="activity-badge"
                                                                            icon={subject.isActivity ?
                                                                                <Assignment fontSize="small"/> :
                                                                                <MenuBook fontSize="small"/>}
                                                                        />
                                                                    }
                                                                />
                                                                <ListItemSecondaryAction>
                                                                    <Tooltip title="Edit">
                                                                        <IconButton
                                                                            edge="end"
                                                                            onClick={() => handleEditSubject(subject)}
                                                                            color="primary"
                                                                        >
                                                                            <Edit/>
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete">
                                                                        <IconButton
                                                                            edge="end"
                                                                            onClick={() => handleOpenModal(subject.id)}
                                                                            color="error"
                                                                        >
                                                                            <Delete/>
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        </motion.div>
                                                    ))
                                                ) : (
                                                    <motion.div
                                                        initial={{opacity: 0}}
                                                        animate={{opacity: 1}}
                                                        exit={{opacity: 0}}
                                                    >
                                                        <Box className="empty-state">
                                                            <Info fontSize="large"/>
                                                            <Typography variant="body1">
                                                                No subjects found
                                                            </Typography>
                                                        </Box>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </List>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} className="glass-card">
                                    <Typography variant="h6" gutterBottom>
                                        Assign Subject to Class
                                    </Typography>
                                    <Box className="form-control-container">
                                        <FormControl fullWidth>
                                            <InputLabel>Select Class</InputLabel>
                                            <Select
                                                value={selectedClass}
                                                onChange={(e) => {
                                                    setSelectedClass(e.target.value);
                                                    setSelectedSection('');
                                                }}
                                                label="Select Class"
                                            >
                                                {classes.map(schoolClass => (
                                                    <MenuItem key={schoolClass.id} value={schoolClass.id}>
                                                        {schoolClass.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    {selectedClass && (
                                        <Box className="form-control-container">
                                            <FormControl fullWidth>
                                                <InputLabel>Select Section</InputLabel>
                                                <Select
                                                    value={selectedSection}
                                                    onChange={(e) => setSelectedSection(e.target.value)}
                                                    label="Select Section"
                                                >
                                                    {classes
                                                        .find(c => c.id === selectedClass)
                                                        ?.sections.map(section => (
                                                            <MenuItem key={section.id} value={section.id}>
                                                                {section.name}
                                                            </MenuItem>
                                                        ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    )}

                                    <Box className="form-control-container">
                                        <FormControl fullWidth>
                                            <InputLabel>Select Subjects</InputLabel>
                                            <Select
                                                multiple
                                                value={selectedSubjects}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setSelectedSubjects(value);
                                                    setSelectAll(value.length === subjects.length);
                                                }}
                                                label="Select Subjects"
                                                renderValue={(selected) => (
                                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                                                        {selected.map((value) => (
                                                            <Chip
                                                                key={value}
                                                                label={subjects.find(s => s.id === value)?.name}
                                                                size="small"
                                                            />
                                                        ))}
                                                    </Box>
                                                )}
                                            >
                                                <MenuItem>
                                                    <Checkbox
                                                        checked={selectAll}
                                                        onChange={handleSelectAll}
                                                        indeterminate={
                                                            selectedSubjects.length > 0 &&
                                                            selectedSubjects.length < subjects.length
                                                        }
                                                    />
                                                    <ListItemText primary="Select All"/>
                                                </MenuItem>
                                                {subjects.map(subject => (
                                                    <MenuItem key={subject.id} value={subject.id}>
                                                        <Checkbox
                                                            checked={selectedSubjects.indexOf(subject.id) > -1}
                                                            icon={<RadioButtonUnchecked/>}
                                                            checkedIcon={<CheckCircle/>}
                                                        />
                                                        <ListItemText primary={subject.name}/>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Button
                                        onClick={handleAssignSubjects}
                                        variant="contained"
                                        className="modern-button"
                                        startIcon={<School/>}
                                        fullWidth
                                    >
                                        Assign Subjects
                                    </Button>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} className="glass-card">
                                    <Typography variant="h6" gutterBottom>
                                        Current Assignments
                                    </Typography>
                                    <Box className="assignments-container custom-scrollbar">
                                        {classes.map(schoolClass => (
                                            <Box key={schoolClass.id} className="class-container">
                                                <Typography variant="h6" className="class-title">
                                                    {schoolClass.name}
                                                </Typography>
                                                <Box className="sections-container">
                                                    {schoolClass.sections.map(section => (
                                                        <Box key={section.id} className="section-container">
                                                            <Typography variant="subtitle1" className="section-title">
                                                                {section.name}
                                                            </Typography>
                                                            <List className="subjects-list">
                                                                {section.subjects.map(subject => (
                                                                    <motion.div
                                                                        key={subject.id}
                                                                        layout
                                                                        initial={{opacity: 0}}
                                                                        animate={{opacity: 1}}
                                                                        exit={{opacity: 0}}
                                                                    >
                                                                        <ListItem className="subject-item">
                                                                            <ListItemText
                                                                                primary={subject.name}
                                                                                secondary={
                                                                                    <Chip
                                                                                        size="small"
                                                                                        label={subject.isActivity ? 'Activity' : 'Subject'}
                                                                                        className="activity-badge"
                                                                                    />
                                                                                }
                                                                            />
                                                                            <Tooltip title="Remove">
                                                                                <IconButton
                                                                                    edge="end"
                                                                                    onClick={() => handleRemoveSubject(schoolClass.id, section.id, subject.id)}
                                                                                    color="error"
                                                                                >
                                                                                    <Delete/>
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </ListItem>
                                                                    </motion.div>
                                                                ))}
                                                            </List>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </motion.div>
            </AnimatePresence>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                PaperProps={{
                    className: 'glass-card'
                }}
                TransitionComponent={Zoom}
            >
                <DialogTitle className="dialog-title">
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                        <Delete color="error"/>
                        Delete Subject?
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText className="dialog-content">
                        Are you sure you want to delete this subject? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary" variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleToastDelete}
                        color="error"
                        variant="contained"
                        startIcon={<Delete/>}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </Box>
    );
};

export default SubjectManagement;
