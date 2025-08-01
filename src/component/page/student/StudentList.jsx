import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {
    alpha,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Fade,
    Grid,
    Grow,
    IconButton,
    Paper,
    Skeleton,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {deleteStudent} from "./redux/studentActions";
import {motion} from "framer-motion";

// Enhanced Styled Components
const StyledTableContainer = styled(TableContainer)(({theme}) => ({
    borderRadius: 24,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
    },
    '& .MuiTable-root': {
        borderCollapse: 'separate',
        borderSpacing: '0 8px',
    }
}));

const StyledTableCell = styled(TableCell)(({theme}) => ({
    padding: theme.spacing(2),
    borderBottom: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease-in-out',
    '&.MuiTableCell-head': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontWeight: 600,
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: 'none',
        '&:first-of-type': {
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
        },
        '&:last-of-type': {
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
        },
    }
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        backgroundColor: alpha(theme.palette.primary.light, 0.05),
    },
    '& td:first-of-type': {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    '& td:last-of-type': {
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
    }
}));

const ActionButton = styled(IconButton)(({theme}) => ({
    width: 36,
    height: 36,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.1)',
    }
}));

const StyledAvatar = styled(Avatar)(({theme}) => ({
    width: 40,
    height: 40,
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.1) rotate(5deg)',
    }
}));

const StyledDialog = styled(Dialog)(({theme}) => ({
    '& .MuiDialog-paper': {
        borderRadius: 24,
        padding: theme.spacing(2),
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        background: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(20px)',
    }
}));

const StudentList = ({
                         studentList,
                         handleEdit,
                         handleDelete,
                         handleView,
                         loading,
                     }) => {
    const dispatch = useDispatch();
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const navigate = useNavigate();

    const handleOpenDialog = (student) => {
        setSelectedStudent(student);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleDeleteClick = (student) => {
        setStudentToDelete(student);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (studentToDelete) {
            dispatch(deleteStudent(studentToDelete.id));
            setDeleteDialogOpen(false);
            setStudentToDelete(null);
            toast.success("Student deleted successfully!");
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
    };

    const convertByteArrayToBase64 = (byteArray) => {
        if (!byteArray) return '';
        if (typeof byteArray === 'string' && byteArray.startsWith('data:image')) {
            return byteArray;
        }
        return `data:image/jpeg;base64,${byteArray}`;
    };

    return (
        <Box component={motion.div} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}}>
            <StyledTableContainer component={Paper}>
                {loading ? (
                    <Box p={3}>
                        <Skeleton variant="rectangular" height={56} sx={{borderRadius: 2, mb: 2}}/>
                        {Array.from(new Array(5)).map((_, index) => (
                            <Skeleton
                                key={index}
                                variant="rectangular"
                                height={72}
                                sx={{borderRadius: 2, mb: 1}}
                            />
                        ))}
                    </Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Photo</StyledTableCell>
                                <StyledTableCell>Name</StyledTableCell>
                                <StyledTableCell>Parents</StyledTableCell>
                                <StyledTableCell>Roll No</StyledTableCell>
                                <StyledTableCell>Class</StyledTableCell>
                                <StyledTableCell>Class Teacher</StyledTableCell>
                                <StyledTableCell>Address</StyledTableCell>
                                <StyledTableCell>Bus Route</StyledTableCell>
                                <StyledTableCell align="center">Actions</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentList.length === 0 ? (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={6} align="center">
                                        <Typography variant="body1" color="textSecondary">
                                            No students found
                                        </Typography>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ) : (
                                studentList.map((student) => (
                                    <Fade key={student.id} in timeout={300}>
                                        <StyledTableRow>
                                            <StyledTableCell>
                                                <StyledAvatar
                                                    src={
                                                        student?.studentPhoto
                                                            ? convertByteArrayToBase64(student.studentPhoto)
                                                            : null
                                                    }
                                                    alt={student?.studentName}
                                                />
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {student.studentName}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {student.fatherName}, {student.motherName}
                                                </Typography>
                                            </StyledTableCell>
                                            <StyledTableCell>{student.rollNo}</StyledTableCell>
                                            <StyledTableCell>{student.className}</StyledTableCell>
                                            <StyledTableCell>{student.classTeacher}</StyledTableCell>
                                            <StyledTableCell>{student.address}</StyledTableCell>
                                            <StyledTableCell>{student.busRoute}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                <Box display="flex" gap={1} justifyContent="center">
                                                    <Tooltip title="View Details" arrow>
                                                        <ActionButton
                                                            onClick={() => handleOpenDialog(student)}
                                                            sx={{color: 'info.main'}}
                                                        >
                                                            <VisibilityIcon/>
                                                        </ActionButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Student" arrow>
                                                        <ActionButton
                                                            onClick={() => handleEdit(student)}
                                                            sx={{color: 'warning.main'}}
                                                        >
                                                            <EditIcon/>
                                                        </ActionButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Student" arrow>
                                                        <ActionButton
                                                            onClick={() => handleDeleteClick(student)}
                                                            sx={{color: 'error.main'}}
                                                        >
                                                            <DeleteIcon/>
                                                        </ActionButton>
                                                    </Tooltip>
                                                </Box>
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    </Fade>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </StyledTableContainer>

            {/* View Details Dialog */}
            <StyledDialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Grow}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" component="div" fontWeight="bold">
                            Student Details
                        </Typography>
                        <IconButton onClick={handleCloseDialog} size="small">
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedStudent && (
                        <Box sx={{mt: 2}}>
                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                <StyledAvatar
                                    src={
                                        selectedStudent?.studentPhoto
                                            ? convertByteArrayToBase64(selectedStudent.studentPhoto)
                                            : null
                                    }
                                    sx={{width: 80, height: 80}}
                                />
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {selectedStudent.studentName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {`Class ${selectedStudent.className} | Roll No: ${selectedStudent.rollNo}`}
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <DetailItem label="Parents"
                                            value={`${selectedStudent.fatherName}, ${selectedStudent.motherName}`}/>
                                <DetailItem label="Class Teacher" value={selectedStudent.classTeacher}/>
                                <DetailItem label="Mobile" value={selectedStudent.mobileNo}/>
                                <DetailItem label="Email" value={selectedStudent.email}/>
                                <DetailItem label="Address" value={selectedStudent.address}/>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </StyledDialog>

            {/* Delete Confirmation Dialog */}
            <StyledDialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                TransitionComponent={Grow}
            >
                <DialogTitle>
                    <Typography variant="h6" component="div" fontWeight="bold">
                        Confirm Delete
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this student? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteCancel}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </StyledDialog>

            <ToastContainer position="top-right" autoClose={3000}/>
        </Box>
    );
};

// Helper component for detail items
const DetailItem = ({label, value}) => (
    <>
        <Grid item xs={4}>
            <Typography variant="body1" fontWeight="bold" color="textSecondary">
                {label}:
            </Typography>
        </Grid>
        <Grid item xs={8}>
            <Typography variant="body1">{value || 'N/A'}</Typography>
        </Grid>
    </>
);

export default StudentList;
