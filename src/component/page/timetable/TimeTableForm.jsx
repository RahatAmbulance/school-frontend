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
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import {CloudDownload, Delete, Edit, FilterList, Refresh, Search} from '@mui/icons-material';
import {api, selectSchoolDetails} from '../../../common';
import {alpha, styled} from "@mui/system";
import {useSelector} from "react-redux";
import * as XLSX from "xlsx";
import {motion} from "framer-motion";

// TimePicker component with improved styling
const TimePicker = ({label, value, onChange}) => {
    const hours = [...Array(12).keys()].map(i => String(i + 1).padStart(2, '0')); // 01 to 12
    const minutes = ['00', '15', '30', '45']; // Quarter-hour increments
    const periods = ['AM', 'PM']; // AM/PM

    return (
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={4}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>{label} Hours</InputLabel>
                    <Select
                        value={value.hours}
                        label={`${label} Hours`}
                        onChange={e => onChange({...value, hours: e.target.value})}
                    >
                        {hours.map(hour => (
                            <MenuItem key={hour} value={hour}>
                                {hour}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>{label} Minutes</InputLabel>
                    <Select
                        value={value.minutes}
                        label={`${label} Minutes`}
                        onChange={e => onChange({...value, minutes: e.target.value})}
                    >
                        {minutes.map(minute => (
                            <MenuItem key={minute} value={minute}>
                                {minute}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={4}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>{label} Period</InputLabel>
                    <Select
                        value={value.period}
                        label={`${label} Period`}
                        onChange={e => onChange({...value, period: e.target.value})}
                    >
                        {periods.map(period => (
                            <MenuItem key={period} value={period}>
                                {period}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};

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

const StyledTabs = styled(Tabs)(({theme}) => `
                                        background: ${alpha('#ffffff', 0.9)};
                                        border-radius: 16px;
                                        padding: 0.5rem;
                                        margin-bottom: 2rem;
                                        box-shadow: 0 4px 20px ${alpha('#000', 0.05)};
                                    
                                        & .MuiTab-root {
                                            border-radius: 12px;
                                            margin: 0 0.5rem;
                                            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                                            font-weight: 600;
                                            min-height: 48px;
                                    
                                            &.Mui-selected {
                                                background: linear-gradient(135deg, #00695c 0%, #004d40 100%);
                                                color: white;
                                                box-shadow: 0 4px 12px ${alpha('#004d40', 0.3)};
                                            }
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

const StyledButton = styled(Button)(({theme}) => `
                                        border-radius: 12px;
                                        padding: 0.8rem 2rem;
                                        text-transform: none;
                                        font-weight: 600;
                                        letter-spacing: 0.5px;
                                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                                        box-shadow: 0 2px 8px ${alpha('#004d40', 0.2)};
                                    
                                        &:hover {
                                            transform: translateY(-3px);
                                            box-shadow: 0 6px 16px ${alpha('#004d40', 0.4)};
                                        }
                                    
                                        &.MuiButton-outlined {
                                            border-width: 2px;
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

const StyledIconButton = styled(IconButton)(({theme}) => `
                                        transition: all 0.3s ease;
                                        border-radius: 8px;
                                        padding: 8px;
                                    
                                        &:hover {
                                            transform: scale(1.1);
                                            background-color: ${alpha('#00695c', 0.1)};
                                        }
                                    
                                        &.edit-button {
                                            color: #00695c;
                                        }
                                    
                                        &.delete-button {
                                            color: #f44336;
                                            &:hover {
                                                background-color: ${alpha('#f44336', 0.1)};
                                            }
                                        }
                                    `);

const AnimatedBox = styled(motion.div)`
    width: 100%;
`;

const TimeTableForm = () => {
    const theme = useTheme();
    const userData = useSelector(selectSchoolDetails);
    const classSections = useSelector(state => state.master.data.classSections || []);
    const periodsss = useSelector(state => state.master.data.periods || []);
    const subjects = useSelector(state => state.master.data.subjects || []);
    const schoolId = userData?.id;
    const session = userData?.session;
    const staffList = useSelector(state => state.master.data.staff || []);
    const [loading, setLoading] = useState(false);
    const [classSectionQuery, setClassSectionQuery] = useState('');
    const [teacherQuery, setTeacherQuery] = useState('');

    // New state variables for improved UX
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const handleClassSectionChange = (event) => {
        setClassSectionQuery(event.target.value);
    };

    const handleTeacherChanges = (event) => {
        setTeacherQuery(event.target.value);
    };

    const [timeTable, setTimeTable] = useState({
        className: '',
        section: '',
        teacher: '',
        teacherId: '',
        day: '',
        subject: '',
        periods: '',
        schoolId: schoolId,
        session: session,
        today: '',
        task: '',
        timeFrom: {hours: '08', minutes: '00', period: 'AM'},
        timeTo: {hours: '09', minutes: '00', period: 'AM'},
    });

    const [timeTables, setTimeTables] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTimeTables();
    }, []);

    const fetchTimeTables = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/timetable', {
                params: {schoolId, session}
            });
            setTimeTables(response.data);
        } catch (error) {
            console.error('Error fetching time tables:', error);
            showSnackbar('Failed to load timetables', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = e => {
        setTimeTable({...timeTable, [e.target.name]: e.target.value});
    };

    const handleTimeChange = (field, value) => {
        setTimeTable({...timeTable, [field]: value});
    };

    const handleTeacherChange = (e) => {
        const selectedTeacher = staffList.find(staff => staff.name === e.target.value);
        setTimeTable({
            ...timeTable,
            teacher: selectedTeacher.name,
            teacherId: selectedTeacher.id,
        });
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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/api/timetable', timeTable);
            showSnackbar('Time table saved successfully!');
            await fetchTimeTables();
            resetTimeTable();
        } catch (error) {
            console.error('Error saving time table:', error);
            showSnackbar('Failed to save time table', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetTimeTable = () => {
        setTimeTable({
            className: '',
            section: '',
            teacher: '',
            teacherId: '',
            day: '',
            subject: '',
            periods: '',
            schoolId: schoolId,
            session: session,
            today: '',
            task: '',
            timeFrom: {hours: '08', minutes: '00', period: 'AM'},
            timeTo: {hours: '09', minutes: '00', period: 'AM'},
        });
    };

    const handleEdit = table => {
        setTimeTable(table);
        setTabIndex(0);
        showSnackbar('Now editing timetable entry', 'info');
    };

    const handleDelete = async id => {
        if (window.confirm('Are you sure you want to delete this time table?')) {
            try {
                await api.delete(`/api/timetable/${id}`);
                showSnackbar('Time table deleted successfully!');
                fetchTimeTables();
            } catch (error) {
                console.error('Error deleting time table:', error);
                showSnackbar('Failed to delete time table', 'error');
            }
        }
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
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Timetables');
            const wbout = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
            const blob = new Blob([wbout], {type: 'application/octet-stream'});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `timetables_${new Date().toISOString().split('T')[0]}.xlsx`;
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

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const [selectedClassName, setSelectedClassName] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');

    const filteredTimeTables = timeTables.filter((table) => {
        const matchesClassName = selectedClassName ? table.className?.toLowerCase() === selectedClassName.toLowerCase() : true;
        const matchesSection = selectedSection ? table.section?.toLowerCase() === selectedSection.toLowerCase() : true;
        const matchesTeacher = selectedTeacher ? table.teacher?.toLowerCase() === selectedTeacher.toLowerCase() : true;
        const matchesSearchQuery = searchQuery
            ? (table.className?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.section?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.teacher?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.day?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (table.periods?.toLowerCase() || '').includes(searchQuery.toLowerCase())
            : true;

        return matchesClassName && matchesSection && matchesTeacher && matchesSearchQuery;
    });

    const handleClassChange = (event) => {
        const className = event.target.value;
        setSelectedClassName(className);
        setSelectedSection('');
    };

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };

    const handleTeacherChangeBySearch = (event) => {
        setSelectedTeacher(event.target.value);
    };

    const resetFilters = () => {
        setSelectedClassName('');
        setSelectedSection('');
        setSelectedTeacher('');
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
                                marginBottom: '2rem',
                                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                letterSpacing: '0.5px',
                                fontSize: {xs: '1.75rem', md: '2.25rem'}
                            }}>
                    Time Table Management
                </Typography>

                <StyledTabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    aria-label="Time Table Tabs"
                    centered
                    indicatorColor="none"
                    variant="fullWidth"
                >
                    <Tab label="Create Time Table" icon={<Edit sx={{fontSize: 20}}/>} iconPosition="start"/>
                    <Tab label="View Time Tables" icon={<Search sx={{fontSize: 20}}/>} iconPosition="start"/>
                </StyledTabs>

                <Fade in={tabIndex === 0}>
                    <AnimatedBox
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5}}
                        style={{
                            display: tabIndex === 0 ? 'block' : 'none',
                            marginTop: '1.5rem'
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '2rem',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
                                backgroundImage: 'linear-gradient(90deg, #004d40, #26a69a)'
                            }}/>

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Select Class</InputLabel>
                                        <Select
                                            name="className"
                                            value={timeTable.className}
                                            onChange={handleChange}
                                            label="Select Class"
                                        >
                                            {classSections && classSections.length > 0 ? (
                                                classSections.map((classSection) => (
                                                    <MenuItem key={classSection.id} value={classSection.name}>
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
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Select Section</InputLabel>
                                        <Select
                                            name="section"
                                            value={timeTable.section}
                                            onChange={handleChange}
                                            disabled={!timeTable.className}
                                            label="Select Section"
                                        >
                                            {classSections?.find(cs => cs.name === timeTable.className)?.sections?.length > 0 ? (
                                                classSections
                                                    .find(cs => cs.name === timeTable.className)
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

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Staff/Teacher</InputLabel>
                                        <Select
                                            name="teacher"
                                            value={timeTable.teacher}
                                            onChange={handleTeacherChange}
                                            label="Staff/Teacher"
                                            required
                                        >
                                            {staffList.map((staff) => (
                                                <MenuItem key={staff.id} value={staff.name}>
                                                    {`${staff.name} (${staff.post})`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Day</InputLabel>
                                        <Select
                                            name="day"
                                            value={timeTable.day}
                                            onChange={handleChange}
                                            label="Day"
                                            required
                                        >
                                            <MenuItem value="Monday">Monday</MenuItem>
                                            <MenuItem value="Tuesday">Tuesday</MenuItem>
                                            <MenuItem value="Wednesday">Wednesday</MenuItem>
                                            <MenuItem value="Thursday">Thursday</MenuItem>
                                            <MenuItem value="Friday">Friday</MenuItem>
                                            <MenuItem value="Saturday">Saturday</MenuItem>
                                            <MenuItem value="Sunday">Sunday</MenuItem>
                                        </Select>
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Subject</InputLabel>
                                        <Select
                                            name="subject"
                                            value={timeTable.subject}
                                            onChange={handleChange}
                                            label="Subject"
                                            required
                                        >
                                            {subjects.map((sub) => (
                                                <MenuItem key={sub.id} value={sub.name}>
                                                    {sub.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <InputLabel>Period</InputLabel>
                                        <Select
                                            name="periods"
                                            value={timeTable.periods}
                                            onChange={handleChange}
                                            label="Period"
                                            required
                                        >
                                            {periodsss.map((per) => (
                                                <MenuItem key={per.id} value={per.name}>
                                                    {per.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TimePicker
                                        label="Time From"
                                        value={timeTable.timeFrom}
                                        onChange={value => handleTimeChange('timeFrom', value)}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TimePicker
                                        label="Time To"
                                        value={timeTable.timeTo}
                                        onChange={value => handleTimeChange('timeTo', value)}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <TextField
                                            name="today"
                                            label="Today's Date"
                                            type="date"
                                            fullWidth
                                            value={timeTable.today}
                                            onChange={handleChange}
                                            InputLabelProps={{shrink: true}}
                                        />
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <StyledFormControl fullWidth>
                                        <TextField
                                            name="task"
                                            label="Today's Task"
                                            fullWidth
                                            value={timeTable.task}
                                            onChange={handleChange}
                                        />
                                    </StyledFormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{display: 'flex', gap: 2, justifyContent: 'center', mt: 3}}>
                                        <StyledButton
                                            variant="contained"
                                            color="primary"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20}/> : <Edit/>}
                                            sx={{
                                                background: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
                                                minWidth: '180px'
                                            }}
                                        >
                                            {loading ? 'Saving...' : 'Save Time Table'}
                                        </StyledButton>
                                        <StyledButton
                                            variant="outlined"
                                            color="secondary"
                                            onClick={resetTimeTable}
                                            startIcon={<Refresh/>}
                                            sx={{borderColor: '#00695c', color: '#00695c', minWidth: '150px'}}
                                        >
                                            Clear Form
                                        </StyledButton>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </AnimatedBox>
                </Fade>

                <Fade in={tabIndex === 1}>
                    <AnimatedBox
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5}}
                        style={{
                            width: '100%',
                            display: tabIndex === 1 ? 'block' : 'none'
                        }}
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
                                            Advanced Filters
                                        </Typography>

                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={4}>
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

                                            <Grid item xs={12} sm={4}>
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

                                            <Grid item xs={12} sm={4}>
                                                <StyledFormControl fullWidth variant="outlined" size="small">
                                                    <InputLabel>Teacher</InputLabel>
                                                    <Select
                                                        name="teacher"
                                                        value={selectedTeacher}
                                                        onChange={handleTeacherChangeBySearch}
                                                        label="Teacher"
                                                    >
                                                        <MenuItem value="">All Teachers</MenuItem>
                                                        {staffList.map((staff) => (
                                                            <MenuItem key={staff.id} value={staff.name}>
                                                                {`${staff.name} (${staff.post})`}
                                                            </MenuItem>
                                                        ))}
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
                                            label={`${filteredTimeTables.length} records found`}
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
                                                    <StyledTableCell>Teacher</StyledTableCell>
                                                    <StyledTableCell>Day</StyledTableCell>
                                                    <StyledTableCell>Subject</StyledTableCell>
                                                    <StyledTableCell>Period</StyledTableCell>
                                                    <StyledTableCell>Time From</StyledTableCell>
                                                    <StyledTableCell>Time To</StyledTableCell>
                                                    <StyledTableCell>Date</StyledTableCell>
                                                    <StyledTableCell>Task</StyledTableCell>
                                                    <StyledTableCell align="center">Actions</StyledTableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {filteredTimeTables.map(table => (
                                                    <StyledTableRow key={table.id}>
                                                        <TableCell>{table.className}</TableCell>
                                                        <TableCell>{table.section}</TableCell>
                                                        <TableCell>{table.teacher}</TableCell>
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
                                                        <TableCell align="center">
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                gap: 1
                                                            }}>
                                                                <Tooltip title="Edit">
                                                                    <StyledIconButton
                                                                        onClick={() => handleEdit(table)}
                                                                        className="edit-button"
                                                                        size="small"
                                                                    >
                                                                        <Edit fontSize="small"/>
                                                                    </StyledIconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete">
                                                                    <StyledIconButton
                                                                        onClick={() => handleDelete(table.id)}
                                                                        className="delete-button"
                                                                        size="small"
                                                                    >
                                                                        <Delete fontSize="small"/>
                                                                    </StyledIconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
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
                                    <Typography color="textSecondary">
                                        No time table entries found. Create some entries to see them here.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        sx={{mt: 2}}
                                        onClick={() => setTabIndex(0)}
                                    >
                                        Create New Entry
                                    </Button>
                                </Paper>
                            )}
                        </Paper>
                    </AnimatedBox>
                </Fade>
            </motion.div>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} elevation={6} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default TimeTableForm;