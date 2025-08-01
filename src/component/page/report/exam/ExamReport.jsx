import React, {useState} from 'react';
import {
    Box,
    Button,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
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

const StatCard = styled(Paper)`
  padding: 20px;
  text-align: center;
  height: 100%;
`;

const ProgressLabel = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const ExamReport = () => {
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        examType: 'all',
        subject: 'all'
    });

    // Dummy data - replace with actual API call
    const examData = [
        {
            id: 1,
            studentName: 'John Doe',
            class: 'X',
            section: 'A',
            subject: 'Mathematics',
            marksObtained: 85,
            totalMarks: 100,
            grade: 'A',
            examType: 'Mid Term'
        },
        {
            id: 2,
            studentName: 'Jane Smith',
            class: 'X',
            section: 'B',
            subject: 'Science',
            marksObtained: 92,
            totalMarks: 100,
            grade: 'A+',
            examType: 'Mid Term'
        },
    ];

    const stats = {
        averageScore: 82,
        highestScore: 98,
        lowestScore: 45,
        passPercentage: 85,
        gradeDistribution: {
            'A+': 15,
            'A': 25,
            'B': 35,
            'C': 20,
            'D': 5
        }
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A+':
                return '#4CAF50';
            case 'A':
                return '#8BC34A';
            case 'B':
                return '#FFC107';
            case 'C':
                return '#FF9800';
            case 'D':
                return '#F44336';
            default:
                return '#757575';
        }
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Exam Results Report</Typography>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <Typography variant="h4" color="primary">{stats.averageScore}%</Typography>
                            <Typography variant="body2">Average Score</Typography>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <Typography variant="h4" color="success.main">{stats.highestScore}%</Typography>
                            <Typography variant="body2">Highest Score</Typography>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <Typography variant="h4" color="error.main">{stats.lowestScore}%</Typography>
                            <Typography variant="body2">Lowest Score</Typography>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <Typography variant="h4" color="info.main">{stats.passPercentage}%</Typography>
                            <Typography variant="body2">Pass Percentage</Typography>
                        </StatCard>
                    </Grid>
                </Grid>

                <Paper sx={{p: 2, mb: 3}}>
                    <Typography variant="h6" gutterBottom>Grade Distribution</Typography>
                    {Object.entries(stats.gradeDistribution).map(([grade, percentage]) => (
                        <Box key={grade} sx={{mb: 2}}>
                            <Typography variant="body2">{grade}</Typography>
                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: '#e0e0e0',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: getGradeColor(grade)
                                    }
                                }}
                            />
                            <ProgressLabel>
                                <Typography variant="caption">{percentage}%</Typography>
                            </ProgressLabel>
                        </Box>
                    ))}
                </Paper>

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
                        label="Exam Type"
                        name="examType"
                        value={filters.examType}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="midterm">Mid Term</MenuItem>
                        <MenuItem value="final">Final</MenuItem>
                        <MenuItem value="unit">Unit Test</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Subject"
                        name="subject"
                        value={filters.subject}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="mathematics">Mathematics</MenuItem>
                        <MenuItem value="science">Science</MenuItem>
                        <MenuItem value="english">English</MenuItem>
                    </TextField>

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Exam Type</TableCell>
                                <TableCell>Marks</TableCell>
                                <TableCell>Grade</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {examData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.studentName}</TableCell>
                                    <TableCell>{record.class}</TableCell>
                                    <TableCell>{record.section}</TableCell>
                                    <TableCell>{record.subject}</TableCell>
                                    <TableCell>{record.examType}</TableCell>
                                    <TableCell>
                                        {record.marksObtained}/{record.totalMarks}
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            {((record.marksObtained / record.totalMarks) * 100).toFixed(1)}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography style={{color: getGradeColor(record.grade)}}>
                                            {record.grade}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </div>
    );
};

export default ExamReport; 