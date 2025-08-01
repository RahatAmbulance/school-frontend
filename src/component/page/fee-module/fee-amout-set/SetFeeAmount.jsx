import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fade,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {sessionOptions} from "../../../../commonStyle";
import {addFeeAmount, deleteFeeAmount, fetchFeeAmountDetails, updateFeeAmount} from "./redux/feeAmountSlice";
import {selectSchoolDetails} from "../../../../common";
import {fetchFees} from "../fee-type/redux/actions";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const SetFeeAmount = () => {
    const [formData, setFormData] = useState({
        feeAmounts: {},
        feeTypeMode: {},
        selectedClass: '',
        sessionYear: '',
        isEditing: false,
        currentFeeId: null
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [feeToDelete, setFeeToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const feeRecords = useSelector(state => state.feeType.fees);
    const feeAmountList = useSelector(state => state.feeAmount.feeAmounts);
    const classSections = useSelector(state => state.master.data.classSections);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [error, setError] = useState('');

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchFeeAmountDetails({schoolId, session}));
            dispatch(fetchFees(schoolId, session));
        }
    }, [schoolId, session, dispatch]);

    const resetForm = () => {
        setFormData({
            feeAmounts: {},
            feeTypeMode: {},
            selectedClass: '',
            sessionYear: '',
            isEditing: false,
            currentFeeId: null
        });
    };

    const handleFeeAmountChange = (event, feeType) => {
        setFormData(prev => ({
            ...prev,
            feeAmounts: {
                ...prev.feeAmounts,
                [feeType]: event.target.value
            }
        }));
    };

    const handleFeeTypeModeChange = (feeType) => {
        setFormData(prev => ({
            ...prev,
            feeTypeMode: {
                ...prev.feeTypeMode,
                [feeType]: !prev.feeTypeMode[feeType]
            }
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const {feeAmounts, feeTypeMode, selectedClass, sessionYear, isEditing, currentFeeId} = formData;

        if (!selectedClass || !sessionYear) {
            setError('Both Class and Session Year are required fields');
            return;
        }

        // Clear any previous errors
        setError('');
        setIsLoading(true);

        try {
            if (isEditing) {
                // Find the fee being edited
                const editedFee = feeAmountList.find(f => f.id === currentFeeId);
                if (!editedFee) {
                    setError('Could not find the fee to edit');
                    setIsLoading(false);
                    return;
                }

                const updatedFee = {
                    ...editedFee,
                    amount: feeAmounts[editedFee.selectedFee] || editedFee.amount,
                    className: selectedClass,
                    session: sessionYear,
                    feeTypeMode: editedFee.selectedFee === 'transportationFee'
                        ? (feeTypeMode[editedFee.selectedFee] ? 'Dynamic' : 'Static')
                        : editedFee.feeTypeMode
                };

                await dispatch(updateFeeAmount(updatedFee));
            } else {
                // Check if fees already exist for this class and session combination
                const existingFeesForClassSession = feeAmountList.filter(
                    fee => fee.className === selectedClass && fee.session === sessionYear
                );

                if (existingFeesForClassSession.length > 0) {
                    // Update existing fees for this class and session
                    const updatePromises = existingFeesForClassSession.map(existingFee => {
                        const updatedFee = {
                            ...existingFee,
                            amount: feeAmounts[existingFee.selectedFee] !== undefined
                                ? feeAmounts[existingFee.selectedFee]
                                : existingFee.amount,
                            feeTypeMode: existingFee.selectedFee === 'transportationFee'
                                ? (feeTypeMode[existingFee.selectedFee] ? 'Dynamic' : 'Static')
                                : existingFee.feeTypeMode
                        };
                        return dispatch(updateFeeAmount(updatedFee));
                    });

                    // Also add any new fee types that don't exist for this class/session
                    const existingFeeTypes = existingFeesForClassSession.map(fee => fee.selectedFee);
                    const newFeeTypes = feeRecords.filter(fee => !existingFeeTypes.includes(fee.selectedFee));

                    if (newFeeTypes.length > 0) {
                        const newFees = newFeeTypes
                            .filter(fee => feeAmounts[fee.selectedFee] !== undefined && feeAmounts[fee.selectedFee] !== '')
                            .map(fee => ({
                                ...fee,
                                amount: feeAmounts[fee.selectedFee],
                                className: selectedClass,
                                session: sessionYear,
                                feeTypeMode: fee.selectedFee === 'transportationFee'
                                    ? (feeTypeMode[fee.selectedFee] ? 'Dynamic' : 'Static')
                                    : fee.feeTypeMode || 'Static'
                            }));

                        if (newFees.length > 0) {
                            updatePromises.push(dispatch(addFeeAmount(newFees)));
                        }
                    }

                    await Promise.all(updatePromises);
                } else {
                    // Create new fees for this class and session
                    const newFees = feeRecords
                        .filter(fee => feeAmounts[fee.selectedFee] !== undefined && feeAmounts[fee.selectedFee] !== '')
                        .map(fee => ({
                            ...fee,
                            amount: feeAmounts[fee.selectedFee],
                            className: selectedClass,
                            session: sessionYear,
                            feeTypeMode: fee.selectedFee === 'transportationFee'
                                ? (feeTypeMode[fee.selectedFee] ? 'Dynamic' : 'Static')
                                : fee.feeTypeMode || 'Static'
                        }));

                    if (newFees.length > 0) {
                        await dispatch(addFeeAmount(newFees));
                    }
                }
            }

            resetForm();
            await dispatch(fetchFeeAmountDetails({schoolId, session}));
        } catch (err) {
            console.error('Error submitting fee amounts:', err);
            setError(isEditing ? 'Failed to update fee amount' : 'Failed to save fee amounts');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (fee) => {
        // Initialize all fee amounts to empty initially
        const initialFeeAmounts = {};
        const initialFeeTypeMode = {};

        // Find all fees for this class and session
        const relatedFees = feeAmountList.filter(
            f => f.className === fee.className && f.session === fee.session
        );

        // Set the amounts and modes for all found fees
        relatedFees.forEach(f => {
            initialFeeAmounts[f.selectedFee] = f.amount;
            initialFeeTypeMode[f.selectedFee] = f.feeTypeMode === 'Dynamic';
        });

        setFormData({
            feeAmounts: initialFeeAmounts,
            feeTypeMode: initialFeeTypeMode,
            selectedClass: fee.className,
            sessionYear: fee.session,
            isEditing: true,
            currentFeeId: fee.id
        });
    };

    const handleDeleteClick = (fee) => {
        setFeeToDelete(fee);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (feeToDelete) {
            try {
                await dispatch(deleteFeeAmount(feeToDelete.id));
                setDeleteDialogOpen(false);
                setFeeToDelete(null);
                resetForm();
                await dispatch(fetchFeeAmountDetails({schoolId, session}));
            } catch (err) {
                console.error('Error deleting fee:', err);
                setError('Failed to delete fee amount');
            }
        }
    };

    const handleCloseDialog = () => {
        setDeleteDialogOpen(false);
        setFeeToDelete(null);
    };

    // Check if fees exist for selected class and session
    const getExistingFeesForSelection = () => {
        if (!formData.selectedClass || !formData.sessionYear) return [];
        return feeAmountList.filter(
            fee => fee.className === formData.selectedClass && fee.session === formData.sessionYear
        );
    };

    const existingFeesForSelection = getExistingFeesForSelection();
    const isUpdatingExisting = existingFeesForSelection.length > 0 && !formData.isEditing;

    const containerStyles = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '2rem',
    };

    const cardStyles = {
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-5px)',
        }
    };

    const buttonStyles = {
        borderRadius: '8px',
        textTransform: 'none',
        padding: '10px 20px',
        fontWeight: 600,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
        }
    };

    const tableStyles = {
        '& .MuiTableCell-head': {
            fontWeight: 600,
            backgroundColor: '#f8fafc',
            color: '#334155',
        },
        '& .MuiTableRow-root': {
            '&:nth-of-type(odd)': {
                backgroundColor: '#f8fafc',
            },
            '&:hover': {
                backgroundColor: '#f1f5f9',
            },
            transition: 'background-color 0.2s ease-in-out',
        }
    };

    return (
        <Box sx={containerStyles}>
            <Box sx={{
                display: 'flex',
                gap: 4,
                maxWidth: '1400px',
                margin: '0 auto',
                flexDirection: {xs: 'column', md: 'row'}
            }}>
                <Paper elevation={0} sx={{...cardStyles, flex: 1, padding: 4}}>
                    <Typography variant="h5" gutterBottom sx={{
                        color: '#1e293b',
                        fontWeight: 600,
                        marginBottom: 3
                    }}>
                        {formData.isEditing ? 'Edit Fee Amount' :
                            isUpdatingExisting ? 'Update Existing Fee Amounts' : 'Add New Fee Amounts'}
                    </Typography>

                    {error && (
                        <Fade in={!!error}>
                            <Alert severity="error" sx={{marginBottom: 2, borderRadius: '8px'}}>
                                {error}
                            </Alert>
                        </Fade>
                    )}

                    {isUpdatingExisting && !formData.isEditing && (
                        <Alert severity="info" sx={{marginBottom: 2, borderRadius: '8px'}}>
                            Fees already exist for {formData.selectedClass} - {formData.sessionYear}.
                            Updating existing amounts.
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormControl fullWidth sx={{marginBottom: 3}} variant="outlined">
                            <InputLabel>Select Class</InputLabel>
                            <Select
                                value={formData.selectedClass}
                                onChange={(e) => setFormData(prev => ({...prev, selectedClass: e.target.value}))}
                                label="Select Class"
                                sx={{borderRadius: '8px'}}
                            >
                                {classSections?.map((classSection) => (
                                    <MenuItem key={classSection.id} value={classSection.name || ''}>
                                        {classSection.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{marginBottom: 3}} variant="outlined">
                            <InputLabel>Session Year</InputLabel>
                            <Select
                                value={formData.sessionYear}
                                onChange={(e) => setFormData(prev => ({...prev, sessionYear: e.target.value}))}
                                label="Session Year"
                                sx={{borderRadius: '8px'}}
                            >
                                {sessionOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {feeRecords?.map((fee) => (
                            <Box key={fee.type} sx={{marginBottom: 3}}>
                                <FormControl fullWidth variant="outlined">
                                    <TextField
                                        label={`Amount for ${fee.selectedFee}`}
                                        type="number"
                                        value={formData.feeAmounts[fee.selectedFee] || ''}
                                        onChange={(e) => handleFeeAmountChange(e, fee.selectedFee)}
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                            }
                                        }}
                                    />
                                </FormControl>
                                {fee.selectedFee === 'transportationFee' && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.feeTypeMode[fee.selectedFee] || false}
                                                onChange={() => handleFeeTypeModeChange(fee.selectedFee)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Typography sx={{color: '#475569'}}>
                                                {formData.feeTypeMode[fee.selectedFee] ? "Dynamic Fee" : "Static Fee"}
                                            </Typography>
                                        }
                                        sx={{marginTop: 1}}
                                    />
                                )}
                            </Box>
                        ))}

                        <Box sx={{display: 'flex', gap: 2}}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isLoading}
                                sx={buttonStyles}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit"/>
                                ) : (
                                    formData.isEditing ? 'Update' :
                                        isUpdatingExisting ? 'Update Existing' : 'Create New'
                                )}
                            </Button>
                            {formData.isEditing && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    fullWidth
                                    onClick={resetForm}
                                    sx={buttonStyles}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Box>
                    </form>
                </Paper>

                <Paper elevation={0} sx={{...cardStyles, flex: 1, padding: 4}}>
                    <Typography variant="h5" gutterBottom sx={{
                        color: '#1e293b',
                        fontWeight: 600,
                        marginBottom: 3
                    }}>
                        Existing Fee Amounts
                    </Typography>

                    {feeAmountList?.length > 0 ? (
                        <TableContainer sx={{maxHeight: '600px', overflow: 'auto'}}>
                            <Table sx={tableStyles}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Class</TableCell>
                                        <TableCell>Fee Type</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Session</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {feeAmountList.map((fee) => (
                                        <TableRow key={fee.id}>
                                            <TableCell>{fee.className}</TableCell>
                                            <TableCell>{fee.selectedFee}</TableCell>
                                            <TableCell>₹{fee.amount}</TableCell>
                                            <TableCell>{fee.session}</TableCell>
                                            <TableCell>
                                                <Box sx={{display: 'flex', gap: 1}}>
                                                    <Button
                                                        onClick={() => handleEdit(fee)}
                                                        disabled={formData.isEditing}
                                                        sx={{
                                                            minWidth: 'unset',
                                                            padding: '6px',
                                                            borderRadius: '8px'
                                                        }}
                                                        color="primary"
                                                    >
                                                        <EditIcon fontSize="small"/>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteClick(fee)}
                                                        disabled={formData.isEditing}
                                                        color="error"
                                                        sx={{
                                                            minWidth: 'unset',
                                                            padding: '6px',
                                                            borderRadius: '8px'
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{color: '#64748b', textAlign: 'center', padding: 4}}>
                            No fee amounts available.
                        </Typography>
                    )}
                </Paper>
            </Box>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: 2
                    }
                }}
            >
                <DialogTitle sx={{color: '#1e293b', fontWeight: 600}}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{color: '#475569'}}>
                        Are you sure you want to delete this fee amount? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{padding: 3}}>
                    <Button
                        onClick={handleCloseDialog}
                        sx={{...buttonStyles, color: '#64748b'}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        sx={buttonStyles}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SetFeeAmount;