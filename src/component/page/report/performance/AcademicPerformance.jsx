import React, {useState} from 'react';
import {Box, Button, Card, CardContent, Grid, MenuItem, Paper, TextField, Typography,} from '@mui/material';
import styled from '@emotion/styled';

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin: 20px;
`;

const FilterContainer = styled(Box)`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const PerformanceCard = styled(Card)`
  height: 100%;
`;

const SubjectPerformance = styled(Box)`
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => props.bgcolor || '#f5f5f5'};
`;

const ProgressBar = styled(Box)`
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.value}%;
    background-color: ${props => props.color || '#1976d2'};
    border-radius: 4px;
  }
`;

const AcademicPerformance = () => {
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        student: '',
        term: 'all'
    });

    // Dummy data - replace with actual API call
    const performanceData = {
        student: {
            name: 'John Doe',
            class: 'X',
            section: 'A',
            rollNo: '101'
        },
        overall: {
            average: 85,
            attendance: 92,
            rank: 5,
            totalStudents: 50
        },
        subjects: [
            {
                name: 'Mathematics',
                average: 88,
                highest: 95,
                lowest: 82,
                trend: 'improving',
                color: '#4CAF50'
            },
            {
                name: 'Science',
                average: 85,
                highest: 92,
                lowest: 78,
                trend: 'stable',
                color: '#2196F3'
            },
            {
                name: 'English',
                average: 82,
                highest: 88,
                lowest: 75,
                trend: 'declining',
                color: '#FFC107'
            }
        ],
        terms: [
            {value: 'term1', label: 'Term 1'},
            {value: 'term2', label: 'Term 2'},
            {value: 'final', label: 'Final'}
        ]
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Academic Performance Report</Typography>

                <FilterContainer>
                    <TextField
                        select
                        label="Class"
                        name="class"
                        value={filters.class}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="X">X</MenuItem>
                        <MenuItem value="XI">XI</MenuItem>
                        <MenuItem value="XII">XII</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Section"
                        name="section"
                        value={filters.section}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                        <MenuItem value="C">C</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Term"
                        name="term"
                        value={filters.term}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="all">All Terms</MenuItem>
                        {performanceData.terms.map(term => (
                            <MenuItem key={term.value} value={term.value}>
                                {term.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <Grid container spacing={3}>
                    {/* Student Info */}
                    <Grid item xs={12} md={6}>
                        <PerformanceCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Student Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Name</Typography>
                                        <Typography variant="body1">{performanceData.student.name}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Roll No</Typography>
                                        <Typography variant="body1">{performanceData.student.rollNo}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Class</Typography>
                                        <Typography variant="body1">{performanceData.student.class}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="body2" color="textSecondary">Section</Typography>
                                        <Typography variant="body1">{performanceData.student.section}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </PerformanceCard>
                    </Grid>

                    {/* Overall Performance */}
                    <Grid item xs={12} md={6}>
                        <PerformanceCard>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Overall Performance</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="h4" color="primary">
                                            {performanceData.overall.average}%
                                        </Typography>
                                        <Typography variant="body2">Average Score</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="h4" color="success.main">
                                            {performanceData.overall.attendance}%
                                        </Typography>
                                        <Typography variant="body2">Attendance</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="body1" align="center" sx={{mt: 2}}>
                                            Rank: {performanceData.overall.rank} of {performanceData.overall.totalStudents}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </PerformanceCard>
                    </Grid>

                    {/* Subject-wise Performance */}
                    <Grid item xs={12}>
                        <Paper sx={{p: 3}}>
                            <Typography variant="h6" gutterBottom>Subject-wise Performance</Typography>
                            {performanceData.subjects.map((subject, index) => (
                                <SubjectPerformance key={index}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1">{subject.name}</Typography>
                                        <Typography variant="h6" color={subject.color}>
                                            {subject.average}%
                                        </Typography>
                                    </Box>
                                    <ProgressBar value={subject.average} color={subject.color}/>
                                    <Box display="flex" justifyContent="space-between" mt={1}>
                                        <Typography variant="caption" color="textSecondary">
                                            Highest: {subject.highest}%
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Lowest: {subject.lowest}%
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color={
                                                subject.trend === 'improving' ? 'success.main' :
                                                    subject.trend === 'declining' ? 'error.main' :
                                                        'text.secondary'
                                            }
                                        >
                                            Trend: {subject.trend}
                                        </Typography>
                                    </Box>
                                </SubjectPerformance>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </StyledPaper>
        </div>
    );
};

export default AcademicPerformance; 