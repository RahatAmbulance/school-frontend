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
    TextField,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {api, selectSchoolDetails} from "../../../../common";
import {useSelector} from "react-redux";

const VehicleForm = ({vehicle, open, onClose, onSave}) => {
    const staff = useSelector(state => state.master.data?.staff || []);
    const [formState, setFormState] = useState(vehicle);
    const [driverStaff, setDriverStaff] = useState([]);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    // List of vehicle types
    const vehicleTypes = ["Van", "Bus", "Car"];
    // List of vehicle statuses
    const vehicleStatuses = ["Active", "Inactive", "Under Maintenance"];

    useEffect(() => {
        setFormState(vehicle);
        // Filter staff whose post is "driver"
        const filteredDrivers = staff.filter((member) =>
            member.role?.toLowerCase() === "driver"
        );
        setDriverStaff(filteredDrivers);
    }, [vehicle, staff]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormState((prev) => ({...prev, [name]: value, schoolId, session}));
    };

    const handleDriverChange = (e, type) => {
        const selectedDriverId = e.target.value;
        const selectedDriver = driverStaff.find(driver => driver.id === selectedDriverId);
        const driverKey = type === 'primary' ? 'vehicleDriverName' : 'coDriverName';
        const mobileKey = type === 'primary' ? 'vehicleDriverMobile' : 'coDriverMobile';
        const idKey = type === 'primary' ? 'driverId' : 'coDriverId';

        if (selectedDriver) {
            setFormState((prev) => ({
                ...prev,
                [driverKey]: selectedDriver.name,
                [mobileKey]: selectedDriver.phone,
                [idKey]: selectedDriver.id
            }));
        } else {
            setFormState((prev) => ({
                ...prev,
                [driverKey]: '',
                [mobileKey]: '',
                [idKey]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formState.id) {
            await api.put(`/api/vehicles/${formState.id}`, formState);
        } else {
            await api.post('/api/vehicles', formState);
        }
        onSave();
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
                    {formState.id ? 'Edit Vehicle' : 'Add New Vehicle'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{color: 'text.secondary'}}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>

            <Divider/>

            <DialogContent sx={{p: 3}}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Basic Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Registration Number"
                                        name="regNumber"
                                        value={formState.regNumber || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Vehicle Type"
                                        name="vehicleType"
                                        select
                                        value={formState.vehicleType || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    >
                                        {vehicleTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Vehicle Name"
                                        name="vehicleName"
                                        value={formState.vehicleName || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Number of Seats"
                                        name="noOfSeats"
                                        type="number"
                                        value={formState.noOfSeats || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Vehicle Details */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Vehicle Details
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Engine Number"
                                        name="vehicleEngineNumber"
                                        value={formState.vehicleEngineNumber || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Chassis Number"
                                        name="vehicleChasesNumber"
                                        value={formState.vehicleChasesNumber || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Vehicle Status"
                                        name="vehicleStatus"
                                        select
                                        value={formState.vehicleStatus || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    >
                                        {vehicleStatuses.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Certificates */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Certificates
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Pollution Certificate"
                                        name="pollutionCertificate"
                                        value={formState.pollutionCertificate || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Pollution Certificate Renewal Date"
                                        name="pollutionCertificateRenewalDate"
                                        type="date"
                                        value={formState.pollutionCertificateRenewalDate || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        InputLabelProps={{shrink: true}}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Fitness Certificate Renewal Date"
                                        name="fitnessCertificateRenewalDate"
                                        type="date"
                                        value={formState.fitnessCertificateRenewalDate || ''}
                                        onChange={handleChange}
                                        fullWidth
                                        InputLabelProps={{shrink: true}}
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Driver Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Driver Information
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Primary Driver"
                                        name="vehicleDriverId"
                                        select
                                        value={driverStaff.find(driver => driver.name === formState.vehicleDriverName)?.id || ''}
                                        onChange={(e) => handleDriverChange(e, 'primary')}
                                        fullWidth
                                        required
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    >
                                        {driverStaff.map((driver) => (
                                            <MenuItem key={driver.id} value={driver.id}>
                                                {driver.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Primary Driver Mobile"
                                        name="vehicleDriverMobile"
                                        value={formState.vehicleDriverMobile || ''}
                                        fullWidth
                                        disabled
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Co-Driver"
                                        name="coDriverId"
                                        select
                                        value={driverStaff.find(driver => driver.name === formState.coDriverName)?.id || ''}
                                        onChange={(e) => handleDriverChange(e, 'co')}
                                        fullWidth
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    >
                                        {driverStaff.map((driver) => (
                                            <MenuItem key={driver.id} value={driver.id}>
                                                {driver.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Co-Driver Mobile"
                                        name="coDriverMobile"
                                        value={formState.coDriverMobile || ''}
                                        fullWidth
                                        disabled
                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Additional Information */}
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{mb: 2, fontWeight: 600, color: 'text.primary'}}>
                                Additional Information
                            </Typography>
                            <TextField
                                label="Other Information"
                                name="otherInfo"
                                value={formState.otherInfo || ''}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={4}
                                sx={{'& .MuiOutlinedInput-root': {borderRadius: 1}}}
                            />
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
                    {formState.id ? 'Update Vehicle' : 'Add Vehicle'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VehicleForm;
