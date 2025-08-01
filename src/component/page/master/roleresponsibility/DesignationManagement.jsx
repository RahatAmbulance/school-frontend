import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fade,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import {useDispatch, useSelector} from 'react-redux';
import {createRole, deleteRole, fetchRoles} from "./redux/roleActions";
import {selectSchoolDetails} from "../../../../common";

function DesignationManagement() {
    const [newRole, setNewRole] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [roleType, setRoleType] = useState('Teaching');
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const roles = useSelector((state) => state.roles.roles);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        if (schoolId && session) {
            setIsLoading(true);
            dispatch(fetchRoles(schoolId, session))
                .finally(() => setIsLoading(false));
        }
    }, [dispatch, schoolId, session]);

    const filteredRoles = roles.filter(role => {
        const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || role.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleAddRole = () => {
        if (!newRole.trim()) {
            setError('Designation cannot be blank.');
            return;
        }

        const isDuplicate = roles.some(
            (role) => role.name.toLowerCase().trim() === newRole.toLowerCase().trim()
        );

        if (isDuplicate) {
            setError('This designation already exists.');
            return;
        }

        const capitalizeWords = (str) =>
            str
                .toLowerCase()
                .split(' ')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

        setIsLoading(true);
        const roleData = {
            name: capitalizeWords(newRole.trim()),
            type: roleType,
            schoolId,
            session,
        };

        dispatch(createRole(roleData))
            .then(() => {
                setSnackbarMessage('Designation added successfully');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setNewRole('');
                setRoleType('Teaching');
                setError('');
            })
            .catch(() => {
                setSnackbarMessage('Failed to add designation');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            })
            .finally(() => setIsLoading(false));
    };

    const handleOpenDialog = (id) => {
        setRoleToDelete(id);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setRoleToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (roleToDelete) {
            setIsLoading(true);
            dispatch(deleteRole(roleToDelete))
                .then(() => {
                    setSnackbarMessage("Designation deleted successfully");
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    handleCloseDialog();
                })
                .catch(() => {
                    setSnackbarMessage("Failed to delete designation");
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    handleCloseDialog();
                })
                .finally(() => setIsLoading(false));
        }
    };

    const handleNewRoleChange = (e) => {
        setNewRole(e.target.value);
        if (error) setError('');
    };

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 4
                }}
            >
                Designation Management
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 500}}>
                                Add New Designation
                            </Typography>
                            <Divider/>
                        </Box>

                        <FormControl fullWidth variant="outlined" sx={{mb: 3}}>
                            <InputLabel>Role Type</InputLabel>
                            <Select
                                value={roleType}
                                onChange={(e) => setRoleType(e.target.value)}
                                label="Role Type"
                            >
                                <MenuItem value="Teaching">Teaching</MenuItem>
                                <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="New Designation"
                            value={newRole}
                            onChange={handleNewRoleChange}
                            fullWidth
                            variant="outlined"
                            error={!!error}
                            helperText={error}
                            sx={{mb: 3}}
                        />

                        <Button
                            onClick={handleAddRole}
                            variant="contained"
                            fullWidth
                            disabled={isLoading}
                            startIcon={<AddCircleOutlineIcon/>}
                            sx={{
                                py: 1.5,
                                textTransform: 'none',
                                borderRadius: 2
                            }}
                        >
                            {isLoading ? <CircularProgress size={24}/> : 'Add Designation'}
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Paper
                        elevation={3}
                        sx={{
                            p: 3,
                            borderRadius: 2,
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)'
                            }
                        }}
                    >
                        <Box sx={{mb: 3}}>
                            <Typography variant="h6" gutterBottom sx={{fontWeight: 500}}>
                                Existing Designations
                            </Typography>
                            <Divider/>
                        </Box>

                        <Box sx={{mb: 3, display: 'flex', gap: 2}}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search designations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action"/>
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />

                            <FormControl sx={{minWidth: 120}} size="small">
                                <Select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    displayEmpty
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <FilterListIcon color="action"/>
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="All">All Types</MenuItem>
                                    <MenuItem value="Teaching">Teaching</MenuItem>
                                    <MenuItem value="Non-Teaching">Non-Teaching</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <List sx={{maxHeight: 400, overflow: 'auto'}}>
                            {isLoading ? (
                                <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                    <CircularProgress/>
                                </Box>
                            ) : filteredRoles.length > 0 ? (
                                filteredRoles.map((role) => (
                                    <Fade in key={role.id}>
                                        <ListItem
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={role.name}
                                                secondary={
                                                    <Chip
                                                        label={role.type}
                                                        size="small"
                                                        color={role.type === 'Teaching' ? 'primary' : 'secondary'}
                                                        sx={{mt: 0.5}}
                                                    />
                                                }
                                            />
                                            <IconButton
                                                onClick={() => handleOpenDialog(role.id)}
                                                color="error"
                                                sx={{
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                    },
                                                }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </ListItem>
                                    </Fade>
                                ))
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    align="center"
                                    sx={{p: 3}}
                                >
                                    No designations found.
                                </Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 1
                    }
                }}
            >
                <DialogTitle>Delete Designation?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this designation? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialog}
                        color="primary"
                        sx={{textTransform: 'none'}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 1
                        }}
                    >
                        {isLoading ? <CircularProgress size={24}/> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default DesignationManagement;
