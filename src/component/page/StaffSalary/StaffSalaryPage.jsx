import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Fade,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Slide,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import {useDispatch, useSelector} from "react-redux";
import {
    createStaffSalary,
    deleteStaffSalaryById,
    fetchStaffSalaryBySchoolSession,
    updateStaffSalary,
} from "./Redux/StaffSalaryAction";
import StaffSalaryList from "./StaffSalaryList";
import StaffSalaryForm from "./StaffSalaryForm";
import * as XLSX from "xlsx";
import {selectSchoolDetails} from "../../../common";
import {motion} from "framer-motion";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const StaffSalaryPage = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedStaffSalary, setSelectedStaffSalary] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {staffSalaries, loading, error} = useSelector((state) => state.salary);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchStaffSalaryBySchoolSession(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddStaff = () => {
        setSelectedStaffSalary(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const handleEditStaff = (salary) => {
        setSelectedStaffSalary(salary);
        setOpenForm(true);
    };

    const handleViewStaff = (salary) => {
        setSelectedStaffSalary(salary);
        setOpenDetails(true);
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({open: true, message, severity});
    };

    const handleCloseSnackbar = () => {
        setSnackbar({...snackbar, open: false});
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (formData.id) {
                await dispatch(updateStaffSalary(formData.id, formData));
                showSnackbar("Salary updated successfully");
            } else {
                await dispatch(createStaffSalary(formData));
                showSnackbar("Salary added successfully");
            }
            await dispatch(fetchStaffSalaryBySchoolSession(schoolId, session));
            setOpenForm(false);
        } catch (error) {
            showSnackbar(error.message || "An error occurred", "error");
        }
    };

    const handleDeleteStaff = async (id) => {
        try {
            await dispatch(deleteStaffSalaryById(id));
            showSnackbar("Salary deleted successfully");
            await dispatch(fetchStaffSalaryBySchoolSession(schoolId, session));
        } catch (error) {
            showSnackbar(error.message || "Failed to delete salary", "error");
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDownloadExcel = () => {
        try {
            const filteredData = staffSalaries.map(({
                                                        photo,
                                                        identificationDocuments,
                                                        educationalCertificate,
                                                        professionalQualifications,
                                                        experienceCertificates,
                                                        bankAccount,
                                                        previousEmployer,
                                                        ...staff
                                                    }) => staff);

            const worksheet = XLSX.utils.json_to_sheet(filteredData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Salaries");
            XLSX.writeFile(workbook, "staff_salaries.xlsx");
            showSnackbar("Excel file downloaded successfully");
        } catch (error) {
            showSnackbar("Failed to download Excel file", "error");
        }
    };

    const filteredStaffList = Array.isArray(staffSalaries)
        ? staffSalaries.filter((salary) => {
            const searchFields = [
                salary.name,
                salary.paymentMode,
                salary.totalSubmission,
                salary.transactionId
            ].map(field => (field || "").toLowerCase());
            const query = searchQuery.toLowerCase();
            return searchFields.some(field => field.includes(query));
        })
        : [];

    const LoadingSkeleton = () => (
        <Box sx={{mt: 2}}>
            <Skeleton variant="rectangular" width="100%" height={60} sx={{mb: 2, borderRadius: 2}}/>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{borderRadius: 2}}/>
        </Box>
    );

    return (
        <Fade in timeout={500}>
            <Container maxWidth="lg" sx={{py: 4}}>
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            background: theme.palette.background.default,
                            borderRadius: 2,
                            boxShadow: theme.shadows[1]
                        }}
                    >
                        <Typography
                            variant={isMobile ? "h5" : "h4"}
                            component="h1"
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                letterSpacing: -0.5
                            }}
                        >
                            Staff Salary Management
                        </Typography>

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                alignItems: "center",
                            }}
                        >
                            <TextField
                                fullWidth
                                placeholder="Search by name, payment mode, or submission..."
                                variant="outlined"
                                size="medium"
                                value={searchQuery}
                                onChange={handleSearch}
                                sx={{
                                    flexGrow: 1,
                                    minWidth: {xs: "100%", sm: 300},
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.background.paper,
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover
                                        }
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
                                                sx={{color: theme.palette.text.secondary}}
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
                                onClick={handleAddStaff}
                                startIcon={<AddIcon/>}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: theme.shadows[2]
                                    }
                                }}
                            >
                                Add Salary
                            </Button>

                            <Tooltip title="Download Excel">
                                <IconButton
                                    onClick={handleDownloadExcel}
                                    sx={{
                                        backgroundColor: theme.palette.background.paper,
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        },
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2
                                    }}
                                >
                                    <FileDownloadIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Paper>
                </motion.div>

                {loading ? (
                    <LoadingSkeleton/>
                ) : error ? (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.error.light
                        }}
                    >
                        {error}
                    </Alert>
                ) : (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5, delay: 0.2}}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: theme.shadows[1]
                            }}
                        >
                            <StaffSalaryList
                                staffSalary={filteredStaffList}
                                onEdit={handleEditStaff}
                                onDelete={handleDeleteStaff}
                                onView={handleViewStaff}
                            />
                        </Paper>
                    </motion.div>
                )}

                {/* Form Dialog */}
                <Dialog
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    fullWidth
                    maxWidth="md"
                    TransitionComponent={Transition}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: 2
                        }
                    }}
                >
                    <DialogTitle sx={{px: 1}}>
                        <Typography variant="h5" component="h2" fontWeight={600}>
                            {selectedStaffSalary ? 'Edit Salary Details' : 'Add New Salary'}
                        </Typography>
                    </DialogTitle>
                    <Divider sx={{my: 2}}/>
                    <DialogContent sx={{px: 1}}>
                        <StaffSalaryForm
                            staff={selectedStaffSalary}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setOpenForm(false)}
                        />
                    </DialogContent>
                </Dialog>

                {/* Details Dialog */}
                <Dialog
                    open={openDetails}
                    onClose={() => setOpenDetails(false)}
                    fullWidth
                    maxWidth="md"
                    TransitionComponent={Transition}
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: 2
                        }
                    }}
                >
                    <DialogTitle sx={{px: 1}}>
                        <Typography variant="h5" component="h2" fontWeight={600}>
                            Salary Details
                        </Typography>
                    </DialogTitle>
                    <Divider sx={{my: 2}}/>
                    <DialogContent sx={{px: 1}}>
                        {selectedStaffSalary ? (
                            <Box sx={{py: 2}}>
                                <Table>
                                    <TableBody>
                                        {[
                                            {label: "Name", value: selectedStaffSalary.name},
                                            {label: "Payment Mode", value: selectedStaffSalary.paymentMode},
                                            {label: "Transaction ID", value: selectedStaffSalary.transactionId},
                                            {label: "Month", value: selectedStaffSalary.month},
                                            {label: "Basic Salary", value: selectedStaffSalary.basicSalary},
                                            {label: "Deductions", value: selectedStaffSalary.deductions},
                                            {label: "Net Salary", value: selectedStaffSalary.netSalary},
                                            {label: "Bank Account Name", value: selectedStaffSalary.bankAccountName},
                                            {
                                                label: "Bank Account Number",
                                                value: selectedStaffSalary.bankAccountNumber
                                            },
                                            {label: "IFSC Code", value: selectedStaffSalary.bankIfsc},
                                            {label: "School ID", value: selectedStaffSalary.schoolId},
                                            {label: "Session", value: selectedStaffSalary.session},
                                        ].map((item) => (
                                            <TableRow key={item.label}>
                                                <TableCell
                                                    sx={{
                                                        border: 'none',
                                                        pl: 0,
                                                        py: 1.5,
                                                        color: theme.palette.text.secondary,
                                                        width: '40%'
                                                    }}
                                                >
                                                    {item.label}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        border: 'none',
                                                        py: 1.5,
                                                        color: theme.palette.text.primary,
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    {item.value || "Not available"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        ) : (
                            <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                                <CircularProgress/>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{width: "100%"}}
                        elevation={6}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Fade>
    );
};

export default StaffSalaryPage;
