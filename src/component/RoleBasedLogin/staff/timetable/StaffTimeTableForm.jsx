import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Fade,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import {CloudDownload, FilterList, Refresh, Search} from '@mui/icons-material';
import {alpha, styled} from "@mui/system";
import {useSelector} from "react-redux";
import * as XLSX from "xlsx";
import {motion} from "framer-motion";
import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";

// Modern styled components
const StyledContainer = styled(Container)(({theme}) => `
    padding: 2rem;
    background: ${alpha('#ffffff', 0.9)};
    background-image: linear-gradient(135deg, ${alpha('#f0f5ff', 0.3)} 0%, ${alpha('#f5f5f5', 0.8)} 100%);
    border-radius: 24px;
    box-shadow: 0 10px 40px ${alpha('#000', 0.08)};
    margin-top: 2rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
    
    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, #00695c, #4db6ac);
    }
`);

const StyledFormControl = styled(FormControl)(({theme}) => `
    background: white;
    border-radius: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px ${alpha('#000', 0.08)};
    }

    & .MuiOutlinedInput-root {
        border-radius: 12px;
    }

    & .MuiInputLabel-root {
        color: #00695c;
        font-weight: 500;
    }
`);

const StyledTableContainer = styled(TableContainer)(({theme}) => `
    margin-top: 2rem;
    border-radius: 16px;
    box-shadow: 0 8px 24px ${alpha('#000', 0.1)};
    transition: box-shadow 0.3s ease-in-out;
    overflow: hidden;
    background-color: white;

    &:hover {
        box-shadow: 0 12px 32px ${alpha('#000', 0.15)};
    }
`);

const StyledTableCell = styled(TableCell)(({theme}) => `
    font-weight: 600;
    background: linear-gradient(135deg, #00695c 0%, #004d40 100%);
    color: white;
    padding: 1rem;
    transition: background-color 0.3s ease;
    border-bottom: none;

    &:first-of-type {
        border-top-left-radius: 8px;
    }
    
    &:last-of-type {
        border-top-right-radius: 8px;
    }
`);

const StyledTableRow = styled(TableRow)(({theme}) => `
    transition: background-color 0.2s ease;

    &:hover {
        background-color: ${alpha('#e0f2f1', 0.6)};
    }
    
    &:nth-of-type(odd) {
        background-color: ${alpha('#f5f5f5', 0.5)};
    }
`);

const AnimatedBox = styled(motion.div)`
    width: 100%;
`;

