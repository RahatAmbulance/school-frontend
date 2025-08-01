import React from 'react';
import {Avatar, Box, Card, CardContent, Grid, Typography} from '@mui/material';
import QRCode from 'react-qr-code';

const student = {
    name: 'John Doe',
    class: '10th',
    section: 'A',
    rollNumber: '25',
    parentName: 'Jane Doe',
    mobileNumber: '1234567890',
    bloodGroup: 'O+',
    photo: 'https://via.placeholder.com/100',
};
const StudentIDCard = () => {
    const qrCodeValue = JSON.stringify(student);
    return (
        <Card sx={{maxWidth: 400, margin: 'auto', padding: 2, boxShadow: 3}}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Avatar
                            alt={student.name}
                            src={student.photo}
                            sx={{width: 100, height: 100}}
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <Typography variant="h6" fontWeight="bold">{student.name}</Typography>
                        <Typography variant="body2">Class: {student.class}</Typography>
                        <Typography variant="body2">Section: {student.section}</Typography>
                        <Typography variant="body2">Roll No: {student.rollNumber}</Typography>
                    </Grid>
                </Grid>

                <Box sx={{mt: 2}}>
                    <Typography variant="body2">Parent's Name: {student.parentName}</Typography>
                    <Typography variant="body2">Mobile No: {student.mobileNumber}</Typography>
                    <Typography variant="body2">Blood Group: {student.bloodGroup}</Typography>
                </Box>

                <Box sx={{mt: 2, textAlign: 'center'}}>
                    <QRCode value={qrCodeValue} size={100}/>
                </Box>
            </CardContent>
        </Card>
    );
};

export default StudentIDCard;
