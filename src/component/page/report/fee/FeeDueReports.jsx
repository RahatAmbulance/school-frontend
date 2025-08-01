import React, {useState} from 'react';
import {
    Box,
    Button,
    Chip,
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

const FeeDueReports = () => {
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        dueType: 'all', // all, overdue, upcoming
        sortBy: 'dueDate'
    });

    // Dummy data - replace with actual API call
    const dueData = [
        {
            id: 1,
            studentName: 'John Doe',
            class: 'X',
            section: 'A',
            feeType: 'Tuition',
            dueAmount: 5000,
            dueDate: '2024-03-15',
            status: 'Overdue',
            daysPending: 5
        },
        {
            id: 2,
            studentName: 'Jane Smith',
            class: 'X',
            section: 'B',
            feeType: 'Transport',
            dueAmount: 2000,
            dueDate: '2024-03-20',
            status: 'Upcoming',
            daysPending: 0
        },
    ];

    const summary = {
        totalDue: '₹75,000',
        overdueAmount: '₹25,000',
        totalDefaulters: '30',
        upcomingDues: '15'
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'overdue':
                return 'error';
            case 'upcoming':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Fee Due Report</Typography>

                <SummaryContainer>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="error">{summary.totalDue}</Typography>
                        <Typography variant="body2">Total Due Amount</Typography>
                    </SummaryCard>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="error">{summary.overdueAmount}</Typography>
                        <Typography variant="body2">Overdue Amount</Typography>
                    </SummaryCard>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="warning.main">{summary.totalDefaulters}</Typography>
                        <Typography variant="body2">Total Defaulters</Typography>
                    </SummaryCard>
                    <SummaryCard elevation={2}>
                        <Typography variant="h6" color="info.main">{summary.upcomingDues}</Typography>
                        <Typography variant="body2">Upcoming Dues</Typography>
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
                        label="Due Type"
                        name="dueType"
                        value={filters.dueType}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Sort By"
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="dueDate">Due Date</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="daysPending">Days Pending</MenuItem>
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
                                <TableCell>Due Amount</TableCell>
                                <TableCell>Due Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Days Pending</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dueData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{record.studentName}</TableCell>
                                    <TableCell>{record.class}</TableCell>
                                    <TableCell>{record.section}</TableCell>
                                    <TableCell>{record.feeType}</TableCell>
                                    <TableCell>₹{record.dueAmount}</TableCell>
                                    <TableCell>{record.dueDate}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={record.status}
                                            color={getStatusColor(record.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {record.daysPending > 0 ? (
                                            <Typography color="error">
                                                {record.daysPending} days
                                            </Typography>
                                        ) : '-'}
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

export default FeeDueReports;