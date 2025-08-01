import React, {useEffect, useState} from 'react';
import {
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import axios from 'axios';

const ComplainList = ({schoolId}) => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch complaints from the backend
        const fetchComplaints = async () => {
            try {
                const response = await axios.get(`/api/complaints/${schoolId}`);
                setComplaints(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching complaints:', error);
                setLoading(false);
            }
        };

        if (schoolId) fetchComplaints();
    }, [schoolId]);
    return (
        <div style={{padding: '20px'}}>
            <Typography variant="h6" gutterBottom>
                Complaints List
            </Typography>
            {loading ? (
                <CircularProgress/>
            ) : complaints.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ticket Number</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Complaint Type</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {complaints.map((complaint) => (
                                <TableRow key={complaint.ticketNumber}>
                                    <TableCell>{complaint.ticketNumber}</TableCell>
                                    <TableCell>{complaint.name}</TableCell>
                                    <TableCell>{complaint.type}</TableCell>
                                    <TableCell>{complaint.complaintType}</TableCell>
                                    <TableCell>{complaint.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography>No complaints found.</Typography>
            )}
        </div>
    );
};

export default ComplainList;
