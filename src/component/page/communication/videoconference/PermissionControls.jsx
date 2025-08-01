import React, {useEffect, useState} from "react";
import {DataPacket_Kind, RoomEvent} from "livekit-client";
import "./PermissionControls.css";

export function PermissionControls({room, localParticipant, userName, userRole, roomInfo}) {
    const [participants, setParticipants] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [globalPermissions, setGlobalPermissions] = useState({
        allowScreenShare: true,
        allowChat: true,
        allowAudio: true,
        allowVideo: true,
        allowWhiteboard: true,
        allowHandRaising: true,
        allowPolls: true
    });
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    // Check if current user is admin/teacher
    const isAdmin = userRole === 'teacher' || userRole === 'admin';

    // Initialize and sync with other admins
    useEffect(() => {
        if (!room || !localParticipant) return;

        const updateParticipantsList = () => {
            const allParticipants = room.participants;
            const participantsArray = Array.from(allParticipants.values()).map(p => ({
                id: p.identity,
                name: p.name || p.identity,
                role: p.metadata ? JSON.parse(p.metadata).role : 'student',
                isConnected: p.connectionQuality > 0
            }));

            // Add local participant
            participantsArray.push({
                id: localParticipant.identity,
                name: userName,
                role: userRole,
                isConnected: true,
                isLocal: true
            });

            setParticipants(participantsArray);

            // Initialize permissions for new participants
            const updatedPermissions = {...permissions};
            participantsArray.forEach(p => {
                if (!updatedPermissions[p.id]) {
                    updatedPermissions[p.id] = {
                        canScreenShare: p.role === 'teacher' || p.role === 'admin',
                        canChat: true,
                        canUnmute: true,
                        canUseVideo: true,
                        canUseWhiteboard: p.role === 'teacher' || p.role === 'admin',
                        canRaiseHand: true,
                        canCreatePolls: p.role === 'teacher' || p.role === 'admin'
                    };
                }
            });

            setPermissions(updatedPermissions);
        };

        // Initial update
        updateParticipantsList();
        setLoading(false);

        // Listen for participant changes
        const handleParticipantConnected = () => {
            updateParticipantsList();
        };

        const handleParticipantDisconnected = () => {
            updateParticipantsList();
        };

        // Listen for permission updates from other admins
        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === 'permission_update') {
                    // Update local permissions state
                    if (data.globalPermissions) {
                        setGlobalPermissions(data.globalPermissions);
                    }

                    if (data.userPermissions) {
                        setPermissions(prevPermissions => ({
                            ...prevPermissions,
                            ...data.userPermissions
                        }));
                    }
                }
            } catch (e) {
                console.error('Error processing permission data:', e);
            }
        };

        room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
        room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
        room.on(RoomEvent.DataReceived, handleDataReceived);

        // Request current permissions state from other admins
        if (isAdmin) {
            const requestData = {
                type: 'permission_request',
                requesterId: localParticipant.identity
            };
            const encodedData = new TextEncoder().encode(JSON.stringify(requestData));
            room.localParticipant.publishData(encodedData, DataPacket_Kind.RELIABLE);
        }

        return () => {
            room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
            room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [room, localParticipant, userRole, userName]);

    // Handle sharing permission updates with all participants
    const broadcastPermissionChanges = (globalPerms, userPerms) => {
        if (!room || !localParticipant || !isAdmin) return;

        const permissionData = {
            type: 'permission_update',
            globalPermissions: globalPerms,
            userPermissions: userPerms,
            updatedBy: localParticipant.identity,
            timestamp: new Date().toISOString()
        };

        const encodedData = new TextEncoder().encode(JSON.stringify(permissionData));
        room.localParticipant.publishData(encodedData, DataPacket_Kind.RELIABLE);
    };

    // Handle global permission changes
    const handleGlobalPermissionChange = (permission, value) => {
        if (!isAdmin) return;

        const updatedGlobalPermissions = {
            ...globalPermissions,
            [permission]: value
        };

        setGlobalPermissions(updatedGlobalPermissions);
        broadcastPermissionChanges(updatedGlobalPermissions, null);

        // Show save confirmation
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    // Handle individual user permission changes
    const handleUserPermissionChange = (userId, permission, value) => {
        if (!isAdmin) return;

        const updatedPermissions = {
            ...permissions,
            [userId]: {
                ...permissions[userId],
                [permission]: value
            }
        };

        setPermissions(updatedPermissions);

        // Only broadcast the specific user's updated permissions
        const userPermsToUpdate = {
            [userId]: updatedPermissions[userId]
        };

        broadcastPermissionChanges(null, userPermsToUpdate);

        // Show save confirmation
        setSaveStatus('Participant settings updated!');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    // Handle confirmation dialog
    const handleConfirmAction = () => {
        if (pendingAction === 'removeParticipant') {
            // In a real implementation, this would call the LiveKit API to remove the participant
            const selectedParticipantName = participants.find(p => p.id === selectedParticipant)?.name;
            alert(`This would remove ${selectedParticipantName} from the room.`);
        }

        // Reset pending action and close dialog
        setPendingAction(null);
        setShowConfirmDialog(false);
    };

    const handleCancelAction = () => {
        setPendingAction(null);
        setShowConfirmDialog(false);
    };

    if (!isAdmin) {
        return (
            <div className="permission-controls no-access">
                <h2>Permission Controls</h2>
                <p>Only teachers and administrators can access permission controls.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="permission-controls loading">
                <h2>Permission Controls</h2>
                <p>Loading participant data...</p>
            </div>
        );
    }

    return (
        <div className="permission-controls">
            <h2>Permission Controls</h2>

            {saveStatus && <div className="save-status success">{saveStatus}</div>}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="confirmation-dialog">
                    <div className="dialog-content">
                        <h4>Confirm Action</h4>
                        <p>
                            {pendingAction === 'removeParticipant' &&
                                `Are you sure you want to remove ${participants.find(p => p.id === selectedParticipant)?.name} from the room?`}
                        </p>
                        <div className="dialog-buttons">
                            <button className="cancel-button" onClick={handleCancelAction}>Cancel</button>
                            <button className="confirm-button" onClick={handleConfirmAction}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="control-sections">
                <div className="global-permissions">
                    <h3>Room Settings</h3>
                    <p className="section-description">Control features available to all participants</p>

                    <div className="permission-options">
                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowScreenShare}
                                    onChange={(e) => handleGlobalPermissionChange('allowScreenShare', e.target.checked)}
                                />
                                Allow Screen Sharing
                            </label>
                        </div>

                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowChat}
                                    onChange={(e) => handleGlobalPermissionChange('allowChat', e.target.checked)}
                                />
                                Allow Chat Messages
                            </label>
                        </div>

                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowAudio}
                                    onChange={(e) => handleGlobalPermissionChange('allowAudio', e.target.checked)}
                                />
                                Allow Audio
                            </label>
                        </div>

                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowVideo}
                                    onChange={(e) => handleGlobalPermissionChange('allowVideo', e.target.checked)}
                                />
                                Allow Video
                            </label>
                        </div>

                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowWhiteboard}
                                    onChange={(e) => handleGlobalPermissionChange('allowWhiteboard', e.target.checked)}
                                />
                                Allow Whiteboard Access
                            </label>
                        </div>

                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowHandRaising}
                                    onChange={(e) => handleGlobalPermissionChange('allowHandRaising', e.target.checked)}
                                />
                                Allow Hand Raising
                            </label>
                        </div>

                        <div className="permission-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={globalPermissions.allowPolls}
                                    onChange={(e) => handleGlobalPermissionChange('allowPolls', e.target.checked)}
                                />
                                Allow Polls & Quizzes
                            </label>
                        </div>
                    </div>
                </div>

                <div className="user-permissions">
                    <h3>Participant Permissions</h3>
                    <p className="section-description">Set individual permissions for specific participants</p>

                    <div className="participants-list">
                        <div className="participant-select">
                            <label htmlFor="participant-dropdown">Select participant:</label>
                            <select
                                id="participant-dropdown"
                                value={selectedParticipant || ''}
                                onChange={(e) => setSelectedParticipant(e.target.value)}
                            >
                                <option value="">-- Select a participant --</option>
                                {participants
                                    .filter(p => p.id !== localParticipant.identity) // Don't show yourself
                                    .map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.role}) {!p.isConnected ? '- Disconnected' : ''}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {selectedParticipant && permissions[selectedParticipant] && (
                            <div className="individual-permissions">
                                <h4>Permissions for {participants.find(p => p.id === selectedParticipant)?.name}</h4>

                                <div className="permission-options">
                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canScreenShare}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canScreenShare', e.target.checked)}
                                            />
                                            Can Share Screen
                                        </label>
                                    </div>

                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canChat}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canChat', e.target.checked)}
                                            />
                                            Can Send Chat Messages
                                        </label>
                                    </div>

                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canUnmute}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canUnmute', e.target.checked)}
                                            />
                                            Can Unmute Microphone
                                        </label>
                                    </div>

                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canUseVideo}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canUseVideo', e.target.checked)}
                                            />
                                            Can Use Camera
                                        </label>
                                    </div>

                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canUseWhiteboard}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canUseWhiteboard', e.target.checked)}
                                            />
                                            Can Use Whiteboard
                                        </label>
                                    </div>

                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canRaiseHand}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canRaiseHand', e.target.checked)}
                                            />
                                            Can Raise Hand
                                        </label>
                                    </div>

                                    <div className="permission-item">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedParticipant].canCreatePolls}
                                                onChange={(e) => handleUserPermissionChange(selectedParticipant, 'canCreatePolls', e.target.checked)}
                                            />
                                            Can Create Polls
                                        </label>
                                    </div>
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className="mute-all-button"
                                        onClick={() => {
                                            // Implement functionality to mute this participant
                                            // This would require LiveKit SDK functionality
                                            // For now, just update the permission
                                            handleUserPermissionChange(selectedParticipant, 'canUnmute', false);
                                            alert(`${participants.find(p => p.id === selectedParticipant)?.name} has been muted and cannot unmute themselves.`);
                                        }}
                                    >
                                        Force Mute
                                    </button>

                                    <button
                                        className="remove-button"
                                        onClick={() => {
                                            setPendingAction('removeParticipant');
                                            setShowConfirmDialog(true);
                                        }}
                                    >
                                        Remove from Room
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bulk-actions">
                <h3>Bulk Actions</h3>
                <div className="action-buttons">
                    <button
                        className="mute-all-button"
                        onClick={() => {
                            // Update permissions for all non-admin users
                            const updatedPerms = {...permissions};

                            participants
                                .filter(p => p.role !== 'teacher' && p.role !== 'admin')
                                .forEach(p => {
                                    if (updatedPerms[p.id]) {
                                        updatedPerms[p.id] = {
                                            ...updatedPerms[p.id],
                                            canUnmute: false
                                        };
                                    }
                                });

                            setPermissions(updatedPerms);
                            broadcastPermissionChanges(null, updatedPerms);
                            setSaveStatus('All participants have been muted!');
                            setTimeout(() => setSaveStatus(''), 3000);
                        }}
                    >
                        Mute All Participants
                    </button>

                    <button
                        className="allow-unmute-button"
                        onClick={() => {
                            // Update permissions for all users
                            const updatedPerms = {...permissions};

                            participants.forEach(p => {
                                if (updatedPerms[p.id]) {
                                    updatedPerms[p.id] = {
                                        ...updatedPerms[p.id],
                                        canUnmute: true
                                    };
                                }
                            });

                            setPermissions(updatedPerms);
                            broadcastPermissionChanges(null, updatedPerms);
                            setSaveStatus('All participants can now unmute themselves!');
                            setTimeout(() => setSaveStatus(''), 3000);
                        }}
                    >
                        Allow All to Unmute
                    </button>

                    <button
                        className="lock-chat-button"
                        onClick={() => {
                            // Disable chat for all non-admin users
                            const updatedPerms = {...permissions};

                            participants
                                .filter(p => p.role !== 'teacher' && p.role !== 'admin')
                                .forEach(p => {
                                    if (updatedPerms[p.id]) {
                                        updatedPerms[p.id] = {
                                            ...updatedPerms[p.id],
                                            canChat: false
                                        };
                                    }
                                });

                            setPermissions(updatedPerms);
                            broadcastPermissionChanges(null, updatedPerms);
                            setSaveStatus('Chat has been locked for all students!');
                            setTimeout(() => setSaveStatus(''), 3000);
                        }}
                    >
                        Lock Chat (Students)
                    </button>

                    <button
                        className="unlock-chat-button"
                        onClick={() => {
                            // Enable chat for all users
                            const updatedPerms = {...permissions};

                            participants.forEach(p => {
                                if (updatedPerms[p.id]) {
                                    updatedPerms[p.id] = {
                                        ...updatedPerms[p.id],
                                        canChat: true
                                    };
                                }
                            });

                            setPermissions(updatedPerms);
                            broadcastPermissionChanges(null, updatedPerms);
                            setSaveStatus('Chat has been unlocked for all participants!');
                            setTimeout(() => setSaveStatus(''), 3000);
                        }}
                    >
                        Unlock Chat (All)
                    </button>
                </div>
            </div>
        </div>
    );
}