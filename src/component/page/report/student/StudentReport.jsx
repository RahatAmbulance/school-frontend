import React, {useState} from 'react';
import {
    Box,
    Button,
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

const StudentReport = () => {
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        year: new Date().getFullYear(),
        status: 'all'
    });

    // Dummy data - replace with actual API call
    const students = [
        {id: 1, name: 'John Doe', class: 'X', section: 'A', rollNo: '101', status: 'Active'},
        {id: 2, name: 'Jane Smith', class: 'X', section: 'B', rollNo: '102', status: 'Active'},
    ];

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Student Report</Typography>

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
                        label="Status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Roll No</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.rollNo}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.class}</TableCell>
                                    <TableCell>{student.section}</TableCell>
                                    <TableCell>{student.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </div>
    );
};

export default StudentReport; 