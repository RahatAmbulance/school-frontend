import React, {useState} from 'react';
import {useParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Container,
    Fade,
    Grid,
    Paper,
    Stack,
    Tab,
    Tabs,
    Typography
} from '@mui/material';
import CurrentLocation from './CurrentLocation';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HistoryIcon from '@mui/icons-material/History';
import TimelineIcon from '@mui/icons-material/Timeline';
import VerifiedIcon from '@mui/icons-material/Verified';
import BuildIcon from '@mui/icons-material/Build';
import InfoIcon from '@mui/icons-material/Info';

const VehicleDetails = () => {
    const {vehicleId} = useParams();
    const [tabIndex, setTabIndex] = useState(0);

    // Get vehicles from Redux store
    const vehicles = useSelector(state => state?.vehicles?.vehicles);
    // Find the specific vehicle by ID, converting both to string for comparison
    const vehicle = vehicles?.find(v => String(v.id) === String(vehicleId));

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    if (!vehicle) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh'
            }}>
                <Typography variant="h5" color="text.secondary">Vehicle not found</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            {/* Header */}
            <Box sx={{mb: 4}}>
                <Typography variant="h4" component="h1" gutterBottom sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <DirectionsBusIcon sx={{mr: 2, fontSize: 35}}/>
                    Vehicle Details
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Chip
                        label={vehicle.regNumber}
                        color="primary"
                        variant="outlined"
                        sx={{borderRadius: 1}}
                    />
                    <Chip
                        label={vehicle.vehicleType}
                        color="secondary"
                        variant="outlined"
                        sx={{borderRadius: 1}}
                    />
                    <Chip
                        label={vehicle.vehicleStatus}
                        color={vehicle.vehicleStatus === 'Active' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{borderRadius: 1}}
                    />
                </Stack>
            </Box>

            {/* Content */}
            <Paper elevation={0} sx={{mb: 3, borderRadius: 2}}>
                <Tabs
                    value={tabIndex}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: 48,
                            fontSize: '1rem'
                        }
                    }}
                >
                    <Tab icon={<DirectionsBusIcon/>} label="Details" iconPosition="start"/>
                    <Tab icon={<LocationOnIcon/>} label="Current Location" iconPosition="start"/>
                    <Tab icon={<TimelineIcon/>} label="Routes" iconPosition="start"/>
                    <Tab icon={<HistoryIcon/>} label="History" iconPosition="start"/>
                </Tabs>

                <Box sx={{p: 3}}>
                    {/* Details Tab */}
                    <TabPanel value={tabIndex} index={0}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <VehicleInfoCard vehicle={vehicle}/>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DriverInfoCard vehicle={vehicle}/>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* Current Location Tab */}
                    <TabPanel value={tabIndex} index={1}>
                        <CurrentLocation vehicleId={vehicleId}/>
                    </TabPanel>

                    {/* Routes Tab */}
                    <TabPanel value={tabIndex} index={2}>
                        <RoutesList routes={vehicle.routes}/>
                    </TabPanel>

                    {/* History Tab */}
                    <TabPanel value={tabIndex} index={3}>
                        <HistoryPanel/>
                    </TabPanel>
                </Box>
            </Paper>
        </Container>
    );
};

// TabPanel component
const TabPanel = ({children, value, index}) => {
    return (
        <Fade in={value === index} timeout={300}>
            <div style={{display: value === index ? 'block' : 'none'}}>
                {children}
            </div>
        </Fade>
    );
};