const StaffTimeTableForm = () => {
    const theme = useTheme();
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const classSections = useSelector(state => state.master.data.classSections || []);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [loading, setLoading] = useState(false);

    // State variables for improved UX
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const [timeTables, setTimeTables] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTimeTables();
    }, []);

    const fetchTimeTables = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/timetable', {
                params: {
                    schoolId,
                    session,
                    teacher: userActualData?.name // Add teacher filter to API call
                }
            });
            setTimeTables(response.data);
        } catch (error) {
            console.error('Error fetching time tables:', error);
            showSnackbar('Failed to load timetables', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    const handleDownload = () => {
        try {
            const data = filteredTimeTables.map(table => ({
                Class: table.className,
                Section: table.section,
                Teacher: table.teacher,
                Day: table.day,
                Subject: table.subject,
                Period: table.periods,
                'Time From': `${table.timeFrom.hours}:${table.timeFrom.minutes} ${table.timeFrom.period}`,
                'Time To': `${table.timeTo.hours}:${table.timeTo.minutes} ${table.timeTo.period}`,
                'Date': table.today,
                'Task': table.task
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'My Timetables');
            const wbout = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
            const blob = new Blob([wbout], {type: 'application/octet-stream'});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `my_timetables_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            showSnackbar(`Downloaded as ${fileName}`);
        } catch (error) {
            console.error('Error downloading time tables:', error);
            showSnackbar('Failed to download time tables', 'error');
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const [selectedClassName, setSelectedClassName] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    // Filter timetables for current user and apply other filters
    const filteredTimeTables = timeTables.filter((table) => {
        // First filter by current user's name (case-insensitive)
        const matchesCurrentUser = table.teacher?.toLowerCase() === userActualData?.name?.toLowerCase();

        // Then apply other filters
        const matchesClassName = selectedClassName ? table.className?.toLowerCase() === selectedClassName.toLowerCase() : true;
        const matchesSection = selectedSection ? table.section?.toLowerCase() === selectedSection.toLowerCase() : true;
        const matchesSearchQuery = searchQuery
            ? (table.className?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.section?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.day?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.periods?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            : true;

        return matchesCurrentUser && matchesClassName && matchesSection && matchesSearchQuery;
    });

    const handleClassChange = (event) => {
        const className = event.target.value;
        setSelectedClassName(className);
        setSelectedSection('');
    };

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };

    const resetFilters = () => {
        setSelectedClassName('');
        setSelectedSection('');
        setSearchQuery('');
    };

    const toggleFilters = () => {
        setIsFiltersExpanded(!isFiltersExpanded);
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
                    My Time Tables
                </Typography>

                {/* Display current user info */}
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

                <AnimatedBox
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
                            <TextField
                                label="Search"
                                variant="outlined"
                                fullWidth
                                size="medium"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search by class, section, day, subject, or period..."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search/>
                                        </InputAdornment>
                                    ),
                                    sx: {borderRadius: '12px'}
                                }}
                                sx={{mr: 2, flexGrow: 1}}
                            />

                            <Box sx={{display: 'flex', gap: 1}}>
                                <Tooltip title="Toggle Filters">
                                    <IconButton onClick={toggleFilters} color="primary">
                                        <FilterList/>
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Download Excel">
                                    <IconButton onClick={handleDownload} color="primary">
                                        <CloudDownload/>
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Refresh Data">
                                    <IconButton onClick={fetchTimeTables} color="primary">
                                        <Refresh/>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Fade in={isFiltersExpanded}>
                            <Box sx={{mb: 3, display: isFiltersExpanded ? 'block' : 'none'}}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: '12px',
                                        background: alpha('#e0f2f1', 0.5)
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{mb: 2, fontWeight: 600}}>
                                        Filter by Class & Section
                                    </Typography>

                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} sm={6}>
                                            <StyledFormControl fullWidth variant="outlined" size="small">
                                                <InputLabel>Class</InputLabel>
                                                <Select
                                                    name="className"
                                                    value={selectedClassName}
                                                    onChange={handleClassChange}
                                                    label="Class"
                                                >
                                                    <MenuItem value="">All Classes</MenuItem>
                                                    {classSections && classSections.length > 0 ? (
                                                        classSections.map((classSection) => (
                                                            <MenuItem key={classSection.id}
                                                                      value={classSection.name}>
                                                                {classSection.name}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem value="" disabled>
                                                            No Classes Available
                                                        </MenuItem>
                                                    )}
                                                </Select>
                                            </StyledFormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <StyledFormControl fullWidth variant="outlined" size="small">
                                                <InputLabel>Section</InputLabel>
                                                <Select
                                                    name="section"
                                                    value={selectedSection}
                                                    onChange={handleSectionChange}
                                                    label="Section"
                                                    disabled={!selectedClassName}
                                                >
                                                    <MenuItem value="">All Sections</MenuItem>
                                                    {classSections?.find(cs => cs.name === selectedClassName)?.sections?.length > 0 ? (
                                                        classSections
                                                            .find(cs => cs.name === selectedClassName)
                                                            .sections.map((section) => (
                                                            <MenuItem key={section.id} value={section.name}>
                                                                {section.name}
                                                            </MenuItem>
                                                        ))
                                                    ) : (
                                                        <MenuItem value="" disabled>
                                                            No Sections Available
                                                        </MenuItem>
                                                    )}
                                                </Select>
                                            </StyledFormControl>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 2}}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={resetFilters}
                                            startIcon={<Refresh/>}
                                        >
                                            Reset Filters
                                        </Button>
                                    </Box>
                                </Paper>
                            </Box>
                        </Fade>

                        {filteredTimeTables.length > 0 ? (
                            <>
                                <Box sx={{mb: 2}}>
                                    <Chip
                                        label={`${filteredTimeTables.length} timetable entries found`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>

                                <StyledTableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>Class</StyledTableCell>
                                                <StyledTableCell>Section</StyledTableCell>
                                                <StyledTableCell>Day</StyledTableCell>
                                                <StyledTableCell>Subject</StyledTableCell>
                                                <StyledTableCell>Period</StyledTableCell>
                                                <StyledTableCell>Time From</StyledTableCell>
                                                <StyledTableCell>Time To</StyledTableCell>
                                                <StyledTableCell>Date</StyledTableCell>
                                                <StyledTableCell>Task</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredTimeTables.map(table => (
                                                <StyledTableRow key={table.id}>
                                                    <TableCell>{table.className}</TableCell>
                                                    <TableCell>{table.section}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={table.day}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                bgcolor: alpha('#e0f2f1', 0.7),
                                                                borderColor: '#00695c',
                                                                color: '#00695c',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{table.subject}</TableCell>
                                                    <TableCell>{table.periods}</TableCell>
                                                    <TableCell>{`${table.timeFrom.hours}:${table.timeFrom.minutes} ${table.timeFrom.period}`}</TableCell>
                                                    <TableCell>{`${table.timeTo.hours}:${table.timeTo.minutes} ${table.timeTo.period}`}</TableCell>
                                                    <TableCell>{table.today}</TableCell>
                                                    <TableCell>{table.task}</TableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </StyledTableContainer>
                            </>
                        ) : loading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                                <CircularProgress/>
                            </Box>
                        ) : (
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
                                    No timetable entries found
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                    {userActualData?.name ?
                                        `No timetables are currently assigned to ${userActualData.name}. Try adjusting your search criteria or check back later.` :
                                        'Unable to identify current user. Please refresh the page and try again.'
                                    }
                                </Typography>
                            </Paper>
                        )}
                    </Paper>
                </AnimatedBox>
            </motion.div>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} elevation={6} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default StaffTimeTableForm;