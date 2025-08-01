import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
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
    Typography,
} from '@mui/material';
import {CalendarMonth, LocationOn, School} from '@mui/icons-material';
import {useDispatch, useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../../common";
import {sessionOptions} from "../../../../commonStyle";

const PromotionSchool = () => {
    const [toSessionYear, setToSessionYear] = useState('');
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schools = userData || [];

    useEffect(() => {
        console.log("Schools: ", schools);
    }, [schools]);

    const handleSessionChange = (e) => {
        setToSessionYear(e.target.value);
    };

    const handleSchoolSelect = (schoolId) => {
        setSelectedSchools((prev) =>
            prev.includes(schoolId)
                ? prev.filter((id) => id !== schoolId)
                : [...prev, schoolId]
        );
    };

    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            setSelectedSchools(schools.map((school) => school.id));
        } else {
            setSelectedSchools([]);
        }
    };

    const handleUpdate = async () => {
        if (!toSessionYear) {
            setSnackbar({
                open: true,
                message: 'Please select a session year!',
                severity: 'warning'
            });
            return;
        }
        if (selectedSchools.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please select at least one school!',
                severity: 'warning'
            });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                session: toSessionYear,
                schoolIds: selectedSchools,
            };
            await api.post('/api/promoteSchools', payload);
            setSnackbar({
                open: true,
                message: 'Session updated successfully!',
                severity: 'success'
            });
            setSelectedSchools([]);
        } catch (error) {
            console.error('Error updating session:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update session.',
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
                {/* Left Side */}
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
                                onChange={handleSessionChange}
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
                            onClick={handleUpdate}
                            disabled={loading || !toSessionYear || selectedSchools.length === 0}
                            sx={{
                                py: 1.5,
                                textTransform: 'none',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit"/>
                            ) : (
                                "Update Selected Schools"
                            )}
                        </Button>
                    </Paper>
                </Grid>

                {/* Right Side */}
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
                            <School color="primary" sx={{mr: 1}}/>
                            <Typography variant="h6" fontWeight={600}>
                                Schools List
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
                                        checked={selectedSchools.includes(schools.id)}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        color="primary"
                                    />
                                    <Typography>Select All Schools</Typography>
                                </Box>
                            </Box>

                            <List sx={{py: 0}}>
                                <ListItem
                                    dense
                                    button
                                    onClick={() => handleSchoolSelect(schools.id)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={selectedSchools.includes(schools.id)}
                                            color="primary"
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <Typography variant="subtitle1" fontWeight={500}>
                                                    {schools.name}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={schools.type || 'School'}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{display: 'flex', alignItems: 'center', mt: 0.5}}>
                                                <LocationOn fontSize="small" color="action" sx={{mr: 0.5}}/>
                                                <Typography variant="body2" color="text.secondary">
                                                    {`${schools.city}, ${schools.district}, ${schools.state} ${schools.pincode}`}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
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

export default PromotionSchool;
