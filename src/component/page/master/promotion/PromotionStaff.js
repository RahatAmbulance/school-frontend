import React, {useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Typography
} from '@mui/material';
import {CalendarMonth, Group} from '@mui/icons-material';
import {useDispatch, useSelector} from 'react-redux';
import axios from 'axios';
import {selectSchoolDetails} from '../../../../common';
import {sessionOptions} from '../../../../commonStyle';

const PromotionStaff = () => {
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    const [toSessionYear, setToSessionYear] = useState('');
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    const staff = useSelector((state) => state.master.data?.staff || []);

    const handleStaffSelect = (staffId) => {
        setSelectedStaff((prev) =>
            prev.includes(staffId)
                ? prev.filter((id) => id !== staffId)
                : [...prev, staffId]
        );
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelectedStaff(staff.map((member) => member.id));
        } else {
            setSelectedStaff([]);
        }
    };

    const handlePromote = async () => {
        if (!toSessionYear) {
            setSnackbar({
                open: true,
                message: 'Please select a session year to promote!',
                severity: 'warning'
            });
            return;
        }
        if (selectedStaff.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please select at least one staff to promote!',
                severity: 'warning'
            });
            return;
        }

        setLoading(true);
        const payload = {
            session: toSessionYear,
            staffIds: selectedStaff,
            schoolId: schoolId
        };

        try {
            const response = await axios.post('/api/promoteStaff', payload);
            setSnackbar({
                open: true,
                message: 'Staff promoted successfully!',
                severity: 'success'
            });
            setSelectedStaff([]);
        } catch (error) {
            console.error('Promotion Failed:', error);
            setSnackbar({
                open: true,
                message: 'An error occurred while promoting staff. Please try again.',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({...snackbar, open: false});
    };

    return (
        <Box sx={{p: 3}}>
            <Grid container spacing={3}>
                {/* Left Side - Session Selection */}
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <CalendarMonth color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" fontWeight={600}>
                                Session Details
                            </Typography>
                        </Box>

                        <FormControl fullWidth sx={{mb: 3}}>
                            <InputLabel>To Session Year</InputLabel>
                            <Select
                                value={toSessionYear}
                                onChange={(e) => setToSessionYear(e.target.value)}
                            >
                                {sessionOptions.map((year) => (
                                    <MenuItem key={year.value} value={year.label}>
                                        {year.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handlePromote}
                            disabled={loading || !toSessionYear || selectedStaff.length === 0}
                            sx={{
                                py: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit"/>
                            ) : (
                                "Promote Selected Staff"
                            )}
                        </Button>
                    </Paper>
                </Grid>

                {/* Right Side - Staff List */}
                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            background: 'linear-gradient(to right bottom, #ffffff, #f8f9fa)'
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <Group color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" fontWeight={600}>
                                Staff List
                            </Typography>
                        </Box>

                        <Box sx={{
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            maxHeight: 'calc(100vh - 300px)',
                            overflowY: 'auto'
                        }}>
                            <Box sx={{p: 2, borderBottom: '1px solid #e0e0e0'}}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <Checkbox
                                        checked={selectedStaff.length === staff.length && staff.length > 0}
                                        indeterminate={selectedStaff.length > 0 && selectedStaff.length < staff.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        color="primary"
                                    />
                                    <Typography>Select All Staff</Typography>
                                </Box>
                            </Box>

                            <List sx={{py: 0}}>
                                {staff.map((member) => (
                                    <ListItem
                                        key={member.id}
                                        dense
                                        button
                                        onClick={() => handleStaffSelect(member.id)}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'action.hover'
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={selectedStaff.includes(member.id)}
                                                color="primary"
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <Avatar
                                            sx={{
                                                mr: 2,
                                                bgcolor: 'primary.light'
                                            }}
                                        >
                                            {member.name.charAt(0)}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={500}>
                                                    {member.name}
                                                </Typography>
                                            }
                                            secondary={member.role}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PromotionStaff;
