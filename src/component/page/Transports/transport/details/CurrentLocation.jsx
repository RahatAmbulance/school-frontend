import React, {useEffect, useState} from 'react';
import {Alert, Box, Chip, CircularProgress, Paper, Stack, Typography} from '@mui/material';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SockJS from 'sockjs-client';
import {Stomp} from '@stomp/stompjs';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SpeedIcon from '@mui/icons-material/Speed';
import {useSelector} from 'react-redux';
import {baseURL, selectSchoolDetails} from '../../../../../common';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom vehicle marker icon
const vehicleIcon = new L.Icon({
    iconUrl: require('../../../../../component/Images/bus-marker.png'),
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const CurrentLocation = ({vehicleId}) => {
    const [location, setLocation] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [error, setError] = useState(null);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        let client = null;
        const connectWebSocket = () => {
            try {
                const socket = new SockJS(baseURL + '/ws');
                client = Stomp.over(socket);
                client.reconnect_delay = 5000; // 5 seconds delay between reconnection attempts

                client.connect({}, () => {
                    console.log('Connected to WebSocket');
                    setConnectionStatus('connected');
                    setError(null);

                    // Subscribe to the vehicle-specific topic
                    const topic = `/topic/driver-location/${vehicleId}/${schoolId}/${session}`;
                    client.subscribe(topic, (message) => {
                        try {
                            const locationData = JSON.parse(message.body);
                            setLocation(locationData);
                        } catch (error) {
                            console.error('Error parsing location data:', error);
                            setError('Error processing location data');
                        }
                    });
                }, (error) => {
                    console.error('STOMP error:', error);
                    setConnectionStatus('error');
                    setError('Failed to connect to location service');
                    // Attempt to reconnect
                    setTimeout(connectWebSocket, 5000);
                });

                setStompClient(client);
            } catch (error) {
                console.error('WebSocket connection error:', error);
                setConnectionStatus('error');
                setError('Failed to establish connection');
                // Attempt to reconnect
                setTimeout(connectWebSocket, 5000);
            }
        };

        connectWebSocket();

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [vehicleId, schoolId, session]);

    if (connectionStatus === 'connecting') {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
            }}>
                <CircularProgress size={40} sx={{mb: 2}}/>
                <Typography color="text.secondary">
                    Connecting to location service...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                {error}
            </Alert>
        );
    }

    if (!location) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4
            }}>
                <DirectionsBusIcon sx={{fontSize: 48, color: 'text.secondary', mb: 2}}/>
                <Typography color="text.secondary">
                    Waiting for location updates...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Stack spacing={3}>
                {/* Status and Location Information */}
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Chip
                        icon={<LocationOnIcon/>}
                        label={`Lat: ${parseFloat(location.latitude).toFixed(6)}, Lng: ${parseFloat(location.longitude).toFixed(6)}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        icon={<DirectionsBusIcon/>}
                        label={location.vehicleType}
                        color="secondary"
                        variant="outlined"
                    />
                    <Chip
                        icon={<AccessTimeIcon/>}
                        label={new Date(location.currentDateTime).toLocaleString()}
                        variant="outlined"
                    />
                    {location.speed && (
                        <Chip
                            icon={<SpeedIcon/>}
                            label={`${location.speed} km/h`}
                            color="info"
                            variant="outlined"
                        />
                    )}
                </Stack>

                {/* Driver Information */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                    }}
                >
                    <Stack direction="row" spacing={3}>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Driver
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <PersonIcon fontSize="small" color="primary"/>
                                <Typography>{location.driverName}</Typography>
                            </Stack>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Contact
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <PhoneIcon fontSize="small" color="primary"/>
                                <Typography>{location.driverPhone}</Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>

                {/* Map */}
                <Paper
                    elevation={0}
                    sx={{
                        height: 400,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                        '& .leaflet-container': {
                            height: '100%',
                            width: '100%',
                            borderRadius: 'inherit'
                        }
                    }}
                >
                    <MapContainer
                        center={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                        zoom={15}
                        style={{height: '100%', width: '100%'}}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                            position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
                            icon={vehicleIcon}
                        >
                            <Popup>
                                <Box sx={{p: 1}}>
                                    <Typography variant="body2" fontWeight={500} gutterBottom>
                                        {location.vehicleType}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Driver: {location.driverName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Speed: {location.speed ? `${location.speed} km/h` : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Last updated: {new Date(location.currentDateTime).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Popup>
                        </Marker>
                    </MapContainer>
                </Paper>
            </Stack>
        </Box>
    );
};

export default CurrentLocation; 