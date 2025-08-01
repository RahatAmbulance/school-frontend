import React, {useEffect, useState} from 'react';
import {
    Box,
    Chip,
    Collapse,
    Fade,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
    Zoom
} from '@mui/material';
import {eachDayOfInterval, endOfMonth, format, startOfMonth} from 'date-fns';
import {useSelector} from 'react-redux';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CelebrationIcon from '@mui/icons-material/Celebration';

// Generate dates for the selected month
const generateDatesWithDays = (selectedDate) => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(startDate);
    const dates = eachDayOfInterval({start: startDate, end: endDate});
    return dates.map(date => ({
        day: format(date, 'd'),
        dayName: format(date, 'EEE'),
        fullDate: format(date, 'yyyy-MM-dd')
    }));
}

const getStatusInfo = (status, theme) => {
    const baseStyle = {
        chip: {
            borderRadius: '16px',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.05)'
            }
        },
        circle: {
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.1)'
            }
        }
    };

    switch (status) {
        case 'Present':
            return {
                color: theme.palette.success.main,
                bgColor: `${theme.palette.success.main}15`,
                icon: <CheckCircleOutlineIcon fontSize="small"/>,
                ...baseStyle
            };
        case 'Late':
            return {
                color: theme.palette.warning.main,
                bgColor: `${theme.palette.warning.main}15`,
                icon: <AccessTimeIcon fontSize="small"/>,
                ...baseStyle
            };
        case 'Absent':
            return {
                color: theme.palette.error.main,
                bgColor: `${theme.palette.error.main}15`,
                icon: <CancelIcon fontSize="small"/>,
                ...baseStyle
            };
        case 'Half Day':
            return {
                color: theme.palette.info.main,
                bgColor: `${theme.palette.info.main}15`,
                icon: <HourglassBottomIcon fontSize="small"/>,
                ...baseStyle
            };
        case 'Leave':
            return {
                color: theme.palette.warning.dark,
                bgColor: `${theme.palette.warning.dark}15`,
                icon: <EventBusyIcon fontSize="small"/>,
                ...baseStyle
            };
        case 'Holiday':
            return {
                color: theme.palette.grey[500],
                bgColor: `${theme.palette.grey[500]}15`,
                icon: <CelebrationIcon fontSize="small"/>,
                ...baseStyle
            };
        default:
            return {
                color: theme.palette.grey[100],
                bgColor: 'transparent',
                icon: null,
                ...baseStyle
            };
    }
};

const AttendanceViewStaff = ({selectedDate, selectedEmployee}) => {
    const theme = useTheme();
    const attendanceList = useSelector(state => state.attendance.attendanceList);
    const [showCalendar, setShowCalendar] = useState(true);
    const [groupedData, setGroupedData] = useState({});
    const dateToUse = selectedDate && !isNaN(new Date(selectedDate)) ? new Date(selectedDate) : new Date();
    const datesList = generateDatesWithDays(dateToUse);

    useEffect(() => {
        const filteredData = selectedEmployee
            ? attendanceList.filter(attendance => attendance.staffId === selectedEmployee)
            : attendanceList.filter(attendance => attendance.type === 'STAFF');

        const grouped = {};
        filteredData.forEach(attendance => {
            const {staffId, name, date, status} = attendance;
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
                        Holiday: 0
                    }
                };
            }
            grouped[staffId].attendance[date] = status;
            if (status) {
                grouped[staffId].summary[status]++;
            }
        });

        setGroupedData(grouped);
    }, [selectedDate, selectedEmployee, attendanceList]);

    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontWeight: 600
                    }}
                >
                    <Zoom in timeout={800}>
                        <CalendarTodayIcon
                            sx={{
                                color: theme.palette.primary.main,
                                fontSize: '1.5rem'
                            }}
                        />
                    </Zoom>
                    Attendance Calendar
                </Typography>
                <IconButton
                    onClick={() => setShowCalendar(!showCalendar)}
                    sx={{
                        transform: showCalendar ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <KeyboardArrowDownIcon/>
                </IconButton>
            </Box>

            <Collapse in={showCalendar}>
                <TableContainer>
                    <Table sx={{minWidth: 650}}>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: theme.palette.primary.main,
                                        color: 'white',
                                        width: '20%',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Staff Name
                                </TableCell>
                                <TableCell
                                    align="center"
                                    sx={{
                                        fontWeight: 600,
                                        backgroundColor: theme.palette.primary.main,
                                        color: 'white',
                                        width: '30%',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Summary
                                </TableCell>
                                {datesList.map((date, index) => (
                                    <TableCell
                                        key={index}
                                        align="center"
                                        sx={{
                                            fontWeight: 600,
                                            backgroundColor: theme.palette.primary.main,
                                            color: 'white',
                                            p: 1,
                                            minWidth: 60
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                            {date.dayName}
                                        </Typography>
                                        <Typography variant="body2">
                                            {date.day}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(groupedData).map(([staffId, data], index) => (
                                <Fade in timeout={600 + index * 100}>
                                    <TableRow
                                        key={staffId}
                                        sx={{
                                            transition: 'background-color 0.2s ease',
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: theme.palette.action.hover,
                                            },
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.selected,
                                            }
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Typography variant="body1" sx={{fontWeight: 500}}>
                                                {data.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{
                                                display: 'flex',
                                                gap: 1,
                                                flexWrap: 'wrap',
                                                justifyContent: 'center'
                                            }}>
                                                {Object.entries(data.summary).map(([status, count]) => count > 0 && (
                                                    <Chip
                                                        key={status}
                                                        label={`${status}: ${count}`}
                                                        size="small"
                                                        icon={getStatusInfo(status, theme).icon}
                                                        sx={{
                                                            ...getStatusInfo(status, theme).chip,
                                                            backgroundColor: getStatusInfo(status, theme).bgColor,
                                                            color: getStatusInfo(status, theme).color,
                                                            border: `1px solid ${getStatusInfo(status, theme).color}`,
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        {datesList.map((date) => {
                                            const status = data.attendance[date.fullDate];
                                            const statusInfo = getStatusInfo(status, theme);
                                            return (
                                                <TableCell
                                                    key={date.fullDate}
                                                    align="center"
                                                    sx={{
                                                        p: 1,
                                                        position: 'relative',
                                                        transition: 'background-color 0.2s ease',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.action.hover,
                                                        },
                                                    }}
                                                >
                                                    {status && (
                                                        <Tooltip
                                                            title={status}
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <Box
                                                                sx={{
                                                                    ...statusInfo.circle,
                                                                    width: 32,
                                                                    height: 32,
                                                                    borderRadius: '50%',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    margin: '0 auto',
                                                                    backgroundColor: statusInfo.bgColor,
                                                                    color: statusInfo.color,
                                                                    border: `2px solid ${statusInfo.color}`,
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {statusInfo.icon}
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                </Fade>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Collapse>
        </Box>
    );
};

export default AttendanceViewStaff;
