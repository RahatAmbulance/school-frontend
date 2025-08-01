import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    Switch,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import SortIcon from '@mui/icons-material/Sort';
import {api, selectSchoolDetails} from '../../../../common';
import {useSelector} from "react-redux";
import {motion} from 'framer-motion';

function EventManagement() {
    const theme = useTheme();
    const [events, setEvents] = useState([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventStart, setNewEventStart] = useState('');
    const [newEventEnd, setNewEventEnd] = useState('');
    const [newEventAllDay, setNewEventAllDay] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);
    const [editingEventTitle, setEditingEventTitle] = useState('');
    const [editingEventStart, setEditingEventStart] = useState('');
    const [editingEventEnd, setEditingEventEnd] = useState('');
    const [editingEventAllDay, setEditingEventAllDay] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        fetchEvents(schoolId, session);
    }, []);

    const fetchEvents = (schoolId, session) => {
        api.get('/api/master/events', {
            params: {schoolId, session}
        })
            .then(response => setEvents(response.data))
            .catch(error => {
                console.error('Error fetching events:', error);
                setSnackbarMessage('Error loading events');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    const getSortedEvents = () => {
        const sortedEvents = [...events].sort((a, b) => {
            const dateA = new Date(a.start);
            const dateB = new Date(b.start);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        return sortedEvents;
    };

    const handleAddEvent = () => {
        // Validation without past date restriction
        if (!newEventTitle.trim()) {
            showSnackbar("Event title cannot be blank.", 'error');
            return;
        }
        if (!newEventStart) {
            showSnackbar("Start date/time cannot be blank.", 'error');
            return;
        }
        if (!newEventAllDay && !newEventEnd) {
            showSnackbar("End date/time cannot be blank for non-all-day events.", 'error');
            return;
        }
        if (!newEventAllDay && newEventEnd && new Date(newEventStart) >= new Date(newEventEnd)) {
            showSnackbar("End date/time must be after start date/time.", 'error');
            return;
        }

        const newEvent = {
            title: newEventTitle,
            start: newEventStart,
            end: newEventAllDay ? null : newEventEnd,
            allDay: newEventAllDay,
            schoolId: schoolId,
            session: session,
        };

        api.post('/api/master/events', newEvent)
            .then(response => {
                setEvents([...events, response.data]);
                resetEventForm();
                showSnackbar('Event added successfully!', 'success');
            })
            .catch(error => {
                console.error('Error adding event:', error);
                showSnackbar('Error adding event. Please try again.', 'error');
            });
    };

    const handleEditEvent = (event) => {
        setEditingEventId(event.id);
        setEditingEventTitle(event.title);
        setEditingEventStart(event.start);
        setEditingEventEnd(event.end || '');
        setEditingEventAllDay(event.allDay);
    };

    const handleUpdateEvent = () => {
        // Validation without past date restriction
        if (!editingEventTitle.trim()) {
            showSnackbar("Event title cannot be blank.", 'error');
            return;
        }
        if (!editingEventStart) {
            showSnackbar("Start date/time cannot be blank.", 'error');
            return;
        }
        if (!editingEventAllDay && !editingEventEnd) {
            showSnackbar("End date/time cannot be blank for non-all-day events.", 'error');
            return;
        }
        if (!editingEventAllDay && editingEventEnd && new Date(editingEventStart) >= new Date(editingEventEnd)) {
            showSnackbar("End date/time must be after start date/time.", 'error');
            return;
        }

        const updatedEvent = {
            title: editingEventTitle,
            start: editingEventStart,
            end: editingEventAllDay ? null : editingEventEnd,
            allDay: editingEventAllDay,
            schoolId: schoolId,
            session: session,
        };

        api.put(`/api/master/events/${editingEventId}`, updatedEvent)
            .then(response => {
                const updatedEvents = events.map(event =>
                    event.id === editingEventId ? response.data : event
                );
                setEvents(updatedEvents);
                resetEventForm();
                showSnackbar('Event updated successfully!', 'success');
            })
            .catch(error => {
                console.error('Error updating event:', error);
                showSnackbar('Error updating event. Please try again.', 'error');
            });
    };

    const handleDeleteEvent = (id) => {
        setConfirmDeleteId(id);
        setOpenDialog(true);
    };

    const confirmDelete = () => {
        if (confirmDeleteId) {
            api.delete(`/api/master/events/${confirmDeleteId}`)
                .then(() => {
                    setEvents(events.filter(event => event.id !== confirmDeleteId));
                    showSnackbar('Event deleted successfully!', 'success');
                    setOpenDialog(false);
                    setConfirmDeleteId(null);
                })
                .catch(error => {
                    console.error('Error deleting event:', error);
                    showSnackbar('Error deleting event. Please try again.', 'error');
                    setOpenDialog(false);
                    setConfirmDeleteId(null);
                });
        }
    };

    const resetEventForm = () => {
        setEditingEventId(null);
        setEditingEventTitle('');
        setEditingEventStart('');
        setEditingEventEnd('');
        setEditingEventAllDay(false);
        setNewEventTitle('');
        setNewEventStart('');
        setNewEventEnd('');
        setNewEventAllDay(false);
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    const handleCancelEdit = () => {
        resetEventForm();
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
    };

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Box sx={{
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2
            }}>
                <EventIcon sx={{fontSize: 40, color: theme.palette.primary.main}}/>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Event Management
                </Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{opacity: 0, x: -50}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.5}}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 2,
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
                                    : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                    mb: 3,
                                    fontWeight: 600,
                                    color: theme.palette.primary.main
                                }}
                            >
                                {editingEventId ? 'Edit Event' : 'Add New Event'}
                            </Typography>

                            <TextField
                                label="Event Title"
                                value={editingEventId ? editingEventTitle : newEventTitle}
                                onChange={(e) => editingEventId ? setEditingEventTitle(e.target.value) : setNewEventTitle(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <TextField
                                label="Start Date & Time"
                                type="datetime-local"
                                value={editingEventId ? editingEventStart : newEventStart}
                                onChange={(e) => editingEventId ? setEditingEventStart(e.target.value) : setNewEventStart(e.target.value)}
                                fullWidth
                                variant="outlined"
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                                InputLabelProps={{shrink: true}}
                            />

                            {!newEventAllDay && !editingEventAllDay && (
                                <TextField
                                    label="End Date & Time"
                                    type="datetime-local"
                                    value={editingEventId ? editingEventEnd : newEventEnd}
                                    onChange={(e) => editingEventId ? setEditingEventEnd(e.target.value) : setNewEventEnd(e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        mb: 3,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2
                                        }
                                    }}
                                    InputLabelProps={{shrink: true}}
                                />
                            )}

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={editingEventId ? editingEventAllDay : newEventAllDay}
                                        onChange={(e) => editingEventId ? setEditingEventAllDay(e.target.checked) : setNewEventAllDay(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="All Day Event"
                                sx={{mb: 3}}
                            />

                            <Box sx={{display: 'flex', gap: 2}}>
                                <Button
                                    onClick={editingEventId ? handleUpdateEvent : handleAddEvent}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                        '&:hover': {
                                            background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                                        }
                                    }}
                                >
                                    {editingEventId ? 'Update Event' : 'Add Event'}
                                </Button>

                                {editingEventId && (
                                    <Button
                                        onClick={handleCancelEdit}
                                        variant="outlined"
                                        sx={{
                                            py: 1.5,
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            minWidth: '100px'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </motion.div>
                </Grid>

                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{opacity: 0, x: 50}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.5}}
                    >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                borderRadius: 2,
                                maxHeight: '70vh',
                                overflow: 'auto',
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(145deg, #1a1a1a, #2d2d2d)'
                                    : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
                                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                '&::-webkit-scrollbar': {
                                    width: '8px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: '#f1f1f1',
                                    borderRadius: '4px'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: theme.palette.primary.main,
                                    borderRadius: '4px'
                                }
                            }}
                        >
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: theme.palette.primary.main
                                    }}
                                >
                                    Existing Events ({events.length})
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<SortIcon/>}
                                    onClick={toggleSortOrder}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '0.75rem'
                                    }}
                                >
                                    {sortOrder === 'desc' ? 'Latest First' : 'Oldest First'}
                                </Button>
                            </Box>

                            {events.length === 0 ? (
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <Typography variant="body1" color="text.secondary">
                                        No events found. Add your first event!
                                    </Typography>
                                </Box>
                            ) : (
                                <List>
                                    {getSortedEvents().map((event) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            transition={{duration: 0.3}}
                                        >
                                            <ListItem
                                                sx={{
                                                    mb: 2,
                                                    borderRadius: 2,
                                                    backgroundColor: theme.palette.background.paper,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.3s ease',
                                                    border: editingEventId === event.id ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                                            {event.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color="text.secondary">
                                                            {event.allDay ? (
                                                                `All Day - ${new Date(event.start).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}`
                                                            ) : (
                                                                <>
                                                                    {new Date(event.start).toLocaleString(undefined, {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                    {event.end && ` - ${new Date(event.end).toLocaleString(undefined, {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}`}
                                                                </>
                                                            )}
                                                        </Typography>
                                                    }
                                                />
                                                <IconButton
                                                    onClick={() => handleEditEvent(event)}
                                                    color="primary"
                                                    sx={{
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            backgroundColor: 'rgba(25, 118, 210, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDeleteEvent(event.id)}
                                                    color="error"
                                                    sx={{
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            backgroundColor: 'rgba(211, 47, 47, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </ListItem>
                                        </motion.div>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </motion.div>
                </Grid>
            </Grid>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                    }
                }}
            >
                <DialogTitle sx={{fontWeight: 600}}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this event? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2}}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none'
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default EventManagement;
