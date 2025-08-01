import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Chip,
    CircularProgress,
    Collapse,
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
    useTheme
} from '@mui/material';
import {eachDayOfInterval, endOfMonth, format, startOfMonth} from 'date-fns';
import {useSelector} from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';

const generateDatesWithDays = (selectedDate) => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(startDate);
    const dates = eachDayOfInterval({start: startDate, end: endDate});
    return dates.map(date => ({
        day: format(date, 'd'),
        dayName: format(date, 'EEE'),
    }));
}

const getStatusDetails = (status) => {
    switch (status) {
        case 'Present':
            return {
                icon: <CheckCircleIcon fontSize="small"/>,
                color: '#28a745',
                bgcolor: '#e8f5e9'
            };
        case 'Late':
            return {
                icon: <AccessTimeIcon fontSize="small"/>,
                color: '#ffc107',
                bgcolor: '#fff8e1'
            };
        case 'Absent':
            return {
                icon: <CancelIcon fontSize="small"/>,
                color: '#dc3545',
                bgcolor: '#ffebee'
            };
        case 'Half Day':
            return {
                icon: <HourglassBottomIcon fontSize="small"/>,
                color: '#5bc0de',
                bgcolor: '#e1f5fe'
            };
        case 'Leave':
            return {
                icon: <EventBusyIcon fontSize="small"/>,
                color: '#ff5722',
                bgcolor: '#fbe9e7'
            };
        case 'Holiday':
            return {
                icon: <BeachAccessIcon fontSize="small"/>,
                color: '#6c757d',
                bgcolor: '#f5f5f5'
            };
        default:
            return {
                icon: null,
                color: '#ffffff',
                bgcolor: '#ffffff'
            };
    }
};

const groupAttendanceByEmployee = (attendanceList, selectedDate) => {
    const groupedData = {};
    const month = selectedDate.getMonth();
    attendanceList.forEach(attendance => {
        const {studentId, name, date, status, className, section} = attendance;
        const attendanceDate = new Date(date);

        if (attendanceDate.getMonth() !== month) return;

        if (!groupedData[studentId]) {
            groupedData[studentId] = {
                name,
                className: className || 'N/A',
                section: section || 'N/A',
                attendance: {},
                totalPresent: 0,
                totalAbsent: 0,
                totalLate: 0,
                totalHalfDay: 0,
                totalLeave: 0,
                totalHoliday: 0,
            };
        }
        groupedData[studentId].attendance[date] = status;
        switch (status) {
            case 'Present':
                groupedData[studentId].totalPresent += 1;
                break;
            case 'Absent':
                groupedData[studentId].totalAbsent += 1;
                break;
            case 'Late':
                groupedData[studentId].totalLate += 1;
                break;
            case 'Half Day':
                groupedData[studentId].totalHalfDay += 1;
                break;
            case 'Leave':
                groupedData[studentId].totalLeave += 1;
                break;
            case 'Holiday':
                groupedData[studentId].totalHoliday += 1;
                break;
            default:
                break;
        }
    });
    return groupedData;
};

const AttendanceViewStudent = ({studentId, selectedDate, className, section}) => {
    const navigate = useNavigate();
    const attendanceList = useSelector(state => state.attendance.attendanceList);
    const [groupedData, setGroupedData] = useState({});
    const [showDayColumns, setShowDayColumns] = useState(false);
    const theme = useTheme();
    const dateToUse = selectedDate && !isNaN(new Date(selectedDate)) ? new Date(selectedDate) : new Date();
    const datesList = generateDatesWithDays(dateToUse);

    useEffect(() => {
        const filteredData = attendanceList.filter(attendance => {
            if (className && section) {
                return attendance.className === className && attendance.section === section;
            }
            if (className) {
                return attendance.className === className;
            }
            return true;
        });

        const grouped = groupAttendanceByEmployee(filteredData, dateToUse);
        setGroupedData(grouped);
    }, [selectedDate, className, section, attendanceList, dateToUse]);

    const StatChip = ({label, count, color, icon}) => (
        <Chip
            icon={icon}
            label={`${label}: ${count}`}
            sx={{
                backgroundColor: color,
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-icon': {
                    color: 'white'
                }
            }}
        />
    );

    if (!attendanceList.length) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 200
            }}>
                <CircularProgress/>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            >
                                Student Details
                            </TableCell>
                            <TableCell
                                colSpan={6}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    fontWeight: 600
                                }}
                            >
                                Attendance Summary
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                }}
                            >
                                <Tooltip title={showDayColumns ? "Hide Daily View" : "Show Daily View"}>
                                    <IconButton
                                        onClick={() => setShowDayColumns(!showDayColumns)}
                                        sx={{
                                            color: 'white',
                                            transform: showDayColumns ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.3s'
                                        }}
                                    >
                                        <ExpandMoreIcon/>
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(groupedData).map(([studentId, data], index) => (
                            <React.Fragment key={studentId}>
                                <TableRow
                                    sx={{
                                        backgroundColor: index % 2 === 0 ? 'white' : theme.palette.grey[50],
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={500}>
                                                {data.name}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Class: {data.className} | Section: {data.section}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <StatChip
                                            label="Present"
                                            count={data.totalPresent}
                                            color="#28a745"
                                            icon={<CheckCircleIcon/>}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatChip
                                            label="Absent"
                                            count={data.totalAbsent}
                                            color="#dc3545"
                                            icon={<CancelIcon/>}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatChip
                                            label="Late"
                                            count={data.totalLate}
                                            color="#ffc107"
                                            icon={<AccessTimeIcon/>}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatChip
                                            label="Half Day"
                                            count={data.totalHalfDay}
                                            color="#5bc0de"
                                            icon={<HourglassBottomIcon/>}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatChip
                                            label="Leave"
                                            count={data.totalLeave}
                                            color="#ff5722"
                                            icon={<EventBusyIcon/>}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatChip
                                            label="Holiday"
                                            count={data.totalHoliday}
                                            color="#6c757d"
                                            icon={<BeachAccessIcon/>}
                                        />
                                    </TableCell>
                                    <TableCell/>
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={8} sx={{p: 0, border: 0}}>
                                        <Collapse in={showDayColumns} timeout="auto" unmountOnExit>
                                            <Box sx={{py: 2, px: 3, backgroundColor: theme.palette.grey[50]}}>
                                                <TableContainer component={Paper} elevation={0}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                {datesList.map((date, index) => (
                                                                    <TableCell
                                                                        key={index}
                                                                        align="center"
                                                                        sx={{
                                                                            fontWeight: 500,
                                                                            backgroundColor: theme.palette.grey[100]
                                                                        }}
                                                                    >
                                                                        <Typography variant="caption" display="block">
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
                                                            <TableRow>
                                                                {datesList.map((date, index) => {
                                                                    const formattedDate = format(
                                                                        new Date(dateToUse.getFullYear(), dateToUse.getMonth(), date.day),
                                                                        'yyyy-MM-dd'
                                                                    );
                                                                    const status = data.attendance[formattedDate] || '';
                                                                    const statusDetails = getStatusDetails(status);

                                                                    return (
                                                                        <TableCell
                                                                            key={index}
                                                                            align="center"
                                                                            sx={{
                                                                                backgroundColor: statusDetails.bgcolor,
                                                                                transition: 'all 0.3s ease'
                                                                            }}
                                                                        >
                                                                            <Tooltip title={status || 'No Record'}>
                                                                                <Box sx={{color: statusDetails.color}}>
                                                                                    {statusDetails.icon}
                                                                                </Box>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AttendanceViewStudent;
