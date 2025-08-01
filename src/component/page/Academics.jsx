import React from 'react';
import {alpha, Box, Card, CardContent, Grid, styled, Typography, useTheme} from '@mui/material';
import {Assessment, People, Schedule, School, TrendingUp} from '@mui/icons-material'; // Correct icon imports
import {DataGrid} from '@mui/x-data-grid';

// Styled Components
const GradientCard = styled(Card)(({theme}) => ({
    background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.action.hover, 0.2)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[6],
    },
}));

const SubjectPill = styled(Typography)(({theme, color}) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 2),
    borderRadius: 20,
    backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
    color: color || theme.palette.primary.main,
    fontWeight: 500,
    transition: 'all 0.2s ease',
}));

const AcademicDashboard = () => {
    const theme = useTheme();

    // Sample Data
    const students = [
        {id: 1, name: 'Student 1', class: 'Grade 10', attendance: '95%', performance: 'A'},
        {id: 2, name: 'Student 2', class: 'Grade 9', attendance: '89%', performance: 'B+'},
        {id: 3, name: 'Student 3', class: 'Grade 11', attendance: '92%', performance: 'A-'},
    ];

    const schedule = [
        {time: '08:00 AM', subject: 'Mathematics', room: 'B-201'},
        {time: '09:30 AM', subject: 'Physics', room: 'Lab-3'},
        {time: '11:00 AM', subject: 'Literature', room: 'A-104'},
    ];

    return (
        <Box sx={{
            p: 4,
            maxWidth: 1200,
            mx: 'auto',
            background: `linear-gradient(45deg, ${alpha(theme.palette.background.default, 0.95)} 30%, ${alpha(theme.palette.action.selected, 0.1)} 90%)`,
            borderRadius: 4,
            boxShadow: 24,
        }}>
            <Grid container spacing={4}>

                {/* Header Section */}
                <Grid item xs={12}>
                    <GradientCard>
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={3}>
                                <School sx={{fontSize: 48, color: theme.palette.primary.main}}/>
                                <Box>
                                    <Typography variant="h4" fontWeight={700} sx={{
                                        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}>
                                        Academic Dashboard
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        Grade 10 - 2023/2024 Academic Year
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </GradientCard>
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12} md={4}>
                    <GradientCard>
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                                <Assessment fontSize="small"/> Academic Summary
                            </Typography>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography>Total Students:</Typography>
                                    <SubjectPill>245</SubjectPill>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography>Average GPA:</Typography>
                                    <SubjectPill color={theme.palette.success.main}>3.75</SubjectPill>
                                </Box>
                                <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                                    <Typography>Subjects:</Typography>
                                    <SubjectPill color={theme.palette.info.main}>12</SubjectPill>
                                </Box>
                            </Box>
                        </CardContent>
                    </GradientCard>
                </Grid>

                {/* Class Schedule */}
                <Grid item xs={12} md={4}>
                    <GradientCard>
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                                <Schedule fontSize="small"/> Today's Schedule
                            </Typography>
                            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                                {schedule.map((item, index) => (
                                    <Box key={index} sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: alpha(theme.palette.background.paper, 0.4),
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateX(5px)',
                                        },
                                    }}>
                                        <Typography variant="subtitle2">{item.time}</Typography>
                                        <Typography fontWeight={500}>{item.subject}</Typography>
                                        <Typography variant="body2" color="textSecondary">{item.room}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </GradientCard>
                </Grid>

                {/* Performance Chart */}
                <Grid item xs={12} md={4}>
                    <GradientCard>
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                                <TrendingUp fontSize="small"/> Class Performance
                            </Typography>
                            <Box sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(45deg, ${alpha(theme.palette.primary.light, 0.1)} 30%, ${alpha(theme.palette.secondary.light, 0.1)} 90%)`,
                                borderRadius: 2,
                            }}>
                                <Assessment sx={{fontSize: 80, color: alpha(theme.palette.text.primary, 0.2)}}/>
                            </Box>
                        </CardContent>
                    </GradientCard>
                </Grid>

                {/* Student List */}
                <Grid item xs={12}>
                    <GradientCard>
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2, display: 'flex', alignItems: 'center', gap: 1}}>
                                <People fontSize="small"/> Student Roster
                            </Typography>
                            <Box sx={{height: 400, width: '100%'}}>
                                <DataGrid
                                    rows={students}
                                    columns={[
                                        {field: 'name', headerName: 'Name', flex: 1},
                                        {field: 'class', headerName: 'Class', flex: 1},
                                        {field: 'attendance', headerName: 'Attendance', flex: 1},
                                        {
                                            field: 'performance',
                                            headerName: 'Performance',
                                            renderCell: (params) => (
                                                <SubjectPill color={
                                                    params.value === 'A' ? theme.palette.success.main :
                                                        params.value === 'B+' ? theme.palette.warning.main :
                                                            theme.palette.error.main
                                                }>
                                                    {params.value}
                                                </SubjectPill>
                                            )
                                        },
                                    ]}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    sx={{
                                        border: 'none',
                                        '& .MuiDataGrid-cell:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </GradientCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AcademicDashboard;