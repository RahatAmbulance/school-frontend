import React, {useState} from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Fade,
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
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {useDispatch} from "react-redux";
import {deleteDailyTask} from "./redux/DailyTaskActions";

const DailyTaskList = ({dailyTaskList, onEdit, onView}) => {
    const [open, setOpen] = useState(false);
    const [selectedDailyTask, setSelectedDailyTask] = useState(null);
    const [dailyTasks, setDailyTasks] = useState(dailyTaskList);
    const [taskToDelete, SetTaskToDelete] = useState(null);
    const theme = useTheme();
    const dispatch = useDispatch();

    const handleClickOpen = (id) => {
        SetTaskToDelete(id);
        setSelectedDailyTask(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedDailyTask(null);
    };

    const handleToastDelete = () => {
        if (taskToDelete) {
            dispatch(deleteDailyTask(taskToDelete))
                .then(() => {
                    toast.success("Daily Task deleted successfully.");
                    handleClose();
                })
                .catch((error) => {
                    console.error("Error deleting Task:", error);
                    toast.error("Failed to delete the Task. Please try again.");
                    handleClose();
                });
        }
    };

    const tableHeaderStyle = {
        fontWeight: 600,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
    };

    const tableCellStyle = {
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{width: '100%', overflow: 'hidden', borderRadius: 2}}>
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            boxShadow: 6,
                        },
                    }}
                >
                    <TableContainer sx={{maxHeight: 520, overflowX: 'auto'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderStyle}>Type</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Title</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Message</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Created Date</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Staff Name</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Class Name</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Section</TableCell>
                                    <TableCell sx={tableHeaderStyle}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dailyTasks.map((dailyTask, index) => (
                                    <TableRow
                                        key={dailyTask.id}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'white',
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                            },
                                        }}
                                    >
                                        <TableCell sx={tableCellStyle}>{dailyTask.type}</TableCell>
                                        <TableCell sx={tableCellStyle}>{dailyTask.title}</TableCell>
                                        <TableCell sx={tableCellStyle}>{dailyTask.message}</TableCell>
                                        <TableCell sx={tableCellStyle}>
                                            {new Date(dailyTask.createdDate).toLocaleDateString("en-US", {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell sx={tableCellStyle}>{dailyTask.staffName}</TableCell>
                                        <TableCell sx={tableCellStyle}>{dailyTask.className}</TableCell>
                                        <TableCell sx={tableCellStyle}>{dailyTask.section}</TableCell>
                                        <TableCell>
                                            <Box sx={{display: 'flex', gap: 1}}>
                                                <Tooltip title="View Details" arrow>
                                                    <IconButton
                                                        onClick={() => onView(dailyTask)}
                                                        size="small"
                                                        sx={{
                                                            color: theme.palette.info.main,
                                                            '&:hover': {backgroundColor: theme.palette.info.light},
                                                        }}
                                                    >
                                                        <VisibilityIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Task" arrow>
                                                    <IconButton
                                                        onClick={() => onEdit(dailyTask)}
                                                        size="small"
                                                        sx={{
                                                            color: theme.palette.warning.main,
                                                            '&:hover': {backgroundColor: theme.palette.warning.light},
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Task" arrow>
                                                    <IconButton
                                                        onClick={() => handleClickOpen(dailyTask.id)}
                                                        size="small"
                                                        sx={{
                                                            color: theme.palette.error.main,
                                                            '&:hover': {backgroundColor: theme.palette.error.light},
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small"/>
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

                <Dialog
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    transitionDuration={300}
                    PaperProps={{
                        elevation: 5,
                        sx: {
                            borderRadius: 3,
                            padding: 2,
                            minWidth: '300px',
                        },
                    }}
                >
                    <DialogContent sx={{textAlign: 'center', py: 3}}>
                        <Typography variant="h6" component="div" sx={{mb: 2, color: theme.palette.error.main}}>
                            Confirm Deletion
                        </Typography>
                        <DialogContentText>
                            Are you sure you want to delete this task?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{justifyContent: 'center', pb: 3, gap: 2}}>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: theme.palette.grey[100],
                                },
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
                                px: 3,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: theme.palette.error.dark,
                                },
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                <ToastContainer
                    position="top-right"
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
            </Box>
        </Fade>
    );
};

export default DailyTaskList;
