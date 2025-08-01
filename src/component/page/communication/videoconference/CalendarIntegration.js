import React, {useEffect, useState} from 'react';
import {Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {api} from "../../../../common";
import './CalendarIntegration.css';

const localizer = momentLocalizer(moment);

const CalendarIntegration = ({
                                 schoolId,
                                 onRoomSelect,
                                 userName,
                                 userRole,
                                 session,
                                 className,
                                 section,
                                 onJoinMeeting  // New prop to handle joining meetings
                             }) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [calendarSources, setCalendarSources] = useState([]);
    const [selectedCalendarSource, setSelectedCalendarSource] = useState('');
    const [calendarAuthUrl, setCalendarAuthUrl] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('week'); // Default view

    // Fetch calendar events when component mounts or when filters change
    useEffect(() => {
        if (schoolId) {
            fetchCalendarEvents();
            fetchCalendarSources();
        }
    }, [schoolId, session, className, section]);

    // Check if calendar is connected
    useEffect(() => {
        checkCalendarConnection();
    }, []);

    const checkCalendarConnection = async () => {
        try {
            const response = await api.get('/api/calendar/status');
            setIsConnected(response.data.connected);
            if (response.data.connected) {
                fetchCalendarSources();
            }
        } catch (error) {
            console.error('Error checking calendar connection:', error);
            setError('Failed to check calendar connection status');
            setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
        }
    };

    const fetchCalendarSources = async () => {
        try {
            const response = await api.get('/api/calendar/sources');
            setCalendarSources(response.data);
            if (response.data.length > 0) {
                setSelectedCalendarSource(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching calendar sources:', error);
            setError('Failed to fetch calendar sources');
            setTimeout(() => setError(''), 3000);
        }
    };

    const fetchCalendarEvents = async () => {
        setIsLoading(true);
        try {
            const params = {schoolId};

            if (session) params.session = session;
            if (className) params.className = className;
            if (section) params.section = section;

            // Get both room data and calendar events
            const [roomsResponse, calendarResponse] = await Promise.all([
                api.get('/api/rooms', {params}),
                api.get('/api/calendar/events', {params})
            ]);

            // Process room data
            const roomEvents = roomsResponse.data.map(room => ({
                id: `room-${room.id}`,
                title: `${room.name} ${room.active ? '(Active)' : ''}`,
                start: new Date(room.scheduledStartTime || Date.now()),
                end: new Date(room.scheduledEndTime || moment().add(1, 'hour').toDate()),
                resource: room,
                isRoom: true,
                eventType: room.active ? 'active' : 'scheduled'
            }));

            // Process calendar events
            const calendarEvents = calendarResponse.data.map(event => ({
                id: `cal-${event.id}`,
                title: event.title || event.name,
                start: new Date(event.startTime || event.scheduledStartTime),
                end: new Date(event.endTime || event.scheduledEndTime),
                resource: event,
                isCalendarEvent: true,
                eventType: 'calendar'
            }));

            // Combine both types of events
            setEvents([...roomEvents, ...calendarEvents]);
            setIsLoading(false);
            setError('');
        } catch (error) {
            console.error('Error fetching events:', error);
            setIsLoading(false);
            setError('Failed to load events');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleEventSelect = (event) => {
        setSelectedEvent(event);
        if (event.resource) {
            onRoomSelect(event.resource);
        }
    };

    const handleJoinMeeting = () => {
        if (selectedEvent && selectedEvent.resource && selectedEvent.resource.id) {
            // For room events, we can join directly
            if (selectedEvent.isRoom) {
                onJoinMeeting(selectedEvent.resource.id);
            }
            // For calendar events that have room IDs
            else if (selectedEvent.resource.roomId) {
                onJoinMeeting(selectedEvent.resource.roomId);
            }
            // For calendar events without room IDs, we need to create and join
            else {
                handleCreateFromCalendarEvent();
            }
        }
    };

    const handleCreateFromCalendarEvent = async () => {
        if (!selectedEvent || !userName) return;

        try {
            // Create a room from the calendar event
            const calEvent = selectedEvent.resource;
            const roomData = {
                schoolId: parseInt(schoolId),
                name: calEvent.title || calEvent.summary || "Meeting from calendar",
                description: calEvent.description || `Meeting created from calendar by ${userName}`,
                session: session,
                className: className,
                section: section,
                scheduledStartTime: calEvent.start || calEvent.startTime,
                scheduledEndTime: calEvent.end || calEvent.endTime,
                createdBy: userName
            };

            const response = await api.post('/api/rooms', roomData);

            // Join the newly created room
            if (response.status === 200) {
                onJoinMeeting(response.data.id);
            }
        } catch (error) {
            console.error('Error creating room from calendar event:', error);
            setError('Failed to create room from calendar event');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleConnectCalendar = async (source) => {
        try {
            const response = await api.get(`/api/calendar/auth/url?source=${source}`);
            setCalendarAuthUrl(response.data.authUrl);
            // Open the authentication URL in a new window
            window.open(response.data.authUrl, '_blank', 'width=600,height=700');

            // Poll for successful connection
            const checkInterval = setInterval(async () => {
                const statusCheck = await api.get('/api/calendar/status');
                if (statusCheck.data.connected) {
                    clearInterval(checkInterval);
                    setIsConnected(true);
                    fetchCalendarSources();
                    fetchCalendarEvents();
                }
            }, 3000);

            // Stop polling after 2 minutes if not connected
            setTimeout(() => clearInterval(checkInterval), 120000);
        } catch (error) {
            console.error('Error getting calendar auth URL:', error);
            setError('Failed to connect to calendar');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDisconnectCalendar = async () => {
        try {
            await api.post('/api/calendar/disconnect');
            setIsConnected(false);
            // Remove calendar events but keep room events
            setEvents(events.filter(event => event.isRoom));
        } catch (error) {
            console.error('Error disconnecting calendar:', error);
            setError('Failed to disconnect calendar');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleImportToCalendar = async () => {
        if (!selectedEvent || !selectedEvent.resource) return;

        try {
            const roomId = selectedEvent.isRoom ?
                selectedEvent.resource.id :
                selectedEvent.resource.roomId;

            if (!roomId && !selectedEvent.isRoom) {
                // Create a room first if this is just a calendar event
                const newRoomResponse = await api.post('/api/rooms', {
                    schoolId: parseInt(schoolId),
                    name: selectedEvent.title,
                    description: selectedEvent.resource.description || `Imported from calendar by ${userName}`,
                    session: session,
                    className: className,
                    section: section,
                    scheduledStartTime: selectedEvent.start,
                    scheduledEndTime: selectedEvent.end,
                    createdBy: userName
                });

                await api.post('/api/calendar/import', {
                    roomId: newRoomResponse.data.id,
                    calendarId: selectedCalendarSource,
                    summary: selectedEvent.title,
                    description: selectedEvent.resource.description,
                    startTime: selectedEvent.start,
                    endTime: selectedEvent.end
                });
            } else {
                await api.post('/api/calendar/import', {
                    roomId: roomId,
                    calendarId: selectedCalendarSource
                });
            }

            setError('Event successfully added to calendar!');
            setTimeout(() => setError(''), 3000);
            fetchCalendarEvents();
        } catch (error) {
            console.error('Error importing event to calendar:', error);
            setError('Failed to add event to calendar');
            setTimeout(() => setError(''), 3000);
        }
    };

    const createRecurringRoom = async () => {
        if (!selectedEvent || !selectedEvent.resource) return;

        try {
            // Get the room ID - either directly from a room event or from a calendar event with roomId
            const roomId = selectedEvent.isRoom ?
                selectedEvent.resource.id :
                selectedEvent.resource.roomId;

            if (!roomId && !selectedEvent.isRoom) {
                setError('Please select a room event to make recurring');
                setTimeout(() => setError(''), 3000);
                return;
            }

            // Open a modal or redirect to a form to set up recurring details
            const recurringDetails = {
                baseRoomId: roomId,
                recurrenceRule: 'FREQ=WEEKLY;COUNT=10', // Default weekly for 10 weeks
                daysOfWeek: [moment(selectedEvent.start).day()], // Same day of week
                schoolId: schoolId,
                session: session,
                className: className,
                section: section,
                createdBy: userName
            };

            const response = await api.post('/api/rooms/recurring', recurringDetails);
            setError(`Created ${response.data.count} recurring sessions`);
            setTimeout(() => setError(''), 3000);

            // Refresh calendar events to show the new recurring sessions
            fetchCalendarEvents();
        } catch (error) {
            console.error('Error creating recurring room:', error);
            setError('Failed to create recurring sessions');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Custom event styling
    const eventStyleGetter = (event) => {
        let style = {
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };

        // Different colors based on event type
        if (event.eventType === 'active') {
            style.backgroundColor = '#28a745'; // Green for active rooms
        } else if (event.eventType === 'scheduled') {
            style.backgroundColor = '#007bff'; // Blue for scheduled rooms
        } else if (event.eventType === 'calendar') {
            style.backgroundColor = '#6f42c1'; // Purple for external calendar events
        }

        return {style};
    };

    // Custom toolbar for the calendar
    const CustomToolbar = ({label, onView, onNavigate}) => (
        <div className="calendar-toolbar">
            <div className="calendar-toolbar-nav">
                <button onClick={() => onNavigate('PREV')}>
                    &lt; Prev
                </button>
                <button onClick={() => onNavigate('TODAY')}>
                    Today
                </button>
                <button onClick={() => onNavigate('NEXT')}>
                    Next &gt;
                </button>
            </div>
            <div className="calendar-toolbar-label">
                <h3>{label}</h3>
            </div>
            <div className="calendar-toolbar-views">
                <button onClick={() => {
                    onView('month');
                    setViewMode('month');
                }}
                        className={viewMode === 'month' ? 'active' : ''}>
                    Month
                </button>
                <button onClick={() => {
                    onView('week');
                    setViewMode('week');
                }}
                        className={viewMode === 'week' ? 'active' : ''}>
                    Week
                </button>
                <button onClick={() => {
                    onView('day');
                    setViewMode('day');
                }}
                        className={viewMode === 'day' ? 'active' : ''}>
                    Day
                </button>
                <button onClick={() => {
                    onView('agenda');
                    setViewMode('agenda');
                }}
                        className={viewMode === 'agenda' ? 'active' : ''}>
                    Agenda
                </button>
            </div>
        </div>
    );

    return (
        <div className="calendar-container">
            <h2>Calendar View</h2>

            {error && <div
                className={`message-box ${error.includes('success') ? 'success-message' : 'error-message'}`}>{error}</div>}

            <div className="calendar-controls">
                <div className="filters-row">
                    <div className="filter-group">
                        <label>Filters:</label>
                        {schoolId && <span className="filter-badge">School: {schoolId}</span>}
                        {session && <span className="filter-badge">Session: {session}</span>}
                        {className && <span className="filter-badge">Class: {className}</span>}
                        {section && <span className="filter-badge">Section: {section}</span>}
                    </div>

                    <button
                        className="refresh-button"
                        onClick={fetchCalendarEvents}
                    >
                        Refresh Events
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="loading">Loading calendar events...</div>
            ) : (
                <div className="calendar-wrapper">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{height: 500}}
                        onSelectEvent={handleEventSelect}
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView={viewMode}
                        components={{
                            toolbar: CustomToolbar
                        }}
                        eventPropGetter={eventStyleGetter}
                    />
                </div>
            )}

            {selectedEvent && (
                <div className="event-details">
                    <div className="event-header">
                        <div className="event-title">
                            <h3>{selectedEvent.title}</h3>
                            {selectedEvent.resource && (
                                <>
                                    {selectedEvent.isRoom && <span className="event-badge room-badge">Room Event</span>}
                                    {selectedEvent.isCalendarEvent &&
                                        <span className="event-badge calendar-badge">Calendar Event</span>}
                                    {selectedEvent.resource.active &&
                                        <span className="event-badge active-badge">Active</span>}
                                </>
                            )}
                        </div>
                        <div className="event-actions">
                            {userName && (
                                <>
                                    <button
                                        className="quick-join-button"
                                        onClick={handleJoinMeeting}
                                        disabled={!selectedEvent.resource || (!selectedEvent.isRoom && !selectedEvent.resource.roomId)}
                                    >
                                        Quick Join
                                    </button>
                                    <button
                                        className="join-button"
                                        onClick={handleJoinMeeting}
                                    >
                                        Join Meeting
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="event-time">
                        <div className="time-item">
                            <span className="time-label">Start:</span>
                            <span
                                className="time-value">{moment(selectedEvent.start).format('MMMM D, YYYY h:mm A')}</span>
                        </div>
                        <div className="time-item">
                            <span className="time-label">End:</span>
                            <span
                                className="time-value">{moment(selectedEvent.end).format('MMMM D, YYYY h:mm A')}</span>
                        </div>
                    </div>

                    {selectedEvent.resource && (
                        <div className="room-info">
                            {selectedEvent.resource.description && (
                                <div className="info-item">
                                    <span className="info-label">Description:</span>
                                    <span className="info-value">{selectedEvent.resource.description}</span>
                                </div>
                            )}
                            {selectedEvent.resource.session && (
                                <div className="info-item">
                                    <span className="info-label">Session:</span>
                                    <span className="info-value">{selectedEvent.resource.session}</span>
                                </div>
                            )}
                            {selectedEvent.resource.className && (
                                <div className="info-item">
                                    <span className="info-label">Class:</span>
                                    <span className="info-value">
                                        {selectedEvent.resource.className}
                                        {selectedEvent.resource.section && ` - ${selectedEvent.resource.section}`}
                                    </span>
                                </div>
                            )}

                            <div className="additional-actions">
                                {isConnected && (
                                    <button
                                        className="secondary-button"
                                        onClick={handleImportToCalendar}
                                    >
                                        {selectedEvent.isRoom ? 'Add to Calendar' : 'Create Room & Add'}
                                    </button>
                                )}

                                {selectedEvent.isRoom && (
                                    <button
                                        className="secondary-button"
                                        onClick={createRecurringRoom}
                                    >
                                        Make Recurring
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="calendar-legend">
                <h4>Legend:</h4>
                <div className="legend-items">
                    <div className="legend-item">
                        <span className="color-box active-color"></span>
                        <span>Active Meetings</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box scheduled-color"></span>
                        <span>Scheduled Meetings</span>
                    </div>
                    <div className="legend-item">
                        <span className="color-box calendar-color"></span>
                        <span>Calendar Events</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarIntegration;