// FeeType.jsx
import React, {useEffect, useState} from 'react';
import {
    Alert,
    alpha,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Typography,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {useDispatch, useSelector} from "react-redux";
import {selectSchoolDetails} from "../../../../common";
import {sessionOptions} from "../../../../commonStyle";
import {addFee, deleteFee, fetchFees, SET_ERROR, updateFee} from "./redux/actions";
import {AnimatePresence, motion} from 'framer-motion';
import {styled} from '@mui/material/styles';

export const fees = {
    tuitionFee: "Fee charged for academic instruction",
    admissionFee: "One-time fee for new admissions",
    examFee: "Fee for conducting exams",
    libraryFee: "Fee for access to library facilities",
    laboratoryFee: "Fee for using laboratory resources",
    sportsFee: "Fee for sports and physical education",
    transportationFee: "Fee for transport services",
    uniformFee: "Fee for school uniforms",
    activityFee: "Fee for extracurricular activities",
    buildingDevelopmentFee: "Fee for infrastructure development",
    hostelFee: "Fee for hostel accommodation",
    cautionDeposit: "Refundable security deposit",
    lateFee: "Penalty for late payment of fees",
    miscellaneousFee: "Other additional charges"
};

// Styled Components
const StyledPaper = styled(Paper)(({theme}) => ({
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    padding: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const GradientTypography = styled(Typography)(({theme}) => ({
    fontWeight: 800,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(4),
    textAlign: 'center',
}));

const StyledListItem = styled(ListItem)(({theme}) => ({
    borderRadius: 12,
    marginBottom: theme.spacing(1),
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateX(5px)',
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
    },
}));

const StyledFormControl = styled(FormControl)(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
        '&.Mui-focused': {
            boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
    },
}));

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    },
}));

