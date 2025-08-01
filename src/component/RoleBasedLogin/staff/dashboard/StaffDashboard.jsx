import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Avatar,
    Box,
    Button,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    Grid,
    Grow,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import {motion} from 'framer-motion';
import {
    Cake,
    CalendarMonth,
    ChildCare,
    Email,
    Event,
    MoreVert,
    Notifications,
    Person,
    Phone,
    School as SchoolIcon,
    School
} from '@mui/icons-material';
import {format, isValid, parseISO} from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/common/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import {ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip} from "chart.js";
import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";
import {fetchStaff} from "../../../page/staff/redux/staffActions";
import {fetchStudents} from "../../../page/student/redux/studentActions";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Utility function for date handling
const formatDate = (dateString, formatStr = "yyyy-MM-dd") => {
    try {
        if (!dateString) return "";
        const date = parseISO(dateString);
        return isValid(date) ? format(date, formatStr) : "";
    } catch (error) {
        console.error("Invalid date format:", error);
        return "";
    }
};

const ModernWidget = ({
                          title,
                          icon,
                          children,
                          color = "primary.main",
                          action,
                          height,
                          gradient = false,
                          blur = false
                      }) => (
    <Grow in timeout={600}>
        <Paper
            elevation={0}
            sx={{
                borderRadius: 4,
                overflow: "hidden",
                height: height || "100%",
                background: gradient
                    ? `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`
                    : blur
                        ? 'rgba(255, 255, 255, 0.9)'
                        : 'white',
                backdropFilter: blur ? 'blur(20px)' : 'none',
                border: `1px solid ${color}20`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: 'relative',
                '&::before': gradient ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                    zIndex: 1,
                } : {},
                "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 40px ${color}20`,
                    '& .widget-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                    }
                },
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        className="widget-icon"
                        sx={{
                            bgcolor: color,
                            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                            boxShadow: `0 8px 16px ${color}40`,
                            transition: 'all 0.3s ease',
                            width: 56,
                            height: 56,
                        }}
                    >
                        {icon}
                    </Avatar>
                }
                title={
                    <Typography variant="h6" fontWeight={700} sx={{color: 'text.primary'}}>
                        {title}
                    </Typography>
                }
                action={action || null}
                sx={{
                    pb: 1,
                    '& .MuiCardHeader-title': {
                        fontSize: '1.1rem'
                    }
                }}
            />
            <CardContent sx={{pt: 0}}>
                {children}
            </CardContent>
        </Paper>
    </Grow>
);