// Vehicle Information Card
const VehicleInfoCard = ({vehicle}) => (
    <Card elevation={0} sx={{height: '100%', borderRadius: 2, border: 1, borderColor: 'divider'}}>
        <CardContent>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                Vehicle Information
            </Typography>
            <Stack spacing={2}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <DirectionsBusIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Registration Number</Typography>
                        <Typography variant="body1">{vehicle.regNumber}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <DirectionsBusIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Vehicle Name</Typography>
                        <Typography variant="body1">{vehicle.vehicleName}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <EventSeatIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Number of Seats</Typography>
                        <Typography variant="body1">{vehicle.noOfSeats}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <BuildIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Engine Number</Typography>
                        <Typography variant="body1">{vehicle.vehicleEngineNumber}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <BuildIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Chassis Number</Typography>
                        <Typography variant="body1">{vehicle.vehicleChasesNumber}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <VerifiedIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Pollution Certificate</Typography>
                        <Typography variant="body1">Valid
                            until {new Date(vehicle.pollutionCertificateRenewalDate).toLocaleDateString()}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <VerifiedIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Fitness Certificate</Typography>
                        <Typography variant="body1">Valid
                            until {new Date(vehicle.fitnessCertificateRenewalDate).toLocaleDateString()}</Typography>
                    </Box>
                </Box>
            </Stack>
        </CardContent>
    </Card>
);

// Driver Information Card
const DriverInfoCard = ({vehicle}) => (
    <Card elevation={0} sx={{height: '100%', borderRadius: 2, border: 1, borderColor: 'divider'}}>
        <CardContent>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                Driver Information
            </Typography>
            <Stack spacing={2}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <PersonIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Driver Name</Typography>
                        <Typography variant="body1">{vehicle.vehicleDriverName}</Typography>
                    </Box>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <PhoneIcon sx={{mr: 2, color: 'primary.main'}}/>
                    <Box>
                        <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                        <Typography variant="body1">{vehicle.vehicleDriverMobile}</Typography>
                    </Box>
                </Box>
                {vehicle.coDriverName && (
                    <>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <PersonIcon sx={{mr: 2, color: 'primary.main'}}/>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Co-Driver Name</Typography>
                                <Typography variant="body1">{vehicle.coDriverName}</Typography>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <PhoneIcon sx={{mr: 2, color: 'primary.main'}}/>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Co-Driver Contact</Typography>
                                <Typography variant="body1">{vehicle.coDriverMobile}</Typography>
                            </Box>
                        </Box>
                    </>
                )}
                {vehicle.otherInfo && (
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <InfoIcon sx={{mr: 2, color: 'primary.main'}}/>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Additional Information</Typography>
                            <Typography variant="body1">{vehicle.otherInfo}</Typography>
                        </Box>
                    </Box>
                )}
            </Stack>
        </CardContent>
    </Card>
);

// Routes List Component
const RoutesList = ({routes}) => (
    <Card elevation={0} sx={{borderRadius: 2, border: 1, borderColor: 'divider'}}>
        <CardContent>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                Route Information
            </Typography>
            {routes?.length > 0 ? (
                <Stack spacing={2}>
                    {routes.map((route, index) => (
                        <Box key={route.id} sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'background.default'
                        }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{
                                    bgcolor: route.routeType === 'origin' ? 'success.main' :
                                        route.routeType === 'destination' ? 'error.main' : 'primary.main'
                                }}>
                                    {index + 1}
                                </Avatar>
                                <Box flex={1}>
                                    <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                                        {route.routeName}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{mt: 1}}>
                                        <Chip
                                            size="small"
                                            label={route.routeType.toUpperCase()}
                                            color={route.routeType === 'origin' ? 'success' :
                                                route.routeType === 'destination' ? 'error' : 'primary'}
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            label={`₹${route.amount}`}
                                            color="secondary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            size="small"
                                            icon={<LocationOnIcon/>}
                                            label={`${route.latitude.substring(0, 8)}, ${route.longitude.substring(0, 8)}`}
                                            variant="outlined"
                                        />
                                    </Stack>
                                </Box>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            ) : (
                <Box sx={{textAlign: 'center', py: 4}}>
                    <Typography color="text.secondary">
                        No routes available for this vehicle
                    </Typography>
                </Box>
            )}
        </CardContent>
    </Card>
);

// History Panel Component
const HistoryPanel = () => (
    <Card elevation={0} sx={{borderRadius: 2, border: 1, borderColor: 'divider'}}>
        <CardContent>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 600, mb: 3}}>
                Vehicle History
            </Typography>
            <Box sx={{textAlign: 'center', py: 4}}>
                <Typography color="text.secondary">
                    No history records available
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

export default VehicleDetails; 