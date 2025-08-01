import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    useTheme
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {api, selectSchoolDetails} from "../../../../common";
import {useSelector} from "react-redux";
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

const AttendanceTakeStudent = () => {
    const [date, setDate] = useState(dayjs());
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMessages, setDialogMessages] = useState([]);
    const [dialogTitle, setDialogTitle] = useState("");
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector(state => state.master?.data?.classSections);
    const student = useSelector(state => state.master?.data?.student);
    const attendanceList = useSelector(state => state.attendance.attendanceList);
    const schoolId = userData?.id;
    const session = userData?.session;
    const theme = useTheme();
    const [formValues, setFormValues] = useState({
        section: '',
        className: '',
    });

    // Set initial students
    useEffect(() => {
        if (formValues.className && formValues.section) {
            fetchStudents(formValues.className, formValues.section);
        }
    }, [formValues.className, formValues.section]);

    // useEffect(() => {
    //     if (student) setStudents(student);
    // }, [student]);

    useEffect(() => {
        if (students) {
            setAttendance(
                students.map(student => {
                    const existingRecord = attendanceList.find(record => {
                        const studentIdAsString = record.studentId ? String(record.studentId) : '';
                        const studentIdFromListAsString = student.id ? String(student.id) : '';

                        // Compare studentId and date
                        const isSameStudent = studentIdAsString === studentIdFromListAsString;
                        const isSameDate = record.date === date.format('YYYY-MM-DD');  // Assuming date is a moment object

                        return isSameStudent && isSameDate;
                    });

                    console.log("existingRecord", existingRecord);

                    // Return existing record if found, or create a new default record
                    return existingRecord || {
                        studentId: student.id,
                        status: 'Present',
                        comment: '',
                        schoolId,
                        session,
                        type: 'STUDENT',
                        name: student.studentName,
                        className: student.className,
                        section: student.section,
                        date: date.format('YYYY-MM-DD') // Add the date to the new record as well
                    };
                })
            );
        }

        console.log("Attendance", attendance);
    }, [students, attendanceList, userData]);

    const handleAttendanceChange = (studentId, field, value) => {
        setAttendance(prev => prev.map(record =>
            record.studentId === studentId ? {...record, [field]: value} : record
        ));
    };

    const handleMakeAll = (status) => {
        setAttendance(prev => prev.map(record => ({
            ...record,
            status,
            comment: status === 'Present' || status === 'Absent' ? '' : record.comment
        })));
    };

    const handleSubmit = () => {
        // Check if attendance data is empty
        if (!attendance || attendance.length === 0) {
            setDialogMessages(["No attendance data to save."]);
            setOpenDialog(true);
            return;
        }
        const errors = [];
        const API_ENDPOINT = '/api/attendance';
        attendance.forEach(record => {
            if ((record.status === 'Late' || record.status === 'Half Day') && !record.comment) {
                const studentName = students.find(student => student.id === record.studentId).studentName;
                errors.push(`Comment is required for ${studentName} when status is ${record.status}.`);
            }
        });

        if (errors.length > 0) {
            setDialogMessages(errors);
            setOpenDialog(true);
            return;
        }
        console.log("Date", date);
        const attendanceData = attendance.map(record => ({
            id: record.id,
            studentId: record.studentId,
            date: date.format('YYYY-MM-DD'),
            status: record.status,
            comment: record.comment,
            schoolId,
            type: 'STUDENT',
            name: record.name,
            className: record.className,
            section: record.section,
            session,
        }));
// Submit attendance
        api.post(API_ENDPOINT, attendanceData)
            .then(response => {
                // Show success dialog
                setDialogMessages(['Attendance saved successfully!']);
                setOpenDialog(true);
            })
            .catch(error => {
                setDialogMessages(["Failed to save attendance. Please try again."]);
                setOpenDialog(true);
                console.error("There was an error saving the attendance!", error);
            });
    };
    const fetchAttendance = async (selectedDate) => {
        try {
            const response = await api.get('/api/attendance', {
                params: {
                    date: selectedDate.format('YYYY-MM-DD'),
                    schoolId,
                    session,
                },
            });
            setAttendance(response.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };
    // useEffect(() => {
    //     if (students.length > 0) {
    //         fetchAttendance(date);
    //     }
    // }, [date, students]);
    const handleChange = async (e) => {
        const {name, value} = e.target;
        setFormValues(prev => ({...prev, [name]: value}));

        // Update the form values
        const updatedFormValues = {
            ...formValues,
            [name]: value,
        };

        setFormValues(updatedFormValues);

        // Fetch students when class or section changes
        if (name === 'className') {
            await fetchStudents(updatedFormValues.className);
        } else if (name === 'section') {
            await fetchStudents(updatedFormValues.className, updatedFormValues.section);
        }
    };

    // const fetchStudentsWithSection = async (className, section) => {
    //     try {
    //         const response = await api.get('/api/students/class/section/school', {
    //             params: {
    //                 className: className || formValues.className,
    //                 section: section || formValues.section,
    //                 schoolId: schoolId,
    //             },
    //         });
    //         setStudents(response.data);
    //     } catch (error) {
    //         console.error('Error fetching students:', error);
    //     }
    // };

    const fetchStudents = async (className, section) => {
        try {
            const response = await api.get('/api/students/class/section/school', {
                params: {
                    className,
                    section,
                    schoolId,
                },
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present':
                return theme.palette.success.main;
            case 'Absent':
                return theme.palette.error.main;
            case 'Late':
                return theme.palette.warning.main;
            case 'Half Day':
                return theme.palette.info.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present':
                return <CheckCircleIcon/>;
            case 'Absent':
                return <CancelIcon/>;
            case 'Late':
                return <AccessTimeIcon/>;
            case 'Half Day':
                return <HourglassBottomIcon/>;
            default:
                return null;
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Grid container spacing={3} sx={{mb: 4}}>
                    <Grid item xs={12} sm={3}>
                        <DatePicker
                            label="Select Date"
                            value={date}
                            onChange={(newDate) => setDate(newDate)}
                            renderInput={(params) => <TextField {...params} fullWidth/>}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: theme.palette.primary.main,
                                    },
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Class</InputLabel>
                            <Select
                                value={formValues.className}
                                onChange={handleChange}
                                name="className"
                                label="Class"
                            >
                                {classSections?.map((classSection) => (
                                    <MenuItem key={classSection.id} value={classSection.name}>
                                        {classSection.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                            <InputLabel>Section</InputLabel>
                            <Select
                                value={formValues.section}
                                onChange={handleChange}
                                name="section"
                                label="Section"
                                disabled={!formValues.className}
                            >
                                {classSections?.find(cs => cs.name === formValues.className)?.sections?.map((section) => (
                                    <MenuItem key={section.id} value={section.name}>
                                        {section.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {students.length > 0 && (
                    <Paper elevation={2} sx={{p: 3, borderRadius: 2}}>
                        <Box sx={{mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                            <Button
                                variant="outlined"
                                onClick={() => handleMakeAll('Present')}
                                startIcon={<CheckCircleIcon/>}
                                color="success"
                            >
                                Mark All Present
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => handleMakeAll('Absent')}
                                startIcon={<CancelIcon/>}
                                color="error"
                            >
                                Mark All Absent
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{fontWeight: 'bold'}}>Student Name</TableCell>
                                        <TableCell sx={{fontWeight: 'bold'}}>Status</TableCell>
                                        <TableCell sx={{fontWeight: 'bold'}}>Comment</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendance.map((record) => (
                                        <TableRow key={record.studentId}>
                                            <TableCell>{record.name}</TableCell>
                                            <TableCell>
                                                <RadioGroup
                                                    row
                                                    value={record.status}
                                                    onChange={(e) => handleAttendanceChange(record.studentId, 'status', e.target.value)}
                                                >
                                                    {['Present', 'Absent', 'Late', 'Half Day'].map((status) => (
                                                        <FormControlLabel
                                                            key={status}
                                                            value={status}
                                                            control={
                                                                <Radio
                                                                    sx={{
                                                                        color: getStatusColor(status),
                                                                        '&.Mui-checked': {
                                                                            color: getStatusColor(status),
                                                                        },
                                                                    }}
                                                                />
                                                            }
                                                            label={
                                                                <Chip
                                                                    icon={getStatusIcon(status)}
                                                                    label={status}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: record.status === status ? getStatusColor(status) : 'transparent',
                                                                        color: record.status === status ? 'white' : 'inherit',
                                                                    }}
                                                                />
                                                            }
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={record.comment || ''}
                                                    onChange={(e) => handleAttendanceChange(record.studentId, 'comment', e.target.value)}
                                                    placeholder="Add comment if needed"
                                                    disabled={record.status === 'Present' || record.status === 'Absent'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                startIcon={<SaveIcon/>}
                                sx={{
                                    backgroundColor: theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.dark,
                                    },
                                }}
                            >
                                Save Attendance
                            </Button>
                        </Box>
                    </Paper>
                )}

                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {dialogTitle || "Attention Required"}
                    </DialogTitle>
                    <DialogContent>
                        {dialogMessages.map((message, index) => (
                            <Alert
                                key={index}
                                severity={message.includes("successfully") ? "success" : "error"}
                                sx={{mt: index > 0 ? 1 : 0}}
                            >
                                {message}
                            </Alert>
                        ))}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </LocalizationProvider>
    );
};

export default AttendanceTakeStudent;
