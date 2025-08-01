import React, {useEffect, useState} from 'react';
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import {useDispatch, useSelector} from 'react-redux';
import {selectSchoolDetails} from '../../../../common';
import {toast} from 'react-toastify';
import {removeFromRoute, saveRouteAssignments} from './redux/assignmentActions';

const AssignmentModal = ({open, onClose, vehicle, route}) => {
    const dispatch = useDispatch();
    const [tabValue, setTabValue] = useState(0);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingAssignments, setExistingAssignments] = useState(null);

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    // Get students and staff from Redux store
    const students = useSelector(state => state.students?.students || []);
    const staff = useSelector(state => state.staff?.staffList || []);
    const assignments = useSelector(state => state.assignments?.assignments || {});

    useEffect(() => {
        if (route?.id && schoolId && session) {
            // Fetch existing assignments when the modal opens
            const routeAssignments = assignments[route.id];
            if (routeAssignments) {
                setExistingAssignments(routeAssignments);
                setSelectedStudents(routeAssignments.assignedStudents || []);
                setSelectedStaff(routeAssignments.assignedStaff || []);
            }
        }
    }, [route?.id, schoolId, session, assignments]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleStudentSelect = (event, value) => {
        // Preserve existing students and add new ones
        const existingStudents = selectedStudents.filter(student =>
            !value.some(newStudent => newStudent.id === student.id)
        );
        setSelectedStudents([...existingStudents, ...value]);
    };

    const handleStaffSelect = (event, value) => {
        // Preserve existing staff and add new ones
        const existingStaffMembers = selectedStaff.filter(staffMember =>
            !value.some(newStaff => newStaff.id === staffMember.id)
        );
        setSelectedStaff([...existingStaffMembers, ...value]);
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await dispatch(removeFromRoute(
                route.id,
                'student',
                studentId,
                schoolId,
                session
            ));
            toast.success('Student removed from route successfully');
            // Update local state
            setSelectedStudents(prev => prev.filter(student => student.id !== studentId));
        } catch (error) {
            console.error('Error removing student:', error);
            toast.error('Failed to remove student from route');
        }
    };

    const handleRemoveStaff = async (staffId) => {
        try {
            await dispatch(removeFromRoute(
                route.id,
                'staff',
                staffId,
                schoolId,
                session
            ));
            toast.success('Staff member removed from route successfully');
            // Update local state
            setSelectedStaff(prev => prev.filter(staff => staff.id !== staffId));
        } catch (error) {
            console.error('Error removing staff:', error);
            toast.error('Failed to remove staff from route');
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const assignmentData = {
                routeId: route.id,
                vehicleId: route.vehicleId,
                schoolId,
                session,
                assignedStudents: selectedStudents.map(student => ({
                    id: student.id,
                    name: student.studentName || student.name,
                    type: 'student',
                    rollNo: student.rollNo || 'N/A',
                    className: student.className || 'N/A',
                    section: student.section || 'N/A',
                    admissionNo: student.admissionNo || 'N/A',
                })),
                assignedStaff: selectedStaff.map(staff => ({
                    id: staff.id,
                    name: staff.name,
                    type: staff.type,
                    role: staff.role || 'N/A',
                    phone: staff.phone || 'N/A',
                    email: staff.email || 'N/A'
                }))
            };

            await dispatch(saveRouteAssignments(assignmentData));
            toast.success('Assignments saved successfully');
            onClose();
        } catch (error) {
            console.error('Error saving assignments:', error);
            toast.error('Failed to save assignments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.default'
            }}>
                <Box>
                    <Typography variant="h5" component="h2" sx={{fontWeight: 600}}>
                        <DirectionsBusIcon sx={{mr: 1, verticalAlign: 'middle', color: 'primary.main'}}/>
                        Transport Assignment
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" sx={{mt: 1}}>
                        Route: {route?.routeName} | Vehicle: {vehicle?.regNumber}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{color: 'text.secondary'}}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{p: 3, bgcolor: 'background.default'}}>
                <Grid container spacing={3}>
                    {/* Students Section */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{height: '100%'}}>
                            <CardContent>
                                <Box sx={{
                                    mb: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <SchoolIcon sx={{mr: 1, color: 'primary.main'}}/>
                                        <Typography variant="h6">Students</Typography>
                                    </Box>
                                    {existingAssignments?.assignedStudents?.length > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                            Existing: {existingAssignments.assignedStudents.length}
                                        </Typography>
                                    )}
                                </Box>
                                <Autocomplete
                                    multiple
                                    options={students}
                                    value={selectedStudents}
                                    onChange={handleStudentSelect}
                                    getOptionLabel={(option) =>
                                        `${option.studentName || option.name || 'Unknown'} (${option.rollNo || 'N/A'}) - ${option.className || 'N/A'}-${option.section || 'N/A'}`
                                    }
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Box>
                                                <Typography variant="body1">
                                                    {option.studentName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Roll No: {option.rollNo || 'N/A'} |
                                                    Class: {option.className || 'N/A'}-{option.section || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            placeholder="Search students..."
                                            size="small"
                                            fullWidth
                                            sx={{mb: 2}}
                                        />
                                    )}
                                />
                                <Divider sx={{my: 2}}/>
                                <List sx={{maxHeight: 300, overflow: 'auto'}}>
                                    {selectedStudents.map((student) => (
                                        <ListItem
                                            key={student.id}
                                            sx={{
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                mb: 1,
                                                '&:hover': {bgcolor: 'action.hover'}
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: 'primary.main'}}>
                                                    <SchoolIcon/>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle2">
                                                        {student.studentName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{mt: 0.5}}>
                                                        <Typography variant="caption" component="div"
                                                                    color="text.secondary">
                                                            Father Name: {student.fatherName || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" component="div"
                                                                    color="text.secondary">
                                                            Roll No: {student.rollNo || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" component="div"
                                                                    color="text.secondary">
                                                            Class: {student.className || 'N/A'}-{student.section || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveStudent(student.id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                    {selectedStudents.length === 0 && (
                                        <Typography color="text.secondary" align="center" sx={{py: 2}}>
                                            No students assigned
                                        </Typography>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Staff Section */}
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined" sx={{height: '100%'}}>
                            <CardContent>
                                <Box sx={{
                                    mb: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                                        <WorkIcon sx={{mr: 1, color: 'secondary.main'}}/>
                                        <Typography variant="h6">Staff</Typography>
                                    </Box>
                                    {existingAssignments?.assignedStaff?.length > 0 && (
                                        <Typography variant="caption" color="text.secondary">
                                            Existing: {existingAssignments.assignedStaff.length}
                                        </Typography>
                                    )}
                                </Box>
                                <Autocomplete
                                    multiple
                                    options={staff}
                                    value={selectedStaff}
                                    onChange={handleStaffSelect}
                                    getOptionLabel={(option) =>
                                        `${option.name} (${option.role || 'N/A'})`
                                    }
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Box>
                                                <Typography variant="body1">
                                                    {option.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Role: {option.role || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="outlined"
                                            placeholder="Search staff..."
                                            size="small"
                                            fullWidth
                                            sx={{mb: 2}}
                                        />
                                    )}
                                />
                                <Divider sx={{my: 2}}/>
                                <List sx={{maxHeight: 300, overflow: 'auto'}}>
                                    {selectedStaff.map((staffMember) => (
                                        <ListItem
                                            key={staffMember.id}
                                            sx={{
                                                bgcolor: 'background.paper',
                                                borderRadius: 1,
                                                mb: 1,
                                                '&:hover': {bgcolor: 'action.hover'}
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{bgcolor: 'secondary.main'}}>
                                                    <WorkIcon/>
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle2">
                                                        {staffMember.name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{mt: 0.5}}>
                                                        <Typography variant="caption" component="div"
                                                                    color="text.secondary">
                                                            Role: {staffMember.role || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" component="div"
                                                                    color="text.secondary">
                                                            Phone: {staffMember.phone || 'N/A'}
                                                        </Typography>
                                                        <Typography variant="caption" component="div"
                                                                    color="text.secondary">
                                                            Email: {staffMember.email || 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => handleRemoveStaff(staffMember.id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                    {selectedStaff.length === 0 && (
                                        <Typography color="text.secondary" align="center" sx={{py: 2}}>
                                            No staff assigned
                                        </Typography>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {(selectedStudents.length > 0 || selectedStaff.length > 0) && (
                    <Alert severity="info" sx={{mt: 3}}>
                        Total assignments: {selectedStudents.length} students and {selectedStaff.length} staff members
                        {existingAssignments && (
                            <Typography variant="caption" display="block" sx={{mt: 0.5}}>
                                (Including {existingAssignments.assignedStudents?.length || 0} existing students
                                and {existingAssignments.assignedStaff?.length || 0} existing staff)
                            </Typography>
                        )}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{p: 3, bgcolor: 'background.default'}}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{borderRadius: 1}}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading}
                    sx={{borderRadius: 1}}
                >
                    Save Assignments
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignmentModal; 