import React from 'react';
import {Avatar, Card, CardContent, Grid, Typography} from '@mui/material';

const StaffCard = ({staff}) => {
    const convertByteArrayToBase64 = (byteArray) => {
        return `data:image/jpeg;base64,${byteArray}`;
    };

    return (
        <Card
            sx={{
                margin: 'auto',
                padding: '16px',
                boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                maxWidth: 400,
            }}
        >
            <Grid container direction="column" alignItems="center">
                {/* Photo Section */}
                <Grid item>
                    <Avatar
                        src={staff?.photo ? convertByteArrayToBase64(staff.photo) : '/placeholder-image.png'}
                        alt={`${staff?.name || 'Staff'}'s photo`}
                        sx={{
                            width: 100,
                            height: 100,
                            marginBottom: 2,
                        }}
                    />
                </Grid>


                {/* Details Section */}
                <CardContent sx={{textAlign: 'left'}}>
                    <Grid container spacing={1}>
                        <Grid item xs={4}>
                            <Typography variant="body2" fontWeight="bold">Staff Name:</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body2">{staff?.name || 'Staff Name'}</Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography variant="body2" fontWeight="bold">Post:</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body2">{staff?.post || 'N/A'}</Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography variant="body2" fontWeight="bold">phone No:</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body2">{staff?.phone || 'N/A'}</Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography variant="body2" fontWeight="bold">Department:</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body2">{staff?.department || 'N/A'}</Typography>
                        </Grid>

                        <Grid item xs={4}>
                            <Typography variant="body2" fontWeight="bold">Position:</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body2">{staff?.position || 'N/A'}</Typography>
                        </Grid>


                        <Grid item xs={4}>
                            <Typography variant="body2" fontWeight="bold">Certificates:</Typography>
                        </Grid>
                        <Grid item xs={8}>
                            <Typography variant="body2">{staff?.Certificates || 'N/A'}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Grid>
        </Card>
    );
};

export default StaffCard;
