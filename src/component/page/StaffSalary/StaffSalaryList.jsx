import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {
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
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
    Zoom,
} from "@mui/material";
import 'react-toastify/dist/ReactToastify.css';
import {toast} from 'react-toastify';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {deleteStaffSalaryById} from "./Redux/StaffSalaryAction";
import {AnimatePresence, motion} from "framer-motion";

const StaffSalaryList = ({staffSalary, onEdit, onView}) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffToDelete, setStaffToDelete] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (id) => {
        setStaffToDelete(id);
        setModalOpen(true);
        setSelectedStaff(id);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setStaffToDelete(null);
        setSelectedStaff(null);
    };

    const handleToastDelete = () => {
        if (staffToDelete) {
            dispatch(deleteStaffSalaryById(staffToDelete))
                .then(() => {
                    toast.success("Staff Salary deleted successfully.");
                    handleCloseModal();
                })
                .catch((error) => {
                    console.error("Error deleting salary:", error);
                    toast.error("Failed to delete the salary. Please try again.");
                    handleCloseModal();
                });
        }
    };

    const getPaymentModeColor = (mode) => {
        const modes = {
            'cash': 'success',
            'cheque': 'info',
            'bank transfer': 'primary',
            'upi': 'secondary',
            'default': 'default'
        };
        return modes[mode?.toLowerCase()] || modes.default;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <Box sx={{width: '100%'}}>
            <TableContainer
                component={Paper}
                sx={{
                    maxHeight: 520,
                    borderRadius: 2,
                    overflow: 'hidden',
                    '& .MuiTableCell-root': {
                        borderColor: theme.palette.divider
                    }
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Staff Name
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Payment Mode
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Total Submission
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Transaction ID
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    backgroundColor: theme.palette.background.default,
                                    color: theme.palette.text.primary
                                }}
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <AnimatePresence>
                            {(rowsPerPage > 0
                                    ? staffSalary.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    : staffSalary
                            ).map((salary, index) => (
                                <motion.tr
                                    key={salary.id}
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -20}}
                                    transition={{duration: 0.3, delay: index * 0.05}}
                                    component={TableRow}
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper',
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={500}>
                                            {salary.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={salary.paymentMode}
                                            color={getPaymentModeColor(salary.paymentMode)}
                                            size="small"
                                            sx={{fontWeight: 500}}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatCurrency(salary.totalSubmission)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {salary.transactionId || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Tooltip title="View Details" arrow>
                                                <IconButton
                                                    onClick={() => onView(salary)}
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.primary.light,
                                                        }
                                                    }}
                                                >
                                                    <VisibilityIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit" arrow>
                                                <IconButton
                                                    onClick={() => onEdit(salary)}
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.secondary.main,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.secondary.light,
                                                        }
                                                    }}
                                                >
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete" arrow>
                                                <IconButton
                                                    onClick={() => handleOpenModal(salary.id)}
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.error.main,
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.error.light,
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={staffSalary.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                }}
            />

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                TransitionComponent={Zoom}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 2
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6" component="h2" fontWeight={600}>
                        Confirm Deletion
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this salary record? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{px: 3, pb: 3}}>
                    <Button
                        onClick={handleCloseModal}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleToastDelete}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StaffSalaryList;
