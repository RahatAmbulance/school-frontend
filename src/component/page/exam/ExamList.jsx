import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {motion} from "framer-motion";
import {api, selectSchoolDetails} from "../../../common";
import {useSelector} from "react-redux";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';

const localizer = momentLocalizer(moment);

const ExamList = ({onEditExam, onDelete}) => {
    const [exams, setExams] = useState([]);
    const [view, setView] = useState("list");
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        api.get("/api/exams", {
            params: {schoolId, session},
        }).then((response) => {
            setExams(response.data);
        });
    }, [schoolId, session]);

    const toIST = (utcDate) => {
        return new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        }).format(new Date(utcDate));
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) {
            return;
        }
        api.delete(`/api/exams/${id}`).then(() => {
            setExams(exams.filter(exam => exam.id !== id));
        });
    };

    const getStatusColor = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) return {color: 'info', label: 'Upcoming'};
        if (now > end) return {color: 'success', label: 'Completed'};
        return {color: 'warning', label: 'In Progress'};
    };

    const calendarEvents = exams.map(exam => ({
        title: exam.name,
        start: new Date(exam.startDate),
        end: new Date(exam.endDate),
        resource: exam
    }));

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <Box sx={{mb: 3}}>
                <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5" component="h2" color="primary" gutterBottom>
                            Exam Schedule
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="List View">
                                <IconButton
                                    onClick={() => setView("list")}
                                    color={view === "list" ? "primary" : "default"}
                                >
                                    <ViewListIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Calendar View">
                                <IconButton
                                    onClick={() => setView("calendar")}
                                    color={view === "calendar" ? "primary" : "default"}
                                >
                                    <CalendarMonthIcon/>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {view === "list" ? (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <Grid container spacing={2}>
                        {exams.map((exam) => (
                            <Grid item xs={12} sm={6} md={4} key={exam.id}>
                                <Card
                                    component={motion.div}
                                    whileHover={{scale: 1.02}}
                                    transition={{duration: 0.2}}
                                    elevation={2}
                                >
                                    <CardContent>
                                        <Box sx={{mb: 2}}>
                                            <Typography variant="h6" component="h3" gutterBottom>
                                                {exam.name}
                                            </Typography>
                                            <Chip
                                                label={getStatusColor(exam.startDate, exam.endDate).label}
                                                color={getStatusColor(exam.startDate, exam.endDate).color}
                                                size="small"
                                                sx={{mb: 1}}
                                            />
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Class: {exam.className} {exam.section}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Start: {toIST(exam.startDate)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            End: {toIST(exam.endDate)}
                                        </Typography>

                                        <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEditExam(exam)}
                                                    color="primary"
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(exam.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            ) : (
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <Paper elevation={2} sx={{p: 2, height: '70vh'}}>
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{height: '100%'}}
                            onSelectEvent={(event) => onEditExam(event.resource)}
                        />
                    </Paper>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ExamList;
