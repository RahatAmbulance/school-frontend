import React, {useEffect, useState} from "react";
import {
    alpha,
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {api, selectSchoolDetails} from "../../../common";
import {AnimatePresence, motion} from "framer-motion";
import {useSelector} from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SubjectIcon from "@mui/icons-material/Subject";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";

const ExamForm = ({examId, onSave}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector((state) => state.master.data.classSections);
    const [errors, setErrors] = useState({});
    const subjectOptions = useSelector((state) => state.master.data.subjects);
    const schoolId = userData?.id;
    const session = userData?.session;
    const today = new Date().toISOString().slice(0, 16);
    const [exam, setExam] = useState({
        name: "",
        type: "",
        className: "",
        section: "",
        subjects: [
            {
                name: "",
                maxMarks: "",
                minMarks: "",
                startDate: dayjs(),
                endDate: dayjs(),
                roomNo: "",
            },
        ],
        startDate: dayjs(),
        endDate: dayjs(),
        duration: 0,
        examHall: "",
        schoolId: schoolId,
        session: session,
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (examId) {
            setIsLoading(true);
            api.get(`/api/exams/${examId}`)
                .then((response) => {
                    setExam({
                        ...response.data,
                        startDate: dayjs(response.data.startDate),
                        endDate: dayjs(response.data.endDate),
                        subjects: response.data.subjects.map((subject) => ({
                            ...subject,
                            maxMarks: subject.maxMarks || "",
                            minMarks: subject.minMarks || "",
                            startDate: dayjs(subject.startDate),
                            endDate: dayjs(subject.endDate),
                            roomNo: subject.roomNo || "",
                        })),
                        session: response.data.session || session,
                    });
                })
                .finally(() => setIsLoading(false));
        }
    }, [examId, session]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setExam({...exam, [name]: value});
        if (errors[name]) {
            setErrors((prev) => ({...prev, [name]: ""}));
        }
    };

    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = exam.subjects.map((subject, i) =>
            i === index ? {...subject, [field]: value} : subject
        );
        setExam({...exam, subjects: updatedSubjects});

        if (errors[`subjects.${index}.${field}`]) {
            setErrors((prev) => ({...prev, [`subjects.${index}.${field}`]: ""}));
        }
    };

    const handleAddSubject = () => {
        setExam((prev) => ({
            ...prev,
            subjects: [
                ...prev.subjects,
                {
                    name: "",
                    maxMarks: "",
                    minMarks: "",
                    startDate: dayjs(),
                    endDate: dayjs(),
                    roomNo: "",
                },
            ],
        }));
    };

    const handleRemoveSubject = (index) => {
        setExam((prev) => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index),
        }));
    };
    const handleSave = async () => {
        try {
            setIsLoading(true);
            console.log("Saving exam, isLoading set to true");
            const response = examId
                ? await api.put(`/api/exams/${examId}`, exam)
                : await api.post("/api/exams", exam);
            console.log("API response:", response);
            onSave();
            console.log("onSave callback called");
        } catch (error) {
            console.error("API Error:", error);
        } finally {
            setIsLoading(false);
            console.log("isLoading set to false");
        }
    };

    const getExamTypeColor = (type) => {
        switch (type) {
            case "Written":
                return theme.palette.primary.main;
            case "Oral":
                return theme.palette.warning.main;
            case "Practical":
                return theme.palette.success.main;
            default:
                return theme.palette.grey[500];
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg" sx={{py: 3}}>
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: {xs: 3, sm: 4},
                            borderRadius: 3,
                            bgcolor: "background.paper",
                            boxShadow: theme.shadows[3],
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: "8px",
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.7)})`,
                            },
                        }}
                    >
                        <Box sx={{mb: 4, textAlign: "center"}}>
                            <SchoolIcon
                                sx={{
                                    fontSize: 40,
                                    color: theme.palette.primary.main,
                                    mb: 1.5,
                                    opacity: 0.8,
                                }}
                            />
                            <Typography
                                variant="h4"
                                gutterBottom
                                color="primary"
                                sx={{
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                {examId ? "Edit Exam Details" : "Create New Exam"}
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{maxWidth: 600, mx: "auto"}}>
                                {examId
                                    ? "Update existing exam information and subject details below."
                                    : "Fill in the required information to create a new exam for your students."}
                            </Typography>

                            <Divider sx={{mt: 3, mb: 4}}/>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Exam Name"
                                    name="name"
                                    value={exam.name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    error={!!errors.name}
                                    helperText={errors.name}
                                    InputProps={{
                                        sx: {borderRadius: 2}
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="exam-type-label">Exam Type</InputLabel>
                                    <Select
                                        labelId="exam-type-label"
                                        name="type"
                                        value={exam.type}
                                        onChange={handleChange}
                                        label="Exam Type"
                                        required
                                        sx={{borderRadius: 2}}
                                    >
                                        <MenuItem value="Written">Written</MenuItem>
                                        <MenuItem value="Oral">Oral</MenuItem>
                                        <MenuItem value="Practical">Practical</MenuItem>
                                    </Select>
                                </FormControl>
                                {exam.type && (
                                    <Box sx={{mt: 1}}>
                                        <Chip
                                            label={exam.type}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(getExamTypeColor(exam.type), 0.1),
                                                color: getExamTypeColor(exam.type),
                                                fontWeight: 500,
                                            }}
                                        />
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="class-name-label">Class</InputLabel>
                                    <Select
                                        labelId="class-name-label"
                                        name="className"
                                        value={exam.className}
                                        onChange={handleChange}
                                        label="Class"
                                        sx={{borderRadius: 2}}
                                        startAdornment={
                                            <ClassIcon color="action" sx={{ml: 1, mr: 1}}/>
                                        }
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
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="section-label">Section</InputLabel>
                                    <Select
                                        labelId="section-label"
                                        name="section"
                                        value={exam.section}
                                        onChange={handleChange}
                                        label="Section"
                                        sx={{borderRadius: 2}}
                                        startAdornment={
                                            <SupervisedUserCircleIcon color="action" sx={{ml: 1, mr: 1}}/>
                                        }
                                        disabled={!exam.className}
                                    >
                                        {classSections?.find((cs) => cs.name === exam.className)
                                            ?.sections?.length > 0 ? (
                                            classSections
                                                .find((cs) => cs.name === exam.className)
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
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        py: 1,
                                        px: 2,
                                        mb: 3,
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderLeft: `4px solid ${theme.palette.primary.main}`
                                    }}
                                >
                                    <SubjectIcon sx={{mr: 2, color: theme.palette.primary.main}}/>
                                    <Typography variant="h6" color="primary.main" fontWeight="500">
                                        Subjects
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <AnimatePresence>
                                    {exam.subjects.map((subject, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{opacity: 0, y: 20}}
                                            animate={{opacity: 1, y: 0}}
                                            exit={{opacity: 0, y: -20, transition: {duration: 0.2}}}
                                            transition={{duration: 0.3}}
                                        >
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 3,
                                                    mb: 3,
                                                    position: "relative",
                                                    borderRadius: 2,
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    boxShadow: `0 4px 12px ${alpha(theme.palette.divider, 0.5)}`,
                                                    transition: "transform 0.2s, box-shadow 0.2s",
                                                    "&:hover": {
                                                        boxShadow: `0 8px 24px ${alpha(theme.palette.divider, 0.7)}`,
                                                        transform: "translateY(-2px)",
                                                    },
                                                }}
                                            >
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            sx={{mb: 2}}
                                                        >
                                                            <Box sx={{display: "flex", alignItems: "center"}}>
                                                                <Avatar
                                                                    sx={{
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                        color: theme.palette.primary.main,
                                                                        fontWeight: "bold",
                                                                        mr: 1.5,
                                                                        width: 36,
                                                                        height: 36,
                                                                    }}
                                                                >
                                                                    {index + 1}
                                                                </Avatar>
                                                                <Typography variant="subtitle1" fontWeight={500}>
                                                                    Subject {index + 1}
                                                                </Typography>
                                                            </Box>
                                                            <Tooltip title="Remove Subject">
                                                                <IconButton
                                                                    onClick={() => handleRemoveSubject(index)}
                                                                    color="error"
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                                                        "&:hover": {
                                                                            bgcolor: alpha(theme.palette.error.main, 0.2),
                                                                        },
                                                                    }}
                                                                >
                                                                    <CloseIcon fontSize="small"/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <FormControl
                                                            fullWidth
                                                            variant="outlined"
                                                            error={!!errors[`subjects.${index}.name`]}
                                                        >
                                                            <InputLabel>Subject</InputLabel>
                                                            <Select
                                                                value={subject.name}
                                                                onChange={(e) =>
                                                                    handleSubjectChange(index, "name", e.target.value)
                                                                }
                                                                label="Subject"
                                                                sx={{borderRadius: 2}}
                                                            >
                                                                {subjectOptions?.map((subj) => (
                                                                    <MenuItem key={subj.id} value={subj.name}>
                                                                        {subj.name}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                            {errors[`subjects.${index}.name`] && (
                                                                <FormHelperText>
                                                                    {errors[`subjects.${index}.name`]}
                                                                </FormHelperText>
                                                            )}
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12} sm={3}>
                                                        <TextField
                                                            label="Max Marks"
                                                            type="number"
                                                            value={subject.maxMarks}
                                                            onChange={(e) =>
                                                                handleSubjectChange(index, "maxMarks", e.target.value)
                                                            }
                                                            fullWidth
                                                            required
                                                            variant="outlined"
                                                            error={!!errors[`subjects.${index}.maxMarks`]}
                                                            helperText={errors[`subjects.${index}.maxMarks`]}
                                                            InputProps={{
                                                                sx: {borderRadius: 2}
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={3}>
                                                        <TextField
                                                            label="Min Marks"
                                                            type="number"
                                                            value={subject.minMarks}
                                                            onChange={(e) =>
                                                                handleSubjectChange(index, "minMarks", e.target.value)
                                                            }
                                                            fullWidth
                                                            required
                                                            variant="outlined"
                                                            error={!!errors[`subjects.${index}.minMarks`]}
                                                            helperText={errors[`subjects.${index}.minMarks`]}
                                                            InputProps={{
                                                                sx: {borderRadius: 2}
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <DateTimePicker
                                                            label="Start Date & Time"
                                                            value={subject.startDate}
                                                            onChange={(value) =>
                                                                handleSubjectChange(index, "startDate", value)
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    variant: "outlined",
                                                                    error: !!errors[`subjects.${index}.startDate`],
                                                                    helperText: errors[`subjects.${index}.startDate`],
                                                                    InputProps: {sx: {borderRadius: 2}}
                                                                },
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <DateTimePicker
                                                            label="End Date & Time"
                                                            value={subject.endDate}
                                                            onChange={(value) =>
                                                                handleSubjectChange(index, "endDate", value)
                                                            }
                                                            slotProps={{
                                                                textField: {
                                                                    fullWidth: true,
                                                                    variant: "outlined",
                                                                    error: !!errors[`subjects.${index}.endDate`],
                                                                    helperText: errors[`subjects.${index}.endDate`],
                                                                    InputProps: {sx: {borderRadius: 2}}
                                                                },
                                                            }}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <TextField
                                                            label="Room Number"
                                                            value={subject.roomNo}
                                                            onChange={(e) =>
                                                                handleSubjectChange(index, "roomNo", e.target.value)
                                                            }
                                                            fullWidth
                                                            required
                                                            variant="outlined"
                                                            error={!!errors[`subjects.${index}.roomNo`]}
                                                            helperText={errors[`subjects.${index}.roomNo`]}
                                                            InputProps={{
                                                                startAdornment: <MeetingRoomIcon color="action"
                                                                                                 sx={{mr: 1}}/>,
                                                                sx: {borderRadius: 2}
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleAddSubject}
                                    startIcon={<AddCircleOutlineIcon/>}
                                    fullWidth
                                    sx={{
                                        mt: 1,
                                        mb: 3,
                                        py: 1.2,
                                        borderRadius: 2,
                                        borderStyle: "dashed",
                                        borderWidth: 2,
                                        textTransform: "none",
                                        fontWeight: 500,
                                    }}
                                >
                                    Add Another Subject
                                </Button>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" color="text.primary" sx={{mb: 2, fontWeight: 500}}>
                                    Exam Details
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Duration (in minutes)"
                                    type="number"
                                    name="duration"
                                    value={exam.duration}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    error={!!errors.duration}
                                    helperText={errors.duration}
                                    InputProps={{
                                        startAdornment: <AccessTimeIcon color="action" sx={{mr: 1}}/>,
                                        sx: {borderRadius: 2}
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    label="Exam Hall"
                                    name="examHall"
                                    value={exam.examHall}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    variant="outlined"
                                    error={!!errors.examHall}
                                    helperText={errors.examHall}
                                    InputProps={{
                                        startAdornment: <MeetingRoomIcon color="action" sx={{mr: 1}}/>,
                                        sx: {borderRadius: 2}
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={12} md={4}>
                                <TextField
                                    label="Session"
                                    name="session"
                                    value={exam.session}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <EventIcon color="action" sx={{mr: 1}}/>,
                                        sx: {borderRadius: 2}
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 3,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSave}
                                        fullWidth
                                        size="large"
                                        disabled={isLoading}
                                        sx={{
                                            py: 1.5,
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            boxShadow: 3,
                                            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                                            textTransform: "none",
                                            fontSize: "1.1rem",
                                            transition: "transform 0.2s",
                                            "&:hover": {
                                                boxShadow: 5,
                                                transform: "scale(1.01)",
                                            },
                                        }}
                                    >
                                        {isLoading
                                            ? "Processing..."
                                            : examId
                                                ? "Update Exam Details"
                                                : "Create New Exam"}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </motion.div>
            </Container>
        </LocalizationProvider>
    );
};

export default ExamForm;