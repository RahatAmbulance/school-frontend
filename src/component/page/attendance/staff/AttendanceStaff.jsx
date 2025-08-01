import React, {useEffect, useState} from 'react';
import {
    Box,
    Container,
    Fade,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    Zoom
} from '@mui/material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {useDispatch, useSelector} from 'react-redux';
import {fetchAttendance} from '../redux/attendanceActions';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import AssessmentIcon from '@mui/icons-material/Assessment';
import * as XLSX from 'xlsx';
import AttendanceViewStaff from "./AttendanceViewStaff";
import {eachDayOfInterval, endOfMonth, format, startOfMonth} from "date-fns";
import {selectSchoolDetails} from "../../../../common";

function AttendanceStaff() {
    const theme = useTheme();
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const attendanceList = useSelector(state => state.attendance.attendanceList);
    const staffList = useSelector(state => state.staff.staffList);
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    const handleEmployeeChange = (event) => {
        setSelectedEmployee(event.target.value);
    };

    const generateDatesWithDays = (selectedDate) => {
        const startDate = startOfMonth(selectedDate);
        const endDate = endOfMonth(startDate);
        return eachDayOfInterval({start: startDate, end: endDate}).map(date => ({
            day: format(date, 'd'),
            dayName: format(date, 'EEE'),
        }));
    };

    const groupAttendanceByEmployee = (attendanceList) => {
        return attendanceList.reduce((groupedData, attendance) => {
            const {staffId, name, date, status} = attendance;
            if (!groupedData[staffId]) {
                groupedData[staffId] = {name, attendance: {}};
            }
            groupedData[staffId].attendance[date] = status;
            return groupedData;
        }, {});
    };

    const handleDownload = () => {
        const dateToUse = selectedDate && !isNaN(new Date(selectedDate)) ? new Date(selectedDate) : new Date();
        const datesList = generateDatesWithDays(dateToUse);
        const filteredData = selectedEmployee
            ? attendanceList.filter(attendance => attendance.staffId === selectedEmployee)
            : attendanceList;

        const groupedData = groupAttendanceByEmployee(filteredData);
        const sheetData = Object.entries(groupedData).map(([staffId, employeeData]) => {
            const row = {Name: employeeData.name};
            datesList.forEach(date => {
                const formattedDate = format(new Date(dateToUse.getFullYear(), dateToUse.getMonth(), date.day), 'yyyy-MM-dd');
                row[date.day] = employeeData.attendance[formattedDate] || '';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(sheetData, {header: ['Name', ...datesList.map(date => date.day)]});
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
        XLSX.writeFile(workbook, `staff_attendance_${format(dateToUse, 'yyyy-MM')}.xlsx`);
    };

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchAttendance(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container>
                <Fade in timeout={600}>
                    <Grid container spacing={3} sx={{mb: 4}}>
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 2,
                                    gap: 1
                                }}>
                                    <Zoom in timeout={800}>
                                        <PersonSearchIcon
                                            sx={{
                                                fontSize: '2rem',
                                                color: theme.palette.primary.main
                                            }}
                                        />
                                    </Zoom>
                                    <Typography variant="h6" fontWeight={600}>
                                        Select Staff Member
                                    </Typography>
                                </Box>
                                <TextField
                                    select
                                    fullWidth
                                    label="Staff Member"
                                    value={selectedEmployee}
                                    onChange={handleEmployeeChange}
                                    sx={{
                                        backgroundColor: 'background.paper',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value="">All Staff Members</MenuItem>
                                    {staffList.map((option) => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}>
                                        <Zoom in timeout={800}>
                                            <CalendarMonthIcon
                                                sx={{
                                                    fontSize: '2rem',
                                                    color: theme.palette.primary.main
                                                }}
                                            />
                                        </Zoom>
                                        <Typography variant="h6" fontWeight={600}>
                                            Select Month
                                        </Typography>
                                    </Box>
                                    <Tooltip
                                        title="Download Attendance Report"
                                        placement="left"
                                        arrow
                                    >
                                        <IconButton
                                            onClick={handleDownload}
                                            sx={{
                                                backgroundColor: theme.palette.primary.main,
                                                color: 'white',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: theme.palette.primary.dark,
                                                    transform: 'scale(1.1)'
                                                }
                                            }}
                                        >
                                            <FileDownloadIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <DatePicker
                                    views={['year', 'month']}
                                    label="Month & Year"
                                    minDate={dayjs('2024-01-01')}
                                    maxDate={dayjs('2100-12-31')}
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    sx={{
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }
                                    }}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Fade>

                <Fade in timeout={800}>
                    <Paper
                        elevation={3}
                        sx={{
                            mb: 4,
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 6
                            }
                        }}
                    >
                        <Box sx={{
                            p: 2,
                            bgcolor: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <AssessmentIcon sx={{color: 'white'}}/>
                            <Typography variant="h6" sx={{color: 'white', fontWeight: 600}}>
                                Attendance Records
                            </Typography>
                        </Box>
                        <AttendanceViewStaff
                            selectedDate={selectedDate}
                            selectedEmployee={selectedEmployee}
                        />
                    </Paper>
                </Fade>
            </Container>
        </LocalizationProvider>
    );
}

export default AttendanceStaff;
