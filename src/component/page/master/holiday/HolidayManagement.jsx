import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Fade,
    FormControlLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import SortIcon from '@mui/icons-material/Sort';
import {api, selectSchoolDetails} from '../../../../common';
import {useSelector} from "react-redux";
import {format} from 'date-fns';

function HolidayManagement() {
    const [holidays, setHolidays] = useState([]);
    const [newHolidayTitle, setNewHolidayTitle] = useState('');
    const [newHolidayStart, setNewHolidayStart] = useState('');
    const [newHolidayEnd, setNewHolidayEnd] = useState('');
    const [newHolidayAllDay, setNewHolidayAllDay] = useState(false);
    const [editingHolidayId, setEditingHolidayId] = useState(null);
    const [editingHolidayTitle, setEditingHolidayTitle] = useState('');
    const [editingHolidayStart, setEditingHolidayStart] = useState('');
    const [editingHolidayEnd, setEditingHolidayEnd] = useState('');
    const [editingHolidayAllDay, setEditingHolidayAllDay] = useState(false);
    const [alert, setAlert] = useState({show: false, message: '', severity: 'success'});
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const today = new Date().toISOString().slice(0, 16);

    useEffect(() => {
        fetchHolidays(schoolId, session);
    }, [schoolId, session]);

    const fetchHolidays = (schoolId, session) => {
        api.get('/api/master/holidays', {
            params: {schoolId, session}
        })
            .then(response => setHolidays(response.data))
            .catch(error => {
                console.error('Error fetching holidays:', error);
                showAlert('Failed to fetch holidays', 'error');
            });
    };

    const showAlert = (message, severity = 'success') => {
        setAlert({show: true, message, severity});
        setTimeout(() => setAlert({show: false, message: '', severity: 'success'}), 3000);
    };

    const getSortedHolidays = () => {
        const sortedHolidays = [...holidays].sort((a, b) => {
            const dateA = new Date(a.start);
            const dateB = new Date(b.start);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        return sortedHolidays;
    };

    const toggleSortOrder = () => {
        setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
    };

    const handleAddHoliday = () => {
        if (!validateHolidayInput(newHolidayTitle, newHolidayStart, newHolidayEnd, newHolidayAllDay)) return;

        const newHoliday = {
            title: newHolidayTitle,
            start: newHolidayStart,
            end: newHolidayAllDay ? null : newHolidayEnd,
            allDay: newHolidayAllDay,
            schoolId: schoolId,
            session: session,
        };

        api.post('/api/master/holidays', newHoliday)
            .then(response => {
                setHolidays([...holidays, response.data]);
                resetHolidayForm();
                showAlert('Holiday added successfully');
            })
            .catch(error => {
                console.error('Error adding holiday:', error);
                showAlert('Failed to add holiday', 'error');
            });
    };

    const handleEditHoliday = (holiday) => {
        setEditingHolidayId(holiday.id);
        setEditingHolidayTitle(holiday.title);
        setEditingHolidayStart(holiday.start);
        setEditingHolidayEnd(holiday.end || '');
        setEditingHolidayAllDay(holiday.allDay);
    };

    const handleUpdateHoliday = () => {
        if (!validateHolidayInput(editingHolidayTitle, editingHolidayStart, editingHolidayEnd, editingHolidayAllDay)) return;

        const updatedHoliday = {
            title: editingHolidayTitle,
            start: editingHolidayStart,
            end: editingHolidayAllDay ? null : editingHolidayEnd,
            allDay: editingHolidayAllDay,
            schoolId: schoolId,
            session: session,
        };

        api.put(`/api/master/holidays/${editingHolidayId}`, updatedHoliday)
            .then(response => {
                const updatedHolidays = holidays.map(holiday =>
                    holiday.id === editingHolidayId ? response.data : holiday
                );
                setHolidays(updatedHolidays);
                resetHolidayForm();
                showAlert('Holiday updated successfully');
            })
            .catch(error => {
                console.error('Error updating holiday:', error);
                showAlert('Failed to update holiday', 'error');
            });
    };

    const handleDeleteHoliday = (id) => {
        api.delete(`/api/master/holidays/${id}`)
            .then(() => {
                setHolidays(holidays.filter(holiday => holiday.id !== id));
                showAlert('Holiday deleted successfully');
            })
            .catch(error => {
                console.error('Error deleting holiday:', error);
                showAlert('Failed to delete holiday', 'error');
            });
    };

    const validateHolidayInput = (title, start, end, allDay) => {
        if (!title.trim()) {
            showAlert('Holiday title cannot be blank', 'error');
            return false;
        }
        if (!start) {
            showAlert('Start date/time cannot be blank', 'error');
            return false;
        }
        if (!allDay && !end) {
            showAlert('End date/time cannot be blank for non-all-day holidays', 'error');
            return false;
        }
        if (!allDay && end && new Date(start) >= new Date(end)) {
            showAlert('End date/time must be after start date/time', 'error');
            return false;
        }
        return true;
    };

    const resetHolidayForm = () => {
        setEditingHolidayId(null);
        setEditingHolidayTitle('');
        setEditingHolidayStart('');
        setEditingHolidayEnd('');
        setEditingHolidayAllDay(false);
        setNewHolidayTitle('');
        setNewHolidayStart('');
        setNewHolidayEnd('');
        setNewHolidayAllDay(false);
    };

    const handleCancelEdit = () => {
        resetHolidayForm();
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
        } catch {
            return dateString;
        }
    };

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Box sx={{mb: 4, textAlign: 'center'}}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 1
                    }}
                >
                    <EventIcon sx={{mr: 1, verticalAlign: 'bottom'}}/>
                    Holiday Management
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Manage school holidays and events efficiently
                </Typography>
            </Box>

            <Fade in={alert.show}>
                <Alert
                    severity={alert.severity}
                    sx={{
                        position: 'fixed',
                        top: 24,
                        right: 24,
                        zIndex: 9999,
                        boxShadow: 3
                    }}
                >
                    {alert.message}
                </Alert>
            </Fade>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card
                        elevation={3}
                        sx={{
                            height: '100%',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)'
                            }
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Typography variant="h6" gutterBottom color="primary">
                                {editingHolidayId ? 'Edit Holiday' : 'Add New Holiday'}
                            </Typography>
                            <Box component="form" sx={{mt: 2}}>
                                <TextField
                                    label="Holiday Title"
                                    value={editingHolidayId ? editingHolidayTitle : newHolidayTitle}
                                    onChange={(e) => editingHolidayId
                                        ? setEditingHolidayTitle(e.target.value)
                                        : setNewHolidayTitle(e.target.value)
                                    }
                                    fullWidth
                                    variant="outlined"
                                    sx={{mb: 3}}
                                />
                                <TextField
                                    label="Start Date & Time"
                                    type="datetime-local"
                                    value={editingHolidayId ? editingHolidayStart : newHolidayStart}
                                    onChange={(e) => editingHolidayId
                                        ? setEditingHolidayStart(e.target.value)
                                        : setNewHolidayStart(e.target.value)
                                    }
                                    fullWidth
                                    variant="outlined"
                                    sx={{mb: 3}}
                                    InputLabelProps={{shrink: true}}
                                />
                                {!newHolidayAllDay && !editingHolidayAllDay && (
                                    <TextField
                                        label="End Date & Time"
                                        type="datetime-local"
                                        value={editingHolidayId ? editingHolidayEnd : newHolidayEnd}
                                        onChange={(e) => editingHolidayId
                                            ? setEditingHolidayEnd(e.target.value)
                                            : setNewHolidayEnd(e.target.value)
                                        }
                                        fullWidth
                                        variant="outlined"
                                        sx={{mb: 3}}
                                        InputLabelProps={{shrink: true}}
                                        inputProps={{
                                            min: editingHolidayStart || newHolidayStart
                                        }}
                                    />
                                )}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={editingHolidayId ? editingHolidayAllDay : newHolidayAllDay}
                                            onChange={(e) => editingHolidayId
                                                ? setEditingHolidayAllDay(e.target.checked)
                                                : setNewHolidayAllDay(e.target.checked)
                                            }
                                            color="primary"
                                        />
                                    }
                                    label="All Day Event"
                                    sx={{mb: 3}}
                                />
                                <Box sx={{display: 'flex', gap: 2}}>
                                    <Button
                                        onClick={editingHolidayId ? handleUpdateHoliday : handleAddHoliday}
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        size="large"
                                        startIcon={editingHolidayId ? <EditIcon/> : <AddIcon/>}
                                        sx={{
                                            py: 1.5,
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        {editingHolidayId ? 'Update Holiday' : 'Add Holiday'}
                                    </Button>

                                    {editingHolidayId && (
                                        <Button
                                            onClick={handleCancelEdit}
                                            variant="outlined"
                                            sx={{
                                                py: 1.5,
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                minWidth: '100px'
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card
                        elevation={3}
                        sx={{
                            height: '100%',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-5px)'
                            }
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                                <Typography variant="h6" color="primary">
                                    Existing Holidays ({holidays.length})
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
                            <Box sx={{maxHeight: 500, overflowY: 'auto'}}>
                                <List>
                                    {getSortedHolidays().map((holiday) => (
                                        <React.Fragment key={holiday.id}>
                                            <ListItem
                                                sx={{
                                                    transition: 'all 0.3s ease',
                                                    border: editingHolidayId === holiday.id ? '2px solid' : '1px solid transparent',
                                                    borderColor: editingHolidayId === holiday.id ? 'primary.main' : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover',
                                                        transform: 'scale(1.02)',
                                                    },
                                                    borderRadius: 1,
                                                    mb: 1
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle1" fontWeight={500}>
                                                            {holiday.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color="text.secondary">
                                                            {holiday.allDay
                                                                ? `All Day - ${new Date(holiday.start).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}`
                                                                : `${formatDate(holiday.start)}${holiday.end ? ` - ${formatDate(holiday.end)}` : ''}`}
                                                        </Typography>
                                                    }
                                                />
                                                <Tooltip title="Edit Holiday">
                                                    <IconButton
                                                        onClick={() => handleEditHoliday(holiday)}
                                                        color="primary"
                                                        sx={{
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                backgroundColor: 'primary.light'
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Holiday">
                                                    <IconButton
                                                        onClick={() => handleDeleteHoliday(holiday.id)}
                                                        color="error"
                                                        sx={{
                                                            '&:hover': {
                                                                transform: 'scale(1.1)',
                                                                backgroundColor: 'error.light'
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItem>
                                            <Divider/>
                                        </React.Fragment>
                                    ))}
                                    {holidays.length === 0 && (
                                        <Box sx={{textAlign: 'center', py: 4}}>
                                            <Typography color="text.secondary">
                                                No holidays added yet. Add your first holiday!
                                            </Typography>
                                        </Box>
                                    )}
                                </List>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}

export default HolidayManagement;
