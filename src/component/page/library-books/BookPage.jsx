import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {useDispatch, useSelector} from "react-redux";
import {createBook, createBorrowBook, deleteBook, fetchBOOK, updateBook,} from "./redux/BookActions";
import BookForm from "./BookForm";
import BookList from "./BookList";
import * as XLSX from "xlsx";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import {selectSchoolDetails} from "../../../common";

const BookPage = () => {
    const theme = useTheme();
    const [openForm, setOpenForm] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const {bookList, loading, error} = useSelector((state) => state.book);

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;


    useEffect(() => {
        dispatch(fetchBOOK(schoolId, session));
    }, [dispatch, schoolId, session]);

    const handleAddBook = () => {
        setSelectedBook(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const handleEditBook = (book) => {
        setSelectedBook(book);
        setOpenForm(true);
    };

    const handleViewBook = (book) => {
        setSelectedBook(book);
        setOpenDetails(true);
    };

    const handleBorrowBook = (book) => {
        setSelectedBook(book);
        setOpenDetails(true);
        dispatch(createBorrowBook(book));
    };
    const handleCheckFine = (book) => {
        setSelectedBook(book);
        setOpenDetails(true);
    };
    const handleFormSubmit = (formData) => {
        if (formData.id) {
            dispatch(updateBook(formData.id, formData));
        } else {
            dispatch(createBook(formData));
        }
        setOpenForm(false);
    };

    const handleDeleteBook = (id) => {
        dispatch(deleteBook(id));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDownloadExcel = () => {
        const filteredData = bookList.map(
            ({
                 photo,
                 identificationDocuments,
                 educationalCertificate,
                 professionalQualifications,
                 experienceCertificates,
                 bankAccount,
                 previousEmployer,
                 ...book
             }) => book
        );

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Book");
        XLSX.writeFile(workbook, "Book.xlsx");
    };

    // Ensure staffList is an array before applying array methods
    const filteredBookList = Array.isArray(bookList)
        ? bookList.filter((book) => {
            const title = book.title?.toLowerCase() || "";
            const author = book.author?.toLowerCase() || "";
            const isbn = book.isbn?.toLowerCase() || "";
            const query = searchQuery.toLowerCase();

            return (
                title.includes(query) ||
                author.includes(query) ||
                isbn.includes(query)
            );
        })
        : [];

    return (
        <Container maxWidth="lg">
            <Box sx={{py: 4}}>
                <Typography variant="h4" component="h1" gutterBottom sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    mb: 4
                }}>
                    Library Management
                </Typography>

                {loading ? (
                    <Box sx={{mt: 3}}>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{mb: 2}}/>
                        <Skeleton variant="rectangular" width="100%" height={400}/>
                    </Box>
                ) : error ? (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                            boxShadow: theme.shadows[2]
                        }}
                    >
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                background: theme.palette.background.paper,
                                mb: 3
                            }}
                        >
                            <Box sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                flexWrap: "wrap"
                            }}>
                                <TextField
                                    label="Search books..."
                                    variant="outlined"
                                    size="medium"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    sx={{
                                        flexGrow: 1,
                                        minWidth: 250,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
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
                                                >
                                                    <ClearIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAddBook}
                                    startIcon={<AddCircleOutlineIcon/>}
                                    sx={{
                                        borderRadius: 2,
                                        px: 3,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    Add New Book
                                </Button>
                                <Tooltip title="Export to Excel">
                                    <IconButton
                                        color="primary"
                                        onClick={handleDownloadExcel}
                                        sx={{
                                            bgcolor: theme.palette.primary.light,
                                            '&:hover': {
                                                bgcolor: theme.palette.primary.main,
                                                '& svg': {
                                                    color: 'white'
                                                }
                                            }
                                        }}
                                    >
                                        <FileDownloadIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Paper>

                        <Paper
                            elevation={3}
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}
                        >
                            <BookList
                                bookList={filteredBookList}
                                onEdit={handleEditBook}
                                onDelete={handleDeleteBook}
                                onView={handleViewBook}
                                onBorrow={handleBorrowBook}
                                onCheckFine={handleCheckFine}
                            />
                        </Paper>

                        <Dialog
                            open={openForm}
                            onClose={() => setOpenForm(false)}
                            fullWidth
                            maxWidth="md"
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }
                            }}
                        >
                            <DialogTitle sx={{
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                py: 2
                            }}>
                                {selectedBook ? "Edit Book" : "Add New Book"}
                            </DialogTitle>
                            <DialogContent sx={{p: 3}}>
                                <BookForm
                                    book={selectedBook}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setOpenForm(false)}
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
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }
                            }}
                        >
                            <DialogTitle
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    py: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                Book Details
                                <IconButton
                                    onClick={() => setOpenDetails(false)}
                                    sx={{color: 'white'}}
                                >
                                    <CloseIcon/>
                                </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{p: 3}}>
                                {selectedBook ? (
                                    <TableContainer>
                                        <Table>
                                            <TableBody>
                                                {[
                                                    {label: "Title", value: selectedBook.title},
                                                    {label: "Author", value: selectedBook.author},
                                                    {label: "ISBN", value: selectedBook.isbn},
                                                    {
                                                        label: "Status",
                                                        value: selectedBook.borrowed ? "Borrowed" : "Available"
                                                    },
                                                    {label: "Borrowed By", value: selectedBook.borrowedBy},
                                                    {label: "Borrowed Email", value: selectedBook.borrowedEmail},
                                                    {
                                                        label: "Price",
                                                        value: selectedBook.price ? `$${selectedBook.price}` : "N/A"
                                                    },
                                                    {
                                                        label: "Late Fine",
                                                        value: selectedBook.lateFine ? `$${selectedBook.lateFine}` : "N/A"
                                                    },
                                                    {label: "Issue Date", value: selectedBook.issueDate},
                                                    {label: "Return Last Date", value: selectedBook.returnLastDate},
                                                    {
                                                        label: "Location",
                                                        value: `Room ${selectedBook.roomNo}, Rack ${selectedBook.rackNo}, Row ${selectedBook.rowNo}`
                                                    },
                                                    {label: "Barcode", value: selectedBook.barCode},
                                                ].map((item) => (
                                                    <TableRow
                                                        key={item.label}
                                                        sx={{
                                                            '&:nth-of-type(odd)': {
                                                                bgcolor: theme.palette.action.hover,
                                                            },
                                                        }}
                                                    >
                                                        <TableCell
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: theme.palette.text.secondary,
                                                                width: '30%'
                                                            }}
                                                        >
                                                            {item.label}
                                                        </TableCell>
                                                        <TableCell>{item.value || "Not available"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Skeleton variant="rectangular" width="100%" height={200}/>
                                )}
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default BookPage;
