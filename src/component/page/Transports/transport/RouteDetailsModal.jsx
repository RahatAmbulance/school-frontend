import React, {useEffect, useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MapIcon from '@mui/icons-material/Map';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useDispatch, useSelector} from 'react-redux';
import {fetchRouteAssignments, removeFromRoute} from './redux/assignmentActions';
import {deleteRoute} from './redux/routeActions';
import AssignmentModal from './AssignmentModal';
import {selectSchoolDetails} from '../../../../common';
import {toast} from 'react-toastify';

const RouteDetailsModal = ({open, onClose, vehicle, onEditRoute}) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [routeToDelete, setRouteToDelete] = useState(null);
    const [expandedPanel, setExpandedPanel] = useState(false);
    const [expandedRoute, setExpandedRoute] = useState(false);

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const assignments = useSelector(state => state.assignments?.assignments || {});

    useEffect(() => {
        if (vehicle?.routes?.length > 0) {
            vehicle.routes.forEach(route => {
                dispatch(fetchRouteAssignments(route.id, schoolId, session));
            });
        }
    }, [dispatch, vehicle, schoolId, session]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleAssign = (route) => {
        setSelectedRoute(route);
        setIsAssignModalOpen(true);
    };

    const handleDeleteClick = (route) => {
        setRouteToDelete(route);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (routeToDelete) {
            try {
                await dispatch(deleteRoute(routeToDelete.id, vehicle.id, schoolId, session));
                toast.success('Route and associated records deleted successfully');
                setDeleteDialogOpen(false);
                setRouteToDelete(null);
                onClose();
            } catch (error) {
                console.error('Error deleting route:', error);
                toast.error('Failed to delete route. Please try again.');
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setRouteToDelete(null);
    };

    const handleRemoveAssignment = async (member, type, route) => {
        try {
            await dispatch(removeFromRoute(
                route.id,
                type,
                member.id,
                schoolId,
                session
            ));
            toast.success(`${type === 'student' ? 'Student' : 'Staff member'} removed from route successfully`);
        } catch (error) {
            console.error('Error removing assignment:', error);
            toast.error(`Failed to remove ${type === 'student' ? 'student' : 'staff member'} from route`);
        }
    };

    const getAssignmentCounts = (route) => {
        const routeAssignments = assignments[route.id] || {};
        return {
            students: (routeAssignments.assignedStudents || []).length,
            staff: (routeAssignments.assignedStaff || []).length
        };
    };

    const handlePanelChange = (panel) => (event, isExpanded) => {
        setExpandedPanel(isExpanded ? panel : false);
    };

    const handleRouteChange = (routeId) => (event, isExpanded) => {
        setExpandedRoute(isExpanded ? routeId : false);
    };

    const renderAssignmentList = (route, type) => {
        const routeAssignments = assignments[route.id] || {};
        const assignedMembers = type === 'student' ?
            routeAssignments.assignedStudents || [] :
            routeAssignments.assignedStaff || [];
        const panelId = `${route.id}-${type}`;

        return (
            <Accordion
                expanded={expandedPanel === panelId}
                onChange={handlePanelChange(panelId)}
                sx={{
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    '&:before': {
                        display: 'none',
                    },
                    '&:not(:last-child)': {
                        marginBottom: 1,
                    }
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    sx={{
                        borderBottom: expandedPanel === panelId ? '1px solid' : 'none',
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                            sx={{
                                bgcolor: type === 'student' ? 'primary.main' : 'secondary.main',
                                width: 32,
                                height: 32
                            }}
                        >
                            {type === 'student' ? <SchoolIcon/> : <PersonIcon/>}
                        </Avatar>
                        <Typography variant="subtitle1">
                            {type === 'student' ? 'Students' : 'Staff Members'}
                            <Chip
                                size="small"
                                label={assignedMembers.length}
                                sx={{
                                    ml: 1,
                                    backgroundColor: type === 'student' ? 'primary.lighter' : 'secondary.lighter'
                                }}
                            />
                        </Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{p: 0}}>
                    <List sx={{
                        '& .MuiListItem-root': {
                            transition: 'all 0.2s',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                                transform: 'translateX(4px)'
                            }
                        }
                    }}>
                        {assignedMembers.map((member) => (
                            <ListItem
                                key={member.id}
                                sx={{
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:last-child': {
                                        borderBottom: 'none'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: type === 'student' ? 'primary.main' : 'secondary.main',
                                        }}
                                    >
                                        {type === 'student' ? <SchoolIcon/> : <PersonIcon/>}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2">
                                            {member.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Stack direction="row" spacing={2} mt={0.5}>
                                            {type === 'student' ? (
                                                <>
                                                    <Chip
                                                        size="small"
                                                        label={`Class ${member.className} ${member.section}`}
                                                        sx={{backgroundColor: 'primary.lighter'}}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`Roll No: ${member.rollNo}`}
                                                        sx={{backgroundColor: 'secondary.lighter'}}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Chip
                                                        size="small"
                                                        label={member.role}
                                                        sx={{backgroundColor: 'primary.lighter'}}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={member.phone}
                                                        sx={{backgroundColor: 'secondary.lighter'}}
                                                    />
                                                </>
                                            )}
                                        </Stack>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleRemoveAssignment(member, type, route)}
                                        color="error"
                                        size="small"
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'error.lighter'
                                            }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                        {assignedMembers.length === 0 && (
                            <ListItem sx={{py: 4}}>
                                <ListItemText
                                    primary={
                                        <Box textAlign="center">
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                sx={{mb: 1}}
                                            >
                                                No {type === 'student' ? 'students' : 'staff'} assigned
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        )}
                    </List>
                </AccordionDetails>
            </Accordion>
        );
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle sx={{pb: 1}}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" component="span" sx={{display: 'flex', alignItems: 'center'}}>
                            <DirectionsBusIcon sx={{mr: 1}}/>
                            Route Details
                        </Typography>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon/>
                        </IconButton>
                    </Stack>
                </DialogTitle>

                <DialogContent sx={{pt: 0}}>
                    {vehicle?.routes?.map((route, index) => (
                        <Accordion
                            key={route.id}
                            expanded={expandedRoute === route.id}
                            onChange={handleRouteChange(route.id)}
                            sx={{
                                mb: 2,
                                '&:before': {
                                    display: 'none',
                                },
                                boxShadow: 'none',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '8px !important',
                                overflow: 'hidden'
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon/>}
                                sx={{
                                    backgroundColor: 'background.neutral',
                                    '&:hover': {backgroundColor: 'action.hover'}
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2} width="100%">
                                    <Avatar
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        <MapIcon/>
                                    </Avatar>
                                    <Box flex={1}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {route.routeName} (Route {index + 1})
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <Chip size="small" label={route.routeType} sx={{mr: 1}}/>
                                            {route.origin || route.routeName} → {route.destination}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                            size="small"
                                            icon={<SchoolIcon sx={{fontSize: '1rem !important'}}/>}
                                            label={getAssignmentCounts(route).students}
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            icon={<PersonIcon sx={{fontSize: '1rem !important'}}/>}
                                            label={getAssignmentCounts(route).staff}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    </Stack>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{p: 2}}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Stack direction="row" spacing={2} mb={2}>
                                            <Button
                                                variant="contained"
                                                startIcon={<PersonAddIcon/>}
                                                onClick={() => handleAssign(route)}
                                                size="small"
                                            >
                                                Assign Members
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<EditIcon/>}
                                                onClick={() => onEditRoute(route)}
                                                size="small"
                                            >
                                                Edit Route
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                startIcon={<DeleteIcon/>}
                                                onClick={() => handleDeleteClick(route)}
                                                size="small"
                                            >
                                                Delete Route
                                            </Button>
                                        </Stack>

                                        <Card variant="outlined" sx={{mb: 2}}>
                                            <CardContent>
                                                <Stack direction="row" spacing={4}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Origin
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {route.origin || route.routeName}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Destination
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {route.destination}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardContent>
                                        </Card>
                                    </Box>

                                    {renderAssignmentList(route, 'student')}
                                    {renderAssignmentList(route, 'staff')}
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    ))}

                    {(!vehicle?.routes || vehicle.routes.length === 0) && (
                        <Box textAlign="center" py={4}>
                            <Typography variant="h6" color="text.secondary">
                                No routes found for this vehicle
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {isAssignModalOpen && (
                <AssignmentModal
                    open={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    route={selectedRoute}
                    vehicleId={vehicle?.id}
                />
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 2,
                        maxWidth: 400
                    }
                }}
            >
                <DialogContent>
                    <Box sx={{textAlign: "center", py: 2}}>
                        <Typography variant="h6" gutterBottom>
                            Delete Route
                        </Typography>
                        <DialogContentText>
                            Are you sure you want to delete this route? This action cannot be undone.
                        </DialogContentText>
                    </Box>
                </DialogContent>
                <DialogActions sx={{justifyContent: "center", pb: 2}}>
                    <Button
                        onClick={handleDeleteCancel}
                        variant="outlined"
                        sx={{borderRadius: 2, px: 3}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{borderRadius: 2, px: 3}}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RouteDetailsModal;
