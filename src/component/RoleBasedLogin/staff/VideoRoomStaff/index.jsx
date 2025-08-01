import React, {useEffect, useState} from 'react';
import {LiveKitRoom} from '@livekit/components-react';
import '@livekit/components-styles';
import {api} from "../../../../common";
import {format} from 'date-fns';
import {VideoConference} from "../../../page/communication/videoconference/VideoConference";
import CalendarIntegration from '../../../page/communication/videoconference/CalendarIntegration';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';

function VideoRoomStaff() {
    const [token, setToken] = useState('');
    const [serverUrl, setServerUrl] = useState('');
    const [roomInfo, setRoomInfo] = useState(null);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('staff');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [session, setSession] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [filterType, setFilterType] = useState('active');
    const [activeTab, setActiveTab] = useState('rooms');
    const [joinMode, setJoinMode] = useState('join');

    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedDays, setSelectedDays] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    });
    const [recurringEndDate, setRecurringEndDate] = useState('');

    const API_BASE_URL = '/api';

    useEffect(() => {
        fetchRooms();
    }, [filterType, schoolId, session, className, section]);

    const fetchRooms = async () => {
        try {
            let endpoint = `${API_BASE_URL}/rooms`;
            let params = {};

            if (filterType === 'active') {
                endpoint = `${API_BASE_URL}/rooms/active`;
            } else if (filterType === 'upcoming') {
                endpoint = `${API_BASE_URL}/rooms/upcoming`;
                if (schoolId) params.schoolId = schoolId;
            } else if (filterType === 'school' && schoolId) {
                endpoint = `${API_BASE_URL}/rooms/school/${schoolId}`;
            } else if (filterType === 'class') {
                endpoint = `${API_BASE_URL}/rooms/class`;
                params = {
                    schoolId,
                    session,
                    className,
                    section
                };
            }
            const response = await api.get(endpoint, {params});
            setAvailableRooms(response.data);
            setError('');
        } catch (e) {
            console.error('Error fetching rooms:', e);
            setError('Failed to load rooms. The server might be offline.');
        }
    };

    const handleDaySelect = (day) => {
        setSelectedDays(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    const getSelectedDaysArray = () => {
        return Object.entries(selectedDays)
            .filter(([_, isSelected]) => isSelected)
            .map(([day]) => day);
    };

    const createRoom = async (isScheduleOnly = false) => {
        if (!roomInfo?.name?.trim() || !schoolId) {
            setError('Room name and School ID are required');
            return;
        }

        if (isScheduleOnly && (!roomInfo?.scheduledStartTime || !roomInfo?.scheduledEndTime)) {
            setError('Start and end times are required for scheduling');
            return;
        }

        if (isRecurring && (!recurringEndDate || getSelectedDaysArray().length === 0)) {
            setError('Please select days and end date for recurring meetings');
            return;
        }

        try {
            const requestPayload = {
                schoolId: parseInt(schoolId),
                name: roomInfo.name,
                description: roomInfo.description || `Room created by ${userName}`,
                session: session,
                className: className,
                section: section,
                scheduledStartTime: roomInfo.scheduledStartTime,
                scheduledEndTime: roomInfo.scheduledEndTime,
                createdBy: userName,
                active: true,
            };

            if (isRecurring && isScheduleOnly) {
                requestPayload.recurring = {
                    isRecurring: true,
                    days: getSelectedDaysArray(),
                    endDate: recurringEndDate
                };
            }

            const response = await api.post(`${API_BASE_URL}/rooms`, requestPayload);

            if (response.status === 200) {
                setRoomInfo(response.data);
                await fetchRooms();

                if (!isScheduleOnly) {
                    await getToken(response.data.id);
                } else {
                    setError('Meeting scheduled successfully!');
                    setTimeout(() => setError(''), 3000);
                }

                if (isScheduleOnly) {
                    setActiveTab('calendar');
                }
            } else {
                setError('Failed to create room');
            }
        } catch (e) {
            console.error('Error creating room:', e);
            setError(`Failed to create room: ${e.response?.data?.message || 'Server might be offline'}`);
        }
    };

    const getToken = async (roomId) => {
        if (!roomId || !userName.trim()) {
            setError('Room ID and user name are required');
            return;
        }

        try {
            const response = await api.get(`${API_BASE_URL}/livekit/token`, {
                params: {
                    roomId: roomId,
                    identity: userName,
                    canPublish: true,
                    userRole: userRole
                }
            });

            setToken(response.data.token);
            setServerUrl(response.data.serverUrl);
            setConnected(true);
            setError('');
        } catch (e) {
            console.error('Error getting token:', e);
            setError(`Failed to connect: ${e.response?.data?.message || 'Server might be offline'}`);
        }
    };

    const handleRoomSelect = (room) => {
        setRoomInfo(room);
    };

    const handleDisconnect = () => {
        setConnected(false);
        setToken('');
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'Not scheduled';
        const date = new Date(dateTimeStr);
        return format(date, 'MMM dd, yyyy HH:mm');
    };

    const renderRecurringOptions = () => (
        <Box sx={{mt: 2}}>
            <FormControlLabel
                control={
                    <Switch
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                    />
                }
                label="Recurring Meeting"
            />
            {isRecurring && (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Select Days:</Typography>
                        {Object.keys(selectedDays).map((day) => (
                            <FormControlLabel
                                key={day}
                                control={
                                    <Switch
                                        checked={selectedDays[day]}
                                        onChange={() => handleDaySelect(day)}
                                    />
                                }
                                label={day.charAt(0).toUpperCase() + day.slice(1)}
                            />
                        ))}
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            type="date"
                            label="End Date"
                            value={recurringEndDate}
                            onChange={(e) => setRecurringEndDate(e.target.value)}
                            fullWidth
                            InputLabelProps={{shrink: true}}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );

    if (connected && token && serverUrl) {
        return (
            <LiveKitRoom
                token={token}
                serverUrl={serverUrl}
                connect={true}
                onDisconnected={handleDisconnect}
            >
                <VideoConference/>
            </LiveKitRoom>
        );
    }

    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{p: 3, mt: 3}}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{mb: 3}}
                >
                    <Tab value="rooms" label="Video Rooms"/>
                    <Tab value="calendar" label="Calendar"/>
                </Tabs>

                {activeTab === 'rooms' ? (
                    <Box>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth sx={{mb: 2}}>
                                    <InputLabel>Filter Type</InputLabel>
                                    <Select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        label="Filter Type"
                                    >
                                        <MenuItem value="active">Active Rooms</MenuItem>
                                        <MenuItem value="upcoming">Upcoming</MenuItem>
                                        <MenuItem value="class">Class Rooms</MenuItem>
                                        <MenuItem value="all">All Rooms</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    fullWidth
                                    label="School ID"
                                    value={schoolId}
                                    onChange={(e) => setSchoolId(e.target.value)}
                                    sx={{mb: 2}}
                                />

                                {filterType === 'class' && (
                                    <>
                                        <TextField
                                            fullWidth
                                            label="Session"
                                            value={session}
                                            onChange={(e) => setSession(e.target.value)}
                                            sx={{mb: 2}}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Class"
                                            value={className}
                                            onChange={(e) => setClassName(e.target.value)}
                                            sx={{mb: 2}}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Section"
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                            sx={{mb: 2}}
                                        />
                                    </>
                                )}
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Box sx={{mb: 3}}>
                                    <Typography variant="h6" gutterBottom>
                                        Available Rooms
                                    </Typography>
                                    {availableRooms.map((room) => (
                                        <Paper
                                            key={room.id}
                                            elevation={1}
                                            sx={{
                                                p: 2,
                                                mb: 2,
                                                cursor: 'pointer',
                                                '&:hover': {bgcolor: 'action.hover'}
                                            }}
                                            onClick={() => handleRoomSelect(room)}
                                        >
                                            <Typography variant="subtitle1">{room.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Start: {formatDateTime(room.scheduledStartTime)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                End: {formatDateTime(room.scheduledEndTime)}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>

                                {roomInfo && (
                                    <Box sx={{mt: 3}}>
                                        <Typography variant="h6" gutterBottom>
                                            Join Room
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            label="Your Name"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            sx={{mb: 2}}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() => getToken(roomInfo.id)}
                                            disabled={!userName.trim()}
                                        >
                                            Join Room
                                        </Button>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <CalendarIntegration
                        schoolId={schoolId}
                        session={session}
                        className={className}
                        section={section}
                    />
                )}
            </Paper>
        </Container>
    );
}

export default VideoRoomStaff; 