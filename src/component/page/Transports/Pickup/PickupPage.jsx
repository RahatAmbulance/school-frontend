import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {Add as AddIcon, Badge, Close, Event, Fingerprint, Person, Phone, School} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useDispatch, useSelector} from 'react-redux';
import {createPickupAuthorization, fetchPickupAuthorizations,} from './redux/PickupAction';
import PickupList from './PickupList';
import PickupForm from "./PickupForm";
import * as XLSX from 'xlsx';
import ClearIcon from '@mui/icons-material/Clear';
import {selectSchoolDetails} from "../../../../common";

const convertByteArrayToBase64 = (byteArray) => {
    return byteArray ? `data:image/jpeg;base64,${byteArray}` : null;
};

const PickupPage = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedAuth, setSelectedAuth] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const dispatch = useDispatch();

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const {pickupAuthorizations, loading, error} = useSelector((state) => state.pickups);

    useEffect(() => {
        if (schoolId) {
            dispatch(fetchPickupAuthorizations());
        }
    }, [dispatch, schoolId]);

    const handleAddAuthorization = () => {
        setSelectedAuth(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => setSearchQuery('');

    const handleEditAuthorization = (auth) => {
        setSelectedAuth(auth);
        setOpenForm(true);
    };

    const handleOpenDetails = (auth) => {
        setSelectedAuth(auth);
        setIsDetailsDialogOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsDialogOpen(false);
    };

    const handleFormSubmit = (formData) => {
        const operation = formData.id
            ? dispatch(createPickupAuthorization({...formData, id: formData.id}))
            : dispatch(createPickupAuthorization(formData));

        operation
            .then(() => {
                dispatch(fetchPickupAuthorizations());
                setOpenForm(false);
            })
            .catch((error) => console.error("Operation failed:", error));
    };

    const handleDownloadExcel = () => {
        const filteredData = pickupAuthorizations.map(auth => ({
            studentId: auth.studentId,
            studentName: auth.studentName,
            authorizedPerson: auth.authorizedPersonName,
            relationship: auth.relationship,
            contactNumber: auth.contactNumber,
            validFrom: new Date(auth.validFrom).toLocaleDateString(),
            validUntil: new Date(auth.validUntil).toLocaleDateString(),
            status: auth.active ? "Active" : "Inactive"
        }));

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Pickups');
        XLSX.writeFile(workbook, 'pickup_authorizations.xlsx');
    };

    const filteredAuthorizations = pickupAuthorizations?.filter(auth => {
        const searchLower = searchQuery.toLowerCase();
        return (
            auth.studentName.toLowerCase().includes(searchLower) ||
            auth.authorizedPersonName.toLowerCase().includes(searchLower) ||
            auth.contactNumber.includes(searchLower)
        );
    }) || [];

    const DetailItem = ({icon, label, value}) => (
        <Box sx={{
            display: 'flex',
            mb: 2,
            alignItems: 'flex-start',
            '&:hover': {
                transform: 'translateX(4px)',
                transition: 'transform 0.2s ease-in-out'
            }
        }}>
            <Box sx={{
                mr: 2,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'primary.lighter',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.1)',
                    bgcolor: 'primary.light',
                }
            }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="caption" sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: 0.5
                }}>
                    {label}
                </Typography>
                <Typography variant="body1" sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    wordBreak: 'break-word'
                }}>
                    {value || 'N/A'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{py: 3}}>
            <Fade in={true} timeout={800}>
                <Box>
                    {loading ? (
                        <Box sx={{mt: 2}}>
                            <Skeleton variant="rectangular" width="100%" height={60} sx={{borderRadius: 2, mb: 2}}/>
                            <Skeleton variant="rectangular" width="100%" height={400} sx={{borderRadius: 2}}/>
                        </Box>
                    ) : error ? (
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 2,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            {error}
                        </Alert>
                    ) : (
                        <>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
                                }}
                            >
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search by student name, authorized person, or contact..."
                                            variant="outlined"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon color="action"/>
                                                    </InputAdornment>
                                                ),
                                                endAdornment: searchQuery && (
                                                    <InputAdornment position="end">
                                                        <IconButton size="small" onClick={handleClearSearch}>
                                                            <ClearIcon/>
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                                sx: {
                                                    borderRadius: 2,
                                                    '&:hover': {
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'primary.main',
                                                        },
                                                    },
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{
                                            display: 'flex',
                                            gap: 2,
                                            justifyContent: {xs: 'flex-start', md: 'flex-end'}
                                        }}>
                                            <Button
                                                variant="contained"
                                                startIcon={<AddIcon/>}
                                                onClick={handleAddAuthorization}
                                                sx={{
                                                    borderRadius: 2,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                                                    },
                                                }}
                                            >
                                                New Authorization
                                            </Button>
                                            <Tooltip title="Download as Excel">
                                                <IconButton
                                                    color="primary"
                                                    onClick={handleDownloadExcel}
                                                    sx={{
                                                        bgcolor: 'primary.lighter',
                                                        '&:hover': {
                                                            bgcolor: 'primary.light',
                                                            transform: 'rotate(15deg)',
                                                        },
                                                    }}
                                                >
                                                    <FileDownloadIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 15px rgba(0,0,0,0.08)'
                                }}
                            >
                                <PickupList
                                    pickupAuthorizations={filteredAuthorizations}
                                    onEdit={handleEditAuthorization}
                                    onView={handleOpenDetails}
                                />
                            </Paper>

                            <Dialog
                                open={openForm}
                                onClose={() => setOpenForm(false)}
                                fullWidth
                                maxWidth="md"
                                PaperProps={{
                                    sx: {
                                        borderRadius: 3,
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                    }
                                }}
                            >
                                <DialogTitle sx={{
                                    px: 3,
                                    py: 2,
                                    bgcolor: 'primary.lighter',
                                    color: 'primary.dark',
                                    fontSize: '1.2rem',
                                    fontWeight: 600
                                }}>
                                    {selectedAuth ? 'Edit Authorization' : 'New Authorization'}
                                </DialogTitle>
                                <DialogContent sx={{p: 3}}>
                                    <PickupForm
                                        pickup={selectedAuth}
                                        onSubmit={handleFormSubmit}
                                        onCancel={() => setOpenForm(false)}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Dialog
                                open={isDetailsDialogOpen}
                                onClose={handleCloseDetails}
                                fullWidth
                                maxWidth="md"
                                PaperProps={{
                                    sx: {
                                        borderRadius: 3,
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                                        overflow: 'hidden'
                                    }
                                }}
                            >
                                <DialogTitle sx={{
                                    px: 3,
                                    py: 2,
                                    bgcolor: 'primary.main',
                                    color: 'common.white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <Typography variant="h6" sx={{fontWeight: 600}}>
                                        Authorization Details
                                    </Typography>
                                    <IconButton onClick={handleCloseDetails} sx={{color: 'common.white'}}>
                                        <Close/>
                                    </IconButton>
                                </DialogTitle>

                                <DialogContent sx={{p: 3}}>
                                    {selectedAuth ? (
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={4}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    textAlign: 'center'
                                                }}>
                                                    <Avatar
                                                        src={convertByteArrayToBase64(selectedAuth.photo)}
                                                        alt={selectedAuth.studentName}
                                                        sx={{
                                                            width: 180,
                                                            height: 180,
                                                            mb: 2,
                                                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                                            border: '4px solid white'
                                                        }}
                                                    />
                                                    <Typography variant="h6" sx={{fontWeight: 600, mb: 0.5}}>
                                                        {selectedAuth.studentName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                                        ID: {selectedAuth.studentId}
                                                    </Typography>
                                                    <Chip
                                                        label={selectedAuth.active ? "Active" : "Inactive"}
                                                        color={selectedAuth.active ? "success" : "error"}
                                                        sx={{
                                                            borderRadius: '8px',
                                                            px: 2,
                                                            '& .MuiChip-label': {
                                                                px: 2,
                                                                py: 0.5,
                                                                fontSize: '0.875rem',
                                                                fontWeight: 500
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} md={8}>
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12}>
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 2.5,
                                                                borderRadius: 2,
                                                                bgcolor: 'background.paper',
                                                                border: '1px solid',
                                                                borderColor: 'divider'
                                                            }}
                                                        >
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 600,
                                                                color: 'primary.main',
                                                                mb: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <School/> Academic Information
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} sm={6}>
                                                                    <DetailItem
                                                                        icon={<School/>}
                                                                        label="Class"
                                                                        value={`${selectedAuth.className} - ${selectedAuth.section}`}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <DetailItem
                                                                        icon={<Person/>}
                                                                        label="Roll Number"
                                                                        value={selectedAuth.rollNumber}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Paper>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Paper
                                                            elevation={0}
                                                            sx={{
                                                                p: 2.5,
                                                                borderRadius: 2,
                                                                bgcolor: 'background.paper',
                                                                border: '1px solid',
                                                                borderColor: 'divider'
                                                            }}
                                                        >
                                                            <Typography variant="subtitle1" sx={{
                                                                fontWeight: 600,
                                                                color: 'primary.main',
                                                                mb: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Fingerprint/> Authorization Details
                                                            </Typography>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} sm={6}>
                                                                    <DetailItem
                                                                        icon={<Person/>}
                                                                        label="Authorized Person"
                                                                        value={`${selectedAuth.authorizedPersonName} (${selectedAuth.relationship})`}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <DetailItem
                                                                        icon={<Phone/>}
                                                                        label="Contact"
                                                                        value={selectedAuth.contactNumber}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <DetailItem
                                                                        icon={<Badge/>}
                                                                        label="ID Proof"
                                                                        value={`${selectedAuth.idProofType}: ${selectedAuth.idProofNumber}`}
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <DetailItem
                                                                        icon={<Event/>}
                                                                        label="Validity"
                                                                        value={`${new Date(selectedAuth.validFrom).toLocaleDateString()} - ${new Date(selectedAuth.validUntil).toLocaleDateString()}`}
                                                                    />
                                                                </Grid>
                                                            </Grid>
                                                        </Paper>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Skeleton variant="rectangular" width="100%" height={400}/>
                                    )}
                                </DialogContent>

                                <DialogActions sx={{p: 2.5, bgcolor: 'background.paper'}}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCloseDetails}
                                        sx={{
                                            borderRadius: 2,
                                            px: 3,
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: 'primary.lighter'
                                            }
                                        }}
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default PickupPage;