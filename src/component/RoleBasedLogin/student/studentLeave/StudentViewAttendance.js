// StudentViewAttendance.jsx
import React, {useEffect, useMemo, useState} from 'react';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Container,
    Fade,
    Grid,
    LinearProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import {
    AccessTime as AccessTimeIcon,
    Assessment as AssessmentIcon,
    CalendarMonth as CalendarMonthIcon,
    CalendarToday as CalendarTodayIcon,
    Cancel as CancelIcon,
    Celebration as CelebrationIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    EventBusy as EventBusyIcon,
    FileDownload as FileDownloadIcon,
    HourglassBottom as HourglassBottomIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    WorkOutline as WorkOutlineIcon,
} from '@mui/icons-material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {useDispatch, useSelector} from 'react-redux';
import * as XLSX from 'xlsx';
import {eachDayOfInterval, endOfMonth, format, isWeekend, isWithinInterval, parseISO, startOfMonth,} from 'date-fns';
import {selectSchoolDetails, selectUserActualData,} from '../../../../common';
import {fetchAttendance} from '../../../page/attendance/redux/attendanceActions';

/* ------------------------------------------------------------------
   Helper Functions
------------------------------------------------------------------- */
const generateDatesWithDays = (selectedDate) => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(startDate);
    return eachDayOfInterval({start: startDate, end: endDate}).map(
        (date) => ({
            day: format(date, 'd'),
            dayName: format(date, 'EEE'),
            fullDate: format(date, 'yyyy-MM-dd'),
            isWeekend: isWeekend(date),
        })
    );
};

const getStatusInfo = (status, theme) => {
    const statusConfig = {
        Present: {
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.1),
            icon: <CheckCircleOutlineIcon fontSize="small"/>,
            label: 'Present',
            gradient: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
        },
        Late: {
            color: theme.palette.warning.main,
            bgColor: alpha(theme.palette.warning.main, 0.1),
            icon: <AccessTimeIcon fontSize="small"/>,
            label: 'Late',
            gradient: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
        },
        Absent: {
            color: theme.palette.error.main,
            bgColor: alpha(theme.palette.error.main, 0.1),
            icon: <CancelIcon fontSize="small"/>,
            label: 'Absent',
            gradient: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
        },
        'Half Day': {
            color: theme.palette.info.main,
            bgColor: alpha(theme.palette.info.main, 0.1),
            icon: <HourglassBottomIcon fontSize="small"/>,
            label: 'Half Day',
            gradient: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
        },
        Leave: {
            color: theme.palette.secondary.main,
            bgColor: alpha(theme.palette.secondary.main, 0.1),
            icon: <EventBusyIcon fontSize="small"/>,
            label: 'Leave',
            gradient: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
        },
        Holiday: {
            color: theme.palette.grey[600],
            bgColor: alpha(theme.palette.grey[600], 0.1),
            icon: <CelebrationIcon fontSize="small"/>,
            label: 'Holiday',
            gradient: `linear-gradient(135deg, ${theme.palette.grey[400]} 0%, ${theme.palette.grey[600]} 100%)`,
        },
    };

    return statusConfig[status] || {
        color: theme.palette.grey[400],
        bgColor: alpha(theme.palette.grey[400], 0.1),
        icon: null,
        label: 'Unknown',
        gradient: `linear-gradient(135deg, ${theme.palette.grey[200]} 0%, ${theme.palette.grey[400]} 100%)`,
    };
};

