import React, {useState} from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    IconButton,
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BookIcon from "@mui/icons-material/Book";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {deleteBook} from './redux/BookActions';
import {toast, ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookList = ({bookList, onEdit, onDelete, onView, onBorrow, onCheckFine}) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (id) => {
        setSelectedBook(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedBook(null);
    };

    const handleConfirmDelete = () => {
        if (selectedBook) {
            dispatch(deleteBook(selectedBook));
            toast.success('Book deleted successfully');
            setOpen(false);
            setSelectedBook(null);
        }
    };

    const handleBorrowBook = (bookId) => {
        navigate(`/borrow/${bookId}`);
    };

    const handleCheckFine = (bookId) => {
        navigate(`/checkfine/${bookId}`);
    };

    return (
        <Box>
            <TableContainer>
                <Table sx={{minWidth: 650}}>
                    <TableHead>
                        <TableRow
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                '& th': {
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                },
                            }}
                        >
                            <TableCell>Title</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>ISBN</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                                ? bookList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : bookList
                        ).map((book, index) => (
                            <TableRow
                                key={book.id}
                                sx={{
                                    '&:nth-of-type(odd)': {
                                        bgcolor: theme.palette.action.hover,
                                    },
                                    '&:hover': {
                                        bgcolor: theme.palette.action.selected,
                                    },
                                }}
                            >
                                <TableCell>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <BookIcon color="primary"/>
                                        <Typography variant="body1" sx={{fontWeight: 500}}>
                                            {book.title}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{book.author}</TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={book.borrowed ? "Borrowed" : "Available"}
                                        color={book.borrowed ? "error" : "success"}
                                        size="small"
                                        sx={{fontWeight: 500}}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        Room {book.roomNo}, Rack {book.rackNo}, Row {book.rowNo}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 1}}>
                                        <Tooltip title="View Details" arrow>
                                            <IconButton
                                                onClick={() => onView(book)}
                                                size="small"
                                                sx={{
                                                    color: theme.palette.info.main,
                                                    '&:hover': {bgcolor: theme.palette.info.light},
                                                }}
                                            >
                                                <VisibilityIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit Book" arrow>
                                            <IconButton
                                                onClick={() => onEdit(book)}
                                                size="small"
                                                sx={{
                                                    color: theme.palette.warning.main,
                                                    '&:hover': {bgcolor: theme.palette.warning.light},
                                                }}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Book" arrow>
                                            <IconButton
                                                onClick={() => handleOpenModal(book.id)}
                                                size="small"
                                                sx={{
                                                    color: theme.palette.error.main,
                                                    '&:hover': {bgcolor: theme.palette.error.light},
                                                }}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={book.borrowed ? "Check Fine" : "Borrow Book"} arrow>
                                            <IconButton
                                                onClick={() => book.borrowed ? handleCheckFine(book.id) : handleBorrowBook(book.id)}
                                                size="small"
                                                sx={{
                                                    color: book.borrowed ? theme.palette.warning.main : theme.palette.success.main,
                                                    '&:hover': {
                                                        bgcolor: book.borrowed ? theme.palette.warning.light : theme.palette.success.light,
                                                    },
                                                }}
                                            >
                                                {book.borrowed ? <AttachMoneyIcon/> : <BookIcon/>}
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={bookList.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                    borderTop: `1px solid ${theme.palette.divider}`,
                }}
            />

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 400,
                    },
                }}
            >
                <DialogContent>
                    <DialogContentText sx={{textAlign: 'center', mb: 2}}>
                        Are you sure you want to delete this book?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{justifyContent: 'center', pb: 3}}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
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
                            px: 3,
                            textTransform: 'none',
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer position="bottom-right"/>
        </Box>
    );
};

export default BookList;
