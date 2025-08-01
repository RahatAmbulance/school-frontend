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

const LibraryReport = () => {
    const [filters, setFilters] = useState({
        category: '',
        status: 'all',
        sortBy: 'title',
        dateRange: 'month'
    });

    // Dummy data - replace with actual API call
    const libraryData = [
        {
            id: 1,
            title: 'Mathematics for Class X',
            category: 'Textbook',
            author: 'John Smith',
            copies: 50,
            available: 42,
            issued: 8,
            condition: 'Good'
        },
        {
            id: 2,
            title: 'Science Encyclopedia',
            category: 'Reference',
            author: 'Mary Johnson',
            copies: 20,
            available: 18,
            issued: 2,
            condition: 'Excellent'
        },
    ];

    const summary = {
        totalBooks: 2500,
        booksIssued: 350,
        overdueBooks: 45,
        categories: 12,
        newAdditions: 75
    };

    const categories = [
        'Textbook',
        'Reference',
        'Fiction',
        'Non-Fiction',
        'Magazine',
        'Journal'
    ];

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getConditionColor = (condition) => {
        switch (condition.toLowerCase()) {
            case 'excellent':
                return 'success';
            case 'good':
                return 'primary';
            case 'fair':
                return 'warning';
            case 'poor':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Library Report</Typography>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="primary">{summary.totalBooks}</Typography>
                                <Typography variant="body2">Total Books</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="info.main">{summary.booksIssued}</Typography>
                                <Typography variant="body2">Books Issued</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="error.main">{summary.overdueBooks}</Typography>
                                <Typography variant="body2">Overdue Books</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.categories}</Typography>
                                <Typography variant="body2">Categories</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.newAdditions}</Typography>
                                <Typography variant="body2">New Additions</Typography>
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
                        label="Status"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="available">Available</MenuItem>
                        <MenuItem value="issued">Issued</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Sort By"
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="title">Title</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="author">Author</MenuItem>
                        <MenuItem value="copies">Copies</MenuItem>
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

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Author</TableCell>
                                <TableCell>Total Copies</TableCell>
                                <TableCell>Available</TableCell>
                                <TableCell>Issued</TableCell>
                                <TableCell>Condition</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {libraryData.map((book) => (
                                <TableRow key={book.id}>
                                    <TableCell>{book.title}</TableCell>
                                    <TableCell>{book.category}</TableCell>
                                    <TableCell>{book.author}</TableCell>
                                    <TableCell>{book.copies}</TableCell>
                                    <TableCell>
                                        <Typography color="success.main">
                                            {book.available}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography color="info.main">
                                            {book.issued}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={book.condition}
                                            color={getConditionColor(book.condition)}
                                            size="small"
                                        />
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

export default LibraryReport; 