/* ------------------------------------------------------------------
   Statistics Cards Component
------------------------------------------------------------------- */
const StatsCards = ({summary, totalWorkingDays, theme, selectedMonthYear}) => {
    const statsData = [
        {
            title: 'Present',
            value: summary.Present || 0,
            icon: <CheckCircleOutlineIcon/>,
            color: theme.palette.success.main,
            bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.2)} 100%)`,
        },
        {
            title: 'Absent',
            value: summary.Absent || 0,
            icon: <CancelIcon/>,
            color: theme.palette.error.main,
            bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.2)} 100%)`,
        },
        {
            title: 'Late',
            value: summary.Late || 0,
            icon: <AccessTimeIcon/>,
            color: theme.palette.warning.main,
            bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.2)} 100%)`,
        },
        {
            title: 'Leave',
            value: summary.Leave || 0,
            icon: <EventBusyIcon/>,
            color: theme.palette.secondary.main,
            bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
        },
    ];

    const attendanceRate = totalWorkingDays > 0
        ? ((summary.Present || 0) / totalWorkingDays * 100).toFixed(1)
        : 0;

    return (
        <Grid container spacing={3} sx={{mb: 4}}>
            {statsData.map((stat, index) => (
                <Grid item xs={6} md={3} key={stat.title}>
                    <Fade in timeout={600 + index * 100}>
                        <Card
                            elevation={0}
                            sx={{
                                background: stat.bgGradient,
                                border: `1px solid ${alpha(stat.color, 0.2)}`,
                                borderRadius: 3,
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 12px 24px ${alpha(stat.color, 0.2)}`,
                                    border: `1px solid ${alpha(stat.color, 0.4)}`,
                                },
                            }}
                        >
                            <CardContent sx={{p: 3, pb: '16px !important'}}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: stat.color,
                                            width: 48,
                                            height: 48,
                                            boxShadow: `0 4px 12px ${alpha(stat.color, 0.3)}`,
                                        }}
                                    >
                                        {stat.icon}
                                    </Avatar>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: stat.color,
                                            fontFamily: '"Inter", "Roboto", sans-serif',
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                        textTransform: 'uppercase',
                                        letterSpacing: 1,
                                    }}
                                >
                                    {stat.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>
            ))}

            {/* Attendance Rate Card */}
            <Grid item xs={12} md={12}>
                <Fade in timeout={1000}>
                    <Card
                        elevation={0}
                        sx={{
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{p: 3}}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2}}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Avatar
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            width: 56,
                                            height: 56,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}
                                    >
                                        <TrendingUpIcon fontSize="large"/>
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6"
                                                    sx={{fontWeight: 600, color: theme.palette.text.primary}}>
                                            Attendance Rate
                                        </Typography>
                                        <Typography variant="body2" sx={{color: theme.palette.text.secondary}}>
                                            {selectedMonthYear} performance
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontWeight: 700,
                                        color: theme.palette.primary.main,
                                        fontFamily: '"Inter", "Roboto", sans-serif',
                                    }}
                                >
                                    {attendanceRate}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={parseFloat(attendanceRate)}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Fade>
            </Grid>
        </Grid>
    );
};

