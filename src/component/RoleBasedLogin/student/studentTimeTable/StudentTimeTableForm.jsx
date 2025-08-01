import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import {CloudDownload, Refresh} from '@mui/icons-material';
import {alpha, styled} from '@mui/system';
import {useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import {api, selectSchoolDetails, selectUserActualData} from '../../../../common';

// Existing styled components (keep your existing styles)
const StyledContainer = styled(Container)(({theme}) => ({
    padding: '2rem',
    background: alpha('#ffffff', 0.9),
    backgroundImage: `linear-gradient(135deg, ${alpha('#f0f5ff', 0.3)} 0%, ${alpha('#f5f5f5', 0.8)} 100%)`,
    borderRadius: '24px',
    boxShadow: `0 10px 40px ${alpha('#000', 0.08)}`,
    marginTop: '2rem',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',

    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '5px',
        background: 'linear-gradient(90deg, #00695c, #4db6ac)',
    },
}));

const StyledTableContainer = styled(TableContainer)(({theme}) => ({
    marginTop: '2rem',
    borderRadius: '16px',
    boxShadow: `0 8px 24px ${alpha('#000', 0.1)}`,
    transition: 'box-shadow 0.3s ease-in-out',
    overflow: 'hidden',
    backgroundColor: 'white',

    '&:hover': {
        boxShadow: `0 12px 32px ${alpha('#000', 0.15)}`,
    },
}));

const StyledTableCell = styled(TableCell)(({theme}) => ({
    fontWeight: 600,
    background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
    color: 'white',
    padding: '1rem',
    transition: 'background-color 0.3s ease',
    borderBottom: 'none',
    textAlign: 'center',
    minWidth: '120px',
}));

const PeriodCell = styled(TableCell)(({theme}) => ({
    fontWeight: 700,
    background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    minWidth: '100px',
    borderRight: `2px solid ${alpha('#fff', 0.3)}`,
}));

const SubjectCell = styled(TableCell)(({theme}) => ({
    padding: '0.75rem',
    textAlign: 'center',
    border: `1px solid ${alpha('#00695c', 0.2)}`,
    minHeight: '60px',
    verticalAlign: 'middle',
    background: 'white',
    transition: 'background-color 0.2s ease',

    '&:hover': {
        backgroundColor: alpha('#e0f2f1', 0.6),
    },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: alpha('#f5f5f5', 0.3),
    },
}));

