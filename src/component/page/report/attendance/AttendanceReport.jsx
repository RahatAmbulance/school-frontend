import React, {useState} from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
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

const AttendanceReport = () => {
    const [filters, setFilters] = useState({
        type: 'student', // student or staff
        class: '',
        section: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Dummy data - replace with actual API call
    const attendanceData = [
        {
            id: 1,
            name: 'John Doe',
            class: 'X',
            section: 'A',
            totalDays: 30,
            presentDays: 27,
            absentDays: 3,
            percentage: '90%'
        },
        {
            id: 2,
            name: 'Jane Smith',
            class: 'X',
            section: 'B',
            totalDays: 30,
            presentDays: 28,
            absentDays: 2,
            percentage: '93%'
        },
    ];

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const months = [
        {value: 1, label: 'January'},
        {value: 2, label: 'February'},
        {value: 3, label: 'March'},
        {value: 4, label: 'April'},
        {value: 5, label: 'May'},
        {value: 6, label: 'June'},
        {value: 7, label: 'July'},
        {value: 8, label: 'August'},
        {value: 9, label: 'September'},
        {value: 10, label: 'October'},
        {value: 11, label: 'November'},
        {value: 12, label: 'December'}
    ];

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Attendance Report</Typography>

                <FilterContainer>
                    <FormControl style={{minWidth: 120}}>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filters.type}
                            label="Type"
                            name="type"
                            onChange={handleFilterChange}
                        >
                            <MenuItem value="student">Student</MenuItem>
                            <MenuItem value="staff">Staff</MenuItem>
                        </Select>
                    </FormControl>

                    {filters.type === 'student' && (
                        <>
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
                        </>
                    )}

                    <TextField
                        select
                        label="Month"
                        name="month"
                        value={filters.month}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        {months.map((month) => (
                            <MenuItem key={month.value} value={month.value}>
                                {month.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                {filters.type === 'student' && (
                                    <>
                                        <TableCell>Class</TableCell>
                                        <TableCell>Section</TableCell>
                                    </>
                                )}
                                <TableCell>Total Days</TableCell>
                                <TableCell>Present Days</TableCell>
                                <TableCell>Absent Days</TableCell>
                                <TableCell>Percentage</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendanceData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.name}</TableCell>
                                    {filters.type === 'student' && (
                                        <>
                                            <TableCell>{record.class}</TableCell>
                                            <TableCell>{record.section}</TableCell>
                                        </>
                                    )}
                                    <TableCell>{record.totalDays}</TableCell>
                                    <TableCell>{record.presentDays}</TableCell>
                                    <TableCell>{record.absentDays}</TableCell>
                                    <TableCell>{record.percentage}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </div>
    );
};

export default AttendanceReport; 