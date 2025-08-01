import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Fade,
    Grid,
    Grow,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {useDispatch, useSelector} from 'react-redux';
import {createExpense, fetchExpenses,} from './redux/ExpenseAction';
import ExpenseList from '../expenses/ExpenseList';
import ExpenseForm from "../expenses/ExpenseForm";
import * as XLSX from 'xlsx';
import ClearIcon from '@mui/icons-material/Clear';
import {selectSchoolDetails} from "../../../common";

const Expense = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();
    const theme = useTheme();

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {expenses, loading, error} = useSelector((state) => state.expenses);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchExpenses(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddExpense = () => {
        setSelectedExpense(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => setSearchQuery('');

    const handleEditExpense = (expense) => {
        setSelectedExpense(expense);
        setOpenForm(true);
    };

    const handleViewExpense = (expense) => {
        setSelectedExpense(expense);
        setOpenDetails(true);
    };

    // const handleFormSubmit = (formData) => {
    //   const operation = formData.id
    //     ? dispatch(createExpense(formData))
    //     : dispatch(updateExpense(formData));

    //   operation
    //     .then(() => dispatch(fetchExpenses(schoolId, session)))
    //     .catch((error) => console.error("Expense operation failed:", error));

    //   setOpenForm(false);
    // };

    const handleFormSubmit = (formData) => {
        dispatch(createExpense(formData))
            .then(() => {
                dispatch(fetchExpenses(schoolId, session));
                setOpenForm(false);
            })
            .catch((error) => {
                console.error("Expense creation failed:", error);
            });
    };

    const handleDownloadExcel = () => {
        const filteredData = expenses.map(({attachmentsData, ...expense}) => ({
            ...expense,
            amount: parseFloat(expense.amount),
            creationDateTime: new Date(expense.creationDateTime).toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
        XLSX.writeFile(workbook, 'expenses.xlsx');
    };

    const filteredExpenses = expenses?.filter(expense => {
        const searchLower = searchQuery.toLowerCase();
        return expense.category.toLowerCase().includes(searchLower) ||
            expense.description.toLowerCase().includes(searchLower);
    }) || [];

    const LoadingSkeleton = () => (
        <Box sx={{p: 2}}>
            <Skeleton variant="rectangular" width="100%" height={60} sx={{mb: 2, borderRadius: 1}}/>
            <Grid container spacing={2}>
                {[1, 2, 3].map((i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Skeleton variant="rectangular" height={200} sx={{borderRadius: 2}}/>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{py: 4}}>
            <Fade in={!loading} timeout={800}>
                <Box>
                    {error ? (
                        <Alert
                            severity="error"
                            sx={{
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
                                    mb: 4,
                                    borderRadius: 2,
                                    background: theme.palette.background.paper,
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 3
                                }}>
                                    <Typography variant="h4" component="h1" sx={{fontWeight: 600}}>
                                        Expenses Management
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 2}}>
                                        <Tooltip title="Download Expenses">
                                            <IconButton
                                                color="primary"
                                                onClick={handleDownloadExcel}
                                                sx={{
                                                    bgcolor: theme.palette.primary.light,
                                                    '&:hover': {bgcolor: theme.palette.primary.main},
                                                }}
                                            >
                                                <FileDownloadIcon/>
                                            </IconButton>
                                        </Tooltip>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddCircleOutlineIcon/>}
                                            onClick={handleAddExpense}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: 'none',
                                                px: 3,
                                            }}
                                        >
                                            Add Expense
                                        </Button>
                                    </Box>
                                </Box>

                                <TextField
                                    fullWidth
                                    placeholder="Search by category or description..."
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
                                            bgcolor: theme.palette.background.default,
                                        }
                                    }}
                                />
                            </Paper>

                            <Grow in={!loading} timeout={500}>
                                <Box>
                                    <ExpenseList
                                        expenses={filteredExpenses}
                                        onEdit={handleEditExpense}
                                        onView={handleViewExpense}
                                    />
                                </Box>
                            </Grow>

                            <Dialog
                                open={openForm}
                                onClose={() => setOpenForm(false)}
                                fullWidth
                                maxWidth="md"
                                PaperProps={{
                                    sx: {borderRadius: 3}
                                }}
                            >
                                <DialogTitle sx={{
                                    pb: 1,
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                }}>
                                    <Typography variant="h5" component="h2">
                                        {selectedExpense ? 'Edit Expense' : 'Add New Expense'}
                                    </Typography>
                                </DialogTitle>
                                <DialogContent sx={{pt: 3}}>
                                    <ExpenseForm
                                        expense={selectedExpense}
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
                                    sx: {borderRadius: 3}
                                }}
                            >
                                <DialogTitle sx={{pb: 1}}>
                                    <Typography variant="h5" component="h2">
                                        Expense Details
                                    </Typography>
                                </DialogTitle>
                                <DialogContent>
                                    {selectedExpense ? (
                                        <Card sx={{mt: 2, boxShadow: 'none'}}>
                                            <CardContent>
                                                <Table>
                                                    <TableBody>
                                                        {[
                                                            {label: "Category", value: selectedExpense.category},
                                                            {label: "Amount", value: `$${selectedExpense.amount}`},
                                                            {label: "Description", value: selectedExpense.description},
                                                            {
                                                                label: "Date",
                                                                value: new Date(selectedExpense.creationDateTime).toLocaleString()
                                                            },
                                                            {
                                                                label: "Attachment",
                                                                value: selectedExpense.attachmentsData ? (
                                                                    <Button
                                                                        variant="outlined"
                                                                        onClick={() => window.open(`data:application/octet-stream;base64,${selectedExpense.attachmentsData}`)}
                                                                        sx={{
                                                                            borderRadius: 2,
                                                                            textTransform: 'none',
                                                                        }}
                                                                    >
                                                                        View Attachment
                                                                    </Button>
                                                                ) : "None"
                                                            }
                                                        ].map((item) => (
                                                            <TableRow key={item.label} sx={{
                                                                '&:last-child td': {border: 0}
                                                            }}>
                                                                <TableCell sx={{fontWeight: 600, width: '30%'}}>
                                                                    {item.label}
                                                                </TableCell>
                                                                <TableCell>{item.value}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <LoadingSkeleton/>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </>
                    )}
                </Box>
            </Fade>
            {loading && <LoadingSkeleton/>}
        </Container>
    );
};

export default Expense;