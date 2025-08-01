import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Fade,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    Snackbar,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {AccessTime, Delete, Description, Edit, EventNote, Person} from '@mui/icons-material'; // Icons for Edit and Delete
import {useSelector} from 'react-redux';
import {api, selectSchoolDetails, selectUserActualData} from '../../../../common';
import {styled} from '@mui/material/styles';

const leaveDurationOptions = ['Full Day', 'Half Day'];
const halfDayOptions = ['First Half', 'Second Half'];

// Styled components
const StyledCard = styled(Card)(({theme}) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const StyledTableCell = styled(TableCell)(({theme}) => ({
    fontWeight: 'bold',
    padding: theme.spacing(2),
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    transition: 'background-color 0.3s',
    '&:hover': {
        backgroundColor: theme.palette.action.selected,
    },
}));

const StatusChip = styled(Chip)(({theme, status}) => ({
    fontWeight: 'bold',
    backgroundColor:
        status === 'Approved' ? theme.palette.success.light :
            status === 'Rejected' ? theme.palette.error.light :
                theme.palette.warning.light,
    color:
        status === 'Approved' ? theme.palette.success.dark :
            status === 'Rejected' ? theme.palette.error.dark :
                theme.palette.warning.dark,
}));

const LeaveApplicationForm = ({applyLeave, editingLeave, handleEditSubmit}) => {
    const theme = useTheme();
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;

    const [employeeName, setEmployeeName] = useState(editingLeave?.name || '');
    const [leaveType, setLeaveType] = useState(editingLeave?.leaveType || '');
    const [leaveDuration, setLeaveDuration] = useState(editingLeave?.leaveDuration || 'Full Day');
    const [halfDayType, setHalfDayType] = useState(editingLeave?.halfDayType || '');
    const [fromDate, setFromDate] = useState(editingLeave?.fromDate || '');
    const [toDate, setToDate] = useState(editingLeave?.toDate || '');
    const [reason, setReason] = useState(editingLeave?.reason || '');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false); // New state for Snackbar visibility

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(toDate) < new Date(fromDate)) {
            alert("The 'To Date' cannot be earlier than the 'From Date'. Please select a valid date range.");
            return;
        }
        const newLeave = {
            loginId: userActualData.tableId,
            name: userActualData?.name,
            leaveType,
            leaveDuration,
            halfDayType: leaveDuration === 'Half Day' ? halfDayType : null,
            fromDate,
            toDate,
            reason,
            status: 'Pending',
            role: userActualData.role,
            schoolId: schoolId,
            session,
            tableName: userActualData.tableName,
            className: userActualData.className,
            section: userActualData.section,
            rollNo: userActualData.rollNo,
            admissionNo: userActualData.admissionNo
        };

        setLoading(true);
        try {
            if (editingLeave) {
                await handleEditSubmit(newLeave);
            } else {
                const response = await api.post('/api/attendance/leaves', newLeave);
                applyLeave(response.data);
            }
            setShowSuccess(true);
        } catch (error) {
            console.error('Error applying leave:', error);
        } finally {
            setLoading(false);
            setEmployeeName('');
            setLeaveType('');
            setLeaveDuration('Full Day');
            setHalfDayType('');
            setFromDate('');
            setToDate('');
            setReason('');
        }
    };
    const handleCloseSnackbar = () => {
        setShowSuccess(false);
    };
    return (
        <Fade in timeout={500}>
            <StyledCard>
                <CardContent>
                    <Typography variant="h5" gutterBottom align="center" color="primary"
                                sx={{fontWeight: 'bold', mb: 4}}>
                        {editingLeave ? 'Edit Leave Application' : 'New Leave Application'}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Leave Type"
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                    select
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <EventNote sx={{mr: 1, color: theme.palette.primary.main}}/>,
                                    }}
                                >
                                    <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                                    <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                                    <MenuItem value="Earned Leave">Earned Leave</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Leave Duration"
                                    value={leaveDuration}
                                    onChange={(e) => setLeaveDuration(e.target.value)}
                                    select
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <AccessTime sx={{mr: 1, color: theme.palette.primary.main}}/>,
                                    }}
                                >
                                    {leaveDurationOptions.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {leaveDuration === 'Half Day' && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Half Day Type"
                                        value={halfDayType}
                                        onChange={(e) => setHalfDayType(e.target.value)}
                                        select
                                        required
                                        variant="outlined"
                                    >
                                        {halfDayOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="From Date"
                                    type="date"
                                    InputLabelProps={{shrink: true}}
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    required
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="To Date"
                                    type="date"
                                    InputLabelProps={{shrink: true}}
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    required
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Reason"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <Description
                                            sx={{mr: 1, mt: 1, color: theme.palette.primary.main}}/>,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    fullWidth
                                    size="large"
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        borderRadius: 2,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                        },
                                    }}
                                >
                                    {loading ? (
                                        <CircularProgress size={24}/>
                                    ) : editingLeave ? (
                                        'Update Leave'
                                    ) : (
                                        'Submit Leave'
                                    )}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>

                <Snackbar
                    open={showSuccess}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity="success"
                        variant="filled"
                        sx={{width: '100%'}}
                    >
                        Leave application submitted successfully!
                    </Alert>
                </Snackbar>
            </StyledCard>
        </Fade>
    );
};

