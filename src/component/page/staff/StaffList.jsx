import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {
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
    Grid,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from 'react-toastify';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import {useNavigate} from "react-router-dom";
import {deleteStaff} from "./redux/staffActions";
import {motion} from "framer-motion";

const MotionCard = motion(Card);

const StaffList = ({staffList, onEdit, onView}) => {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();

    console.log('StaffList Debug:', {
        receivedStaffList: staffList,
        staffListLength: staffList?.length,
        firstStaffMember: staffList?.[0],
        hasRequiredFields: staffList?.map(staff => ({
            id: staff.id,
            hasName: Boolean(staff.name),
            hasEmail: Boolean(staff.email),
            hasPhone: Boolean(staff.phone),
            hasType: Boolean(staff.type)
        }))
    });

    const handleClickOpen = (staff) => {
        navigate(`/staff/${staff.id}`);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedStaff(null);
    };

    const handleDeleteRole = (id) => {
        dispatch(deleteStaff(id));
    };

    const handleOpenModal = (id) => {
        setStaffToDelete(id);
        setModalOpen(true);
        setSelectedStaff(id);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setStaffToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (staffToDelete) {
            handleDeleteRole(staffToDelete);
            handleCloseModal();
            toast.success("Staff member deleted successfully!");
        }
    };

    if (!staffList || staffList.length === 0) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="200px"
                flexDirection="column"
                gap={2}
            >
                <Typography variant="h6" color="textSecondary">
                    No staff members found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Add new staff members to see them here
                </Typography>
            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={3}>
                {staffList.map((staff, index) => (
                    <Grid item xs={12} sm={6} md={4} key={staff.id || index}>
                        <MotionCard
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[4],
                                },
                            }}
                        >
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Avatar
                                            src={staff.photo}
                                            alt={staff.name}
                                            sx={{
                                                width: 64,
                                                height: 64,
                                                border: `2px solid ${theme.palette.primary.main}`,
                                            }}
                                        />
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onView(staff)}
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        '&:hover': {transform: 'scale(1.1)'},
                                                    }}
                                                >
                                                    <VisibilityIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(staff)}
                                                    sx={{
                                                        color: theme.palette.warning.main,
                                                        '&:hover': {transform: 'scale(1.1)'},
                                                    }}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenModal(staff.id)}
                                                    sx={{
                                                        color: theme.palette.error.main,
                                                        '&:hover': {transform: 'scale(1.1)'},
                                                    }}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {staff.name || 'No Name'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <WorkIcon fontSize="small" color="action"/>
                                            <Typography variant="body2" color="textSecondary">
                                                {staff.post || 'No Position'}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EmailIcon fontSize="small" color="action"/>
                                            <Typography variant="body2" noWrap>
                                                {staff.email || 'No Email'}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PhoneIcon fontSize="small" color="action"/>
                                            <Typography variant="body2">
                                                {staff.phone || 'No Phone'}
                                            </Typography>
                                        </Stack>
                                    </Stack>

                                    <Box>
                                        <Chip
                                            label={staff.staffType === 'Teaching' ? 'Teaching' : 'Non-Teaching'}
                                            size="small"
                                            color={staff.staffType === 'Teaching' ? 'primary' : 'secondary'}
                                            sx={{
                                                borderRadius: '8px',
                                                backgroundColor: staff.staffType === 'Teaching' ? '#1976d2' : '#9c27b0',
                                                color: 'white'
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle sx={{pb: 1}}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Confirm Delete</Typography>
                        <IconButton size="small" onClick={handleCloseModal}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this staff member? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2, pt: 1}}>
                    <Button
                        onClick={handleCloseModal}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
};

export default StaffList;
