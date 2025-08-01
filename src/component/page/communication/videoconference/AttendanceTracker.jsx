import React, {useEffect, useState} from "react";
import {DataPacket_Kind, RoomEvent} from "livekit-client";
import {format} from "date-fns";
import './AttendanceTracker.css';
import * as XLSX from 'xlsx';

export function AttendanceTracker({room, localParticipant, userName, userRole, roomInfo}) {
    // Load initial data from localStorage if available
    const loadInitialData = () => {
        try {
            const storedData = localStorage.getItem(`attendance_${roomInfo.name}`);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Convert stored date strings back to Date objects
                return parsedData.map(record => ({
                    ...record,
                    joinTime: new Date(record.joinTime),
                    leaveTime: record.leaveTime ? new Date(record.leaveTime) : null,
                    lastActive: new Date(record.lastActive)
                }));
            }
        } catch (error) {
            console.error('Error loading attendance data:', error);
        }
        return [];
    };

    const loadActiveParticipants = () => {
        try {
            const storedData = localStorage.getItem(`active_participants_${roomInfo.name}`);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                return parsedData.map(record => ({
                    ...record,
                    joinTime: new Date(record.joinTime),
                    leaveTime: record.leaveTime ? new Date(record.leaveTime) : null,
                    lastActive: new Date(record.lastActive)
                }));
            }
        } catch (error) {
            console.error('Error loading active participants:', error);
        }
        return [];
    };

    const [attendanceRecords, setAttendanceRecords] = useState(loadInitialData);
    const [activeParticipants, setActiveParticipants] = useState(loadActiveParticipants);
    const [showExport, setShowExport] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({key: 'joinTime', direction: 'desc'});
    const [reportData, setReportData] = useState(null);
    const [viewMode, setViewMode] = useState('all'); // 'all', 'active', 'left'
    const [selectedParticipants, setSelectedParticipants] = useState(new Set());

    // Save data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(`attendance_${roomInfo.name}`, JSON.stringify(attendanceRecords));
        } catch (error) {
            console.error('Error saving attendance data:', error);
        }
    }, [attendanceRecords, roomInfo.name]);

    useEffect(() => {
        try {
            localStorage.setItem(`active_participants_${roomInfo.name}`, JSON.stringify(activeParticipants));
        } catch (error) {
            console.error('Error saving active participants:', error);
        }
    }, [activeParticipants, roomInfo.name]);

    // Clean up old data when component unmounts
    useEffect(() => {
        return () => {
            // Only clean up if user has left the room
            if (!room) {
                try {
                    const now = new Date();
                    const updatedRecords = attendanceRecords.map(record => {
                        if (record.active) {
                            const durationMs = now - new Date(record.joinTime);
                            const durationMinutes = Math.floor(durationMs / 60000);
                            return {
                                ...record,
                                active: false,
                                leaveTime: now,
                                duration: durationMinutes,
                                totalDuration: (record.totalDuration || 0) + durationMinutes,
                                lastActive: now
                            };
                        }
                        return record;
                    });
                    localStorage.setItem(`attendance_${roomInfo.name}`, JSON.stringify(updatedRecords));
                    localStorage.setItem(`active_participants_${roomInfo.name}`, JSON.stringify([]));
                } catch (error) {
                    console.error('Error cleaning up attendance data:', error);
                }
            }
        };
    }, [room, attendanceRecords, roomInfo.name]);

    // Track when participants join and leave
    useEffect(() => {
        if (!room) return;

        const handleParticipantConnected = (participant) => {
            const joinTime = new Date();
            // Check if participant already exists in records
            const existingRecord = attendanceRecords.find(r => r.id === participant.identity);

            const participantInfo = {
                id: participant.identity,
                name: participant.name || participant.identity,
                role: participant.metadata ? JSON.parse(participant.metadata).role : 'student',
                joinTime: joinTime,
                leaveTime: null,
                duration: 0,
                active: true,
                sessionId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                totalDuration: existingRecord ? existingRecord.totalDuration : 0,
                joinCount: existingRecord ? existingRecord.joinCount + 1 : 1,
                lastActive: joinTime
            };

            setActiveParticipants(prev => [...prev, participantInfo]);
            setAttendanceRecords(prev => [participantInfo, ...prev.filter(r => r.id !== participant.identity)]);

            broadcastAttendanceEvent('join', participantInfo);
        };

        const handleParticipantDisconnected = (participant) => {
            const leaveTime = new Date();

            setActiveParticipants(prev => {
                const updatedParticipants = prev.filter(p => p.id !== participant.identity);
                return updatedParticipants;
            });

            setAttendanceRecords(prev => {
                return prev.map(record => {
                    if (record.id === participant.identity && record.active) {
                        const durationMs = leaveTime - new Date(record.joinTime);
                        const durationMinutes = Math.floor(durationMs / 60000);
                        const totalDuration = (record.totalDuration || 0) + durationMinutes;

                        const updatedRecord = {
                            ...record,
                            leaveTime: leaveTime,
                            duration: durationMinutes,
                            active: false,
                            totalDuration: totalDuration,
                            lastActive: leaveTime
                        };

                        broadcastAttendanceEvent('leave', updatedRecord);
                        return updatedRecord;
                    }
                    return record;
                });
            });
        };

        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));

                if (data.type === 'attendance') {
                    if (data.event === 'join') {
                        setActiveParticipants(prev => {
                            if (!prev.find(p => p.sessionId === data.participant.sessionId)) {
                                return [...prev, data.participant];
                            }
                            return prev;
                        });

                        setAttendanceRecords(prev => {
                            const existingRecord = prev.find(p => p.id === data.participant.id);
                            if (existingRecord) {
                                return prev.map(record =>
                                    record.id === data.participant.id
                                        ? {...record, joinCount: record.joinCount + 1}
                                        : record
                                );
                            }
                            return [data.participant, ...prev];
                        });
                    } else if (data.event === 'leave') {
                        setActiveParticipants(prev =>
                            prev.filter(p => p.sessionId !== data.participant.sessionId)
                        );

                        setAttendanceRecords(prev => {
                            return prev.map(record => {
                                if (record.sessionId === data.participant.sessionId) {
                                    return {
                                        ...data.participant,
                                        leaveTime: new Date(data.participant.leaveTime),
                                        joinTime: new Date(data.participant.joinTime),
                                        lastActive: new Date(data.participant.lastActive)
                                    };
                                }
                                return record;
                            });
                        });
                    } else if (data.event === 'sync_request' && userRole === 'instructor') {
                        sendAttendanceSync(participant.identity);
                    } else if (data.event === 'sync_data') {
                        setAttendanceRecords(data.records.map(record => ({
                            ...record,
                            joinTime: new Date(record.joinTime),
                            leaveTime: record.leaveTime ? new Date(record.leaveTime) : null,
                            lastActive: new Date(record.lastActive)
                        })));

                        setActiveParticipants(data.activeParticipants.map(record => ({
                            ...record,
                            joinTime: new Date(record.joinTime),
                            leaveTime: record.leaveTime ? new Date(record.leaveTime) : null,
                            lastActive: new Date(record.lastActive)
                        })));
                    }
                }
            } catch (e) {
                console.error('Error parsing attendance data:', e);
            }
        };

        if (userRole !== 'instructor') {
            requestAttendanceSync();
        } else {
            if (localParticipant && !attendanceRecords.find(r => r.id === localParticipant.identity)) {
                const joinTime = new Date();
                const participantInfo = {
                    id: localParticipant.identity,
                    name: userName || localParticipant.identity,
                    role: userRole,
                    joinTime: joinTime,
                    leaveTime: null,
                    duration: 0,
                    active: true,
                    sessionId: Date.now().toString() + Math.random().toString(36).substring(2, 9),
                    totalDuration: 0,
                    joinCount: 1,
                    lastActive: joinTime
                };

                setActiveParticipants(prev => [...prev, participantInfo]);
                setAttendanceRecords(prev => [participantInfo, ...prev]);
            }
        }

        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        room.on(RoomEvent.DataReceived, handleDataReceived);

        return () => {
            room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
            room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [room, localParticipant, userName, userRole, attendanceRecords]);

    // Update durations for active participants
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setAttendanceRecords(prev => {
                return prev.map(record => {
                    if (record.active) {
                        const durationMs = now - new Date(record.joinTime);
                        const durationMinutes = Math.floor(durationMs / 60000);
                        return {
                            ...record,
                            duration: durationMinutes,
                            totalDuration: (record.totalDuration || 0) + durationMinutes,
                            lastActive: now
                        };
                    }
                    return record;
                });
            });
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const requestAttendanceSync = () => {
        if (!room || !localParticipant) return;

        const syncRequest = {
            type: 'attendance',
            event: 'sync_request',
            requesterId: localParticipant.identity
        };

        const data = new TextEncoder().encode(JSON.stringify(syncRequest));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const sendAttendanceSync = (requesterId) => {
        if (!room || !localParticipant) return;

        const syncData = {
            type: 'attendance',
            event: 'sync_data',
            records: attendanceRecords,
            activeParticipants: activeParticipants
        };

        const data = new TextEncoder().encode(JSON.stringify(syncData));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const broadcastAttendanceEvent = (eventType, participantInfo) => {
        if (!room || !localParticipant) return;

        const eventData = {
            type: 'attendance',
            event: eventType,
            participant: participantInfo,
            timestamp: new Date().toISOString()
        };

        const data = new TextEncoder().encode(JSON.stringify(eventData));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const formatTime = (time) => {
        if (!time) return "Still active";
        return format(new Date(time), 'HH:mm:ss');
    };

    const formatDate = (date) => {
        if (!date) return "";
        return format(new Date(date), 'yyyy-MM-dd');
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({key, direction});
    };

    const generateReport = () => {
        const now = new Date();
        const updatedRecords = attendanceRecords.map(record => {
            if (record.active) {
                const durationMs = now - new Date(record.joinTime);
                const durationMinutes = Math.floor(durationMs / 60000);
                return {
                    ...record,
                    duration: durationMinutes,
                    totalDuration: (record.totalDuration || 0) + durationMinutes
                };
            }
            return record;
        });

        if (exportFormat === 'excel') {
            // Prepare data for Excel
            const excelData = updatedRecords.map(record => ({
                'Name': record.name,
                'Role': record.role,
                'Join Date': format(new Date(record.joinTime), 'yyyy-MM-dd'),
                'Join Time': format(new Date(record.joinTime), 'HH:mm:ss'),
                'Leave Time': record.active ? 'Still active' : format(new Date(record.leaveTime), 'HH:mm:ss'),
                'Current Duration (min)': record.duration,
                'Total Duration (min)': record.totalDuration || 0,
                'Join Count': record.joinCount || 1,
                'Status': record.active ? 'Active' : 'Left'
            }));

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const colWidths = [
                {wch: 25}, // Name
                {wch: 15}, // Role
                {wch: 12}, // Join Date
                {wch: 12}, // Join Time
                {wch: 12}, // Leave Time
                {wch: 15}, // Current Duration
                {wch: 15}, // Total Duration
                {wch: 12}, // Join Count
                {wch: 10}  // Status
            ];
            ws['!cols'] = colWidths;

            // Add header styling
            const headerStyle = {
                font: {bold: true, color: {rgb: "FFFFFF"}},
                fill: {fgColor: {rgb: "4472C4"}},
                alignment: {horizontal: "center"}
            };

            // Get the range of cells in the worksheet
            const range = XLSX.utils.decode_range(ws['!ref']);

            // Apply header styling to the first row
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const headerCell = XLSX.utils.encode_cell({r: 0, c: C});
                if (!ws[headerCell]) continue;
                ws[headerCell].s = headerStyle;
            }

            // Add room information at the top
            const roomInfo = [
                ['Room Information'],
                ['Room Name', roomInfo.name],
                ['Export Date', format(now, 'yyyy-MM-dd HH:mm:ss')],
                ['Total Participants', attendanceRecords.length.toString()],
                ['Active Participants', activeParticipants.length.toString()],
                [''],  // Empty row for spacing
            ];

            // Create a new worksheet for room info
            const wsInfo = XLSX.utils.aoa_to_sheet(roomInfo);

            // Style the room info header
            wsInfo['A1'].s = {
                font: {bold: true, color: {rgb: "FFFFFF"}},
                fill: {fgColor: {rgb: "4472C4"}},
                alignment: {horizontal: "center"}
            };

            // Add both worksheets to the workbook
            XLSX.utils.book_append_sheet(wb, wsInfo, 'Room Info');
            XLSX.utils.book_append_sheet(wb, ws, 'Attendance Records');

            // Generate Excel file
            const fileName = `attendance_${roomInfo.name}_${format(now, 'yyyyMMdd_HHmmss')}.xlsx`;
            XLSX.writeFile(wb, fileName);

            // No need to set reportData since we're directly downloading the file
            setShowExport(false);
        } else if (exportFormat === 'csv') {
            const csvRows = [];
            csvRows.push(['Name', 'Role', 'Join Date', 'Join Time', 'Leave Time', 'Duration (min)', 'Total Duration (min)', 'Join Count', 'Status'].join(','));

            updatedRecords.forEach(record => {
                const row = [
                    `"${record.name}"`,
                    record.role,
                    formatDate(record.joinTime),
                    formatTime(record.joinTime),
                    record.active ? 'Still active' : formatTime(record.leaveTime),
                    record.duration,
                    record.totalDuration,
                    record.joinCount,
                    record.active ? 'Active' : 'Left'
                ];
                csvRows.push(row.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], {type: 'text/csv;charset=utf-8;'});
            setReportData({
                fileName: `attendance_${roomInfo.name}_${format(now, 'yyyyMMdd_HHmmss')}.csv`,
                blob: blob,
                url: URL.createObjectURL(blob)
            });
        } else if (exportFormat === 'json') {
            const jsonData = {
                roomName: roomInfo.name,
                exportTime: now.toISOString(),
                attendanceRecords: updatedRecords.map(record => ({
                    ...record,
                    joinTime: new Date(record.joinTime).toISOString(),
                    leaveTime: record.leaveTime ? new Date(record.leaveTime).toISOString() : null,
                    lastActive: new Date(record.lastActive).toISOString()
                }))
            };

            const blob = new Blob([JSON.stringify(jsonData, null, 2)], {type: 'application/json'});
            setReportData({
                fileName: `attendance_${roomInfo.name}_${format(now, 'yyyyMMdd_HHmmss')}.json`,
                blob: blob,
                url: URL.createObjectURL(blob)
            });
        }
    };

    // Filter and sort records
    const filteredAndSortedRecords = React.useMemo(() => {
        let records = [...attendanceRecords];

        // Filter by view mode
        if (viewMode === 'active') {
            records = records.filter(record => record.active);
        } else if (viewMode === 'left') {
            records = records.filter(record => !record.active);
        }

        // Filter by search term
        if (searchTerm) {
            records = records.filter(record => {
                const searchFields = [
                    record.name.toLowerCase(),
                    record.id.toLowerCase(),
                    record.role.toLowerCase()
                ];
                return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
            });
        }

        // Sort records
        if (sortConfig.key) {
            records.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return records;
    }, [attendanceRecords, viewMode, searchTerm, sortConfig]);

    // Calculate statistics
    const stats = React.useMemo(() => {
        return {
            totalAttendees: attendanceRecords.length,
            currentlyActive: activeParticipants.length,
            averageDuration: attendanceRecords.length > 0
                ? Math.round(attendanceRecords.reduce((acc, record) => acc + record.totalDuration, 0) / attendanceRecords.length)
                : 0,
            maxDuration: Math.max(...attendanceRecords.map(record => record.totalDuration), 0),
            totalJoins: attendanceRecords.reduce((acc, record) => acc + record.joinCount, 0)
        };
    }, [attendanceRecords, activeParticipants]);

    return (
        <div className="attendance-tracker">
            <div className="attendance-header">
                <h2>Attendance Tracker</h2>
                <div className="attendance-summary">
                    <div className="summary-item">
                        <div className="summary-label">Total Attendees</div>
                        <div className="summary-value">{stats.totalAttendees}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-label">Currently Active</div>
                        <div className="summary-value">{stats.currentlyActive}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-label">Avg. Duration (min)</div>
                        <div className="summary-value">{stats.averageDuration}</div>
                    </div>
                    <div className="summary-item">
                        <div className="summary-label">Total Joins</div>
                        <div className="summary-value">{stats.totalJoins}</div>
                    </div>
                </div>
            </div>

            <div className="attendance-tools">
                <div className="tool-group">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by name, ID, or role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="view-mode-selector">
                        <button
                            className={`view-mode-button ${viewMode === 'all' ? 'active' : ''}`}
                            onClick={() => setViewMode('all')}
                        >
                            All
                        </button>
                        <button
                            className={`view-mode-button ${viewMode === 'active' ? 'active' : ''}`}
                            onClick={() => setViewMode('active')}
                        >
                            Active
                        </button>
                        <button
                            className={`view-mode-button ${viewMode === 'left' ? 'active' : ''}`}
                            onClick={() => setViewMode('left')}
                        >
                            Left
                        </button>
                    </div>
                </div>

                {userRole === 'instructor' && (
                    <div className="export-container">
                        {!showExport ? (
                            <button
                                className="export-button"
                                onClick={() => setShowExport(true)}
                            >
                                Export Attendance
                            </button>
                        ) : (
                            <div className="export-options">
                                <select
                                    value={exportFormat}
                                    onChange={(e) => setExportFormat(e.target.value)}
                                    className="export-format-select"
                                >
                                    <option value="excel">Excel</option>
                                    <option value="csv">CSV</option>
                                    <option value="json">JSON</option>
                                </select>
                                <button
                                    className="generate-button"
                                    onClick={generateReport}
                                >
                                    Generate & Download
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={() => setShowExport(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {reportData && (
                <div className="download-report">
                    <div className="download-info">
                        <span className="download-filename">{reportData.fileName}</span>
                        <span className="download-ready">Ready for download</span>
                    </div>
                    <button
                        className="download-button"
                        onClick={() => {
                            const a = document.createElement('a');
                            a.href = reportData.url;
                            a.download = reportData.fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }}
                    >
                        Download
                    </button>
                    <button
                        className="close-button"
                        onClick={() => setReportData(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="attendance-list">
                <table className="attendance-table">
                    <thead>
                    <tr>
                        <th onClick={() => requestSort('name')}>
                            Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('role')}>
                            Role {sortConfig.key === 'role' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('joinTime')}>
                            Join Time {sortConfig.key === 'joinTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('leaveTime')}>
                            Leave Time {sortConfig.key === 'leaveTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('duration')}>
                            Current
                            Duration {sortConfig.key === 'duration' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('totalDuration')}>
                            Total
                            Duration {sortConfig.key === 'totalDuration' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('joinCount')}>
                            Join Count {sortConfig.key === 'joinCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        <th onClick={() => requestSort('active')}>
                            Status {sortConfig.key === 'active' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedRecords.length > 0 ? (
                        filteredAndSortedRecords.map((record) => (
                            <tr
                                key={record.sessionId}
                                className={`${record.active ? 'active-participant' : ''} ${selectedParticipants.has(record.sessionId) ? 'selected' : ''}`}
                                onClick={() => {
                                    setSelectedParticipants(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(record.sessionId)) {
                                            newSet.delete(record.sessionId);
                                        } else {
                                            newSet.add(record.sessionId);
                                        }
                                        return newSet;
                                    });
                                }}
                            >
                                <td>{record.name}</td>
                                <td>{record.role}</td>
                                <td>{formatTime(record.joinTime)}</td>
                                <td>{record.active ? 'Still active' : formatTime(record.leaveTime)}</td>
                                <td>{record.duration} min</td>
                                <td>{record.totalDuration} min</td>
                                <td>{record.joinCount}</td>
                                <td>
                                        <span className={`status-indicator ${record.active ? 'active' : 'inactive'}`}>
                                            {record.active ? 'Active' : 'Left'}
                                        </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="no-records">
                                {searchTerm ? 'No matching records found' : 'No attendance records yet'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}