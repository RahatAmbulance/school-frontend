import React, {useEffect, useState} from 'react';
import {
    Alert,
    Autocomplete,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {Close as CloseIcon} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {useDispatch, useSelector} from "react-redux";
import {selectSchoolDetails, selectUserActualData} from "../../../common";
import {createNotification} from './redux/notificationActions';

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.spacing(3),
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(20px)',
    },
}));

const GradientButton = styled(Button)(({theme}) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
    },
}));

const CreateNotification = ({open, onClose}) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const actualUsrData = useSelector(selectUserActualData);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const classSections = useSelector(
        (state) => state.master.data.classSections || []
    );
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Add these state variables
    const [availableSections, setAvailableSections] = useState([]);

    const [newNotification, setNewNotification] = useState({
        schoolId,
        session,
        title: '',
        message: '',
        type: 'all',
        createdBy: 'Admin',
        className: '',
        section: '',
        eventStartDate: '',
        eventEndDate: '',
        isHalfDay: false
    });

    // Update this effect to use newNotification instead of filters
    useEffect(() => {
        if (newNotification.className) {
            const selectedClass = classSections.find(cs => cs.name === newNotification.className);
            setAvailableSections(selectedClass?.sections || []);

            // Reset section when class changes
            if (!selectedClass?.sections?.some(s => s.name === newNotification.section)) {
                setNewNotification(prev => ({...prev, section: ''}));
            }
        } else {
            setAvailableSections([]);
        }
    }, [newNotification.className, classSections]);

    const handleSubmit = async () => {
        try {
            await dispatch(createNotification(newNotification));
            setSnackbarMessage('Notification created successfully!');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            resetForm();
            onClose();
        } catch (error) {
            setSnackbarMessage(error.message || 'Failed to create notification');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const resetForm = () => {
        setNewNotification({
            schoolId,
            session,
            title: '',
            message: '',
            type: 'all',
            createdBy: 'Admin',
            className: '',
            section: '',
            eventStartDate: '',
            eventEndDate: '',
            isHalfDay: false
        });
        setAvailableSections([]);
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // Get available class names from classSections
    const classNames = classSections.map(cls => cls.name);

    return (
        <>
            <StyledDialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{pb: 1}}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" sx={{fontWeight: 700}}>
                            Create New Notification
                        </Typography>
                        <IconButton onClick={onClose}>
                            <CloseIcon/>
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{pt: 2}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={newNotification.title}
                                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                                sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Message"
                                multiline
                                rows={4}
                                value={newNotification.message}
                                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                                sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={newNotification.type}
                                    label="Type"
                                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                                    sx={{borderRadius: 2}}
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="student">Students</MenuItem>
                                    <MenuItem value="staff">Staff</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                value={newNotification.className}
                                onChange={(_, newValue) => setNewNotification({
                                    ...newNotification,
                                    className: newValue || '',
                                    section: ''
                                })}
                                options={classNames || []}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Class (Optional)"
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                    />
                                )}
                                noOptionsText="No Classes Available"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Autocomplete
                                value={newNotification.section}
                                onChange={(_, newValue) => setNewNotification({
                                    ...newNotification,
                                    section: newValue || ''
                                })}
                                options={availableSections.map(section => section.name) || []}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Section (Optional)"
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                                    />
                                )}
                                disabled={!newNotification.className}
                                noOptionsText="No Sections Available"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Event Start Date"
                                type="date"
                                InputLabelProps={{shrink: true}}
                                value={newNotification.eventStartDate}
                                onChange={(e) => setNewNotification({
                                    ...newNotification,
                                    eventStartDate: e.target.value
                                })}
                                sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Event End Date"
                                type="date"
                                InputLabelProps={{shrink: true}}
                                value={newNotification.eventEndDate}
                                onChange={(e) => setNewNotification({...newNotification, eventEndDate: e.target.value})}
                                sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={newNotification.isHalfDay}
                                        onChange={(e) => setNewNotification({
                                            ...newNotification,
                                            isHalfDay: e.target.checked
                                        })}
                                        color="primary"
                                    />
                                }
                                label="Half Day Event"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{p: 3, pt: 1}}>
                    <Button
                        onClick={onClose}
                        sx={{borderRadius: 2, textTransform: 'none'}}
                    >
                        Cancel
                    </Button>
                    <GradientButton
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{borderRadius: 2, textTransform: 'none'}}
                    >
                        Create Notification
                    </GradientButton>
                </DialogActions>
            </StyledDialog>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CreateNotification;