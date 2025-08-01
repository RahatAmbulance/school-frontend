import React, {useEffect, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Collapse,
    Fade,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    Link,
    MenuItem,
    Modal,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import {alpha, styled} from "@mui/material/styles";
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from 'react-toastify';
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import {useDispatch} from "react-redux";
import {formatDate} from "../../../commonStyle";
import {deleteEnquiry, updateEnquiry} from "./redux/enquiryActions.js";
import MasterJson from "../../masterfile/MasterJson.json";
import {GridCloseIcon} from "@mui/x-data-grid";

// Enhanced Styled Components
const StyledCard = styled(Card)(({theme}) => ({
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 48px rgba(0, 0, 0, 0.12)",
    },
}));

const StatusChip = styled(Chip)(({theme, status}) => {
    const getStatusColor = () => {
        switch (status?.toLowerCase()) {
            case "open":
                return {bg: "#fff3e0", color: "#e65100", borderColor: "#ffb74d"};
            case "in-progress":
                return {bg: "#e3f2fd", color: "#1565c0", borderColor: "#64b5f6"};
            case "closed":
                return {bg: "#e8f5e9", color: "#2e7d32", borderColor: "#81c784"};
            default:
                return {bg: "#f5f5f5", color: "#616161", borderColor: "#bdbdbd"};
        }
    };
    const colors = getStatusColor();
    return {
        backgroundColor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.borderColor}`,
        fontWeight: 600,
        borderRadius: "16px",
        padding: "8px 16px",
        height: "auto",
        "& .MuiChip-label": {
            padding: "0",
        },
    };
});

const ActionButton = styled(IconButton)(({theme, color}) => ({
    backgroundColor: alpha(theme.palette[color].main, 0.1),
    color: theme.palette[color].main,
    transition: "all 0.2s ease",
    "&:hover": {
        backgroundColor: alpha(theme.palette[color].main, 0.2),
        transform: "scale(1.1)",
    },
}));

const StudentAvatar = styled(Avatar)(({theme}) => ({
    width: 56,
    height: 56,
    backgroundColor: theme.palette.primary.main,
    fontSize: "1.5rem",
    fontWeight: 600,
}));

const InfoIcon = styled(Box)(({theme}) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: theme.palette.text.secondary,
    "& svg": {
        fontSize: "1.2rem",
    },
}));

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    borderRadius: "24px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    p: 4,
    width: "auto",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflow: "auto",
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({theme}) => ({
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
    '& .MuiToggleButton-root': {
        borderRadius: theme.spacing(2),
        margin: theme.spacing(0, 1),
        padding: theme.spacing(1, 3),
        textTransform: 'none',
        '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            '&:hover': {
                backgroundColor: theme.palette.primary.dark,
            },
        },
    },
}));

const EnquiryTable = ({filteredEnquiries}) => {
    const [studentsData, setStudentsData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [openModal, setOpenModal] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [enquiryStatusValue, setEnquiryStatusValue] = useState("");
    const [expandedCards, setExpandedCards] = useState({});
    const theme = useTheme();
    const dispatch = useDispatch();

    useEffect(() => {
        setStudentsData(filteredEnquiries);
    }, [filteredEnquiries]);

    const handleStatusChange = (event, newStatus) => {
        if (newStatus !== null) {
            setSelectedStatus(newStatus);
        }
    };

    const filteredStudents = studentsData.filter(student => {
        if (selectedStatus === 'all') return true;
        return student.enquiryStatus?.toLowerCase() === selectedStatus.toLowerCase();
    });

    const handleExpandClick = (studentId) => {
        setExpandedCards(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleOpenModal = (action, student) => {
        setSelectedStudent(student);
        setSelectedAction(action);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedAction("");
        setSelectedStudent(null);
    };

    const handleToastDelete = () => {
        if (selectedStudent?.id) {
            dispatch(deleteEnquiry(selectedStudent.id))
                .then(() => {
                    toast.success("Enquiry deleted successfully");
                    handleCloseModal();
                })
                .catch((error) => {
                    console.error("Error deleting enquiry:", error);
                    toast.error("Failed to delete the enquiry. Please try again.");
                    handleCloseModal();
                });
        }
    };

    const handleSubmitForStatus = async (event) => {
        event.preventDefault();
        try {
            const updatedStudent = {
                ...selectedStudent,
                enquiryStatus: enquiryStatusValue,
            };
            await dispatch(updateEnquiry(updatedStudent));
            toast.success("Status updated successfully");
            handleCloseModal();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status. Please try again.");
        }
    };

    const renderModalContent = () => {
        if (!selectedStudent) return null;

        const fullName = `${selectedStudent.firstName} ${selectedStudent.lastName}`;

        switch (selectedAction) {
            case "View":
                return (
                    <Fade in>
                        <Box>
                            <Typography
                                variant="h4"
                                gutterBottom
                                sx={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: theme.palette.primary.main,
                                    mb: 4,
                                }}
                            >
                                Student Details
                            </Typography>
                            <Grid container spacing={3}>
                                {[
                                    {label: "Full Name", value: fullName},
                                    {
                                        label: "Email",
                                        value: (
                                            <Link
                                                href={`mailto:${selectedStudent.email}`}
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    textDecoration: "none",
                                                    fontWeight: 500,
                                                    "&:hover": {
                                                        textDecoration: "underline",
                                                    },
                                                }}
                                            >
                                                {selectedStudent.email}
                                            </Link>
                                        ),
                                    },
                                    {label: "Date of Birth", value: selectedStudent.dob || "N/A"},
                                    {label: "Class", value: selectedStudent.studentClass},
                                    {
                                        label: "Enquiry Status",
                                        value: (
                                            <StatusChip
                                                label={selectedStudent.enquiryStatus}
                                                status={selectedStudent.enquiryStatus}
                                            />
                                        ),
                                    },
                                    {label: "Gender", value: selectedStudent.gender},
                                    {label: "Nationality", value: selectedStudent.nationality},
                                    {
                                        label: "Address",
                                        value: `${selectedStudent.address}, ${selectedStudent.city}, ${selectedStudent.state}, ${selectedStudent.country} - ${selectedStudent.pincode}`,
                                    },
                                    {label: "Mother's Name", value: selectedStudent.motherName},
                                    {label: "Mother's Occupation", value: selectedStudent.motherOccupation},
                                    {label: "Mother's Mobile", value: selectedStudent.motherMobile},
                                    {label: "Father's Name", value: selectedStudent.fatherName},
                                    {label: "Father's Occupation", value: selectedStudent.fatherOccupation || "N/A"},
                                    {label: "Father's Mobile", value: selectedStudent.fatherMobile},
                                    {
                                        label: "Enquiry Creation Date",
                                        value: new Date(selectedStudent.creationDateTime).toLocaleString(),
                                    },
                                    {label: "Remark", value: selectedStudent.remark || "N/A"},
                                ].map((item, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {item.label}
                                        </Typography>
                                        <Typography variant="body1" sx={{mt: 1}}>
                                            {item.value}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Fade>
                );

            case "Status":
                return (
                    <Fade in>
                        <Box>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={{color: theme.palette.primary.main, fontWeight: 600}}
                            >
                                Update Status for {fullName}
                            </Typography>
                            <form onSubmit={handleSubmitForStatus}>
                                <FormControl fullWidth sx={{mt: 2}}>
                                    <InputLabel>Enquiry Status</InputLabel>
                                    <Select
                                        value={enquiryStatusValue}
                                        onChange={(e) => setEnquiryStatusValue(e.target.value)}
                                        required
                                        label="Enquiry Status"
                                    >
                                        {MasterJson.enquiry.map((status) => (
                                            <MenuItem key={status.name} value={status.name}>
                                                {status.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Box sx={{mt: 3, display: "flex", justifyContent: "flex-end"}}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            borderRadius: "8px",
                                            textTransform: "none",
                                            px: 4,
                                        }}
                                    >
                                        Update Status
                                    </Button>
                                </Box>
                            </form>
                        </Box>
                    </Fade>
                );

            case "Delete":
                return (
                    <Fade in>
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Are you sure you want to delete this enquiry?
                            </Typography>
                            <Typography color="text.secondary" sx={{mb: 3}}>
                                This action cannot be undone.
                            </Typography>
                            <Box sx={{display: "flex", justifyContent: "flex-end", gap: 2}}>
                                <Button
                                    onClick={handleCloseModal}
                                    variant="outlined"
                                    sx={{borderRadius: "8px", textTransform: "none"}}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleToastDelete}
                                    variant="contained"
                                    color="error"
                                    sx={{borderRadius: "8px", textTransform: "none"}}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Box sx={{mb: 4}}>
                <StyledToggleButtonGroup
                    value={selectedStatus}
                    exclusive
                    onChange={handleStatusChange}
                    aria-label="enquiry status filter"
                >
                    <ToggleButton value="all">
                        All
                    </ToggleButton>
                    <ToggleButton value="open">
                        Open
                    </ToggleButton>
                    <ToggleButton value="in-progress">
                        In Progress
                    </ToggleButton>
                    <ToggleButton value="closed">
                        Closed
                    </ToggleButton>
                </StyledToggleButtonGroup>
            </Box>

            <Grid container spacing={2}>
                {filteredStudents.map((student, index) => (
                    <Grid item xs={12} key={student.id || index}>
                        <StyledCard>
                            <Grid container spacing={2} alignItems="center">
                                {/* Left Section - Avatar and Name */}
                                <Grid item xs={12} sm={3}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <StudentAvatar>
                                            {student.firstName?.[0]}
                                            {student.lastName?.[0]}
                                        </StudentAvatar>
                                        <Box>
                                            <Typography variant="h6" sx={{mb: 0.5}}>
                                                {student.firstName} {student.lastName}
                                            </Typography>
                                            <StatusChip
                                                label={student.enquiryStatus}
                                                status={student.enquiryStatus}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Middle Section - Basic Info */}
                                <Grid item xs={12} sm={6}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <InfoIcon>
                                                <SchoolIcon/>
                                                <Typography variant="body2">
                                                    Class: {student.studentClass}
                                                </Typography>
                                            </InfoIcon>
                                            <InfoIcon sx={{mt: 1}}>
                                                <PhoneIcon/>
                                                <Link
                                                    href={`tel:${student.phoneNumber}`}
                                                    sx={{
                                                        color: "primary.main",
                                                        textDecoration: "none",
                                                        "&:hover": {
                                                            textDecoration: "underline",
                                                        },
                                                    }}
                                                >
                                                    {student.phoneNumber}
                                                </Link>
                                            </InfoIcon>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <InfoIcon>
                                                <EmailIcon/>
                                                <Link
                                                    href={`mailto:${student.email}`}
                                                    sx={{
                                                        color: "primary.main",
                                                        textDecoration: "none",
                                                        "&:hover": {
                                                            textDecoration: "underline",
                                                        },
                                                    }}
                                                >
                                                    {student.email}
                                                </Link>
                                            </InfoIcon>
                                            <InfoIcon sx={{mt: 1}}>
                                                <CalendarTodayIcon/>
                                                <Typography variant="body2">
                                                    {formatDate(student.creationDateTime)}
                                                </Typography>
                                            </InfoIcon>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                {/* Right Section - Actions */}
                                <Grid item xs={12} sm={3}>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="View Details">
                                            <ActionButton
                                                size="small"
                                                color="info"
                                                onClick={() => handleOpenModal("View", student)}
                                            >
                                                <VisibilityIcon/>
                                            </ActionButton>
                                        </Tooltip>
                                        <Tooltip title="Update Status">
                                            <ActionButton
                                                size="small"
                                                color="warning"
                                                onClick={() => handleOpenModal("Status", student)}
                                            >
                                                <UpdateIcon/>
                                            </ActionButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Enquiry">
                                            <ActionButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleOpenModal("Delete", student)}
                                            >
                                                <DeleteIcon/>
                                            </ActionButton>
                                        </Tooltip>
                                        <Tooltip title={expandedCards[student.id] ? "Show Less" : "Show More"}>
                                            <ActionButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleExpandClick(student.id)}
                                            >
                                                {expandedCards[student.id] ? (
                                                    <KeyboardArrowUpIcon/>
                                                ) : (
                                                    <KeyboardArrowDownIcon/>
                                                )}
                                            </ActionButton>
                                        </Tooltip>
                                    </Stack>
                                </Grid>
                            </Grid>

                            {/* Collapsible Section */}
                            <Collapse in={expandedCards[student.id]} timeout="auto" unmountOnExit>
                                <Box sx={{mt: 2, pt: 2, borderTop: 1, borderColor: 'divider'}}>
                                    <Grid container spacing={3}>
                                        {/* Parents Information */}
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600}}>
                                                Parents Information
                                            </Typography>
                                            <Stack spacing={2}>
                                                <Box>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Father's Details
                                                    </Typography>
                                                    <InfoIcon>
                                                        <PersonIcon/>
                                                        <Typography variant="body2">
                                                            {student.fatherName}
                                                        </Typography>
                                                    </InfoIcon>
                                                    <InfoIcon>
                                                        <WorkIcon/>
                                                        <Typography variant="body2">
                                                            {student.fatherOccupation || 'N/A'}
                                                        </Typography>
                                                    </InfoIcon>
                                                    <InfoIcon>
                                                        <PhoneIcon/>
                                                        <Typography variant="body2">
                                                            {student.fatherMobile}
                                                        </Typography>
                                                    </InfoIcon>
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Mother's Details
                                                    </Typography>
                                                    <InfoIcon>
                                                        <PersonIcon/>
                                                        <Typography variant="body2">
                                                            {student.motherName}
                                                        </Typography>
                                                    </InfoIcon>
                                                    <InfoIcon>
                                                        <WorkIcon/>
                                                        <Typography variant="body2">
                                                            {student.motherOccupation || 'N/A'}
                                                        </Typography>
                                                    </InfoIcon>
                                                    <InfoIcon>
                                                        <PhoneIcon/>
                                                        <Typography variant="body2">
                                                            {student.motherMobile}
                                                        </Typography>
                                                    </InfoIcon>
                                                </Box>
                                            </Stack>
                                        </Grid>

                                        {/* Additional Information */}
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600}}>
                                                Additional Information
                                            </Typography>
                                            <Stack spacing={1}>
                                                <InfoIcon>
                                                    <LocationOnIcon/>
                                                    <Typography variant="body2">
                                                        {student.address}, {student.city}, {student.state}, {student.country} - {student.pincode}
                                                    </Typography>
                                                </InfoIcon>
                                                {student.nationality && (
                                                    <Typography variant="body2">
                                                        Nationality: {student.nationality}
                                                    </Typography>
                                                )}
                                                {student.remark && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Remark: {student.remark}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Collapse>
                        </StyledCard>
                    </Grid>
                ))}
            </Grid>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                closeAfterTransition
            >
                <Fade in={openModal}>
                    <Box sx={modalStyle}>
                        {selectedStudent && renderModalContent()}
                        <IconButton
                            onClick={handleCloseModal}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: "grey.500",
                                backgroundColor: "rgba(0, 0, 0, 0.04)",
                                "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                                },
                            }}
                        >
                            <GridCloseIcon/>
                        </IconButton>
                    </Box>
                </Fade>
            </Modal>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
};

export default EnquiryTable;