// Widget component for reusable card sections
const Widget = ({title, icon, children, color = "primary.main", action, elevation = 0, height}) => (
    <Paper
        elevation={elevation}
        sx={{
            borderRadius: 3,
            overflow: "hidden",
            height: height || "100%",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
            },
        }}
    >
        <CardHeader
            avatar={
                <Avatar sx={{bgcolor: color}}>
                    {icon}
                </Avatar>
            }
            title={
                <Typography variant="subtitle1" fontWeight={600}>
                    {title}
                </Typography>
            }
            action={action || null}
            sx={{bgcolor: `${color}10`, pb: 1}}
        />
        <CardContent sx={{pt: 2}}>
            {children}
        </CardContent>
    </Paper>
);
const StaffDashboard = () => {
    const [staffAttendance, setStaffAttendance] = useState([])
    const [showBirthdayContainer] = useState(true);
    const theme = useTheme();
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const {id: schoolId, session} = userData || {};
    const [data, setData] = useState({
        birthdays: [],
        holidays: [],
        events: [],
        staff: [],
        students: [],
        notifications: [],
        fees: [],
        examResults: [],
        attendanceData: {
            staffCount: 17,
            teachingCount: 0,
            studentCount: 0,
            studentPresent: 0,
            staffPresent: 0,
            teacherPresent: 0
        }
    });
    const [loading, setLoading] = useState({
        birthdays: true,
        holidays: true,
        staff: true,
        students: true,
        notifications: true,
        fees: true,
        examResults: true,
        attendance: true
    });

    // Memoized fetch function
    const fetchData = useCallback(async (endpoint, dataKey, params = {}) => {
        if (!schoolId || !session) return;

        try {
            setLoading(prev => ({...prev, [dataKey]: true}));
            const queryParams = new URLSearchParams({schoolId, session, ...params}).toString();
            const response = await api.get(`${endpoint}?${queryParams}`);

            setData(prev => ({...prev, [dataKey]: response.data}));
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${dataKey}:`, error);
        } finally {
            setLoading(prev => ({...prev, [dataKey]: false}));
        }
    }, [schoolId, session]);

    // Data fetching effects
    useEffect(() => {
        if (schoolId && session) {
            fetchData('/api/notifications/school/session', 'notifications');
            fetchData('/api/master/holidays', 'holidays');
            fetchData('/api/master/events', 'events');
            fetchData('/api/birthdays', 'birthdays').then(birthdays => {
                if (birthdays) {
                    const filtered = birthdays
                    setData(prev => ({...prev, birthdays: filtered}));
                }
            });
            fetchData('/api/staff/school/session', 'staff').then(staffData => {
                if (staffData) {
                    const teachingStaff = staffData.filter(member =>
                        member.staffType === "Teaching"
                    );
                    const nonTeachingStaff = staffData.filter(member =>
                        member.staffType === "Non-Teaching"
                    );
                    setData(prev => ({
                        ...prev,
                        attendanceData: {
                            ...prev.attendanceData,
                            teachingCount: teachingStaff.length,
                            staffCount: nonTeachingStaff.length
                        }
                    }));
                }
            });
            fetchData('/api/students/school/session', 'students').then(students => {
                if (students) {
                    setData(prev => ({
                        ...prev,
                        attendanceData: {
                            ...prev.attendanceData,
                            studentCount: students.length
                        }
                    }));
                }
            });
            const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
            fetchData('/api/attendance/by-date-school-session', 'attendance', {date: today}).then(attendance => {
                if (attendance) {
                    const studentPresent = attendance.filter(
                        member => member.type === "STUDENT" && member.status === "Present"
                    ).length;

                    // Split staff attendance into teaching and non-teaching categories
                    const teachingPresent = attendance.filter(
                        member => member.type === "STAFF" &&
                            member.staffType === "Teaching" &&
                            member.status === "Present"
                    ).length;

                    const nonTeachingPresent = attendance.filter(
                        member => member.type === "STAFF" &&
                            member.staffType === "Non-Teaching" &&
                            member.status === "Present"
                    ).length;

                    setData(prev => ({
                        ...prev,
                        attendanceData: {
                            ...prev.attendanceData,
                            studentPresent,
                            teacherPresent: teachingPresent,
                            staffPresent: nonTeachingPresent
                        }
                    }));
                }
            });
            setData(prev => ({
                ...prev,
                examResults: [
                    {subject: "Mathematics", avgScore: 78, maxScore: 100},
                    {subject: "Science", avgScore: 82, maxScore: 100},
                    {subject: "English", avgScore: 85, maxScore: 100},
                    {subject: "History", avgScore: 76, maxScore: 100},
                    {subject: "Computer", avgScore: 90, maxScore: 100}
                ]
            }));

        }
    }, [fetchData, schoolId, session, dispatch]);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchStaff(schoolId, session));
            dispatch(fetchStudents(schoolId, session));
        }
    }, [dispatch, schoolId, session]);
// State to track current month and year
    const [currentMonth, setCurrentMonth] = useState();
    const [currentYear, setCurrentYear] = useState();

    const handleDatesSet = (dateInfo) => {
        // Get the actual view date from the calendar API
        const calendarApi = dateInfo.view.calendar;
        const viewDate = calendarApi.getDate();

        const month = viewDate.getMonth() + 1;
        const year = viewDate.getFullYear();

        setCurrentMonth(month);
        setCurrentYear(year);

        // Call your existing function with month and year parameters
        if (userActualData?.tableId && schoolId && session) {
            fetchStaffAttendance(userActualData.tableId, month, year);
        }
    };

    const fetchAttendanceData = async (month, year) => {
        try {
            const response = await fetch(`/api/attendance?month=${month}&year=${year}`);
            const data = await response.json();

            // Update your calendar events state
            //         setCalendarAttendanceEvents(data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    const calendarAttendanceEvents = useMemo(() => {
        try {
            const attendanceEvent = (staffAttendance || []).map(att => {
                const eventDate = att.date ? format(new Date(att.date), 'yyyy-MM-dd') : null;
                return {
                    title: `${att.status}`,
                    start: eventDate,
                    end: eventDate,
                    backgroundColor: att.type === 'STAFF' ? theme.palette.primary.main : theme.palette.secondary.main,
                    borderColor: att.type === 'STAFF' ? theme.palette.primary.main : theme.palette.secondary.main,
                    allDay: true, // attendance is typically full day
                    type: 'attendance',
                    rawData: att,
                };
            });
            const combined = [...attendanceEvent].filter(ev => ev.start && ev.end);
            console.log("combine DATA : -  ", combined);
            return combined;
        } catch (error) {
            console.error("Error creating calendar events:", error);
            return [];
        }
    }, [staffAttendance, theme]);

    const calendarEvents = useMemo(() => {
        try {
            const holidayEvents = (data.holidays || []).map(holiday => ({
                title: holiday.title,
                start: formatDate(holiday.start),
                end: formatDate(holiday.end),
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                allDay: true,
                type: 'holiday'
            }));

            const otherEvents = (data.events || []).map(event => ({
                title: event.title,
                start: formatDate(event.start),
                end: formatDate(event.end),
                backgroundColor: theme.palette.secondary.main,
                borderColor: theme.palette.secondary.main,
                allDay: event.allDay || false,
                type: 'event'
            }));
            console.log("Holiday Events:", holidayEvents);
            console.log("Other Events:", otherEvents);

            // Combine and filter both arrays
            return [...holidayEvents, ...otherEvents].filter(event => event.start && event.end);
        } catch (error) {
            console.error("Error creating calendar events:", error);
            return [];
        }
    }, [data.holidays, data.events, theme]);

    useEffect(() => {
        if (userActualData?.tableId && schoolId && session) {
            fetchStaffAttendance(userActualData.tableId);
        }
    }, [userActualData, schoolId, session]);

    const fetchStaffAttendance = async (staffId, month = null, year = null) => {
        try {
            const params = {
                staffId,
                schoolId,
                session,
            };

            // Add month and year if provided
            if (month) params.month = month;
            if (year) params.year = year;

            const response = await api.get('api/attendance/by-staff-or-student', {
                params,
            });
            setStaffAttendance(response.data);
            console.log("Response Data setStaffAttendance :-  : ", response.data);
        } catch (error) {
            console.error('Error fetching staff attendance:', error);
        }
    };

    return (
        <Box sx={{
            padding: 3,
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 4,
                    gap: 2,
                    p: 3,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                }}>
                    <SchoolIcon sx={{fontSize: 40, color: theme.palette.primary.main}}/>
                    <Box>
                        <Typography variant="h4" sx={{fontWeight: 600, color: theme.palette.primary.main}}>
                            Welcome back, {userActualData?.name || 'Staff'}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Typography>
                    </Box>
                </Box>
            </motion.div>
            <Box sx={{
                p: 3,
                bgcolor: "#f5f7fa",
                minHeight: "100vh",
                transition: "all 0.3s ease-in-out"
            }}>
                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} md={8}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                height: "100%",
                                background: "white"
                            }}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek'
                                    }}
                                    events={calendarAttendanceEvents}
                                    height="auto"
                                    dayMaxEvents={3}
                                    moreLinkClick="popover"
                                    eventDisplay="block"
                                    datesSet={handleDatesSet}
                                />
                            </Grid>

                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                            <Widget
                                title="Notification Center"
                                icon={<Notifications/>}
                                color={theme.palette.info.main}
                                elevation={0}
                                height={220}
                                action={
                                    <IconButton size="small">
                                        <MoreVert fontSize="small"/>
                                    </IconButton>
                                }
                            >
                                {loading.notifications ? (
                                    <Box sx={{display: "flex", justifyContent: "center", py: 3}}>
                                        <CircularProgress size={24}/>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        maxHeight: 200, overflowY: 'auto', scrollbarWidth: 'thin',
                                        '&::-webkit-scrollbar': {width: '6px'},
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '10px'
                                        }
                                    }}>
                                        <List dense disablePadding>
                                            {data.notifications.slice(0, 5).map((notification, index) => (
                                                <ListItem
                                                    key={index}
                                                    alignItems="flex-start"
                                                    sx={{
                                                        px: 0,
                                                        borderBottom: index !== data.notifications.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                                                        pb: 1,
                                                        mb: 1
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        <Avatar sx={{
                                                            bgcolor: `${theme.palette.info.main}20`,
                                                            color: theme.palette.info.main
                                                        }}>
                                                            <Notifications fontSize="small"/>
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="body2"
                                                                        sx={{fontWeight: 500, lineHeight: 1.2}}>
                                                                {notification.message}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(notification.createDateTime).toLocaleString()}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}

                                            {data.notifications.length === 0 && (
                                                <Box sx={{textAlign: "center", py: 2}}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No new notifications
                                                    </Typography>
                                                </Box>
                                            )}
                                        </List>
                                    </Box>
                                )}

                                {data.notifications.length > 0 && (
                                    <Button
                                        fullWidth
                                        size="small"
                                        variant="text"
                                        sx={{mt: 1}}
                                    >
                                        View all notifications
                                    </Button>
                                )}
                            </Widget>

                            <Widget
                                title="Upcoming Events"
                                icon={<Event/>}
                                color={theme.palette.error.main}
                                elevation={0}
                                height={220}
                                action={
                                    <IconButton size="small">
                                        <MoreVert fontSize="small"/>
                                    </IconButton>
                                }
                            >
                                {loading.holidays ? (
                                    <Box sx={{display: "flex", justifyContent: "center", py: 3}}>
                                        <CircularProgress size={24}/>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        maxHeight: 130, overflowY: 'auto', scrollbarWidth: 'thin',
                                        '&::-webkit-scrollbar': {width: '6px'},
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '10px'
                                        }
                                    }}>
                                        <List dense disablePadding>
                                            {data.holidays
                                                .sort((a, b) => new Date(b.creationDateTime) - new Date(a.creationDateTime))
                                                .slice(0, 5)
                                                .map((holiday, idx) => {
                                                    const isUpcoming = new Date(holiday.start) > new Date();
                                                    const daysUntil = isUpcoming ?
                                                        Math.ceil((new Date(holiday.start) - new Date()) / (1000 * 60 * 60 * 24)) : null;

                                                    return (
                                                        <ListItem
                                                            key={idx}
                                                            sx={{
                                                                px: 0,
                                                                py: 0.75,
                                                                borderBottom: idx !== Math.min(data.holidays.length, 5) - 1 ?
                                                                    `1px solid ${theme.palette.divider}` : 'none'
                                                            }}
                                                        >
                                                            <ListItemAvatar>
                                                                <Avatar sx={{
                                                                    bgcolor: isUpcoming && daysUntil < 7 ?
                                                                        `${theme.palette.warning.main}20` : `${theme.palette.error.main}20`,
                                                                    color: isUpcoming && daysUntil < 7 ?
                                                                        theme.palette.warning.main : theme.palette.error.main,
                                                                    width: 40,
                                                                    height: 40
                                                                }}>
                                                                    <Typography variant="caption" fontWeight={500}>
                                                                        {holiday.start ? format(parseISO(holiday.start), 'dd MMM').split(' ')[0] : ''}
                                                                    </Typography>
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center'
                                                                    }}>
                                                                        <Typography variant="body2"
                                                                                    sx={{fontWeight: 500}}>
                                                                            {holiday.title}
                                                                        </Typography>
                                                                        {isUpcoming && daysUntil < 7 && (
                                                                            <Chip
                                                                                label="Soon"
                                                                                size="small"
                                                                                sx={{
                                                                                    height: 20,
                                                                                    fontSize: '0.7rem',
                                                                                    bgcolor: `${theme.palette.warning.main}15`,
                                                                                    color: theme.palette.warning.main
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <Typography variant="caption"
                                                                                color="text.secondary">
                                                                        {holiday.start ? format(parseISO(holiday.start), 'MMM dd') : ''} - {holiday.end ? format(parseISO(holiday.end), 'MMM dd') : ''}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                    );
                                                })}

                                            {data.holidays.length === 0 && (
                                                <Box sx={{textAlign: "center", py: 2}}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No upcoming holidays
                                                    </Typography>
                                                </Box>
                                            )}
                                        </List>

                                        {data.holidays.length > 5 && (
                                            <Button fullWidth size="small" variant="text" sx={{mt: 1}}>
                                                View all events
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </Widget>
                        </Stack>
                    </Grid>
                </Grid>

                {/* Additional Dashboard Content */}
                <Grid container spacing={3}>
                    {/* School Calendar */}
                    <Grid item xs={12} md={8}>
                        <ModernWidget
                            title="Academic Calendar"
                            icon={<CalendarMonth/>}
                            color={theme.palette.primary.main}
                            gradient={true}
                        >
                            {/* Calendar Stats Header */}
                            <Grid container spacing={2} sx={{mb: 3}}>
                                <Grid item xs={6} sm={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}25 100%)`,
                                            border: `1px solid ${theme.palette.primary.main}20`,
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 16px ${theme.palette.primary.main}20`
                                            }
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={700} color="primary.main">
                                            {data.holidays.length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Total Events
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}25 100%)`,
                                            border: `1px solid ${theme.palette.success.main}20`,
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 16px ${theme.palette.success.main}20`
                                            }
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={700} color="success.main">
                                            {data.holidays.filter(h => new Date(h.start) > new Date()).length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Upcoming
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}25 100%)`,
                                            border: `1px solid ${theme.palette.warning.main}20`,
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 16px ${theme.palette.warning.main}20`
                                            }
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={700} color="warning.main">
                                            {data.holidays.filter(h => {
                                                const eventDate = new Date(h.start);
                                                const today = new Date();
                                                const diffTime = eventDate - today;
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                return diffDays > 0 && diffDays <= 7;
                                            }).length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            This Week(Holidays)
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}25 100%)`,
                                            border: `1px solid ${theme.palette.info.main}20`,
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 16px ${theme.palette.info.main}20`
                                            }
                                        }}
                                    >
                                        <Typography variant="h5" fontWeight={700} color="info.main">
                                            {new Date().getDate()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Today
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Enhanced Calendar */}
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    border: `2px solid ${theme.palette.divider}`,
                                    background: 'white',
                                    '& .fc': {
                                        '--fc-border-color': theme.palette.divider,
                                        '--fc-button-bg-color': theme.palette.primary.main,
                                        '--fc-button-hover-bg-color': theme.palette.primary.dark,
                                        '--fc-today-bg-color': `${theme.palette.primary.main}08`,
                                        fontFamily: theme.typography.fontFamily,
                                    },
                                    '& .fc-header-toolbar': {
                                        padding: '20px 24px',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        margin: 0,
                                        '& .fc-toolbar-title': {
                                            fontSize: '1.5rem',
                                            fontWeight: 800,
                                            color: 'white',
                                        },
                                        '& .fc-button': {
                                            background: 'rgba(255,255,255,0.15)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            backdropFilter: 'blur(10px)',
                                            '&:hover': {
                                                background: 'rgba(255,255,255,0.25)',
                                                transform: 'translateY(-1px)',
                                            }
                                        }
                                    },
                                    '& .fc-daygrid-day': {
                                        minHeight: '80px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: `${theme.palette.primary.main}05`,
                                        },
                                        '&.fc-day-today': {
                                            background: `${theme.palette.primary.main}10`,
                                            '& .fc-daygrid-day-number': {
                                                background: theme.palette.primary.main,
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                // Continuing from where the code was cut off...

                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                margin: '4px'
                                            }
                                        }
                                    },
                                    '& .fc-event': {
                                        borderRadius: '6px',
                                        border: 'none',
                                        padding: '2px 6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                        }
                                    },
                                    '& .fc-col-header-cell': {
                                        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                                        padding: '12px 8px'
                                    }
                                }}
                            >
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek'
                                    }}
                                    events={calendarEvents}
                                    height="auto"
                                    dayMaxEvents={3}
                                    moreLinkClick="popover"
                                    eventDisplay="block"
                                />
                            </Paper>
                        </ModernWidget>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={3}>
                            {/* Birthdays */}
                            {showBirthdayContainer && (
                                <Widget
                                    title="Upcoming Birthdays"
                                    icon={<Cake/>}
                                    color={theme.palette.success.main}
                                    elevation={0}
                                >
                                    {loading.birthdays ? (
                                        <Box sx={{display: "flex", justifyContent: "center", py: 3}}>
                                            <CircularProgress size={24}/>
                                        </Box>
                                    ) : (
                                        <Box sx={{
                                            maxHeight: 200,
                                            overflowY: 'auto',
                                            scrollbarWidth: 'thin',
                                            '&::-webkit-scrollbar': {width: '6px'},
                                            '&::-webkit-scrollbar-thumb': {
                                                backgroundColor: 'rgba(0,0,0,0.2)',
                                                borderRadius: '10px'
                                            }
                                        }}>
                                            <List dense disablePadding>
                                                {data.birthdays.map((birthday, idx) => (
                                                    <ListItem
                                                        key={idx}
                                                        alignItems="flex-start"
                                                        sx={{
                                                            px: 0,
                                                            py: 1,
                                                            borderBottom: idx !== data.birthdays.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'
                                                        }}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: birthday.type === "Student"
                                                                        ? `${theme.palette.info.main}20`
                                                                        : `${theme.palette.success.main}20`,
                                                                    color: birthday.type === "Student"
                                                                        ? theme.palette.info.main
                                                                        : theme.palette.success.main
                                                                }}
                                                            >
                                                                {birthday.type === "Student" ? <ChildCare/> : <Person/>}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "space-between"
                                                                }}>
                                                                    <Typography variant="body2" sx={{fontWeight: 500}}>
                                                                        {birthday.name}
                                                                    </Typography>
                                                                    <Chip
                                                                        size="small"
                                                                        label={new Date(birthday.dob).toLocaleDateString("en-US", {
                                                                            month: "short",
                                                                            day: "numeric"
                                                                        })}
                                                                        sx={{
                                                                            fontSize: '0.7rem',
                                                                            height: 20,
                                                                            bgcolor: `${theme.palette.success.main}10`,
                                                                            color: theme.palette.success.main,
                                                                            fontWeight: 500
                                                                        }}
                                                                    />
                                                                </Box>
                                                            }
                                                            secondary={
                                                                <Box>
                                                                    {birthday.type === "Student" && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                color: "text.secondary",
                                                                                gap: 0.5
                                                                            }}
                                                                        >
                                                                            <School fontSize="inherit" color="inherit"/>
                                                                            Class {birthday.className}{birthday.section ? `-${birthday.section}` : ""}
                                                                        </Typography>
                                                                    )}
                                                                    {birthday.email && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            noWrap
                                                                            sx={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                color: "text.secondary",
                                                                                gap: 0.5,
                                                                                maxWidth: "100%",
                                                                            }}
                                                                        >
                                                                            <Email fontSize="inherit" color="inherit"/>
                                                                            {birthday.email.trim()}
                                                                        </Typography>
                                                                    )}
                                                                    {birthday.phone && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                color: "text.secondary",
                                                                                gap: 0.5
                                                                            }}
                                                                        >
                                                                            <Phone fontSize="inherit" color="inherit"/>
                                                                            {birthday.phone}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                ))}

                                                {data.birthdays.length === 0 && (
                                                    <Box sx={{textAlign: "center", py: 2}}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            No upcoming birthdays
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </List>
                                        </Box>
                                    )}
                                    {data.birthdays.length > 5 && (
                                        <Button
                                            fullWidth
                                            size="small"
                                            variant="text"
                                            sx={{mt: 1}}
                                        >
                                            View all birthdays
                                        </Button>
                                    )}
                                </Widget>
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default StaffDashboard;