const StudentTimeTableForm = () => {
    // Your existing Redux selectors and state setup
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);

    const schoolData = useMemo(() => ({
        schoolId: userData?.id,
        session: userData?.session
    }), [userData?.id, userData?.session]);

    const [timeTables, setTimeTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Transform data into grid format
    const timetableGrid = useMemo(() => {
        if (!timeTables.length) return {periods: [], days: [], grid: {}};

        // Extract unique periods and days
        const periods = [...new Set(timeTables.map(t => t.periods))].sort();
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Create grid structure
        const grid = {};

        // Initialize grid
        periods.forEach(period => {
            grid[period] = {};
            days.forEach(day => {
                grid[period][day] = {
                    subject: '',
                    timeFrom: '',
                    timeTo: '',
                    teacher: '',
                    task: ''
                };
            });
        });

        // Populate grid with data
        timeTables.forEach(table => {
            const period = table.periods;
            const day = table.day;

            if (period && day && grid[period] && grid[period][day]) {
                grid[period][day] = {
                    subject: table.subject || '',
                    timeFrom: table.timeFrom ?
                        `${table.timeFrom.hours}:${table.timeFrom.minutes} ${table.timeFrom.period}` : '',
                    timeTo: table.timeTo ?
                        `${table.timeTo.hours}:${table.timeTo.minutes} ${table.timeTo.period}` : '',
                    teacher: table.teacher || '',
                    task: table.task || ''
                };
            }
        });

        // Get time ranges for each day
        const dayTimeRanges = {};
        days.forEach(day => {
            const dayTables = timeTables.filter(t => t.day === day);
            if (dayTables.length > 0) {
                const firstPeriod = dayTables[0];
                const lastPeriod = dayTables[dayTables.length - 1];
                dayTimeRanges[day] = {
                    start: firstPeriod.timeFrom ?
                        `${firstPeriod.timeFrom.hours}:${firstPeriod.timeFrom.minutes} ${firstPeriod.timeFrom.period}` : '',
                    end: lastPeriod.timeTo ?
                        `${lastPeriod.timeTo.hours}:${lastPeriod.timeTo.minutes} ${lastPeriod.timeTo.period}` : ''
                };
            }
        });

        return {periods, days, grid, dayTimeRanges};
    }, [timeTables]);

    // Your existing API calls and handlers
    const fetchTimeTables = useCallback(async () => {
        if (!schoolData.schoolId || !schoolData.session) return;

        setLoading(true);
        try {
            const response = await api.get('/api/timetable', {
                params: {
                    schoolId: schoolData.schoolId,
                    session: schoolData.session
                }
            });
            setTimeTables(response.data || []);
        } catch (error) {
            console.error('Error fetching time tables:', error);
            showSnackbar('Failed to load timetables', 'error');
        } finally {
            setLoading(false);
        }
    }, [schoolData.schoolId, schoolData.session]);

    useEffect(() => {
        fetchTimeTables();
    }, [fetchTimeTables]);

    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({open: true, message, severity});
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setSnackbar(prev => ({...prev, open: false}));
    }, []);

    const handleDownload = useCallback(async () => {
        // Your existing download logic adapted for grid format
        try {
            const XLSX = await import('xlsx');

            const data = [];
            timetableGrid.periods.forEach(period => {
                const row = {Period: period};
                timetableGrid.days.forEach(day => {
                    const cell = timetableGrid.grid[period][day];
                    row[day] = cell.subject || 'Free';
                });
                data.push(row);
            });

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetable Grid');

            const wbout = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
            const blob = new Blob([wbout], {type: 'application/octet-stream'});

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const fileName = `timetable_grid_${new Date().toISOString().split('T')[0]}.xlsx`;

            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showSnackbar(`Downloaded as ${fileName}`);
        } catch (error) {
            console.error('Error downloading timetable:', error);
            showSnackbar('Failed to download timetable', 'error');
        }
    }, [timetableGrid, showSnackbar]);

    // Render the grid-based timetable
    const renderTimetableGrid = () => {
        if (loading) {
            return (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                    <CircularProgress/>
                </Box>
            );
        }

        if (!timetableGrid.periods.length) {
            return (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: '12px',
                        background: alpha('#f5f5f5', 0.5),
                        my: 2
                    }}
                >
                    <Typography color="textSecondary" variant="h6" sx={{mb: 1}}>
                        No timetable data found
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                        No timetable entries are available for the current user.
                    </Typography>
                </Paper>
            );
        }

        return (
            <StyledTableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <PeriodCell>Period</PeriodCell>
                            {timetableGrid.days.map(day => (
                                <StyledTableCell key={day}>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                                            {day}
                                        </Typography>
                                        {timetableGrid.dayTimeRanges[day] && (
                                            <Typography variant="caption" sx={{
                                                opacity: 0.9,
                                                fontSize: '0.75rem',
                                                display: 'block',
                                                mt: 0.5
                                            }}>
                                                {timetableGrid.dayTimeRanges[day].start} - {timetableGrid.dayTimeRanges[day].end}
                                            </Typography>
                                        )}
                                    </Box>
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timetableGrid.periods.map(period => (
                            <StyledTableRow key={period}>
                                <PeriodCell>
                                    <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                                        {period}
                                    </Typography>
                                </PeriodCell>
                                {timetableGrid.days.map(day => {
                                    const cell = timetableGrid.grid[period][day];
                                    const hasContent = cell.subject;

                                    return (
                                        <SubjectCell key={`${period}-${day}`}>
                                            {hasContent ? (
                                                <Box>
                                                    <Chip
                                                        label={cell.subject}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha('#00695c', 0.1),
                                                            color: '#00695c',
                                                            fontWeight: 600,
                                                            mb: 0.5
                                                        }}
                                                    />
                                                    {cell.teacher && (
                                                        <Typography variant="caption" display="block" sx={{
                                                            color: 'text.secondary',
                                                            fontSize: '0.7rem'
                                                        }}>
                                                            {cell.teacher}
                                                        </Typography>
                                                    )}
                                                    {cell.timeFrom && cell.timeTo && (
                                                        <Typography variant="caption" display="block" sx={{
                                                            color: 'text.secondary',
                                                            fontSize: '0.65rem',
                                                            mt: 0.5
                                                        }}>
                                                            {cell.timeFrom} - {cell.timeTo}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{
                                                    color: 'text.disabled',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Free
                                                </Typography>
                                            )}
                                        </SubjectCell>
                                    );
                                })}
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>
        );
    };

    return (
        <StyledContainer maxWidth="xl">
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <Typography variant="h4" component="h1" gutterBottom
                            sx={{
                                color: '#004d40',
                                fontWeight: 700,
                                textAlign: 'center',
                                marginBottom: '1rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                letterSpacing: '0.5px',
                                fontSize: {xs: '1.75rem', md: '2.25rem'}
                            }}>
                    My Time Table
                </Typography>

                <Box sx={{textAlign: 'center', mb: 2}}>
                    <Chip
                        label={`Teacher: ${userActualData?.name || 'Unknown'}`}
                        color="primary"
                        variant="filled"
                        sx={{
                            bgcolor: '#00695c',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            px: 2,
                            py: 1
                        }}
                    />
                </Box>

                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.5}}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '2rem',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3}}>
                            <Typography variant="h6" sx={{color: '#004d40', fontWeight: 600}}>
                                Weekly Schedule Grid
                            </Typography>

                            <Box sx={{display: 'flex', gap: 1}}>
                                <Tooltip title="Download Excel">
                                    <IconButton
                                        onClick={handleDownload}
                                        color="primary"
                                        disabled={!timetableGrid.periods.length}
                                    >
                                        <CloudDownload/>
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Refresh Data">
                                    <IconButton onClick={fetchTimeTables} color="primary" disabled={loading}>
                                        <Refresh/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {renderTimetableGrid()}
                    </Paper>
                </motion.div>
            </motion.div>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} elevation={6} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default StudentTimeTableForm;
