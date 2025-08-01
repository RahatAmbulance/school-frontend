import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import {Add as AddIcon, Class as ClassIcon, Delete as DeleteIcon, School as SchoolIcon} from '@mui/icons-material';
import {AnimatePresence, motion} from 'framer-motion';
import {
    addClass,
    addSection,
    fetchClasses,
    removeClass,
    removeSection,
    submitClasses,
    updateClass
} from './redux/Action';
import {selectSchoolDetails} from '../../../../common';
import 'react-toastify/dist/ReactToastify.css';

const ClassSection = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const {classes, loading, error} = useSelector((state) => state.classes);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isSection, setIsSection] = useState(false);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchClasses(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleClassChange = (e, index) => {
        const updatedClasses = classes.map((c, i) =>
            i === index ? {...c, name: e.target.value, schoolId, session} : c
        );
        dispatch(updateClass({index, updatedClass: updatedClasses[index]}));
    };

    const handleSectionChange = (e, classIndex, sectionIndex) => {
        const updatedClasses = classes.map((c, i) =>
            i === classIndex
                ? {
                    ...c,
                    sections: c.sections.map((s, j) =>
                        j === sectionIndex ? {...s, name: e.target.value, schoolId, session} : s
                    ),
                }
                : c
        );
        dispatch(updateClass({index: classIndex, updatedClass: updatedClasses[classIndex]}));
    };

    const isValidName = (name) => /^[a-zA-Z0-9 ]*$/.test(name) && name.trim() !== '';

    const isFormValid = () => {
        return classes.every(
            (schoolClass) =>
                isValidName(schoolClass.name) &&
                schoolClass.sections.every((section) => isValidName(section.name))
        );
    };

    const handleOpenModal = (id, isSection = false, classIndex = null, sectionIndex = null) => {
        setSelectedItem({id, classIndex, sectionIndex});
        setIsSection(isSection);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedItem(null);
        setIsSection(false);
    };

    const handleDelete = () => {
        if (selectedItem) {
            if (isSection) {
                dispatch(removeSection(selectedItem.classIndex, selectedItem.sectionIndex, selectedItem.id));
            } else {
                dispatch(removeClass(selectedItem.id));
            }
            handleCloseModal();
        }
    };

    if (loading) {
        return (
            <Box sx={{padding: 3}}>
                {[1, 2, 3].map((_, idx) => (
                    <Skeleton
                        key={idx}
                        variant="rectangular"
                        height={100}
                        sx={{
                            marginBottom: 2,
                            borderRadius: 2,
                            animation: 'pulse 1.5s infinite ease-in-out',
                        }}
                    />
                ))}
            </Box>
        );
    }

    return (
        <Box
            component={motion.div}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            sx={{
                padding: 3,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                borderRadius: 2,
                backdropFilter: 'blur(8px)',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    background: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: 2,
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        fontWeight: 'bold',
                    }}
                >
                    <SchoolIcon fontSize="large"/>
                    Class & Section Management
                </Typography>
            </Paper>

            <AnimatePresence>
                {classes.map((schoolClass, index) => (
                    <motion.div
                        key={index}
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: 20}}
                        transition={{duration: 0.3}}
                    >
                        <Card
                            sx={{
                                marginBottom: 3,
                                borderRadius: 2,
                                boxShadow: theme.shadows[3],
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[8],
                                },
                            }}
                        >
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={5}>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <ClassIcon color="primary"/>
                                            <TextField
                                                label={`Class ${index + 1} Name`}
                                                fullWidth
                                                value={schoolClass.name}
                                                onChange={(e) => handleClassChange(e, index)}
                                                variant="outlined"
                                                error={!isValidName(schoolClass.name)}
                                                helperText={
                                                    !isValidName(schoolClass.name)
                                                        ? schoolClass.name.trim() === ''
                                                            ? 'Enter class name'
                                                            : 'Invalid class name'
                                                        : ''
                                                }
                                            />
                                            <Tooltip title="Delete Class" placement="top">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleOpenModal(schoolClass.id)}
                                                    sx={{
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={7}>
                                        <AnimatePresence>
                                            {schoolClass.sections.map((section, secIndex) => (
                                                <motion.div
                                                    key={secIndex}
                                                    initial={{opacity: 0, height: 0}}
                                                    animate={{opacity: 1, height: 'auto'}}
                                                    exit={{opacity: 0, height: 0}}
                                                >
                                                    <Collapse in={true}>
                                                        <Grid container spacing={2} sx={{mb: 2}}>
                                                            <Grid item xs={10}>
                                                                <TextField
                                                                    label={`Section ${secIndex + 1}`}
                                                                    fullWidth
                                                                    value={section.name}
                                                                    onChange={(e) =>
                                                                        handleSectionChange(e, index, secIndex)
                                                                    }
                                                                    variant="outlined"
                                                                    error={!isValidName(section.name)}
                                                                    helperText={
                                                                        !isValidName(section.name)
                                                                            ? section.name.trim() === ''
                                                                                ? 'Enter section name'
                                                                                : 'Invalid section name'
                                                                            : ''
                                                                    }
                                                                />
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                <Tooltip title="Delete Section" placement="top">
                                                                    <IconButton
                                                                        color="error"
                                                                        onClick={() =>
                                                                            handleOpenModal(
                                                                                section.id,
                                                                                true,
                                                                                index,
                                                                                secIndex
                                                                            )
                                                                        }
                                                                        sx={{
                                                                            '&:hover': {
                                                                                transform: 'scale(1.1)',
                                                                            },
                                                                        }}
                                                                    >
                                                                        <DeleteIcon/>
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Grid>
                                                        </Grid>
                                                    </Collapse>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<AddIcon/>}
                                            onClick={() => dispatch(addSection(index))}
                                            sx={{
                                                mt: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                },
                                            }}
                                        >
                                            Add Section
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>

            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 4,
                }}
            >
                <Button
                    onClick={() => dispatch(addClass({name: '', sections: [], schoolId}))}
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon/>}
                    sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    Add Class
                </Button>
                <Button
                    onClick={() => dispatch(submitClasses(classes, schoolId, session))}
                    variant="contained"
                    color="secondary"
                    disabled={!isFormValid()}
                    sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: alpha(theme.palette.secondary.main, 0.5),
                        },
                    }}
                >
                    Save Changes
                </Button>
            </Box>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                PaperProps={{
                    component: motion.div,
                    initial: {opacity: 0, y: 20},
                    animate: {opacity: 1, y: 0},
                }}
            >
                <DialogTitle>
                    {isSection ? 'Delete Section?' : 'Delete Class?'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this {isSection ? 'section' : 'class'}?
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseModal}
                        color="primary"
                        variant="outlined"
                        sx={{mr: 1}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon/>}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClassSection;

















































