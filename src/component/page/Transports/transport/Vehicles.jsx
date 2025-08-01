import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import RouteIcon from "@mui/icons-material/Route";
import VehicleForm from "./VehicleForm";
import RouteForm from "./RouteForm";
import RouteDetailsModal from "./RouteDetailsModal";
import {deleteVehicle, fetchVehicles} from "./redux/vehicleActions";
import * as XLSX from "xlsx";
import {useNavigate} from "react-router-dom";
import {selectSchoolDetails} from "../../../../common";

const Vehicles = () => {
    const dispatch = useDispatch();
    const {vehicles, loading, error} = useSelector((state) => state.vehicles);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRouteDetailsModalOpen, setIsRouteDetailsModalOpen] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);
    const [open, setOpen] = useState(false);

    const handleClickOpen = (id) => {
        setVehicleToDelete(id);
        setSelectedVehicle(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedVehicle(null);
    };
    const handleToastDelete = () => {
        if (vehicleToDelete) {
            dispatch(deleteVehicle(vehicleToDelete))
                .then(() => {
                    toast.success("Vehicle's list deleted successfully.");
                    handleClose();
                })
                .catch((error) => {
                    console.error("Error deleting vehicle:", error);
                    toast.error("Failed to delete the vehicle. Please try again.");
                    handleClose();
                });
        }
    };
    const navigate = useNavigate();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchVehicles(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleEditVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsVehicleModalOpen(true);
    };

    const handleViewVehicle = (vehicle) => {
        navigate(`/transport/${vehicle.id}`);
    };

    const handleEditRoute = (route) => {
        setSelectedRoute(route);
        setIsRouteModalOpen(true);
    };

    const handleDeleteRoute = (id) => {
        // Implement delete route functionality
    };

    const handleViewRoute = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsRouteDetailsModalOpen(true);
    };

    const handleCloseVehicleModal = () => {
        setSelectedVehicle(null);
        setIsVehicleModalOpen(false);
    };

    const handleCloseRouteModal = () => {
        setSelectedRoute(null);
        setIsRouteModalOpen(false);
    };

    const handleCloseDetailsModal = () => {
        setSelectedVehicle(null);
        setIsDetailsModalOpen(false);
    };

    const handleCloseRouteDetailsModal = () => {
        setSelectedVehicle(null);
        setIsRouteDetailsModalOpen(false);
    };

    const handleSaveVehicle = () => {
        dispatch(fetchVehicles(schoolId, session));
        handleCloseVehicleModal();
    };

    const handleSaveRoute = () => {
        dispatch(fetchVehicles(schoolId, session));
        handleCloseRouteModal();
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleDownloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            vehicles.map((vehicle) => ({
                "Reg. Number": vehicle.regNumber,
                "Vehicle Type": vehicle.vehicleType,
                "Vehicle Name": vehicle.vehicleName,
                "No. of Seats": vehicle.noOfSeats,
                "Driver Name": vehicle.driverName,
                Phone: vehicle.phone,
                Routes: vehicle.routes.map((route) => `${route.origin}`).join(", "),
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Vehicles");
        XLSX.writeFile(wb, "Vehicles.xlsx");
    };

    const filteredVehicles = vehicles.filter(
        (vehicle) =>
            (vehicle.regNumber &&
                vehicle.regNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (vehicle.driverName &&
                vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (vehicle.phone && vehicle.phone.includes(searchTerm)) ||
            (vehicle.routes &&
                vehicle.routes.some(
                    (route) =>
                        route.origin &&
                        route.origin.toLowerCase().includes(searchTerm.toLowerCase())
                ))
    );

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            <Box sx={{mb: 4}}>
                <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 600, color: "primary.main"}}>
                    <DirectionsBusIcon sx={{mr: 1, verticalAlign: "middle"}}/>
                    Vehicle Management
                </Typography>
            </Box>

            <Card elevation={0} sx={{mb: 4, backgroundColor: "background.paper"}}>
                <CardContent>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems="center">
                        <TextField
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search vehicles..."
                            variant="outlined"
                            size="medium"
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action"/>
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch} size="small">
                                            <ClearIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {borderRadius: 2}
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsVehicleModalOpen(true)}
                            startIcon={<DirectionsBusIcon/>}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                whiteSpace: "nowrap",
                                minWidth: "fit-content"
                            }}
                        >
                            Add Vehicle
                        </Button>
                        <Tooltip title="Download Excel">
                            <IconButton
                                onClick={handleDownloadExcel}
                                color="primary"
                                sx={{
                                    backgroundColor: "action.hover",
                                    "&:hover": {backgroundColor: "action.selected"}
                                }}
                            >
                                <DownloadIcon/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>

            <Paper elevation={0} sx={{borderRadius: 2, overflow: "hidden"}}>
                <TableContainer sx={{maxHeight: "calc(100vh - 300px)"}}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{fontWeight: 600, backgroundColor: "background.paper"}}>
                                    Reg. Number
                                </TableCell>
                                <TableCell sx={{fontWeight: 600, backgroundColor: "background.paper"}}>
                                    Vehicle Type
                                </TableCell>
                                <TableCell sx={{fontWeight: 600, backgroundColor: "background.paper"}}>
                                    Vehicle Name
                                </TableCell>
                                <TableCell sx={{fontWeight: 600, backgroundColor: "background.paper"}}>
                                    No. of Seats
                                </TableCell>
                                <TableCell
                                    sx={{fontWeight: 600, backgroundColor: "background.paper", textAlign: "center"}}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                Array.from({length: 5}).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell><Skeleton animation="wave"/></TableCell>
                                        <TableCell><Skeleton animation="wave"/></TableCell>
                                        <TableCell><Skeleton animation="wave"/></TableCell>
                                        <TableCell><Skeleton animation="wave"/></TableCell>
                                        <TableCell><Skeleton animation="wave"/></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredVehicles.length > 0 ? (
                                filteredVehicles.map((vehicle) => (
                                    <TableRow
                                        key={vehicle.id}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "action.hover",
                                                transition: "background-color 0.2s"
                                            }
                                        }}
                                    >
                                        <TableCell>{vehicle.regNumber}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={vehicle.vehicleType}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{vehicle.vehicleName}</TableCell>
                                        <TableCell>{vehicle.noOfSeats}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="View Details" arrow>
                                                    <IconButton
                                                        onClick={() => handleViewVehicle(vehicle)}
                                                        size="small"
                                                        sx={{color: "primary.main"}}
                                                    >
                                                        <VisibilityIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit" arrow>
                                                    <IconButton
                                                        onClick={() => handleEditVehicle(vehicle)}
                                                        size="small"
                                                        sx={{color: "secondary.main"}}
                                                    >
                                                        <EditIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete" arrow>
                                                    <IconButton
                                                        onClick={() => handleClickOpen(vehicle.id)}
                                                        size="small"
                                                        sx={{color: "error.main"}}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </Tooltip>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<RouteIcon/>}
                                                    onClick={() => {
                                                        setSelectedVehicle(vehicle);
                                                        setIsRouteModalOpen(true);
                                                    }}
                                                    sx={{borderRadius: 1}}
                                                >
                                                    Add Route
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => handleViewRoute(vehicle)}
                                                    sx={{borderRadius: 1}}
                                                >
                                                    Routes
                                                </Button>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{py: 8}}>
                                        <Typography variant="h6" color="text.secondary">
                                            No vehicles found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {isVehicleModalOpen && (
                <VehicleForm
                    vehicle={selectedVehicle || {}}
                    open={isVehicleModalOpen}
                    onClose={handleCloseVehicleModal}
                    onSave={handleSaveVehicle}
                />
            )}
            {isRouteModalOpen && (
                <RouteForm
                    route={selectedRoute || {}}
                    open={isRouteModalOpen}
                    onClose={handleCloseRouteModal}
                    onSave={handleSaveRoute}
                    vehicleId={selectedVehicle?.id}
                />
            )}
            {isRouteDetailsModalOpen && (
                <RouteDetailsModal
                    open={isRouteDetailsModalOpen}
                    onClose={handleCloseRouteDetailsModal}
                    vehicle={selectedVehicle}
                    onEditRoute={handleEditRoute}
                    onDeleteRoute={handleDeleteRoute}
                />
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        p: 2,
                        maxWidth: 400
                    }
                }}
            >
                <DialogContent>
                    <Box sx={{textAlign: "center", py: 2}}>
                        <Typography variant="h6" gutterBottom>
                            Delete Vehicle
                        </Typography>
                        <DialogContentText>
                            Are you sure you want to delete this vehicle? This action cannot be undone.
                        </DialogContentText>
                    </Box>
                </DialogContent>
                <DialogActions sx={{justifyContent: "center", pb: 2}}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{borderRadius: 2, px: 3}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleToastDelete}
                        variant="contained"
                        color="error"
                        sx={{borderRadius: 2, px: 3}}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme="colored"
            />
        </Container>
    );
};

export default Vehicles;
