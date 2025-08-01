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

const TransportReport = () => {
    const [filters, setFilters] = useState({
        route: '',
        vehicle: '',
        status: 'all',
        sortBy: 'route'
    });

    // Dummy data - replace with actual API call
    const transportData = [
        {
            id: 1,
            route: 'Route A',
            vehicle: 'Bus 01',
            driver: 'John Smith',
            capacity: 40,
            students: 35,
            status: 'Active',
            lastMaintenance: '2024-02-15',
            nextMaintenance: '2024-03-15'
        },
        {
            id: 2,
            route: 'Route B',
            vehicle: 'Bus 02',
            driver: 'Mike Johnson',
            capacity: 40,
            students: 32,
            status: 'Active',
            lastMaintenance: '2024-02-20',
            nextMaintenance: '2024-03-20'
        },
    ];

    const summary = {
        totalVehicles: 12,
        activeRoutes: 10,
        totalStudents: 380,
        maintenanceDue: 2,
        averageOccupancy: '85%'
    };

    const routes = [
        'Route A',
        'Route B',
        'Route C',
        'Route D',
        'Route E'
    ];

    const vehicles = [
        'Bus 01',
        'Bus 02',
        'Bus 03',
        'Bus 04',
        'Bus 05'
    ];

    const handleFilterChange = (event) => {
        setFilters({
            ...filters,
            [event.target.name]: event.target.value
        });
    };

    const getMaintenanceStatus = (nextMaintenance) => {
        const today = new Date();
        const maintenance = new Date(nextMaintenance);
        const diffDays = Math.ceil((maintenance - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return {label: 'Overdue', color: 'error'};
        if (diffDays <= 7) return {label: 'Due Soon', color: 'warning'};
        return {label: 'Scheduled', color: 'success'};
    };

    return (
        <div>
            <StyledPaper>
                <Typography variant="h5" gutterBottom>Transport Report</Typography>

                <Grid container spacing={3} sx={{mb: 3}}>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="primary">{summary.totalVehicles}</Typography>
                                <Typography variant="body2">Total Vehicles</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="success.main">{summary.activeRoutes}</Typography>
                                <Typography variant="body2">Active Routes</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="info.main">{summary.totalStudents}</Typography>
                                <Typography variant="body2">Total Students</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="warning.main">{summary.maintenanceDue}</Typography>
                                <Typography variant="body2">Maintenance Due</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.4}>
                        <StatCard>
                            <CardContent>
                                <Typography variant="h4" color="primary">{summary.averageOccupancy}</Typography>
                                <Typography variant="body2">Avg. Occupancy</Typography>
                            </CardContent>
                        </StatCard>
                    </Grid>
                </Grid>

                <FilterContainer>
                    <TextField
                        select
                        label="Route"
                        name="route"
                        value={filters.route}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="">All</MenuItem>
                        {routes.map((route) => (
                            <MenuItem key={route} value={route.toLowerCase()}>
                                {route}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Vehicle"
                        name="vehicle"
                        value={filters.vehicle}
                        onChange={handleFilterChange}
                        style={{minWidth: 150}}
                    >
                        <MenuItem value="">All</MenuItem>
                        {vehicles.map((vehicle) => (
                            <MenuItem key={vehicle} value={vehicle.toLowerCase()}>
                                {vehicle}
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
                        <MenuItem value="maintenance">In Maintenance</MenuItem>
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
                        <MenuItem value="route">Route</MenuItem>
                        <MenuItem value="vehicle">Vehicle</MenuItem>
                        <MenuItem value="capacity">Capacity</MenuItem>
                        <MenuItem value="maintenance">Maintenance Date</MenuItem>
                    </TextField>

                    <Button variant="contained" color="primary">
                        Generate Report
                    </Button>
                </FilterContainer>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Route</TableCell>
                                <TableCell>Vehicle</TableCell>
                                <TableCell>Driver</TableCell>
                                <TableCell>Capacity</TableCell>
                                <TableCell>Students</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Maintenance</TableCell>
                                <TableCell>Next Maintenance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transportData.map((transport) => (
                                <TableRow key={transport.id}>
                                    <TableCell>{transport.route}</TableCell>
                                    <TableCell>{transport.vehicle}</TableCell>
                                    <TableCell>{transport.driver}</TableCell>
                                    <TableCell>{transport.capacity}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color={transport.students / transport.capacity > 0.9 ? 'warning.main' : 'success.main'}>
                                            {transport.students}/{transport.capacity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={transport.status}
                                            color={transport.status === 'Active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{transport.lastMaintenance}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getMaintenanceStatus(transport.nextMaintenance).label}
                                            color={getMaintenanceStatus(transport.nextMaintenance).color}
                                            size="small"
                                        />
                                        <Typography variant="caption" display="block">
                                            {transport.nextMaintenance}
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

export default TransportReport; 