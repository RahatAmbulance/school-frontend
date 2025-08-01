import React, {useEffect, useState} from 'react';
import {LiveKitRoom} from '@livekit/components-react';
import '@livekit/components-styles';

import './VideoRoom.css';
import {api} from "../../../../common";
import {format} from 'date-fns';
import {VideoConference} from "./VideoConference";
import CalendarIntegration from './CalendarIntegration';

function VideoRoom() {
    const [token, setToken] = useState('');
    const [serverUrl, setServerUrl] = useState('');
    const [roomInfo, setRoomInfo] = useState(null);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('student');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [session, setSession] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [filterType, setFilterType] = useState('active'); // 'active', 'upcoming', 'all', 'class'
    const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'calendar'
    const [joinMode, setJoinMode] = useState('join'); // 'join', 'create', 'schedule'

    // Recurring meeting options
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

    // API base URL
    const API_BASE_URL = '/api';

    // Fetch available rooms when component mounts
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
            // Prepare request payload
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

            // Add recurring meeting details if applicable
            if (isRecurring && isScheduleOnly) {
                requestPayload.recurring = {
                    isRecurring: true,
                    days: getSelectedDaysArray(),
                    endDate: recurringEndDate
                };
            }

            const response = await api.post(`${API_BASE_URL}/rooms`, requestPayload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setRoomInfo(response.data);
                await fetchRooms();

                // Only join if not scheduling
                if (!isScheduleOnly) {
                    await getToken(response.data.id);
                } else {
                    setError('Meeting scheduled successfully!');
                    setTimeout(() => setError(''), 3000);
                }

                // Switch to calendar tab if scheduling
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
        return format(date, 'MMM dd, yyyy hh:mm a');
    };

    const renderRecurringOptions = () => {
        const dayLabels = {
            monday: 'Mon',
            tuesday: 'Tue',
            wednesday: 'Wed',
            thursday: 'Thu',
            friday: 'Fri',
            saturday: 'Sat',
            sunday: 'Sun'
        };

        return (
            <>
                <div className="input-group">
                    <div className="checkbox-container">
                        <input
                            id="isRecurring"
                            type="checkbox"
                            checked={isRecurring}
                            onChange={() => setIsRecurring(!isRecurring)}
                        />
                        <label htmlFor="isRecurring">Make this a recurring meeting</label>
                    </div>
                </div>

                {isRecurring && (
                    <>
                        <div className="input-group">
                            <label>Repeat on:</label>
                            <div className="days-selector">
                                {Object.entries(dayLabels).map(([day, label]) => (
                                    <div
                                        key={day}
                                        className={`day-button ${selectedDays[day] ? 'selected' : ''}`}
                                        onClick={() => handleDaySelect(day)}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="recurringEndDate">End date:</label>
                            <input
                                id="recurringEndDate"
                                type="date"
                                value={recurringEndDate}
                                onChange={(e) => setRecurringEndDate(e.target.value)}
                                min={roomInfo?.scheduledStartTime ? roomInfo.scheduledStartTime.substring(0, 10) : ''}
                                required={isRecurring}
                            />
                        </div>
                    </>
                )}
            </>
        );
    };

    const renderForm = () => {
        switch (joinMode) {
            case 'join':
                return (
                    <>
                        <h3>Join a Meeting</h3>
                        <div className="input-group">
                            <label htmlFor="userName">Your Name:</label>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="userRole">Your Role:</label>
                            <select
                                id="userRole"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="join-instructions">
                            <p>Select a room from the list and click "Join Selected Room"</p>
                        </div>

                        <div className="button-group">
                            <button
                                className="join-button primary-button"
                                onClick={() => getToken(roomInfo?.id)}
                                disabled={!roomInfo?.id || !userName}
                            >
                                Join Selected Room
                            </button>
                            <button
                                className="mode-switch-button"
                                onClick={() => setJoinMode('create')}
                            >
                                Create New Meeting
                            </button>
                            <button
                                className="mode-switch-button"
                                onClick={() => setJoinMode('schedule')}
                            >
                                Schedule a Meeting
                            </button>
                        </div>
                    </>
                );
            case 'create':
                return (
                    <>
                        <h3>Create & Join New Meeting</h3>
                        <div className="input-group">
                            <label htmlFor="userName">Your Name:</label>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="userRole">Your Role:</label>
                            <select
                                id="userRole"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="schoolId">School ID:</label>
                            <input
                                id="schoolId"
                                type="number"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                placeholder="Enter school ID"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="session">Academic Session:</label>
                            <input
                                id="session"
                                type="text"
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                                placeholder="E.g. 2024-2025"
                            />
                        </div>

                        <div className="input-group compact-group">
                            <div className="input-subgroup">
                                <label htmlFor="className">Class:</label>
                                <input
                                    id="className"
                                    type="text"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="E.g. Grade 9"
                                />
                            </div>

                            <div className="input-subgroup">
                                <label htmlFor="section">Section:</label>
                                <input
                                    id="section"
                                    type="text"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    placeholder="E.g. A"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="roomName">Meeting Name:</label>
                            <input
                                id="roomName"
                                type="text"
                                value={roomInfo?.name || ''}
                                onChange={(e) => setRoomInfo({...roomInfo || {}, name: e.target.value})}
                                placeholder="Enter meeting name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="roomDescription">Description:</label>
                            <input
                                id="roomDescription"
                                type="text"
                                value={roomInfo?.description || ''}
                                onChange={(e) => setRoomInfo({...roomInfo || {}, description: e.target.value})}
                                placeholder="Enter description"
                            />
                        </div>

                        <div className="button-group">
                            <button
                                className="create-button primary-button"
                                onClick={() => createRoom(false)}
                                disabled={!roomInfo?.name || !schoolId || !userName}
                            >
                                Create & Join Now
                            </button>
                            <button
                                className="mode-switch-button"
                                onClick={() => setJoinMode('join')}
                            >
                                Join Existing Meeting
                            </button>
                            <button
                                className="mode-switch-button"
                                onClick={() => setJoinMode('schedule')}
                            >
                                Schedule Instead
                            </button>
                        </div>
                    </>
                );
            case 'schedule':
                return (
                    <>
                        <h3>Schedule a Meeting</h3>
                        <div className="input-group">
                            <label htmlFor="userName">Your Name:</label>
                            <input
                                id="userName"
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="userRole">Your Role:</label>
                            <select
                                id="userRole"
                                value={userRole}
                                onChange={(e) => setUserRole(e.target.value)}
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label htmlFor="schoolId">School ID:</label>
                            <input
                                id="schoolId"
                                type="number"
                                value={schoolId}
                                onChange={(e) => setSchoolId(e.target.value)}
                                placeholder="Enter school ID"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="session">Academic Session:</label>
                            <input
                                id="session"
                                type="text"
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                                placeholder="E.g. 2024-2025"
                            />
                        </div>

                        <div className="input-group compact-group">
                            <div className="input-subgroup">
                                <label htmlFor="className">Class:</label>
                                <input
                                    id="className"
                                    type="text"
                                    value={className}
                                    onChange={(e) => setClassName(e.target.value)}
                                    placeholder="E.g. Grade 9"
                                />
                            </div>

                            <div className="input-subgroup">
                                <label htmlFor="section">Section:</label>
                                <input
                                    id="section"
                                    type="text"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    placeholder="E.g. A"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="roomName">Meeting Name:</label>
                            <input
                                id="roomName"
                                type="text"
                                value={roomInfo?.name || ''}
                                onChange={(e) => setRoomInfo({...roomInfo || {}, name: e.target.value})}
                                placeholder="Enter meeting name"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="roomDescription">Description:</label>
                            <input
                                id="roomDescription"
                                type="text"
                                value={roomInfo?.description || ''}
                                onChange={(e) => setRoomInfo({...roomInfo || {}, description: e.target.value})}
                                placeholder="Enter description"
                            />
                        </div>

                        <div className="input-group compact-group">
                            <div className="input-subgroup">
                                <label htmlFor="startTime">Start Time:</label>
                                <input
                                    id="startTime"
                                    type="datetime-local"
                                    value={roomInfo?.scheduledStartTime ? roomInfo.scheduledStartTime.substring(0, 16) : ''}
                                    onChange={(e) => setRoomInfo({
                                        ...roomInfo || {},
                                        scheduledStartTime: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="input-subgroup">
                                <label htmlFor="endTime">End Time:</label>
                                <input
                                    id="endTime"
                                    type="datetime-local"
                                    value={roomInfo?.scheduledEndTime ? roomInfo.scheduledEndTime.substring(0, 16) : ''}
                                    onChange={(e) => setRoomInfo({...roomInfo || {}, scheduledEndTime: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        {/* Recurring meeting options */}
                        {renderRecurringOptions()}

                        <div className="button-group">
                            <button
                                className="schedule-button primary-button"
                                onClick={() => createRoom(true)}
                                disabled={!roomInfo?.name || !schoolId || !userName || !roomInfo?.scheduledStartTime || !roomInfo?.scheduledEndTime || (isRecurring && (!recurringEndDate || getSelectedDaysArray().length === 0))}
                            >
                                {isRecurring ? 'Schedule Recurring Meetings' : 'Schedule Meeting'}
                            </button>
                            <button
                                className="mode-switch-button"
                                onClick={() => setJoinMode('join')}
                            >
                                Join Existing Meeting
                            </button>
                            <button
                                className="mode-switch-button"
                                onClick={() => setJoinMode('create')}
                            >
                                Create & Join Now
                            </button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="app-container">
            {error && <div
                className={`message-box ${error.includes('successfully') ? 'success-message' : 'error-message'}`}>{error}</div>}

            {!connected ? (
                <div className="join-container">
                    <div className="form-container" style={{maxHeight: '800px', overflowY: 'auto'}}>
                        {renderForm()}
                    </div>

                    <div className="content-container">
                        <div className="tabs">
                            <button
                                className={`tab-button ${activeTab === 'rooms' ? 'active' : ''}`}
                                onClick={() => setActiveTab('rooms')}
                            >
                                Room List
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
                                onClick={() => setActiveTab('calendar')}
                            >
                                Calendar View
                            </button>
                        </div>

                        {activeTab === 'rooms' ? (
                            <div className="rooms-container">
                                <h2>Available Meetings</h2>

                                <div className="filter-controls">
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="active">Active Meetings</option>
                                        <option value="upcoming">Upcoming Meetings</option>
                                        <option value="school">By School</option>
                                        <option value="class">By Class</option>
                                        <option value="all">All Meetings</option>
                                    </select>

                                    <button className="refresh-button" onClick={fetchRooms}>
                                        Refresh
                                    </button>
                                </div>

                                {availableRooms.length === 0 ? (
                                    <p className="empty-message">No meetings available. Create one!</p>
                                ) : (
                                    <ul className="room-list">
                                        {availableRooms.map((room) => (
                                            <li
                                                key={room.id}
                                                className={`room-item ${roomInfo?.id === room.id ? 'selected' : ''}`}
                                                onClick={() => handleRoomSelect(room)}
                                            >
                                                <div className="room-header">
                                                    <strong>{room.name}</strong>
                                                    {room.active && <span className="active-badge">Active</span>}
                                                    {room.recurring &&
                                                        <span className="recurring-badge">Recurring</span>}
                                                </div>
                                                <div className="room-details">
                                                    <p>{room.description}</p>
                                                    <p>School: {room.schoolId}</p>
                                                    {room.session && <p>Session: {room.session}</p>}
                                                    {room.className &&
                                                        <p>Class: {room.className} {room.section && `- ${room.section}`}</p>}
                                                    <p>Start: {formatDateTime(room.scheduledStartTime)}</p>
                                                    <p>End: {formatDateTime(room.scheduledEndTime)}</p>
                                                    {room.recurring && room.recurringDays && (
                                                        <p>Repeats: {room.recurringDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}</p>
                                                    )}
                                                    {room.recurring && room.recurringEndDate && (
                                                        <p>Until: {format(new Date(room.recurringEndDate), 'MMM dd, yyyy')}</p>
                                                    )}
                                                </div>
                                                {joinMode === 'join' && (
                                                    <button
                                                        className="quick-join-button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRoomSelect(room);
                                                            getToken(room.id);
                                                        }}
                                                        disabled={!userName}
                                                    >
                                                        Quick Join
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <CalendarIntegration
                                schoolId={schoolId}
                                onRoomSelect={handleRoomSelect}
                                userName={userName}
                                userRole={userRole}
                                session={session}
                                className={className}
                                section={section}
                                onJoinMeeting={getToken}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <div className="conference-container">
                    {token && (
                        <LiveKitRoom
                            token={token}
                            serverUrl={serverUrl}
                            onDisconnected={handleDisconnect}
                            connectOptions={{autoSubscribe: true}}
                            data-lk-theme="default"
                        >
                            {/*Video Conference Component with chat, whiteboard, resources, and file sharing  */}
                            <VideoConference
                                userName={userName}
                                roomInfo={roomInfo}
                                userRole={userRole}
                            />
                        </LiveKitRoom>
                    )}
                </div>
            )}
        </div>
    );
}

export default VideoRoom;