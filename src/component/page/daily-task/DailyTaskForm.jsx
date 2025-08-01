import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {
    Box,
    Button,
    Container,
    Fade,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {styled} from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Styled components
const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease-in-out",
    "&:hover": {
        transform: "translateY(-2px)",
    },
}));

const StyledFormControl = styled(FormControl)(({theme}) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 12,
        transition: "all 0.2s",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.01)",
        },
    },
    "& .MuiInputLabel-root": {
        transition: "all 0.2s",
    },
}));

const UploadButton = styled(Button)(({theme}) => ({
    borderRadius: 12,
    padding: theme.spacing(1.5, 3),
    boxShadow: "none",
    transition: "all 0.2s",
    "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: 8,
    padding: theme.spacing(1, 4),
    transition: "all 0.2s",
    "&:hover": {
        transform: "translateY(-1px)",
    },
}));

const DailyTaskForm = ({dailyTask, onSubmit, onCancel}) => {
    const [formData, setFormData] = useState({
        id: "", // Ensure id is included
        type: "",
        subject: "", // Subject field
        title: "",
        message: "",
        creationDateTime: dayjs().tz("Asia/Kolkata"),
        docs: null,
        staffId: "",
        staffName: "",
        className: "",
        section: "",
    });
    const localDateTime = dayjs(); // This gets the current local date and time

    const classSections = useSelector((state) => state.master.data.classSections);
    const sections = useSelector((state) => state.master.data.sections);

    useEffect(() => {
        if (dailyTask) {
            setFormData({
                ...dailyTask,
                creationDateTime: dailyTask.creationDateTime
                    ? dayjs.tz(dailyTask.creationDateTime, 'UTC').tz("Asia/Kolkata")
                    : dayjs().tz("Asia/Kolkata"), // Ensure it's initialized correctly
            });
        }
    }, [dailyTask]);

    console.log("classSections");
    console.log(classSections);
    console.log(JSON.stringify(classSections));
    const [selectedClsSecSubject, setSelectedClsSecSubject] = useState([]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleDateChange = (name, date) => {
        setFormData({...formData, [name]: date});
    };

    const handleClose = () => {
        if (onCancel) onCancel();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1]; // Remove the prefix and keep the base64 string
                setFormData({...formData, docs: base64String}); // Store the cleaned base64 string
            };
            reader.readAsDataURL(file); // Convert the file to base64
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requiredFields = ["type", "subject", "title", "className", "section"]; // Added subject to required fields
        const missingFields = requiredFields.filter((field) => !formData[field]);

        if (missingFields.length > 0) {
            alert(`Please fill out the following fields: ${missingFields.join(", ")}`);
            return;
        }

        // Check if message is filled with at least 2 words
        const messageWordCount = formData.message.trim().split(/\s+/).length;
        if (messageWordCount < 2) {
            alert("Please fill out the message with at least 2 or 3 words.");
            return;
        }

        // Ensure creationDateTime is in local time when submitting
        const displayLocalTime = (utcTime) => {
            return dayjs.utc(utcTime).local().format('YYYY-MM-DD HH:mm:ss'); // or any desired format
        };

        const submissionData = {
            ...formData,
            creationDateTime: localDateTime.format(), // Keep as local time for submission
        };

        onSubmit(submissionData); // Use the modified submission data
    };

    const handleSectionChange = async (e) => {
        const {name, value} = e.target;
        // Update the form values
        const updatedFormValues = {
            ...formData,
            [name]: value,
        };
    };

    return (
        <Container maxWidth="md">
            <Fade in timeout={500}>
                <StyledPaper elevation={0}>
                    <Typography
                        variant="h5"
                        gutterBottom
                        sx={{
                            mb: 4,
                            fontWeight: 600,
                            color: (theme) => theme.palette.primary.main,
                        }}
                    >
                        {formData.id ? "Update Daily Task" : "Create New Daily Task"}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <StyledFormControl fullWidth>
                                    <InputLabel id="type-label">Type Of Task</InputLabel>
                                    <Select
                                        labelId="type-label"
                                        id="type"
                                        name="type" // This should match 'type' in formData
                                        value={formData.type} // Binding the selected value to formData.type
                                        onChange={handleChange}
                                        label="Type Of Task"
                                    >
                                        <MenuItem value="Assignment">Assignment</MenuItem>
                                        <MenuItem value="Daily Activity">Daily Activity</MenuItem>
                                    </Select>
                                </StyledFormControl>
                            </Grid>

                            {/* New Subject Field */}
                            <Grid item xs={12} sm={6}>
                                <StyledFormControl fullWidth>
                                    <InputLabel id="subject-label">Subject</InputLabel>
                                    <Select
                                        labelId="subject-label"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        label="Subject"
                                    >
                                        <MenuItem value="Mathematics">Mathematics</MenuItem>
                                        <MenuItem value="English">English</MenuItem>
                                        <MenuItem value="Science">Science</MenuItem>
                                        <MenuItem value="Social Studies">Social Studies</MenuItem>
                                        <MenuItem value="Hindi">Hindi</MenuItem>
                                        <MenuItem value="Physics">Physics</MenuItem>
                                        <MenuItem value="Chemistry">Chemistry</MenuItem>
                                        <MenuItem value="Biology">Biology</MenuItem>
                                        <MenuItem value="Computer Science">Computer Science</MenuItem>
                                        <MenuItem value="Physical Education">Physical Education</MenuItem>
                                        <MenuItem value="Art & Craft">Art & Craft</MenuItem>
                                        <MenuItem value="Music">Music</MenuItem>
                                        <MenuItem value="Geography">Geography</MenuItem>
                                        <MenuItem value="History">History</MenuItem>
                                        <MenuItem value="Economics">Economics</MenuItem>
                                        <MenuItem value="Political Science">Political Science</MenuItem>
                                        <MenuItem value="Philosophy">Philosophy</MenuItem>
                                        <MenuItem value="Psychology">Psychology</MenuItem>
                                        <MenuItem value="Other">Other</MenuItem>
                                    </Select>
                                </StyledFormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    InputLabelProps={{shrink: true}}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <UploadButton
                                        variant="contained"
                                        component="label"
                                        startIcon={<CloudUploadIcon/>}
                                    >
                                        Upload Document
                                        <input
                                            type="file"
                                            hidden
                                            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/*" // Extended file types
                                            onChange={handleFileChange}
                                        />
                                    </UploadButton>
                                    {formData.docs && (
                                        <Typography
                                            variant="body2"
                                            color="success.main"
                                            sx={{display: "flex", alignItems: "center", gap: 1}}
                                        >
                                            File uploaded successfully ✓
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth variant="outlined" margin="normal">
                                        <InputLabel sx={{marginLeft: "20px"}} id="className-label">Class
                                            Name</InputLabel>
                                        <Select
                                            labelId="className-label"
                                            id="className"
                                            name="className"
                                            label="Class Name"
                                            value={formData.className}
                                            onChange={handleChange}
                                            sx={{marginLeft: "20px"}}
                                        >
                                            {classSections && classSections.length > 0 ? (
                                                classSections.map((classSection) => (
                                                    <MenuItem key={classSection.id} value={classSection.name}>
                                                        {classSection.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="" disabled>
                                                    No Classes Available
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth variant="outlined" margin="normal">
                                        <InputLabel id="select-section-label">
                                            Select Section
                                        </InputLabel>
                                        <Select
                                            labelId="select-section-label"
                                            name="section"
                                            value={formData.section}
                                            onChange={handleChange}
                                            disabled={!formData.className}
                                            label="Select Section"
                                        >
                                            {classSections?.find((cs) => cs.name === formData.className)
                                                ?.sections?.length > 0 ? (
                                                classSections
                                                    .find((cs) => cs.name === formData.className)
                                                    .sections.map((section) => (
                                                    <MenuItem key={section.id} value={section.name}>
                                                        {section.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem value="" disabled>
                                                    No Sections Available
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </StyledFormControl>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    multiline
                                    rows={4} // Adjust the number of rows as needed
                                    InputLabelProps={{shrink: true}}
                                    placeholder="Enter detailed message about the assignment or activity..."
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box
                            sx={{
                                mt: 4,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                            }}
                        >
                            <Tooltip title="Cancel">
                                <ActionButton
                                    onClick={onCancel}
                                    color="error"
                                    variant="outlined"
                                    startIcon={<CancelIcon/>}
                                >
                                    Cancel
                                </ActionButton>
                            </Tooltip>
                            <Tooltip title={formData.id ? "Update Task" : "Create Task"}>
                                <ActionButton
                                    type="submit"
                                    color="primary"
                                    variant="contained"
                                    startIcon={<SaveIcon/>}
                                >
                                    {formData.id ? "Update Task" : "Create Task"}
                                </ActionButton>
                            </Tooltip>
                        </Box>
                    </form>
                </StyledPaper>
            </Fade>
        </Container>
    );
};

export default DailyTaskForm;
