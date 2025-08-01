import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {
    Avatar,
    Box,
    Button,
    Container,
    IconButton,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tabs,
    Tooltip,
    Typography,
} from '@mui/material';
import {api} from '../../../common';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StaffCard from './StaffCard';
import AttendanceViewStaff from '../attendance/staff/AttendanceViewStaff';

const convertByteArrayToBase64 = (byteArray) => {
    return `data:image/jpeg;base64,${byteArray}`;
};
const StaffDetails = ({groupAttendanceByDate}) => {
    const {staffId} = useParams();
    const attendanceList = useSelector(state => state.attendance.attendanceList);

    const dispatch = useDispatch();
    const [staff, setStaff] = useState(null);
    const [groupedData, setGroupedData] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/api/staff/${staffId}`);
                setStaff(response.data);
            } catch (error) {
                console.error("Error fetching staff data:", error);
            }
        };
        fetchData();
    }, [dispatch, staffId]);
    const groupAttendanceByEmployee = (data) => {
        const grouped = {};
        data.forEach(attendance => {
            const {date, status} = attendance;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(status);
        });
        return grouped;
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    if (!staff) return <Typography>Loading...</Typography>;

    return (

        <Container>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography variant="h6" gutterBottom>Staff Details</Typography>
                <Tooltip title="Back">
                    <IconButton onClick={() => navigate(-1)} aria-label="back" sx={{marginRight: 2}}>
                        <ArrowBackIcon/>
                    </IconButton>
                </Tooltip></Box>

            <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                <Tab label="Staff Details"/>
                <Tab label="Staff Card"/>
                <Tab label="Staff Attendence"/>

            </Tabs>

            {/* Fade effect for tab content */}
            {tabIndex === 0 && (
                <Box mt={2}>
                    {/* Display staff details in a table format */}

                    <Table>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                gap: "20px",
                                padding: "20px",
                                backgroundColor: "#e6f7ff",
                                borderRadius: "10px",
                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                                maxWidth: "1200px", // Width adjustment for better UI
                                minHeight: "400px", // Ensures the height contains all content
                                margin: "20px auto",
                                overflow: "hidden", // Prevents content overflow
                            }}
                        >
                            {/* Left: Photo Container */}
                            <div
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "10px",
                                    padding: "20px",
                                    textAlign: "center",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                    flex: "0 0 25%", // Adjusted width
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                {staff?.photo && staff?.photo.length > 0 ? (
                                    <Avatar
                                        src={convertByteArrayToBase64(staff?.photo)}
                                        alt={`${staff?.tName || "Staff"}'s photo`}
                                        sx={{
                                            width: 160,
                                            height: 160,
                                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "160px",
                                            height: "160px",
                                            borderRadius: "50%",
                                            backgroundColor: "#f9f9f9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "2px dashed #ccc",
                                            color: "#888",
                                            fontSize: "16px",
                                        }}
                                    >
                                        No Photo
                                    </div>
                                )}
                                <div
                                    style={{
                                        fontSize: "14px",
                                        color: staff?.photo ? "green" : "red",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {staff?.photo ? "Uploaded" : "Not Uploaded"}
                                </div>
                            </div>

                            {/* Right: Details Container */}
                            <div
                                style={{
                                    backgroundColor: "#ffffff",
                                    borderRadius: "10px",
                                    padding: "20px",
                                    flex: "1", // Takes up the remaining space
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <h3 style={{marginBottom: "20px", color: "#333"}}>
                                    General Information
                                </h3>
                                <Table>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell><strong>Name</strong></TableCell>
                                            <TableCell>{staff.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Post</strong></TableCell>
                                            <TableCell>{staff.post}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Phone</strong></TableCell>
                                            <TableCell>{staff.phone}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Email</strong></TableCell>
                                            <TableCell>{staff.email}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Department</strong></TableCell>
                                            <TableCell>{staff.department || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Position</strong></TableCell>
                                            <TableCell>{staff.position || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Bank Account Number</strong></TableCell>
                                            <TableCell>{staff.bankAccountNumber || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>IFSC Code</strong></TableCell>
                                            <TableCell>{staff.ifscCode || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Vehicle Type</strong></TableCell>
                                            <TableCell>{staff.vehicleType || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Vehicle Number</strong></TableCell>
                                            <TableCell>{staff.vehicleNumber || 'N/A'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Resume</strong></TableCell>
                                            <TableCell>{staff.resume ? 'Uploaded' : 'Not Uploaded'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell><strong>Certificates</strong></TableCell>
                                            <TableCell>{staff.certificates ? 'Uploaded' : 'Not Uploaded'}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </Table>

                </Box>
            )}
            {tabIndex === 1 && (
                <Box mt={2} width="100%" height="auto">
                    <Paper elevation={3} sx={{width: '100%', height: 'auto', padding: 2}}>
                        <StaffCard staff={staff}/>
                    </Paper>
                </Box>
            )}

            {tabIndex === 2 && (
                <Box mt={2}>
                    <Paper elevation={3}>
                        <AttendanceViewStaff staff={attendanceList}/>


                    </Paper>
                </Box>

            )}
            {/* Back button at the bottom */}
            <div style={{marginTop: '10px', textAlign: 'center'}}>
                <Tooltip title="Back">
                    <Button onClick={() => navigate(-1)} variant="contained" color="primary" sx={{marginLeft: 2}}>
                        Back
                    </Button>
                </Tooltip>
            </div>
        </Container>
    );
};

export default StaffDetails;
