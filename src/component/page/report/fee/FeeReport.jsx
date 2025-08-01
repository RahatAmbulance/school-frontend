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

const SummaryContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const SummaryCard = styled(Paper)`
  padding: 20px;
  text-align: center;
`;

const FeeReport = () => {
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        feeType: 'all'
    });

    // Dummy data - replace with actual API call
    const feeData = [
        {
            id: 1,
            studentName: 'John Doe',
            class: 'X',
            section: 'A',
            feeType: 'Tuition',
            amount: 5000,
            status: 'Paid',
            date: '2024-03-01'
        },
        {
            id: 2,
            studentName: 'Jane Smith',
            class: 'X',
            section: 'B',
            feeType: 'Transport',
            amount: 2000,
            status: 'Pending',
            date: '2024-03-05'
        },
    ];

    const summary = {
        totalCollected: '₹50,000',
        pendingAmount: '₹15,000',
        totalStudents: '150',
        defaulters: '10'
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const feeTypes = [
        {value: 'all', label: 'All'},
        {value: 'tuition', label: 'Tuition Fee'},
        {value: 'transport', label: 'Transport Fee'},
        {value: 'library', label: 'Library Fee'},
        {value: 'laboratory', label: 'Laboratory Fee'}
    ];

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Fee Report</Typography>

                <SummaryContainer>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="primary">{summary.totalCollected}</Typography>
                        <Typography variant="body2">Total Collected</Typography>
                    </SummaryCard>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="error">{summary.pendingAmount}</Typography>
                        <Typography variant="body2">Pending Amount</Typography>
                    </SummaryCard>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6">{summary.totalStudents}</Typography>
                        <Typography variant="body2">Total Students</Typography>
                    </SummaryCard>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="warning.main">{summary.defaulters}</Typography>
                        <Typography variant="body2">Defaulters</Typography>
                    </SummaryCard>
                </SummaryContainer>

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
                        label="Fee Type"
                        name="feeType"
                        value={filters.feeType}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        {feeTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
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
                                <TableCell>Student Name</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Fee Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {feeData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.studentName}</TableCell>
                                    <TableCell>{record.class}</TableCell>
                                    <TableCell>{record.section}</TableCell>
                                    <TableCell>{record.feeType}</TableCell>
                                    <TableCell>₹{record.amount}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color={record.status === 'Paid' ? 'success.main' : 'error.main'}
                                        >
                                            {record.status}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{record.date}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </div>
    );
};

export default FeeReport; 