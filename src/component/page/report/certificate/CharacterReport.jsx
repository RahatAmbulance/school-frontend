import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const CharacterReport = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Mock data - Replace with actual API call
    useEffect(() => {
        const mockData = [
            {
                id: 1,
                studentName: 'John Doe',
                class: 'X-A',
                issueDate: '2024-03-15',
                status: 'Issued',
                certificateNo: 'CC-2024-001',
            },
            {
                id: 2,
                studentName: 'Jane Smith',
                class: 'XII-B',
                issueDate: '2024-03-14',
                status: 'Pending',
                certificateNo: 'CC-2024-002',
            },
            // Add more mock data as needed
        ];
        setReports(mockData);
    }, []);

    const handleSearch = () => {
        // Implement search logic here
        console.log('Searching with:', {startDate, endDate, searchQuery});
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setOpenDialog(true);
    };

    const handlePrint = (report) => {
        // Implement print logic
        console.log('Printing report:', report);
    };

    const handleDownload = (report) => {
        // Implement download logic
        console.log('Downloading report:', report);
    };

    return (
        <Box sx={{p: 3}}>
            <Typography variant="h4" gutterBottom sx={{color: '#1976d2', fontWeight: 'bold'}}>
                Character Certificate Reports
            </Typography>

            {/* Search Section */}
            <Card sx={{mb: 3, backgroundColor: '#f8f9fa'}}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    renderInput={(params) => <TextField {...params} fullWidth/>}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Search Student"
                                variant="outlined"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<SearchIcon/>}
                                onClick={handleSearch}
                                sx={{height: '56px'}}
                            >
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Reports Table */}
            <TableContainer component={Paper} sx={{mt: 3}}>
                <Table>
                    <TableHead>
                        <TableRow sx={{backgroundColor: '#f5f5f5'}}>
                            <TableCell>Certificate No.</TableCell>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Class</TableCell>
                            <TableCell>Issue Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report.id} hover>
                                <TableCell>{report.certificateNo}</TableCell>
                                <TableCell>{report.studentName}</TableCell>
                                <TableCell>{report.class}</TableCell>
                                <TableCell>{report.issueDate}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={report.status}
                                        color={report.status === 'Issued' ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleViewReport(report)} color="primary">
                                        <VisibilityIcon/>
                                    </IconButton>
                                    <IconButton onClick={() => handlePrint(report)} color="secondary">
                                        <PrintIcon/>
                                    </IconButton>
                                    <IconButton onClick={() => handleDownload(report)} color="success">
                                        <FileDownloadIcon/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* View Report Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{backgroundColor: '#1976d2', color: 'white'}}>
                    Character Certificate Details
                </DialogTitle>
                <DialogContent sx={{mt: 2}}>
                    {selectedReport && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Certificate Number
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedReport.certificateNo}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Student Name
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedReport.studentName}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Class
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedReport.class}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Issue Date
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedReport.issueDate}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<PrintIcon/>}
                        onClick={() => handlePrint(selectedReport)}
                    >
                        Print
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CharacterReport; 