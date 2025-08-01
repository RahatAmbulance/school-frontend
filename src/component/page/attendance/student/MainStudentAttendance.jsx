import React, {useState} from 'react';
import {Box, Container, Paper, Tab, Tabs, Typography, useTheme} from '@mui/material';
import AttendanceTakeStudent from './AttendanceTakeStudent';
import AttendanceStudent from './AttendanceStudent';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssessmentIcon from '@mui/icons-material/Assessment';

const MainStudentAttendance = () => {
    const [value, setValue] = useState(0);
    const theme = useTheme();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{py: 4}}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                        textAlign: 'center',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        mb: 4
                    }}
                >
                    Student Attendance Management
                </Typography>

                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: theme.palette.background.paper
                    }}
                >
                    <Box sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: theme.palette.grey[50]
                    }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="attendance tabs"
                            centered
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                '& .MuiTab-root': {
                                    minHeight: 64,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                    },
                                },
                            }}
                        >
                            <Tab
                                icon={<CalendarMonthIcon/>}
                                iconPosition="start"
                                label="Take Attendance"
                                sx={{py: 2}}
                            />
                            <Tab
                                icon={<AssessmentIcon/>}
                                iconPosition="start"
                                label="View Attendance"
                                sx={{py: 2}}
                            />
                        </Tabs>
                    </Box>

                    <Box sx={{p: {xs: 2, md: 3}}}>
                        {value === 0 && <AttendanceTakeStudent/>}
                        {value === 1 && <AttendanceStudent/>}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default MainStudentAttendance;
