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

const StaffReport = () => {
    const [filters, setFilters] = useState({
        department: '',
        designation: '',
        status: 'all',
        sortBy: 'name'
    });

    // Dummy data - replace with actual API call
    const staffData = [
        {
            id: 1,
            name: 'John Smith',
            department: 'Science',
            designation: 'Senior Teacher',
            joiningDate: '2020-01-15',
            status: 'Active',
            attendance: 95,
            performance: 'Excellent'
        },
        {
            id: 2,
            name: 'Mary Johnson',
            department: 'Mathematics',
            designation: 'Teacher',
            joiningDate: '2021-03-10',
            status: 'Active',
            attendance: 92,
            performance: 'Good'
        },
    ];

    const summary = {
        totalStaff: 45,
        activeStaff: 42,
        onLeave: 3,
        departments: 8,
        averageAttendance: 94
    };

    const departments = [
        'Science',
        'Mathematics',
        'English',
        'Social Studies',
        'Physical Education',
        'Administration'
    ];

    const designations = [
        'Principal',
        'Vice Principal',
        'Senior Teacher',
        'Teacher',
        'Assistant Teacher',
        'Administrative Staff'
    ];

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getPerformanceColor = (performance) => {
        switch (performance.toLowerCase()) {
            case 'excellent':
                return 'success';
            case 'good':
                return 'primary';
            case 'average':
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
                <Typography variant="h5" gutterBottom>Staff Report</Typography>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="primary">{summary.totalStaff}</Typography>
                                <Typography variant="body2">Total Staff</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.activeStaff}</Typography>
                                <Typography variant="body2">Active Staff</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.onLeave}</Typography>
                                <Typography variant="body2">On Leave</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="info.main">{summary.departments}</Typography>
                                <Typography variant="body2">Departments</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="primary">{summary.averageAttendance}%</Typography>
                                <Typography variant="body2">Avg. Attendance</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                </Grid>

                <FilterContainer>
                    <TextField
                        select
                        label="Department"
                        name="department"
                        value={filters.department}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="">All</MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept} value={dept.toLowerCase()}>
                                {dept}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Designation"
                        name="designation"
                        value={filters.designation}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="">All</MenuItem>
                        {designations.map((desig) => (
                            <MenuItem key={desig} value={desig.toLowerCase()}>
                                {desig}
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
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="onLeave">On Leave</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Sort By"
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        style={{minWidth: 120}}
                    >
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="department">Department</MenuItem>
                        <MenuItem value="joiningDate">Joining Date</MenuItem>
                        <MenuItem value="attendance">Attendance</MenuItem>
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
                                <TableCell>Department</TableCell>
                                <TableCell>Designation</TableCell>
                                <TableCell>Joining Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Attendance</TableCell>
                                <TableCell>Performance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {staffData.map((staff) => (
                                <TableRow key={staff.id}>
                                    <TableCell>{staff.name}</TableCell>
                                    <TableCell>{staff.department}</TableCell>
                                    <TableCell>{staff.designation}</TableCell>
                                    <TableCell>{staff.joiningDate}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={staff.status}
                                            color={staff.status === 'Active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            color={staff.attendance >= 90 ? 'success.main' : 'warning.main'}
                                        >
                                            {staff.attendance}%
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={staff.performance}
                                            color={getPerformanceColor(staff.performance)}
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

export default StaffReport; 