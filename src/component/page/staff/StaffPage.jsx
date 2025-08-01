import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import {useDispatch, useSelector} from 'react-redux';
import {createStaff, deleteStaff, fetchStaff, updateStaff} from './redux/staffActions';
import StaffForm from './StaffForm';
import StaffList from './StaffList';
import * as XLSX from 'xlsx';
import {selectSchoolDetails} from "../../../common";
import {AnimatePresence, motion} from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionContainer = motion(Container);
const MotionCard = motion(Card);

const StaffPage = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [staffType, setStaffType] = useState('non-teaching');
    const [tabValue, setTabValue] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const dispatch = useDispatch();
    const {staffList, loading, error} = useSelector((state) => state.staff);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    console.log('StaffPage Debug:', {
        staffList,
        loading,
        error,
        schoolId,
        session,
        userData
    });

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchStaff(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddStaff = () => {
        setSelectedStaff(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleEditStaff = (staff) => {
        setSelectedStaff(staff);
        setOpenForm(true);
    };

    const handleViewStaff = (staff) => {
        setSelectedStaff(staff);
        setOpenDetails(true);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formData.id) {
                await dispatch(updateStaff(formData.id, formData));
                setSuccessMessage('Staff member updated successfully');
            } else {
                const result = await dispatch(createStaff(formData));
                if (result.success) {
                    setSuccessMessage('Staff member created successfully');
                    setOpenForm(false);
                } else {
                    setErrorMessage(result.error);
                }
            }
        } catch (error) {
            setErrorMessage(error.message || 'An error occurred while processing your request');
        }
    };

    const handleDeleteStaff = (id) => {
        dispatch(deleteStaff(id));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setStaffType(newValue === 0 ? 'teaching' : 'non-teaching');
    };

    const handleDownloadExcel = () => {
        const filteredData = staffList.map(
            ({
                 photo,
                 identificationDocuments,
                 educationalCertificate,
                 professionalQualifications,
                 experienceCertificates,
                 bankAccount,
                 previousEmployer,
                 ...staff
             }) => staff
        );

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
        XLSX.writeFile(workbook, 'staff.xlsx');
    };

    const filteredStaffList = Array.isArray(staffList)
        ? staffList.filter((staff) => {
            const name = staff.name?.toLowerCase() || '';
            const phone = staff.phone?.toLowerCase() || '';
            const email = staff.email?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();
            // Convert staffType to lowercase for case-insensitive comparison
            const staffMemberType = (staff.type || staff.staffType || 'teaching').toLowerCase();
            const isCorrectType = staffMemberType === staffType.toLowerCase();

            console.log('Filtering staff details:', {
                staffMemberType,
                currentStaffType: staffType,
                staff,
                isCorrectType,
                query,
            });

            const matches = isCorrectType && (name.includes(query) || phone.includes(query) || email.includes(query));
            return matches;
        })
        : [];

    console.log('Filtered results:', {
        originalLength: staffList?.length,
        filteredLength: filteredStaffList.length,
        staffType,
        searchQuery
    });

    const getStaffTypeIcon = () => {
        return tabValue === 0 ? <SchoolIcon/> : <WorkIcon/>;
    };

    const getStaffCount = () => {
        return filteredStaffList.length;
    };

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{py: 4}}>
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4].map((item) => (
                            <Grid item xs={12} md={3} key={item}>
                                <Skeleton variant="rectangular" height={120} sx={{borderRadius: 2}}/>
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <Skeleton variant="rectangular" height={400} sx={{borderRadius: 2}}/>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{
                            borderRadius: 2,
                            width: '100%',
                            maxWidth: 500,
                        }}
                    >
                        {error}
                    </Alert>
                </Box>
            </Container>
        );
    }

    return (
        <AnimatePresence>
            <MotionContainer
                maxWidth="lg"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                transition={{duration: 0.5}}
            >
                <Box sx={{py: 4}}>
                    <MotionPaper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            background: theme.palette.background.paper,
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 3}}>
                            <Box>
                                <Typography variant="h5" fontWeight="600" color="primary" gutterBottom>
                                    Staff Management
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        icon={getStaffTypeIcon()}
                                        label={`${staffType === 'teaching' ? 'Teaching' : 'Non-Teaching'} Staff`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <Chip
                                        icon={<PersonIcon/>}
                                        label={`${getStaffCount()} members`}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Stack>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon/>}
                                onClick={handleAddStaff}
                                sx={{
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1.5,
                                    background: theme.palette.primary.main,
                                    '&:hover': {
                                        background: theme.palette.primary.dark,
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                Add New Staff
                            </Button>
                        </Stack>

                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    placeholder="Search by name, phone, or email..."
                                    variant="outlined"
                                    size="medium"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleClearSearch}
                                                    sx={{
                                                        '&:hover': {
                                                            background: theme.palette.action.hover
                                                        }
                                                    }}
                                                >
                                                    <ClearIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: '12px',
                                            '&:hover': {
                                                '& fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            },
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                                <Tooltip title="Download staff list">
                                    <Button
                                        variant="outlined"
                                        startIcon={<FileDownloadIcon/>}
                                        onClick={handleDownloadExcel}
                                        sx={{
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            px: 3,
                                            py: 1.5,
                                            '&:hover': {
                                                borderColor: theme.palette.primary.dark,
                                                background: theme.palette.action.hover,
                                                transform: 'translateY(-2px)',
                                            },
                                            transition: 'all 0.3s ease-in-out',
                                        }}
                                    >
                                        Export to Excel
                                    </Button>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </MotionPaper>

                    <MotionPaper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                            },
                        }}
                    >
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '& .MuiTabs-indicator': {
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                },
                                '& .Mui-selected': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        >
                            <Tab
                                icon={<SchoolIcon/>}
                                iconPosition="start"
                                label="Teaching Staff"
                                sx={{
                                    textTransform: 'none',
                                    minHeight: 48,
                                    '&:hover': {
                                        color: theme.palette.primary.main,
                                        opacity: 1,
                                    },
                                }}
                            />
                            <Tab
                                icon={<WorkIcon/>}
                                iconPosition="start"
                                label="Non-Teaching Staff"
                                sx={{
                                    textTransform: 'none',
                                    minHeight: 48,
                                    '&:hover': {
                                        color: theme.palette.primary.main,
                                        opacity: 1,
                                    },
                                }}
                            />
                        </Tabs>
                        <Box sx={{p: 3}}>
                            <StaffList
                                staffList={filteredStaffList}
                                onEdit={handleEditStaff}
                                onDelete={handleDeleteStaff}
                                onView={handleViewStaff}
                            />
                        </Box>
                    </MotionPaper>

                    <Dialog
                        open={openForm}
                        onClose={() => {
                            setOpenForm(false);
                            setErrorMessage('');
                        }}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                overflow: 'hidden',
                            }
                        }}
                        TransitionComponent={Fade}
                        TransitionProps={{timeout: 300}}
                    >
                        <DialogTitle
                            sx={{
                                px: 3,
                                py: 2,
                                background: theme.palette.background.default,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            {selectedStaff ? <EditIcon color="primary"/> : <AddIcon color="primary"/>}
                            <Typography variant="h6" fontWeight="600">
                                {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </Typography>
                        </DialogTitle>
                        <Divider/>
                        <DialogContent sx={{p: 3}}>
                            {errorMessage && (
                                <Alert severity="error" sx={{mb: 2}}>
                                    {errorMessage}
                                </Alert>
                            )}
                            <StaffForm
                                staff={selectedStaff}
                                staffType={staffType}
                                onSubmit={handleFormSubmit}
                                onCancel={() => {
                                    setOpenForm(false);
                                    setErrorMessage('');
                                }}
                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog
                        open={openDetails}
                        onClose={() => setOpenDetails(false)}
                        fullWidth
                        maxWidth="md"
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                overflow: 'hidden',
                            }
                        }}
                        TransitionComponent={Fade}
                        TransitionProps={{timeout: 300}}
                    >
                        <DialogTitle
                            sx={{
                                px: 3,
                                py: 2,
                                background: theme.palette.background.default,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <PersonIcon color="primary"/>
                            <Typography variant="h6" fontWeight="600">
                                Staff Details
                            </Typography>
                        </DialogTitle>
                        <Divider/>
                        <DialogContent sx={{p: 3}}>
                            {selectedStaff ? (
                                <Box sx={{pt: 2}}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4} sx={{textAlign: 'center'}}>
                                            <Avatar
                                                src={selectedStaff.photo}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    margin: '0 auto',
                                                    border: `4px solid ${theme.palette.primary.main}`,
                                                }}
                                            />
                                            <Typography variant="h6" sx={{mt: 2}}>
                                                {selectedStaff.name}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {selectedStaff.post}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedStaff.email}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <Typography variant="subtitle2" color="textSecondary">
                                                        Phone
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedStaff.phone}
                                                    </Typography>
                                                </Grid>
                                                {/* Add more staff details here */}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Skeleton variant="rectangular" width="100%" height={200} sx={{borderRadius: 1}}/>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Error Snackbar */}
                    <Snackbar
                        open={!!errorMessage}
                        autoHideDuration={6000}
                        onClose={() => setErrorMessage('')}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    >
                        <Alert onClose={() => setErrorMessage('')} severity="error" sx={{width: '100%'}}>
                            {errorMessage}
                        </Alert>
                    </Snackbar>

                    {/* Success Snackbar */}
                    <Snackbar
                        open={!!successMessage}
                        autoHideDuration={6000}
                        onClose={() => setSuccessMessage('')}
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    >
                        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{width: '100%'}}>
                            {successMessage}
                        </Alert>
                    </Snackbar>
                </Box>
            </MotionContainer>
        </AnimatePresence>
    );
};

export default StaffPage;
