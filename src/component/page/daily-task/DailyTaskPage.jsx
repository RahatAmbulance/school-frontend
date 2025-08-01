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
    styled,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {useDispatch, useSelector} from "react-redux";
import {createDailyTask, deleteDailyTask, fetchDailyTask, updateDailyTask,} from "./redux/DailyTaskActions";
import DailyTaskList from "./DailyTaskList";
import DailyTaskForm from "./DailyTaskForm";
import * as XLSX from "xlsx";
import ClearIcon from "@mui/icons-material/Clear";
import {selectSchoolDetails} from "../../../common";

// Styled Components
const StyledContainer = styled(Container)(({theme}) => ({
    padding: theme.spacing(3),
    minHeight: '100vh',
    '& .MuiPaper-root': {
        borderRadius: 12,
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
    }
}));

const SearchContainer = styled(Paper)(({theme}) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: '#fff',
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: 8,
    padding: theme.spacing(1, 3),
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    }
}));

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        padding: theme.spacing(2),
    }
}));

const DetailRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '& td': {
        padding: theme.spacing(2),
    }
}));

const DailyTaskPage = ({items = []}) => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedDailyTask, setSelectedDailyTask] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredItems, setFilteredItems] = useState(items);
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {dailyTaskList, loading, error} = useSelector(
        (state) => state.dailyTask
    );
    const [imageSrc, setImageSrc] = useState(selectedDailyTask?.docs || '');

    useEffect(() => {
        // Reset the image source when selectedDailyTask changes
        setImageSrc(selectedDailyTask?.docs || '');
    }, [selectedDailyTask]);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchDailyTask(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddDailyTask = () => {
        setSelectedDailyTask(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setFilteredItems(items);
    };

    const handleEditDailyTask = (dailyTask) => {
        console.log("On Edit Block");
        console.log(dailyTask);
        setSelectedDailyTask(dailyTask); // Ensure selected task is passed to form
        setOpenForm(true); // Open the form
    };

    const handleViewDailyTask = (dailyTask) => {
        setSelectedDailyTask(dailyTask);
        setOpenDetails(true);
    };

    const handleFormSubmit = (formData) => {
        if (formData.id) {
            dispatch(updateDailyTask(formData.id, formData));
        } else {
            dispatch(createDailyTask(formData));
        }
        setOpenForm(false);
    };

    const handleDeleteDailyTask = (id) => {
        dispatch(deleteDailyTask(id));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        console.log("Search Query:", e.target.value);
    };

    // Enhanced Excel export with subject field
    const handleDownloadExcel = () => {
        const filteredData = dailyTaskList.map(
            ({
                 docs,
                 identificationDocuments,
                 educationalCertificate,
                 professionalQualifications,
                 experienceCertificates,
                 bankAccount,
                 previousEmployer,
                 message, // Add other fields that may contain long texts
                 ...rest
             }) => ({
                ...rest, // Include only the remaining fields
            })
        );

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DailyTask");
        XLSX.writeFile(workbook, "DailyTask.xlsx");
    };

    // Enhanced filtering to include subject field
    const filteredDailyTaskList = Array.isArray(dailyTaskList)
        ? dailyTaskList.filter((dailyTask) => {
            const type = dailyTask.type?.toLowerCase() || "";
            const title = dailyTask.title?.toLowerCase() || "";
            const className = dailyTask.className?.toLowerCase() || "";
            const subject = dailyTask.subject?.toLowerCase() || ""; // Added subject field
            const message = dailyTask.message?.toLowerCase() || ""; // Added message field for better search
            const query = searchQuery.toLowerCase();

            return (
                type.includes(query) ||
                title.includes(query) ||
                className.includes(query) ||
                subject.includes(query) ||
                message.includes(query)
            );
        })
        : [];

    return (
        <StyledContainer maxWidth="lg">
            <Box sx={{minHeight: '200px'}}>
                {loading ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{borderRadius: 2}}/>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{borderRadius: 2}}/>
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{borderRadius: 2}}/>
                    </Box>
                ) : error ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="60vh"
                    >
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {error}
                        </Alert>
                    </Box>
                ) : (
                    <>
                        <SearchContainer elevation={0}>
                            <TextField
                                label="Search by Subject, Type, Title, Message, or Class"
                                variant="outlined"
                                value={searchQuery}
                                onChange={handleSearch}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action"/>
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="clear"
                                                onClick={handleClearSearch}
                                                size="small"
                                            >
                                                <ClearIcon/>
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: {borderRadius: 2}
                                }}
                            />
                            <ActionButton
                                variant="contained"
                                color="primary"
                                onClick={handleAddDailyTask}
                                startIcon={<AddCircleOutlineIcon/>}
                            >
                                Add Assignment
                            </ActionButton>
                            <Tooltip title="Download all Daily Task details">
                                <ActionButton
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleDownloadExcel}
                                    startIcon={<FileDownloadIcon/>}
                                >
                                    Export
                                </ActionButton>
                            </Tooltip>
                        </SearchContainer>

                        <Paper elevation={0} sx={{p: 2, borderRadius: 3}}>
                            <DailyTaskList
                                dailyTaskList={filteredDailyTaskList}
                                onEdit={handleEditDailyTask}
                                onDelete={handleDeleteDailyTask}
                                onView={handleViewDailyTask}
                            />
                        </Paper>

                        <StyledDialog
                            open={openForm}
                            onClose={() => setOpenForm(false)}
                            fullWidth
                            maxWidth="md"
                        >
                            <DialogTitle sx={{
                                pb: 2,
                                borderBottom: '1px solid rgba(0,0,0,0.1)',
                                typography: 'h5',
                                fontWeight: 600
                            }}>
                                {selectedDailyTask ? "Edit Daily Task" : "Add Daily Task"}
                            </DialogTitle>
                            <DialogContent sx={{mt: 2}}>
                                <DailyTaskForm
                                    dailyTask={selectedDailyTask}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => setOpenForm(false)}
                                />
                            </DialogContent>
                        </StyledDialog>

                        <StyledDialog
                            open={openDetails}
                            onClose={() => setOpenDetails(false)}
                            fullWidth
                            maxWidth="md"
                        >
                            <DialogTitle sx={{
                                textAlign: "center",
                                position: "relative",
                                pb: 2,
                                borderBottom: '1px solid rgba(0,0,0,0.1)',
                                typography: 'h5',
                                fontWeight: 600
                            }}>
                                Daily Activities Details
                                <IconButton
                                    aria-label="close"
                                    onClick={() => setOpenDetails(false)}
                                    sx={{
                                        position: "absolute",
                                        right: 8,
                                        top: 8,
                                    }}
                                >
                                    <CloseIcon/>
                                </IconButton>
                            </DialogTitle>
                            <DialogContent sx={{mt: 2}}>
                                {selectedDailyTask ? (
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        textAlign: "center",
                                        minHeight: "200px",
                                    }}>
                                        <Table>
                                            <TableBody>
                                                {[
                                                    {label: "Subject", value: selectedDailyTask.subject}, // Added subject field
                                                    {label: "Type", value: selectedDailyTask.type},
                                                    {label: "Title", value: selectedDailyTask.title},
                                                    {
                                                        label: "File Uploaded",
                                                        value: imageSrc ? (
                                                            <Box sx={{
                                                                p: 1,
                                                                border: '1px solid rgba(0,0,0,0.1)',
                                                                borderRadius: 2,
                                                                display: 'inline-block'
                                                            }}>
                                                                <img
                                                                    src={imageSrc}
                                                                    alt="Uploaded Document"
                                                                    onError={() => setImageSrc('/path/to/default/image.png')}
                                                                    style={{
                                                                        width: '120px',
                                                                        height: 'auto',
                                                                        objectFit: 'contain',
                                                                        borderRadius: '4px'
                                                                    }}
                                                                />
                                                            </Box>
                                                        ) : (
                                                            <Typography color="text.secondary">No file
                                                                uploaded</Typography>
                                                        ),
                                                    },
                                                    {label: "Message", value: selectedDailyTask.message},
                                                    {label: "Staff Name", value: selectedDailyTask.staffName},
                                                    {label: "Class Name", value: selectedDailyTask.className},
                                                    {label: "Section", value: selectedDailyTask.section},
                                                    {label: "Date of Creation", value: selectedDailyTask.createdDate},
                                                ].map((item) => (
                                                    <DetailRow key={item.label}>
                                                        <TableCell sx={{fontWeight: 600, width: '30%'}}>
                                                            {item.label}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.value || (
                                                                <Typography color="text.secondary">Not
                                                                    available</Typography>
                                                            )}
                                                        </TableCell>
                                                    </DetailRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                ) : (
                                    <Skeleton variant="rectangular" width="100%" height={200} sx={{borderRadius: 2}}/>
                                )}
                            </DialogContent>
                        </StyledDialog>
                    </>
                )}
            </Box>
        </StyledContainer>
    );
};

export default DailyTaskPage;