/* ------------------------------------------------------------------
   Enhanced Attendance Calendar
------------------------------------------------------------------- */
const AttendanceCalendar = ({selectedDate}) => {
    const theme = useTheme();
    const attendanceList = useSelector((s) => s.attendance.attendanceList);
    const [showCalendar, setShowCalendar] = useState(true);
    const [groupedData, setGroupedData] = useState({});
    const userDataActual = useSelector(selectUserActualData);

    // Convert selectedDate to proper Date object
    const dateToUse = selectedDate?.toDate ? selectedDate.toDate() : (selectedDate || new Date());
    const datesList = generateDatesWithDays(dateToUse);

    // Get month boundaries for filtering
    const monthStart = startOfMonth(dateToUse);
    const monthEnd = endOfMonth(dateToUse);
    const selectedMonthYear = format(dateToUse, 'MMMM yyyy');

    const {summary, totalWorkingDays} = useMemo(() => {
        const workingDays = datesList.filter(d => !d.isWeekend).length;
        const currentData = Object.values(groupedData)[0];
        return {
            summary: currentData?.summary || {},
            totalWorkingDays: workingDays,
        };
    }, [groupedData, datesList]);

    useEffect(() => {
        console.log('Selected Date:', selectedDate);
        console.log('Date to use:', dateToUse);
        console.log('Month boundaries:', {monthStart, monthEnd});

        const grouped = {};

        // Filter attendance data for the selected month and user
        const filteredAttendance = attendanceList.filter((a) => {
            // Filter by user
            const isUserMatch = a.type === 'STUDENT' && a.studentId === userDataActual.tableId &&
                a.name === userDataActual.name;

            if (!isUserMatch) return false;

            // Filter by selected month/year
            try {
                const attendanceDate = parseISO(a.date);
                const isInSelectedMonth = isWithinInterval(attendanceDate, {
                    start: monthStart,
                    end: monthEnd
                });

                console.log(`Date: ${a.date}, In month: ${isInSelectedMonth}, Status: ${a.status}`);
                return isInSelectedMonth;
            } catch (error) {
                console.error('Error parsing date:', a.date, error);
                return false;
            }
        });

        console.log('Filtered attendance:', filteredAttendance);

        // Group the filtered data
        filteredAttendance.forEach(({staffId, name, date, status}) => {
            if (!grouped[staffId]) {
                grouped[staffId] = {
                    name,
                    attendance: {},
                    summary: {
                        Present: 0,
                        Absent: 0,
                        Late: 0,
                        'Half Day': 0,
                        Leave: 0,
                        Holiday: 0,
                    },
                };
            }
            grouped[staffId].attendance[date] = status;
            if (status) grouped[staffId].summary[status]++;
        });

        console.log('Grouped data:', grouped);
        setGroupedData(grouped);
    }, [selectedDate, attendanceList, userDataActual, monthStart, monthEnd, dateToUse]);

    return (
        <Box sx={{width: '100%'}}>
            {/* Statistics Cards */}
            <StatsCards
                summary={summary}
                totalWorkingDays={totalWorkingDays}
                theme={theme}
                selectedMonthYear={selectedMonthYear}
            />

            {/* Calendar Section */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                }}
            >
                {/* Enhanced Header */}
                <Box
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Avatar
                            sx={{
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            <CalendarTodayIcon sx={{color: 'white'}}/>
                        </Avatar>
                        <Box>
                            <Typography variant="h6" sx={{color: 'white', fontWeight: 600}}>
                                Monthly Attendance Calendar
                            </Typography>
                            <Typography variant="body2" sx={{color: alpha(theme.palette.common.white, 0.8)}}>
                                {selectedMonthYear} • {userDataActual?.name || 'Staff Member'}
                            </Typography>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={showCalendar ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                            onClick={() => setShowCalendar(!showCalendar)}
                            sx={{
                                bgcolor: alpha(theme.palette.common.white, 0.2),
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.common.white, 0.3),
                                },
                            }}
                        >
                            {showCalendar ? 'Hide' : 'Show'} Calendar
                        </Button>
                    </Stack>
                </Box>

                {/* Enhanced Table */}
                <Collapse in={showCalendar}>
                    <TableContainer sx={{maxHeight: '70vh'}}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            color: "#000000 !important", // Force black with !important
                                            background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                            width: '15%',
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 10,
                                            // Ensure all child elements are black
                                            '& *': {
                                                color: '#000000 !important',
                                            },
                                        }}
                                    >
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <PersonIcon
                                                fontSize="small"
                                                sx={{color: '#000000 !important'}} // Force icon color
                                            />
                                            <Typography sx={{color: '#000000 !important', fontWeight: 700}}>
                                                Staff Details
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 700,
                                            color: "#000000 !important", // Force black with !important
                                            background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                            width: '25%',
                                            // Ensure all child elements are black
                                            '& *': {
                                                color: '#000000 !important',
                                            },
                                        }}
                                    >
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}>
                                            <AssessmentIcon
                                                fontSize="small"
                                                sx={{color: '#000000 !important'}} // Force icon color
                                            />
                                            <Typography sx={{color: '#000000 !important', fontWeight: 700}}>
                                                Monthly Summary
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {datesList.map((d) => (
                                        <TableCell
                                            key={d.fullDate}
                                            align="center"
                                            sx={{
                                                fontWeight: 600,
                                                color: "#000000 !important", // Force black with !important
                                                background: d.isWeekend
                                                    ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`
                                                    : `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`,
                                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                p: 1,
                                                minWidth: 65,
                                                // Ensure all child elements are black
                                                '& *': {
                                                    color: '#000000 !important',
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    color: "#000000 !important", // Force black
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 0.5,
                                                }}
                                            >
                                                {d.dayName}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: "#000000 !important", // Force black
                                                }}
                                            >
                                                {d.day}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {Object.entries(groupedData).map(([id, data], idx) => (
                                    <Fade key={id} in timeout={800 + idx * 100}>
                                        <TableRow
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                    transform: 'scale(1.001)',
                                                    transition: 'all 0.2s ease',
                                                },
                                                transition: 'all 0.2s ease',
                                            }}
                                        >
                                            {/* Staff Details */}
                                            <TableCell
                                                sx={{
                                                    position: 'sticky',
                                                    left: 0,
                                                    bgcolor: 'background.paper',
                                                    borderRight: `1px solid ${theme.palette.divider}`,
                                                    zIndex: 5,
                                                }}
                                            >
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: theme.palette.primary.main,
                                                            width: 40,
                                                            height: 40,
                                                        }}
                                                    >
                                                        <WorkOutlineIcon/>
                                                    </Avatar>
                                                    <Box>
                                                        <Typography
                                                            sx={{fontWeight: 600, color: theme.palette.text.primary}}>
                                                            {data.name}
                                                        </Typography>
                                                        <Typography variant="caption"
                                                                    sx={{color: theme.palette.text.secondary}}>
                                                            Roll: {data.rollNo}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {/* Enhanced Summary */}
                                            <TableCell align="center">
                                                <Box sx={{
                                                    display: 'flex',
                                                    gap: 1,
                                                    flexWrap: 'wrap',
                                                    justifyContent: 'center'
                                                }}>
                                                    {Object.entries(data.summary).map(([status, count]) =>
                                                            count > 0 && (
                                                                <Chip
                                                                    key={status}
                                                                    label={count}
                                                                    size="small"
                                                                    icon={getStatusInfo(status, theme).icon}
                                                                    sx={{
                                                                        background: getStatusInfo(status, theme).gradient,
                                                                        color: 'white',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.75rem',
                                                                        height: 28,
                                                                        border: 'none',
                                                                        boxShadow: `0 2px 8px ${alpha(getStatusInfo(status, theme).color, 0.3)}`,
                                                                        transition: 'all 0.2s ease',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-2px)',
                                                                            boxShadow: `0 4px 12px ${alpha(getStatusInfo(status, theme).color, 0.4)}`,
                                                                        },
                                                                    }}
                                                                />
                                                            )
                                                    )}
                                                </Box>
                                            </TableCell>

                                            {/* Daily Status Cells */}
                                            {datesList.map((d) => {
                                                const status = data.attendance[d.fullDate];
                                                const info = getStatusInfo(status, theme);
                                                return (
                                                    <TableCell
                                                        key={d.fullDate}
                                                        align="center"
                                                        sx={{
                                                            p: 1,
                                                            position: 'relative',
                                                            bgcolor: d.isWeekend
                                                                ? alpha(theme.palette.grey[500], 0.02)
                                                                : 'transparent',
                                                        }}
                                                    >
                                                        {status ? (
                                                            <Tooltip
                                                                title={
                                                                    <Box sx={{textAlign: 'center', p: 1}}>
                                                                        <Typography variant="subtitle2"
                                                                                    sx={{fontWeight: 600}}>
                                                                            {info.label}
                                                                        </Typography>
                                                                        <Typography variant="caption">
                                                                            {format(parseISO(d.fullDate), 'dd MMM yyyy')}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                arrow
                                                                placement="top"
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        width: 36,
                                                                        height: 36,
                                                                        borderRadius: '12px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        mx: 'auto',
                                                                        background: info.gradient,
                                                                        color: 'white',
                                                                        cursor: 'pointer',
                                                                        boxShadow: `0 2px 8px ${alpha(info.color, 0.25)}`,
                                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-2px) scale(1.1)',
                                                                            boxShadow: `0 8px 16px ${alpha(info.color, 0.35)}`,
                                                                        },
                                                                    }}
                                                                >
                                                                    {info.icon}
                                                                </Box>
                                                            </Tooltip>
                                                        ) : d.isWeekend ? (
                                                            <Box
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: '12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    mx: 'auto',
                                                                    bgcolor: alpha(theme.palette.grey[400], 0.1),
                                                                    border: `1px dashed ${theme.palette.grey[300]}`,
                                                                }}
                                                            >
                                                                <Typography variant="caption" sx={{
                                                                    color: theme.palette.grey[400],
                                                                    fontWeight: 500
                                                                }}>
                                                                    —
                                                                </Typography>
                                                            </Box>
                                                        ) : null}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    </Fade>
                                ))}

                                {/* Empty state */}
                                {Object.keys(groupedData).length === 0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={datesList.length + 2}
                                            align="center"
                                            sx={{py: 8}}
                                        >
                                            <Box sx={{textAlign: 'center'}}>
                                                <CalendarTodayIcon
                                                    sx={{
                                                        fontSize: 64,
                                                        color: theme.palette.grey[300],
                                                        mb: 2
                                                    }}
                                                />
                                                <Typography variant="h6"
                                                            sx={{color: theme.palette.text.secondary, mb: 1}}>
                                                    No Attendance Data
                                                </Typography>
                                                <Typography variant="body2" sx={{color: theme.palette.text.secondary}}>
                                                    No attendance records found for {selectedMonthYear}.
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Collapse>
            </Card>
        </Box>
    );
};

/* ------------------------------------------------------------------
   Enhanced Main Component
------------------------------------------------------------------- */
const StudentViewAttendance = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const {id: schoolId, session} = useSelector(selectSchoolDetails) || {};
    const userDataActual = useSelector(selectUserActualData);
    const attendanceList = useSelector((s) => s.attendance.attendanceList);
    const isLoading = useSelector((s) => s.attendance.isLoading);

    /* Fetch data on load / change */
    useEffect(() => {
        if (schoolId && session) dispatch(fetchAttendance(schoolId, session));
    }, [dispatch, schoolId, session]);

    /* Enhanced Excel download for selected month only */
    const handleDownload = () => {
        const date = selectedDate?.toDate() || new Date();
        const datesList = generateDatesWithDays(date);
        const monthYear = format(date, 'MMMM-yyyy');

        // Get month boundaries for filtering
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);

        /* Filter for current user and selected month only */
        const userAttendance = attendanceList.filter((a) => {
            const isUserMatch = a.type === 'STUDENT' && a.studentId === userDataActual.tableId;
            if (!isUserMatch) return false;

            try {
                const attendanceDate = parseISO(a.date);
                return isWithinInterval(attendanceDate, {
                    start: monthStart,
                    end: monthEnd
                });
            } catch (error) {
                console.error('Error parsing date for export:', a.date, error);
                return false;
            }
        });

        /* Build attendance map */
        const attendanceMap = {};
        userAttendance.forEach(({date, status}) => {
            attendanceMap[date] = status;
        });

        /* Create detailed sheet data for the selected month */
        const sheetData = datesList.map((d) => ({
            Date: format(parseISO(d.fullDate), 'dd-MMM-yyyy'),
            Day: d.dayName,
            Status: attendanceMap[d.fullDate] || (d.isWeekend ? 'Weekend' : 'No Record'),
            'Is Weekend': d.isWeekend ? 'Yes' : 'No',
        }));

        /* Add summary row */
        const summary = userAttendance.reduce((acc, {status}) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const workingDaysInMonth = datesList.filter(d => !d.isWeekend).length;

        sheetData.push({}, {Date: 'SUMMARY', Day: '', Status: '', 'Is Weekend': ''});
        Object.entries(summary).forEach(([status, count]) => {
            const percentage = workingDaysInMonth > 0
                ? ((count / workingDaysInMonth) * 100).toFixed(1)
                : '0.0';
            sheetData.push({
                Date: status,
                Day: count,
                Status: `${percentage}%`,
                'Is Weekend': '',
            });
        });

        /* Create and save workbook */
        const ws = XLSX.utils.json_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Attendance-${monthYear}`);
        XLSX.writeFile(wb, `${userDataActual.name}_Attendance_${monthYear}.xlsx`);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="xl" sx={{py: 3}}>
                {/* Enhanced Header */}
                {/* Enhanced Date Picker Section */}
                <Fade in timeout={600}>
                    <Card
                        elevation={0}
                        sx={{
                            mb: 4,
                            borderRadius: 4,
                            border: `1px solid ${theme.palette.divider}`,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
                            overflow: 'hidden',
                        }}
                    >
                        <CardContent sx={{p: 4}}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2}}>
                                        <Avatar
                                            sx={{
                                                bgcolor: theme.palette.primary.main,
                                                width: 56,
                                                height: 56,
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            }}
                                        >
                                            <CalendarMonthIcon fontSize="large"/>
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" sx={{fontWeight: 700, mb: 0.5}}>
                                                Select Month & Year
                                            </Typography>
                                            <Typography variant="body2" sx={{color: theme.palette.text.secondary}}>
                                                Choose the month to view your attendance records
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <DatePicker
                                        views={['year', 'month']}
                                        label="Month & Year"
                                        minDate={dayjs('2024-01-01')}
                                        maxDate={dayjs('2100-12-31')}
                                        value={selectedDate}
                                        onChange={(newVal) => setSelectedDate(newVal)}
                                        sx={{
                                            width: '100%',
                                            maxWidth: 400,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 3,
                                                backgroundColor: 'white',
                                                '&:hover fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                    borderWidth: 2,
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: theme.palette.primary.main,
                                                    borderWidth: 2,
                                                },
                                            },
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4} sx={{textAlign: {xs: 'center', md: 'right'}}}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<FileDownloadIcon/>}
                                        onClick={handleDownload}
                                        disabled={isLoading}
                                        sx={{
                                            borderRadius: 3,
                                            py: 1.5,
                                            px: 3,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                                            },
                                            '&:disabled': {
                                                background: theme.palette.grey[300],
                                                boxShadow: 'none',
                                            },
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    >
                                        Download Report
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Fade>

                {/* Loading State */}
                {isLoading && (
                    <Box sx={{mb: 4}}>
                        <LinearProgress
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                },
                            }}
                        />
                    </Box>
                )}

                {/* Enhanced Calendar Component */}
                <AttendanceCalendar selectedDate={selectedDate}/>
            </Container>
        </LocalizationProvider>
    );
};

export default StudentViewAttendance;
