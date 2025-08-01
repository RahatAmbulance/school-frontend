import React, {useEffect, useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Paper,
    TextField,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {api, selectSchoolDetails} from "../../../../common";
import {MapContainer, Marker, TileLayer, useMapEvents} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useSelector} from "react-redux";
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RouteForm = ({route, open, onClose, onSave, vehicleId}) => {
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [formState, setFormState] = useState(route || {});
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to center of India

    useEffect(() => {
        setFormState(route || {});
        // If route has coordinates, center map on them
        if (route?.latitude && route?.longitude) {
            setMapCenter([parseFloat(route.latitude), parseFloat(route.longitude)]);
        }
    }, [route]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormState((prev) => ({...prev, [name]: value}));
    };

    const handleMapClick = (e) => {
        const {lat, lng} = e.latlng;
        setFormState((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
        }));
        setMapCenter([lat, lng]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        formState.vehicleId = vehicleId;
        formState.schoolId = schoolId;
        formState.session = session;
        if (formState.id) {
            await api.put(`/api/routes/${formState.id}`, formState);
        } else {
            await api.post('/api/routes', formState);
        }
        onSave();
    };

    const MapClickHandler = () => {
        useMapEvents({
            click: handleMapClick,
        });
        return null;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    m: 2
                }
            }}
        >
            <DialogTitle sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Typography variant="h5" component="h2" sx={{fontWeight: 600}}>
                    <LocationOnIcon sx={{mr: 1, verticalAlign: 'middle', color: 'primary.main'}}/>
                    {formState.id ? 'Edit Route' : 'Add New Route'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{color: 'text.secondary'}}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            <Divider/>

            <DialogContent sx={{p: 3}}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Route Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Route Name"
                                        name="routeName"
                                        value={formState.routeName || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Route Type"
                                        name="routeType"
                                        value={formState.routeType || ''}
                                        onChange={handleChange}
                                        select
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    >
                                        <MenuItem value="origin">Origin</MenuItem>
                                        <MenuItem value="destination">Destination</MenuItem>
                                        <MenuItem value="middle">Middle</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Amount"
                                        name="amount"
                                        type="number"
                                        value={formState.amount || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Location
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Latitude"
                                        name="latitude"
                                        value={formState.latitude || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Longitude"
                                        name="longitude"
                                        value={formState.longitude || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            height: 300,
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <MapContainer
                                            center={mapCenter}
                                            zoom={13}
                                            style={{height: '100%', width: '100%'}}
                                        >
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <MapClickHandler/>
                                            {formState.latitude && formState.longitude && (
                                                <Marker
                                                    position={[
                                                        parseFloat(formState.latitude),
                                                        parseFloat(formState.longitude),
                                                    ]}
                                                />
                                            )}
                                        </MapContainer>
                                    </Paper>
                                    <Typography variant="caption" color="text.secondary" sx={{mt: 1, display: 'block'}}>
                                        Click on the map to set the route location
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>

            <Divider/>

            <DialogActions sx={{p: 3}}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 1,
                        px: 3,
                        mr: 1,
                        textTransform: 'none'
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{
                        borderRadius: 1,
                        px: 3,
                        textTransform: 'none'
                    }}
                >
                    {formState.id ? 'Update Route' : 'Add Route'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RouteForm;
