import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fade,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {useDispatch, useSelector} from 'react-redux';
import {addAttendance, fetchAttendance} from "../redux/attendanceActions";
import {selectSchoolDetails} from "../../../../common";
import {
    AccessTime,
    CalendarMonth,
    Cancel,
    Celebration,
    CheckCircle,
    CheckCircleOutline,
    EventBusy,
    Group,
    HourglassBottom,
    PersonSearch,
    Save
} from '@mui/icons-material';

const AttendanceTakeStaff = () => {
    const theme = useTheme();
    const [date, setDate] = useState(dayjs());
    const [attendance, setAttendance] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMessages, setDialogMessages] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    const dispatch = useDispatch();
    const staffList = useSelector(state => state.staff.staffList);
    const attendanceList = useSelector(state => state.attendance.attendanceList);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        dispatch(fetchAttendance(schoolId, session));
    }, [date, dispatch, schoolId, session]);

    useEffect(() => {
        setAttendance(
            staffList.map(staff => {
                const existingRecord = attendanceList.find(record =>
                    record.staffId === staff.id && record.date === date.format('YYYY-MM-DD')
                );
                return existingRecord || {
                    staffId: staff.id,
                    status: 'Present',
                    comment: '',
                    schoolId,
                    type: 'STAFF',
                    staffType: staff.staffType || 'Teaching',
                    name: staff.name,
                    date: date.format('YYYY-MM-DD'),
                    session
                };
            })
        );
    }, [staffList, attendanceList, date, userData, session]);

    const handleAttendanceChange = (staffId, field, value) => {
        setAttendance(prev => prev.map(record =>
            record.staffId === staffId ? {...record, [field]: value} : record
        ));
    };

    const handleMakeAll = (status) => {
        setAttendance(prev => prev.map(record => ({
            ...record,
            status,
            comment: (status === 'Present' || status === 'Absent' || status === 'Holiday') ? '' : record.comment
        })));
        setSnackbar({
            open: true,
            message: `All staff marked as ${status}`,
            severity: 'info'
        });
    };

    const filteredAttendance = selectedStaff
        ? attendance.filter(record => record.staffId === selectedStaff)
        : attendance;

    const handleSubmit = () => {
        // Use filteredAttendance instead of attendance
        if (!filteredAttendance || filteredAttendance.length === 0) {
            setDialogMessages(["No attendance data to save."]);
            setOpenDialog(true);
            return;
        }

        const errors = [];
        // Check errors for only filtered attendance
        filteredAttendance.forEach(record => {
            if ((record.status === 'Late' || record.status === 'Half Day' || record.status === 'Leave') && !record.comment) {
                const staffName = staffList.find(staff => staff.id === record.staffId)?.name;
                errors.push(`Comment is required for ${staffName} when status is ${record.status}.`);
            }
        });

        if (errors.length > 0) {
            setDialogMessages(errors);
            setOpenDialog(true);
            return;
        }

        // Send only filtered attendance data
        const attendanceData = filteredAttendance.map(record => ({
            ...record,
            date: date.format('YYYY-MM-DD'),
            schoolId,
        }));

        dispatch(addAttendance(attendanceData));

        // Update success message to reflect the actual number of records saved
        const message = selectedStaff
            ? `Attendance saved successfully for selected staff`
            : `Attendance saved successfully for all staff (${filteredAttendance.length} records)`;

        setSnackbar({
            open: true,
            message: message,
            severity: 'success'
        });
    };

    const getStatusChipProps = (status) => {
        const baseProps = {
            sx: {
                borderRadius: '8px',
                fontWeight: 500,
                minWidth: '100px',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.05)'
                }
            }
        };

        switch (status) {
            case 'Present':
                return {
                    ...baseProps,
                    color: 'success',
                    icon: <CheckCircleOutline/>
                };
            case 'Late':
                return {
                    ...baseProps,
                    color: 'warning',
                    icon: <AccessTime/>
                };
            case 'Absent':
                return {
                    ...baseProps,
                    color: 'error',
                    icon: <Cancel/>
                };
            case 'Half Day':
                return {
                    ...baseProps,
                    color: 'info',
                    icon: <HourglassBottom/>
                };
            case 'Leave':
                return {
                    ...baseProps,
                    color: 'warning',
                    icon: <EventBusy/>
                };
            case 'Holiday':
                return {
                    ...baseProps,
                    color: 'default',
                    icon: <Celebration/>
                };
            default:
                return baseProps;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container>
                <Fade in timeout={600}>
                    <Grid container spacing={3} sx={{mb: 4}}>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <CalendarMonth sx={{mr: 1, color: theme.palette.primary.main, fontSize: '2rem'}}/>
                                    <Typography variant="h6" fontWeight={600}>Select Date</Typography>
                                </Box>
                                <DatePicker
                                    value={date}
                                    onChange={(newDate) => setDate(newDate)}
                                    sx={{
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }
                                    }}
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                    <PersonSearch sx={{mr: 1, color: theme.palette.primary.main, fontSize: '2rem'}}/>
                                    <Typography variant="h6" fontWeight={600}>Filter Staff</Typography>
                                </Box>
                                <FormControl fullWidth>
                                    <InputLabel>Select Staff</InputLabel>
                                    <Select
                                        value={selectedStaff}
                                        onChange={(e) => setSelectedStaff(e.target.value)}
                                        label="Select Staff"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: 2
                                            }
                                        }}
                                    >
                                        <MenuItem value="">All Staff</MenuItem>
                                        {staffList.map((staff) => (
                                            <MenuItem key={staff.id} value={staff.id}>
                                                {staff.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Paper>
                        </Grid>
                    </Grid>
                </Fade>

                <Fade in timeout={800}>
                    <Paper
                        elevation={3}
                        sx={{
                            mb: 4,
                            p: 3,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <Group sx={{mr: 1, color: theme.palette.primary.main, fontSize: '2rem'}}/>
                            <Typography variant="h6" fontWeight={600}>Quick Actions</Typography>
                        </Box>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleMakeAll('Present')}
                                    sx={{
                                        height: '100%',
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    startIcon={<CheckCircle/>}
                                >
                                    Mark All Present
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleMakeAll('Absent')}
                                    sx={{
                                        height: '100%',
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    startIcon={<Cancel/>}
                                >
                                    Mark All Absent
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="info"
                                    onClick={() => handleMakeAll('Holiday')}
                                    sx={{
                                        height: '100%',
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: 600,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                    startIcon={<Celebration/>}
                                >
                                    Mark All Holiday
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Fade>

                <Fade in timeout={1000}>
                    <Paper
                        elevation={3}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}
                    >
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{bgcolor: theme.palette.primary.main}}>
                                        <TableCell sx={{color: 'white', fontWeight: 600, fontSize: '1rem'}}>
                                            Staff Name
                                        </TableCell>
                                        <TableCell align="center"
                                                   sx={{color: 'white', fontWeight: 600, fontSize: '1rem'}}>
                                            Attendance Status
                                        </TableCell>
                                        <TableCell align="center"
                                                   sx={{color: 'white', fontWeight: 600, fontSize: '1rem'}}>
                                            Comment
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAttendance.map((record, index) => (
                                        <TableRow
                                            key={record.staffId}
                                            sx={{
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    bgcolor: theme.palette.action.hover
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body1" fontWeight={500}>
                                                    {record.name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <FormControl fullWidth>
                                                    <RadioGroup
                                                        row
                                                        value={record.status}
                                                        onChange={(e) => handleAttendanceChange(record.staffId, 'status', e.target.value)}
                                                        sx={{
                                                            justifyContent: 'center',
                                                            gap: 1
                                                        }}
                                                    >
                                                        {['Present', 'Late', 'Absent', 'Half Day', 'Leave', 'Holiday'].map((status) => (
                                                            <FormControlLabel
                                                                key={status}
                                                                value={status}
                                                                control={
                                                                    <Radio
                                                                        size="small"
                                                                        sx={{display: 'none'}}
                                                                    />
                                                                }
                                                                label={
                                                                    <Chip
                                                                        label={status}
                                                                        {...getStatusChipProps(status)}
                                                                        variant={record.status === status ? 'filled' : 'outlined'}
                                                                        icon={getStatusChipProps(status).icon}
                                                                    />
                                                                }
                                                                sx={{margin: 0}}
                                                            />
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={record.comment}
                                                    onChange={(e) => handleAttendanceChange(record.staffId, 'comment', e.target.value)}
                                                    placeholder="Add comment..."
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Fade>

                <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 4}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        startIcon={<Save/>}
                        sx={{
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        Save Attendance
                    </Button>
                </Box>

                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: 2
                        }
                    }}
                >
                    <DialogTitle sx={{color: theme.palette.error.main}}>
                        Validation Error
                    </DialogTitle>
                    <DialogContent>
                        {dialogMessages.map((message, index) => (
                            <DialogContentText key={index} sx={{mb: 1}}>
                                • {message}
                            </DialogContentText>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenDialog(false)}
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none'
                            }}
                        >
                            Okay
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                >
                    <Alert
                        onClose={() => setSnackbar({...snackbar, open: false})}
                        severity={snackbar.severity}
                        sx={{
                            width: '100%',
                            borderRadius: 2
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </LocalizationProvider>
    );
};

export default AttendanceTakeStaff;
