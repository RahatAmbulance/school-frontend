import React, {useState} from 'react';
import {Box, Container, Fade, Paper, Tab, Tabs, Typography, useTheme, Zoom} from '@mui/material';
import {Assessment, Groups2Rounded, PersonAdd} from '@mui/icons-material';
import AttendanceTakeStaff from "./AttendanceTakeStaff";
import AttendanceStaff from "./AttendanceStaff";

const MainStaffAttendance = () => {
    const [value, setValue] = useState(0);
    const theme = useTheme();

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Fade in timeout={600}>
            <Container maxWidth="xl">
                <Box sx={{
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        mb: 3
                    }}>
                        <Zoom in timeout={800}>
                            <Groups2Rounded
                                sx={{
                                    fontSize: '2.5rem',
                                    color: theme.palette.primary.main
                                }}
                            />
                        </Zoom>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                textAlign: 'center',
                            }}
                        >
                            Staff Attendance Management
                        </Typography>
                    </Box>

                    <Paper
                        elevation={3}
                        sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[6]
                            }
                        }}
                    >
                        <Box sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '2px',
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }
                        }}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                aria-label="attendance tabs"
                                variant="fullWidth"
                                sx={{
                                    '& .MuiTab-root': {
                                        minHeight: 70,
                                        fontSize: '1.1rem',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                        }
                                    },
                                    '& .Mui-selected': {
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                    },
                                    '& .MuiTabs-indicator': {
                                        height: 3,
                                        borderRadius: '3px 3px 0 0',
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                    }
                                }}
                            >
                                <Tab
                                    icon={<PersonAdd sx={{fontSize: '1.5rem'}}/>}
                                    iconPosition="start"
                                    label="Take Staff Attendance"
                                    sx={{
                                        py: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                />
                                <Tab
                                    icon={<Assessment sx={{fontSize: '1.5rem'}}/>}
                                    iconPosition="start"
                                    label="View Attendance Records"
                                    sx={{
                                        py: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                    }}
                                />
                            </Tabs>
                        </Box>

                        <Box sx={{
                            p: {xs: 2, md: 3},
                            minHeight: '70vh'
                        }}>
                            <Fade in={value === 0} timeout={500}>
                                <Box sx={{display: value === 0 ? 'block' : 'none'}}>
                                    <AttendanceTakeStaff/>
                                </Box>
                            </Fade>
                            <Fade in={value === 1} timeout={500}>
                                <Box sx={{display: value === 1 ? 'block' : 'none'}}>
                                    <AttendanceStaff/>
                                </Box>
                            </Fade>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </Fade>
    );
};

export default MainStaffAttendance;