const LeaveTable = ({leaves, deleteLeave, editLeave}) => {
    return (
        <Fade in timeout={500}>
            <TableContainer component={Paper} sx={{
                mt: 2,
                borderRadius: 2,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                overflow: 'hidden'
            }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{backgroundColor: (theme) => theme.palette.primary.main}}>
                            <StyledTableCell sx={{color: 'white'}}>Name</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>Leave Type</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>Duration</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>From</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>To</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>Reason</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>Status</StyledTableCell>
                            <StyledTableCell sx={{color: 'white'}}>Actions</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaves.map((leave) => (
                            <StyledTableRow key={leave.id}>
                                <TableCell>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Person color="primary"/>
                                        {leave.name}
                                    </Stack>
                                </TableCell>
                                <TableCell>{leave.leaveType}</TableCell>
                                <TableCell>
                                    {leave.leaveDuration}
                                    {leave.leaveDuration === 'Half Day' && ` (${leave.halfDayType})`}
                                </TableCell>
                                <TableCell>{leave.fromDate}</TableCell>
                                <TableCell>{leave.toDate}</TableCell>
                                <TableCell>
                                    <Tooltip title={leave.reason}>
                                        <Typography noWrap sx={{maxWidth: 150}}>
                                            {leave.reason}
                                        </Typography>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    <StatusChip
                                        label={leave.status}
                                        status={leave.status}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={() => editLeave(leave)}
                                                size="small"
                                                sx={{
                                                    color: 'primary.main',
                                                    '&:hover': {backgroundColor: 'primary.light'},
                                                }}
                                            >
                                                <Edit/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={() => deleteLeave(leave.id)}
                                                size="small"
                                                sx={{
                                                    color: 'error.main',
                                                    '&:hover': {backgroundColor: 'error.light'},
                                                }}
                                            >
                                                <Delete/>
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Fade>
    );
};

const StudentLeave = () => {
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [editingLeave, setEditingLeave] = useState(null);

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                let response = await api.get(`/api/attendance/leaves/user/${userActualData.id}/${schoolId}/${session}/${userActualData.tableName}`);
                setLeaves(response.data);
            } catch (error) {
                console.error('Error fetching leaves:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, [userData, schoolId]);

    const applyLeave = (newLeave) => {
        setLeaves([...leaves, newLeave]);
    };

    const deleteLeave = async (id) => {
        try {
            await api.delete(`/api/attendance/leaves/${id}`);
            setLeaves(leaves.filter((leave) => leave.id !== id));
        } catch (error) {
            console.error('Error deleting leave:', error);
        }
    };

    const editLeave = (leave) => {
        setEditingLeave(leave);
        setTabIndex(0);
    };

    const handleEditSubmit = async (updatedLeave) => {
        if (!editingLeave || !editingLeave.id) {
            console.error('No leave selected for editing');
            return;
        }
        try {
            await api.put(`/api/attendance/leaves/full/${editingLeave.id}`, updatedLeave);
            setLeaves((prevLeaves) =>
                prevLeaves.map((leave) =>
                    leave.id === editingLeave.id ? {...leave, ...updatedLeave} : leave
                )
            );
            console.log('Updated Leave Payload:', updatedLeave);

            setEditingLeave(null); // Clear editing mode
            setTabIndex(1);

        } catch (error) {
            console.error('Error updating leave:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        if (newValue === 0) setEditingLeave(null); // Clear edit form when switching tabs
    };

    console.log('Editing Leave:', editingLeave);

    return (
        <Box sx={{
            width: '100%',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'transparent'
                }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        color: (theme) => theme.palette.primary.main,
                        mb: 4
                    }}
                >
                    Leave Management
                </Typography>

                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    centered
                    sx={{
                        mb: 4,
                        '& .MuiTab-root': {
                            minWidth: 200,
                            fontWeight: 'bold',
                        },
                    }}
                >
                    <Tab
                        label={editingLeave ? 'Edit Leave' : 'Apply for Leave'}
                        sx={{
                            '&.Mui-selected': {
                                color: (theme) => theme.palette.primary.main,
                            },
                        }}
                    />
                    <Tab
                        label="Leave Applications"
                        sx={{
                            '&.Mui-selected': {
                                color: (theme) => theme.palette.primary.main,
                            },
                        }}
                    />
                </Tabs>

                <Box sx={{marginTop: '20px'}}>
                    {tabIndex === 0 && (
                        <LeaveApplicationForm
                            applyLeave={applyLeave}
                            editingLeave={editingLeave}
                            handleEditSubmit={handleEditSubmit}
                        />
                    )}
                    {tabIndex === 1 && (
                        <>
                            {loading ? (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '200px'
                                }}>
                                    <CircularProgress/>
                                </Box>
                            ) : (
                                <LeaveTable
                                    leaves={leaves}
                                    deleteLeave={deleteLeave}
                                    editLeave={editLeave}
                                />
                            )}
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default StudentLeave;