import React, {useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
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

const StatCard = styled(Card)`
  height: 100%;
`;

const ExpenseReport = () => {
    const [filters, setFilters] = useState({
        category: '',
        dateRange: 'month',
        status: 'all',
        sortBy: 'date'
    });

    // Dummy data - replace with actual API call
    const expenseData = [
        {
            id: 1,
            date: '2024-03-01',
            category: 'Utilities',
            description: 'Electricity Bill',
            amount: 25000,
            paymentMethod: 'Bank Transfer',
            status: 'Paid',
            approvedBy: 'John Smith'
        },
        {
            id: 2,
            date: '2024-03-05',
            category: 'Maintenance',
            description: 'Building Repairs',
            amount: 15000,
            paymentMethod: 'Check',
            status: 'Pending',
            approvedBy: 'Mary Johnson'
        },
    ];

    const summary = {
        totalExpenses: '₹2,50,000',
        monthlyAverage: '₹75,000',
        pendingPayments: '₹35,000',
        categories: 8,
        budgetUtilization: '85%'
    };

    const categories = [
        'Utilities',
        'Maintenance',
        'Supplies',
        'Equipment',
        'Salaries',
        'Transportation',
        'Events',
        'Miscellaneous'
    ];

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Expense Report</Typography>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h6" color="error">{summary.totalExpenses}</Typography>
                                <Typography variant="body2">Total Expenses</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h6" color="primary">{summary.monthlyAverage}</Typography>
                                <Typography variant="body2">Monthly Average</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h6" color="warning.main">{summary.pendingPayments}</Typography>
                                <Typography variant="body2">Pending Payments</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h6" color="info.main">{summary.categories}</Typography>
                                <Typography variant="body2">Categories</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h6" color="success.main">{summary.budgetUtilization}</Typography>
                                <Typography variant="body2">Budget Utilization</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                </Grid>

                <FilterContainer>
                    <TextField
                        select
                        label="Category"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="">All</MenuItem>
                        {categories.map((category) => (
                            <MenuItem key={category} value={category.toLowerCase()}>
                                {category}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Date Range"
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                        <MenuItem value="quarter">This Quarter</MenuItem>
                        <MenuItem value="year">This Year</MenuItem>
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
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Sort By"
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="date">Date</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="status">Status</MenuItem>
                    </TextField>

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Payment Method</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Approved By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expenseData.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{expense.date}</TableCell>
                                    <TableCell>{expense.category}</TableCell>
                                    <TableCell>{expense.description}</TableCell>
                                    <TableCell>
                                        <Typography color="error">
                                            ₹{expense.amount.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{expense.paymentMethod}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={expense.status}
                                            color={getStatusColor(expense.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{expense.approvedBy}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </div>
    );
};

export default ExpenseReport; 