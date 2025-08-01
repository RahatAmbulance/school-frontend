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

const BonafideReport = () => {
    const [filters, setFilters] = useState({
        class: '',
        section: '',
        status: 'all',
        dateRange: 'month'
    });

    // Dummy data - replace with actual API call
    const certificateData = [
        {
            id: 1,
            studentName: 'John Doe',
            class: 'X',
            section: 'A',
            requestDate: '2024-03-01',
            issueDate: '2024-03-03',
            purpose: 'Bank Account',
            status: 'Issued',
            issuedBy: 'Mary Johnson'
        },
        {
            id: 2,
            studentName: 'Jane Smith',
            class: 'X',
            section: 'B',
            requestDate: '2024-03-05',
            issueDate: null,
            purpose: 'Passport',
            status: 'Pending',
            issuedBy: null
        },
    ];

    const summary = {
        totalIssued: 150,
        pendingRequests: 15,
        issuedThisMonth: 45,
        averageProcessingDays: 2
    };

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'issued':
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
                <Typography variant="h5" gutterBottom>Bonafide Certificate Report</Typography>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="primary">{summary.totalIssued}</Typography>
                                <Typography variant="body2">Total Certificates Issued</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.pendingRequests}</Typography>
                                <Typography variant="body2">Pending Requests</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.issuedThisMonth}</Typography>
                                <Typography variant="body2">Issued This Month</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="info.main">{summary.averageProcessingDays}</Typography>
                                <Typography variant="body2">Avg. Processing Days</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                </Grid>

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
                        <MenuItem value="issued">Issued</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
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
                                <TableCell>Student Name</TableCell>
                                <TableCell>Class</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Request Date</TableCell>
                                <TableCell>Issue Date</TableCell>
                                <TableCell>Purpose</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Issued By</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {certificateData.map((certificate) => (
                                <TableRow key={certificate.id}>
                                    <TableCell>{certificate.studentName}</TableCell>
                                    <TableCell>{certificate.class}</TableCell>
                                    <TableCell>{certificate.section}</TableCell>
                                    <TableCell>{certificate.requestDate}</TableCell>
                                    <TableCell>{certificate.issueDate || '-'}</TableCell>
                                    <TableCell>{certificate.purpose}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={certificate.status}
                                            color={getStatusColor(certificate.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{certificate.issuedBy || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </StyledPaper>
        </div>
    );
};

export default BonafideReport; 