const MonthsGrid = styled(Box)(({theme}) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

const FeeType = () => {
    const [selectedFee, setSelectedFee] = useState('');
    const [mode, setMode] = useState('');
    const [id, setId] = useState('');
    const [months, setMonths] = useState({
        January: false,
        February: false,
        March: false,
        April: false,
        May: false,
        June: false,
        July: false,
        August: false,
        September: false,
        October: false,
        November: false,
        December: false
    });
    const [sessionYear, setSessionYear] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {fees: feeRecords, error, loading} = useSelector((state) => state.feeType);
    const theme = useTheme();

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchFees(schoolId, session));
        }
    }, [schoolId, session, dispatch]);

    const handleFeeChange = (event) => setSelectedFee(event.target.value);
    const handleModeChange = (event) => setMode(event.target.value);
    const handleMonthChange = (event) => {
        const monthName = event.target.value;
        setMonths(prevMonths => ({
            ...prevMonths,
            [monthName]: !prevMonths[monthName]
        }));
    };

    const resetForm = () => {
        setSelectedFee('');
        setMode('');
        setId('');
        setMonths({
            January: false,
            February: false,
            March: false,
            April: false,
            May: false,
            June: false,
            July: false,
            August: false,
            September: false,
            October: false,
            November: false,
            December: false
        });
        setSessionYear('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFee || !mode || !sessionYear) {
            dispatch({
                type: SET_ERROR,
                payload: 'Please fill in all required fields'
            });
            return;
        }

        const hasSelectedMonth = Object.values(months).some(value => value === true);
        if (!hasSelectedMonth) {
            dispatch({
                type: SET_ERROR,
                payload: 'Please select at least one month'
            });
            return;
        }

        const formData = {
            id,
            selectedFee,
            mode,
            months,
            schoolId,
            session: sessionYear
        };

        let success;
        if (!id) {
            success = await dispatch(addFee(formData));
        } else {
            success = await dispatch(updateFee(id, formData));
        }

        if (success) {
            resetForm();
            await dispatch(fetchFees(schoolId, session));
        }
    };

    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (recordToDelete) {
            await dispatch(deleteFee(recordToDelete.id));
            setDeleteDialogOpen(false);
            setRecordToDelete(null);
            await dispatch(fetchFees(schoolId, session));
        }
    };

    const handleCloseDialog = () => {
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
    };

    const handleEdit = (recordToEdit) => {
        setSelectedFee(recordToEdit.selectedFee);
        setMode(recordToEdit.mode);
        setSessionYear(recordToEdit.session);
        setMonths(recordToEdit.months);
        setId(recordToEdit.id);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            padding: theme.spacing(4),
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}>
            <GradientTypography variant="h4">
                Fee Type Management
            </GradientTypography>

            <Box sx={{
                display: 'flex',
                gap: 4,
                justifyContent: 'space-between',
                flexDirection: {xs: 'column', md: 'row'}
            }}>
                {/* Fee Form */}
                <motion.div
                    initial={{opacity: 0, x: -20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.5}}
                    style={{flex: 1}}
                >
                    <StyledPaper>
                        <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
                            <PaymentIcon sx={{mr: 2, color: theme.palette.primary.main}}/>
                            <Typography variant="h5" fontWeight="600">
                                {id ? 'Edit Fee Type' : 'Add Fee Type'}
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <StyledFormControl fullWidth sx={{mb: 3}}>
                                <InputLabel>Select Fee Type</InputLabel>
                                <Select
                                    value={selectedFee}
                                    onChange={handleFeeChange}
                                    label="Select Fee Type"
                                >
                                    <MenuItem value="">
                                        <em>Select a fee</em>
                                    </MenuItem>
                                    {Object.keys(fees).map((key) => (
                                        <MenuItem key={key} value={key}>{key}</MenuItem>
                                    ))}
                                </Select>
                            </StyledFormControl>

                            {selectedFee && (
                                <motion.div
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5}}
                                >
                                    <StyledFormControl fullWidth sx={{mb: 3}}>
                                        <InputLabel>Session Year</InputLabel>
                                        <Select
                                            value={sessionYear}
                                            onChange={(e) => setSessionYear(e.target.value)}
                                            label="Session Year"
                                        >
                                            {sessionOptions.map((option) => (
                                                <MenuItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>

                                    <StyledFormControl fullWidth sx={{mb: 3}}>
                                        <InputLabel>Mode</InputLabel>
                                        <Select
                                            value={mode}
                                            onChange={handleModeChange}
                                            label="Mode"
                                        >
                                            <MenuItem value="">
                                                <em>Select mode</em>
                                            </MenuItem>
                                            <MenuItem value="once">Once</MenuItem>
                                            <MenuItem value="yearly">Yearly</MenuItem>
                                            <MenuItem value="monthly">Monthly</MenuItem>
                                            <MenuItem value="quarterly">Quarterly</MenuItem>
                                        </Select>
                                    </StyledFormControl>

                                    <Box sx={{mb: 3}}>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            <CalendarMonthIcon sx={{mr: 1, color: theme.palette.primary.main}}/>
                                            <Typography variant="h6">Select Months</Typography>
                                        </Box>
                                        <MonthsGrid>
                                            {Object.keys(months).map((month) => (
                                                <FormControlLabel
                                                    key={month}
                                                    control={
                                                        <Checkbox
                                                            checked={months[month]}
                                                            onChange={handleMonthChange}
                                                            value={month}
                                                            sx={{
                                                                '&.Mui-checked': {
                                                                    color: theme.palette.primary.main,
                                                                },
                                                            }}
                                                        />
                                                    }
                                                    label={month}
                                                />
                                            ))}
                                        </MonthsGrid>
                                    </Box>

                                    <Box sx={{display: 'flex', gap: 2}}>
                                        <ActionButton
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={24}/> : (id ? 'Update' : 'Submit')}
                                        </ActionButton>
                                        {id && (
                                            <ActionButton
                                                type="button"
                                                variant="outlined"
                                                color="secondary"
                                                fullWidth
                                                onClick={resetForm}
                                            >
                                                Cancel
                                            </ActionButton>
                                        )}
                                    </Box>
                                </motion.div>
                            )}
                        </form>
                    </StyledPaper>
                </motion.div>

                {/* Fee Records */}
                <motion.div
                    initial={{opacity: 0, x: 20}}
                    animate={{opacity: 1, x: 0}}
                    transition={{duration: 0.5}}
                    style={{flex: 1}}
                >
                    <StyledPaper>
                        <Typography variant="h5" fontWeight="600" sx={{mb: 3}}>
                            Fee Records
                        </Typography>

                        {loading ? (
                            <Box display="flex" justifyContent="center" p={3}>
                                <CircularProgress/>
                            </Box>
                        ) : (
                            <>
                                {error && (
                                    <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                                        {error}
                                    </Alert>
                                )}

                                <List>
                                    <AnimatePresence>
                                        {Array.isArray(feeRecords) && feeRecords.length > 0 ? (
                                            feeRecords.map((record, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{opacity: 0, y: 20}}
                                                    animate={{opacity: 1, y: 0}}
                                                    exit={{opacity: 0, y: -20}}
                                                    transition={{duration: 0.3, delay: index * 0.1}}
                                                >
                                                    <StyledListItem>
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle1" fontWeight="600">
                                                                    {record.selectedFee}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Box>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Session: {record.session}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Mode: {record.mode}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Months: {Object.keys(record.months)
                                                                        .filter(month => record.months[month])
                                                                        .join(', ')}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                        />
                                                        <Box>
                                                            <IconButton
                                                                onClick={() => handleEdit(record)}
                                                                sx={{
                                                                    color: theme.palette.primary.main,
                                                                    '&:hover': {
                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                                    },
                                                                }}
                                                            >
                                                                <EditIcon/>
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => handleDeleteClick(record)}
                                                                sx={{
                                                                    color: theme.palette.error.main,
                                                                    '&:hover': {
                                                                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                                                                    },
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </Box>
                                                    </StyledListItem>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <motion.div
                                                initial={{opacity: 0}}
                                                animate={{opacity: 1}}
                                                transition={{duration: 0.5}}
                                            >
                                                <Typography
                                                    variant="body1"
                                                    align="center"
                                                    sx={{
                                                        py: 3,
                                                        color: theme.palette.text.secondary,
                                                        fontStyle: 'italic'
                                                    }}
                                                >
                                                    No fee records available.
                                                </Typography>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </List>
                            </>
                        )}
                    </StyledPaper>
                </motion.div>
            </Box>

            {/* Delete Confirmation Dialog */}
            <StyledDialog
                open={deleteDialogOpen}
                onClose={handleCloseDialog}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{pb: 1}}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this fee record? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2, pt: 1}}>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {loading ? <CircularProgress size={24}/> : 'Delete'}
                    </Button>
                </DialogActions>
            </StyledDialog>
        </Box>
    );
};

export default FeeType;