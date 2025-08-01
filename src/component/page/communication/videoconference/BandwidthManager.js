import React, {useEffect, useState} from 'react';
import {ConnectionState} from 'livekit-client';

// Component to display connection quality
export const ConnectionQualityIndicator = ({quality}) => {
    const getQualityColor = () => {
        switch (quality) {
            case 'excellent':
                return 'green';
            case 'good':
                return 'lightgreen';
            case 'poor':
                return 'yellow';
            case 'bad':
                return 'orange';
            case 'critical':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <div className="connection-quality" style={{color: getQualityColor()}}>
            <span className="quality-icon">⚡</span>
            <span
                className="quality-text">{quality ? quality.charAt(0).toUpperCase() + quality.slice(1) : 'Unknown'}</span>
        </div>
    );
};

// Component to display bandwidth warnings
export const BandwidthWarningOverlay = ({isActive, message}) => {
    if (!isActive) return null;

    return (
        <div className="bandwidth-warning">
            <div className="warning-content">
                <span className="warning-icon">⚠️</span>
                <span
                    className="warning-message">{message || 'Low bandwidth detected. Video quality has been reduced.'}</span>
            </div>
        </div>
    );
};

// Component for bandwidth settings
export const BandwidthSettings = ({
                                      currentMode,
                                      onModeChange,
                                      availableModes = ['auto', 'high', 'medium', 'low', 'audio-only']
                                  }) => {
    return (
        <div className="bandwidth-settings">
            <label htmlFor="bandwidth-mode">Bandwidth Mode:</label>
            <select
                id="bandwidth-mode"
                value={currentMode || 'auto'}
                onChange={(e) => onModeChange && onModeChange(e.target.value)}
            >
                {availableModes.map(mode => (
                    <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                    </option>
                ))}
            </select>
        </div>
    );
};

// Main BandwidthManager component
export const BandwidthManager = ({room, localParticipant, onActiveTabChange}) => {
    const [connectionQuality, setConnectionQuality] = useState('unknown');
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [bandwidthMode, setBandwidthMode] = useState('auto');

    // Monitor connection quality
    useEffect(() => {
        if (!room) return;

        const handleConnectionQualityUpdate = (quality) => {
            // Quality is a number between 0-1
            // 0-0.2: critical, 0.2-0.4: bad, 0.4-0.6: poor, 0.6-0.8: good, 0.8-1: excellent
            let qualityStatus;

            if (quality < 0.2) qualityStatus = 'critical';
            else if (quality < 0.4) qualityStatus = 'bad';
            else if (quality < 0.6) qualityStatus = 'poor';
            else if (quality < 0.8) qualityStatus = 'good';
            else qualityStatus = 'excellent';

            setConnectionQuality(qualityStatus);

            // Show warning if quality is poor or worse
            if (quality < 0.6) {
                setShowWarning(true);
                if (quality < 0.2) {
                    setWarningMessage('Connection is very poor. Switching to audio-only mode.');
                    // Auto switch to chat if connection is critical
                    onActiveTabChange && onActiveTabChange('chat');
                } else {
                    setWarningMessage('Low bandwidth detected. Video quality has been reduced.');
                }
            } else {
                setShowWarning(false);
            }
        };

        // Listen for connection quality updates
        room.on('connectionQualityUpdate', handleConnectionQualityUpdate);

        // Listen for connection state changes
        room.on('connectionStateChanged', (state) => {
            if (state === ConnectionState.Disconnected || state === ConnectionState.Reconnecting) {
                setConnectionQuality('critical');
                setShowWarning(true);
                setWarningMessage('Connection lost. Attempting to reconnect...');
            }
        });

        return () => {
            room.off('connectionQualityUpdate', handleConnectionQualityUpdate);
            room.off('connectionStateChanged');
        };
    }, [room, onActiveTabChange]);

    // Apply bandwidth mode changes
    useEffect(() => {
        if (!room || !localParticipant) return;

        const applyBandwidthSettings = async () => {
            try {
                switch (bandwidthMode) {
                    case 'high':
                        // Set high quality video
                        await localParticipant.setVideoEnabled(true);
                        await room.localParticipant.setTrackSubscriptionPermissions(
                            {allParticipants: true, allTracks: true, maxQuality: 'high'}
                        );
                        break;

                    case 'medium':
                        // Set medium quality video
                        await localParticipant.setVideoEnabled(true);
                        await room.localParticipant.setTrackSubscriptionPermissions(
                            {allParticipants: true, allTracks: true, maxQuality: 'medium'}
                        );
                        break;

                    case 'low':
                        // Set low quality video
                        await localParticipant.setVideoEnabled(true);
                        await room.localParticipant.setTrackSubscriptionPermissions(
                            {allParticipants: true, allTracks: true, maxQuality: 'low'}
                        );
                        break;

                    case 'audio-only':
                        // Disable video, enable audio only
                        await localParticipant.setVideoEnabled(false);
                        break;

                    case 'auto':
                    default:
                        // Auto adjust based on connection quality
                        if (connectionQuality === 'critical') {
                            await localParticipant.setVideoEnabled(false);
                        } else if (connectionQuality === 'bad') {
                            await localParticipant.setVideoEnabled(true);
                            await room.localParticipant.setTrackSubscriptionPermissions(
                                {allParticipants: true, allTracks: true, maxQuality: 'low'}
                            );
                        } else if (connectionQuality === 'poor') {
                            await localParticipant.setVideoEnabled(true);
                            await room.localParticipant.setTrackSubscriptionPermissions(
                                {allParticipants: true, allTracks: true, maxQuality: 'medium'}
                            );
                        } else {
                            await localParticipant.setVideoEnabled(true);
                            await room.localParticipant.setTrackSubscriptionPermissions(
                                {allParticipants: true, allTracks: true, maxQuality: 'high'}
                            );
                        }
                        break;
                }
            } catch (error) {
                console.error('Error applying bandwidth settings:', error);
            }
        };

        applyBandwidthSettings();
    }, [bandwidthMode, connectionQuality, room, localParticipant]);

    const handleModeChange = (mode) => {
        setBandwidthMode(mode);
    };

    return (
        <div className="bandwidth-manager">
            <ConnectionQualityIndicator quality={connectionQuality}/>
            <BandwidthWarningOverlay isActive={showWarning} message={warningMessage}/>
            <BandwidthSettings currentMode={bandwidthMode} onModeChange={handleModeChange}/>
        </div>
    );
};

// Make individual components available for use in the VideoConference