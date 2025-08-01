import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {
    Button,
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
} from "@mui/material";
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {deleteExpense} from "./redux/ExpenseAction";

const rowColors = ["#f5f5f5", "#ffffff"];
const convertByteArrayToBase64 = (byteArray) => {


    if (!byteArray) return ''; // Handle null or undefined cases

    // Check if it's already a base64 encoded string
    if (typeof byteArray === 'string' && byteArray.startsWith('data:image')) {
        return byteArray;
    }

// If it's an actual byteArray, convert it to base64
    return `data:image/jpeg;base64,${byteArray}`;
};
const ExpenseList = ({expenses, onEdit, onView}) => {
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const handleOpenModal = (id) => {
        setExpenseToDelete(id);
        setModalOpen(true);
        setSelectedExpense(id);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setExpenseToDelete(null);
        setSelectedExpense(null);
    };

    const handleDelete = () => {
        if (expenseToDelete) {
            dispatch(deleteExpense(expenseToDelete))
                .then(() => {
                    toast.success("Expense deleted successfully.");
                    handleCloseModal();
                })
                .catch((error) => {
                    console.error("Error deleting expense:", error);
                    toast.error("Failed to delete expense. Please try again.");
                    handleCloseModal();
                });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadAttachment = (attachmentData, fileName = 'expense_attachment') => {
        if (!attachmentData) return;
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${attachmentData}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <TableContainer component={Paper} style={{maxHeight: 520}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{fontWeight: "bold"}}>Category</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Amount</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Description</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Date</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Attachment</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {expenses.map((expense, index) => (
                            <TableRow
                                key={expense.id}
                                style={{backgroundColor: rowColors[index % rowColors.length]}}
                            >
                                <TableCell>{expense.category}</TableCell>
                                <TableCell>${parseFloat(expense.amount).toLocaleString()}</TableCell>
                                <TableCell>
                                    {expense.description.length > 50
                                        ? `${expense.description.substring(0, 50)}...`
                                        : expense.description}
                                </TableCell>
                                <TableCell>{formatDate(expense.creationDateTime)}</TableCell>
                                <TableCell>
                                    {expense.attachmentsData ? (
                                        <img

                                            src={
                                                convertByteArrayToBase64(expense.attachmentsData) ||
                                                "/path/to/default/image.png"
                                            }
                                            alt={`${expense.category}'s photo`}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                borderRadius: "50%", // For circular photos
                                            }}
                                        />
                                    ) : (
                                        "No Photo"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="View Details" arrow>
                                        <IconButton
                                            onClick={() => onView(expense)}
                                            color="primary"
                                            sx={{marginRight: 1}}
                                        >
                                            <VisibilityIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Expense" arrow>
                                        <IconButton
                                            onClick={() => onEdit(expense)}
                                            color="secondary"
                                            sx={{marginRight: 1}}
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Expense" arrow>
                                        <IconButton
                                            onClick={() => handleOpenModal(expense.id)}
                                            color="error"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete Expense?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this expense record?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button color="primary" autoFocus onClick={handleDelete}>
                        Confirm Delete
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
            />
        </>
    );
};

export default ExpenseList;