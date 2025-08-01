import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
    Zoom
} from "@mui/material";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {deletePickupAuthorization} from "./redux/PickupAction";

const PickupList = ({pickupAuthorizations, onEdit, onView}) => {
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);
    const [authToDelete, setAuthToDelete] = useState(null);
    const theme = useTheme();

    const handleOpenModal = (id) => {
        setAuthToDelete(id);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setAuthToDelete(null);
    };

    const handleDelete = () => {
        if (authToDelete) {
            dispatch(deletePickupAuthorization(authToDelete))
                .then(() => {
                    toast.success("Authorization deleted successfully");
                    handleCloseModal();
                })
                .catch((error) => {
                    toast.error("Failed to delete authorization");
                    handleCloseModal();
                });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatus = (validUntil, active) => {
        if (!active) return {label: "Inactive", color: "error"};
        const now = new Date();
        return new Date(validUntil) > now
            ? {label: "Active", color: "success"}
            : {label: "Expired", color: "warning"};
    };

    const convertByteArrayToBase64 = (byteArray) => {
        return byteArray ? `data:image/jpeg;base64,${byteArray}` : null;
    };

    return (
        <>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    maxHeight: 520,
                    borderRadius: 3,
                    '& .MuiTable-root': {
                        borderCollapse: 'separate',
                        borderSpacing: '0 8px'
                    }
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Student
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Authorized Person
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Contact
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Validity
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Status
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    bgcolor: 'background.paper',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pickupAuthorizations.map((auth, index) => (
                            <Zoom
                                in={true}
                                style={{transitionDelay: `${index * 50}ms`}}
                                key={auth.id}
                            >
                                <TableRow
                                    sx={{
                                        bgcolor: 'background.paper',
                                        '&:hover': {
                                            bgcolor: 'primary.lighter',
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.2s ease-in-out',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        },
                                        transition: 'all 0.2s ease-in-out',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                            <Avatar
                                                src={convertByteArrayToBase64(auth.Photo)}
                                                alt={auth.studentName}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    border: '2px solid',
                                                    borderColor: 'primary.lighter'
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle2"
                                                            sx={{fontWeight: 600, color: 'text.primary'}}>
                                                    {auth.studentName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: {auth.studentId}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{fontWeight: 500}}>
                                            {auth.authorizedPersonName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {auth.relationship}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{fontWeight: 500}}>
                                            {auth.contactNumber}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {auth.idProofType}: {auth.idProofNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{fontWeight: 500}}>
                                            {formatDate(auth.validFrom)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            to {formatDate(auth.validUntil)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatus(auth.validUntil, auth.active).label}
                                            color={getStatus(auth.validUntil, auth.active).color}
                                            size="small"
                                            sx={{
                                                borderRadius: '6px',
                                                fontWeight: 500,
                                                '& .MuiChip-label': {
                                                    px: 1.5,
                                                    py: 0.25
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Tooltip title="View Details" arrow>
                                                <IconButton
                                                    onClick={() => onView(auth)}
                                                    size="small"
                                                    sx={{
                                                        color: 'primary.main',
                                                        bgcolor: 'primary.lighter',
                                                        '&:hover': {
                                                            bgcolor: 'primary.light',
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Authorization" arrow>
                                                <IconButton
                                                    onClick={() => onEdit(auth)}
                                                    size="small"
                                                    sx={{
                                                        color: 'secondary.main',
                                                        bgcolor: 'secondary.lighter',
                                                        '&:hover': {
                                                            bgcolor: 'secondary.light',
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Authorization" arrow>
                                                <IconButton
                                                    onClick={() => handleOpenModal(auth.id)}
                                                    size="small"
                                                    sx={{
                                                        color: 'error.main',
                                                        bgcolor: 'error.lighter',
                                                        '&:hover': {
                                                            bgcolor: 'error.light',
                                                            transform: 'scale(1.1)',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </Zoom>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 2,
                    pt: 3,
                    px: 3,
                    typography: 'h6',
                    fontWeight: 600,
                    color: 'error.main'
                }}>
                    Delete Authorization
                </DialogTitle>
                <DialogContent sx={{px: 3, pb: 3}}>
                    <DialogContentText sx={{color: 'text.secondary'}}>
                        Are you sure you want to delete this pickup authorization? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button
                        onClick={handleCloseModal}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            '&:hover': {
                                bgcolor: 'primary.lighter',
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            boxShadow: '0 4px 12px rgba(211,47,47,0.2)',
                            '&:hover': {
                                boxShadow: '0 6px 16px rgba(211,47,47,0.3)',
                            }
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="colored"
            />
        </>
    );
};

export default PickupList;