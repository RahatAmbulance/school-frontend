import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StudentCard from "./StudentCard";
import AttendanceViewStudent from "../attendance/student/AttendanceViewStudent";
// Function to convert byte array to base64 string
const convertByteArrayToBase64 = (byteArray) => {
    return `data:image/jpeg;base64,${byteArray}`;
};

const StudentDetails = ({studentId, employeeData, filter}) => {
    const {id} = useParams();

    const navigate = useNavigate();
    const [tabIndex, setTabIndex] = useState(0); // State to manage the active tab

    const student = useSelector((state) => {
        if (Array.isArray(state.students?.students)) {
            return state.students?.students.find(
                (student) => student.id === parseInt(id)
            );
        }
        return null;
    });

    if (!student) {
        return <Typography variant="h6">Student not found</Typography>;
    }

    // Convert byte arrays to base64 strings if they exist
    const motherPhoto = student.motherPhoto
        ? convertByteArrayToBase64(student.motherPhoto)
        : null;

    // Fields to display based on the initialState
    const studentDetails = {
        "Student Photo":
            student.studentPhoto && student.studentPhoto.length > 0
                ? " Photo Uploaded"
                : "Not Uploaded",

        "Student Name": student.studentName,
        "Mother Photo": motherPhoto ? (
            <Avatar src={motherPhoto} alt="Mother Photo"/>
        ) : (
            "Not Uploaded"
        ),
        "Father Photo": student.fatherPhoto ? "Uploaded" : "Not Uploaded",
        "Date of Birth": student.dob,
        Gender: student.gender,
        Category: student.category,
        "Mobile No": student.mobileNo,
        "Blood Group": student.bloodGroup,
        "Aadhar Number": student.aadharNumber,
        Role: student.role,
        "Admission No": student.admissionNo,
        "SR No": student.srNo,
        PEN: student.pen,
        "Unique ID Type": student.uniqueIdType,
        "Unique ID": student.uniqueId,
        Stream: student.stream,
        "Fee Category": student.feeCategory,
        "Roll No": student.rollNo,
        class: student.className,
        Status: student.status,
        "New/Old": student.newOld,
        House: student.house,
        "Father's Name": student.fatherName,
        "Mother's Name": student.motherName,
        "Local Guardian Name": student.localGuardianName,
        "Guardian Address": student.guardianAddress,
        "Guardian Mobile No": student.guardianMobileNo,
        "Relation with Student": student.relationWithStudent,
        "Father's Occupation": student.fatherOccupation,
        Religion: student.religion,
        "Caste Name": student.casteName,
        Address: student.address,
        State: student.state,
        District: student.district,
        "Pin Code": student.pinCode,
        "Period of Residence": student.periodOfResidence,
        "Withdrawal File Number": student.withdrawalFileNumber,
        "Scholar Register Number": student.scholarRegisterNumber,
        "Last School Name": student.lastSchoolName,
        "Account Holder Name": student.accountHolderName,
        "Branch Name": student.branchName,
        "Account Number": student.accountNumber,
        "IFSC Code": student.ifscCode,
        "Security Amount": student.securityAmount,
        "Route for Transport": student.routeForTransport,
        "Last Due Amount": student.lastDueAmount,
        "Other Information": student.otherInformation,
        "Vehicle ID": student.vehicleId,
        "Route ID": student.routeId,
    };

    // Function to handle tab changes
    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Container>
            {/* Back Button */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" gutterBottom>
                    <strong>Student Details</strong>
                </Typography>
                <Tooltip title="Back">
                    <IconButton
                        onClick={() => navigate(-1)}
                        aria-label="back"
                        sx={{marginRight: 2}}
                    >
                        <ArrowBackIcon/>
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Tabs for Details and Additional Information */}
            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="Student Details"/>
                <Tab label="Student Card"/>
                <Tab label="Student Attendance"/>
            </Tabs>

            {/* Tab Content */}
            {tabIndex === 0 && (
                <Box mt={2}>
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
                                {student.studentPhoto && student.studentPhoto.length > 0 ? (
                                    <Avatar
                                        src={convertByteArrayToBase64(student.studentPhoto)}
                                        alt={`${student?.studentName || "Student"}'s photo`}
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
                                        color: student.studentPhoto ? "green" : "red",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {student.studentPhoto ? "Uploaded" : "Not Uploaded"}
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
                                        {Object.entries(studentDetails).map(
                                            ([label, value], index) =>
                                                label !== "Student Photo" ? (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <strong>{label}</strong>
                                                        </TableCell>
                                                        <TableCell>{value || "N/A"}</TableCell>
                                                    </TableRow>
                                                ) : null
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </Table>
                </Box>
            )}

            {tabIndex === 1 && (
                <Box mt={2}>
                    <Paper elevation={3}>
                        <StudentCard student={student} showActions={false}/>
                    </Paper>
                </Box>
            )}

            {tabIndex === 2 && (
                <Box mt={2}>
                    <AttendanceViewStudent
                        studentId={student.id}
                        filter={(attendanceData) =>
                            attendanceData.filter(
                                (attendance) => attendance.studentId === student.id
                            )
                        }
                    />
                </Box>
            )}
            <div style={{marginTop: "10px", textAlign: "center"}}>
                <Tooltip title="Back">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="contained"
                        color="primary"
                        sx={{marginLeft: 2}}
                    >
                        Back
                    </Button>
                </Tooltip>
            </div>
        </Container>
    );
};

export default StudentDetails;
