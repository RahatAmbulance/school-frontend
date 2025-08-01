import React from 'react';
import {alpha, Avatar, Box, Card, CardContent, Chip, Grid, styled, Typography} from '@mui/material';
import {motion} from 'framer-motion';

const StyledCard = styled(Card)(({theme}) => ({
    margin: 'auto',
    padding: theme.spacing(3),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    borderRadius: 24,
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
    }
}));

const StyledAvatar = styled(Avatar)(({theme}) => ({
    width: 120,
    height: 120,
    border: `4px solid ${theme.palette.background.paper}`,
    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05) rotate(5deg)',
        boxShadow: '0 12px 32px rgba(37, 99, 235, 0.3)'
    }
}));

const InfoChip = styled(Chip)(({theme}) => ({
    borderRadius: 12,
    fontWeight: 600,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '& .MuiChip-label': {
        padding: '4px 12px',
    }
}));

const DetailLabel = styled(Typography)(({theme}) => ({
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: '0.875rem',
    marginBottom: theme.spacing(0.5)
}));

const DetailValue = styled(Typography)(({theme}) => ({
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '1rem'
}));

const StudentCard = ({student}) => {
    const convertByteArrayToBase64 = (byteArray) => {
        if (!byteArray) return null;
        if (typeof byteArray === 'string' && byteArray.startsWith('data:image')) {
            return byteArray;
        }
        return `data:image/jpeg;base64,${byteArray}`;
    };

    return (
        <StyledCard component={motion.div} initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}>
            <Box display="flex" flexDirection="column" alignItems="center">
                {/* Photo Section */}
                <motion.div whileHover={{scale: 1.05}} transition={{type: "spring", stiffness: 300}}>
                    <StyledAvatar
                        src={student?.studentPhoto ? convertByteArrayToBase64(student.studentPhoto) : null}
                        alt={`${student?.studentName || 'Student'}'s photo`}
                    />
                </motion.div>

                <Box mt={3} mb={2} textAlign="center">
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {student?.studentName || 'Student Name'}
                    </Typography>
                    <InfoChip
                        label={`Class ${student?.className || 'N/A'}`}
                        size="medium"
                    />
                </Box>

                {/* Details Section */}
                <CardContent sx={{width: '100%'}}>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <DetailLabel>Roll Number</DetailLabel>
                            <DetailValue>{student?.rollNo || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={6}>
                            <DetailLabel>Admission No</DetailLabel>
                            <DetailValue>{student?.admissionNo || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={6}>
                            <DetailLabel>Father's Name</DetailLabel>
                            <DetailValue>{student?.fatherName || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={6}>
                            <DetailLabel>Mother's Name</DetailLabel>
                            <DetailValue>{student?.motherName || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={6}>
                            <DetailLabel>Mobile</DetailLabel>
                            <DetailValue>{student?.mobileNo || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={6}>
                            <DetailLabel>Email</DetailLabel>
                            <DetailValue>{student?.email || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={12}>
                            <DetailLabel>Address</DetailLabel>
                            <DetailValue>{student?.address || 'N/A'}</DetailValue>
                        </Grid>
                        <Grid item xs={6}>
                            <DetailLabel>Bus Route</DetailLabel>
                            <DetailValue>{student?.busRoute || 'N/A'}</DetailValue>
                        </Grid>
                    </Grid>
                </CardContent>
            </Box>
        </StyledCard>
    );
};

export default StudentCard;
