import React, {useState} from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Collapse,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventIcon from '@mui/icons-material/Event';

export const FeeCard = ({feeData, student, months}) => {
    const [expanded, setExpanded] = useState(false);
    const theme = useTheme();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const getStatusColor = (status) => {
        return status === 'Paid' ? theme.palette.success.main : theme.palette.warning.main;
    };

    const formattedDate = new Date(feeData.creationDateTime).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const paidMonth = months.find(month => feeData[month] === true);

    const renderContactInfo = (icon, primary, secondary) => (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
            {icon}
            <Box>
                <Typography variant="body2" color="text.secondary">
                    {primary}
                </Typography>
                <Typography variant="body1">
                    {secondary || 'N/A'}
                </Typography>
            </Box>
        </Box>
    );

    return (
        <Card
            elevation={2}
            sx={{
                mb: 2,
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                },
                border: `1px solid ${theme.palette.divider}`
            }}
        >
            <CardHeader
                avatar={
                    <Avatar
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 48,
                            height: 48,
                            transform: 'scale(1)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.1)'
                            }
                        }}
                    >
                        <SchoolIcon fontSize="large"/>
                    </Avatar>
                }
                action={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={feeData.status}
                            size="small"
                            sx={{
                                bgcolor: getStatusColor(feeData.status),
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 1
                            }}
                        />
                        <IconButton
                            onClick={handleExpandClick}
                            sx={{
                                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s'
                            }}
                        >
                            <KeyboardArrowDownIcon/>
                        </IconButton>
                    </Stack>
                }
                title={
                    <Typography variant="h6" sx={{fontWeight: 'bold', mb: 0.5}}>
                        {student?.studentName}
                    </Typography>
                }
                subheader={
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <SchoolIcon fontSize="small" color="action"/>
                                <Typography variant="body2">
                                    Class {student?.className}-{student?.section}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PersonIcon fontSize="small" color="action"/>
                                <Typography variant="body2">
                                    Roll No: {feeData.rollNo}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AccountBalanceIcon fontSize="small" color="action"/>
                                <Typography variant="body2">
                                    Due: ₹{feeData.allTotalAmount}
                                </Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <EventIcon fontSize="small" color="action"/>
                                <Typography variant="body2">
                                    {paidMonth ? `Paid in ${paidMonth}` : 'Not Paid'}
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                }
            />

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Grid container spacing={3}>
                        {/* Student Details Section */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    bgcolor: theme.palette.background.default,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.01)'
                                    }
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                                    <PersonIcon color="primary"/>
                                    <Typography variant="h6" color="primary">
                                        Student Details
                                    </Typography>
                                </Stack>

                                <Stack spacing={3}>
                                    {/* Parents Information */}
                                    <Box>
                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                            Parents Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                {renderContactInfo(
                                                    <PersonIcon fontSize="small" color="action"/>,
                                                    "Father's Name",
                                                    student.fatherName
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                {renderContactInfo(
                                                    <PersonIcon fontSize="small" color="action"/>,
                                                    "Mother's Name",
                                                    student.motherName
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* Contact Information */}
                                    <Box>
                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                            Contact Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                {renderContactInfo(
                                                    <EmailIcon fontSize="small" color="action"/>,
                                                    "Student Email",
                                                    student.email
                                                )}
                                                {renderContactInfo(
                                                    <PhoneIcon fontSize="small" color="action"/>,
                                                    "Student Mobile",
                                                    student.mobileNo
                                                )}
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{mt: 2}}>
                                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                                        Father's Contact
                                                    </Typography>
                                                    {renderContactInfo(
                                                        <PhoneIcon fontSize="small" color="action"/>,
                                                        "Mobile",
                                                        student.fatherMobile
                                                    )}
                                                    {renderContactInfo(
                                                        <EmailIcon fontSize="small" color="action"/>,
                                                        "Email",
                                                        student.fatherEmailAddress
                                                    )}
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{mt: 2}}>
                                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                                        Mother's Contact
                                                    </Typography>
                                                    {renderContactInfo(
                                                        <PhoneIcon fontSize="small" color="action"/>,
                                                        "Mobile",
                                                        student.motherMobile
                                                    )}
                                                    {renderContactInfo(
                                                        <EmailIcon fontSize="small" color="action"/>,
                                                        "Email",
                                                        student.motherEmailAddress
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* Fee Details Section */}
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    bgcolor: theme.palette.background.default,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.01)'
                                    }
                                }}
                            >
                                <Stack direction="row" spacing={1} alignItems="center" mb={3}>
                                    <PaymentIcon color="primary"/>
                                    <Typography variant="h6" color="primary">
                                        Fee Breakdown
                                    </Typography>
                                </Stack>

                                {/* Fee Amounts */}
                                <Stack spacing={1}>
                                    {Object.entries(feeData.feeAmounts).map(([feeType, amount]) => (
                                        <Box
                                            key={feeType}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                p: 1.5,
                                                borderRadius: 1,
                                                bgcolor: theme.palette.background.paper,
                                                border: `1px solid ${theme.palette.divider}`,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateX(5px)',
                                                    bgcolor: theme.palette.action.hover
                                                }
                                            }}
                                        >
                                            <Typography variant="body2">
                                                {feeType.replace(/([A-Z])/g, ' $1').trim()}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold" color="primary">
                                                ₹{amount}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>

                                <Divider sx={{my: 3}}/>

                                {/* Additional Fees */}
                                {(feeData.transportAmount > 0 || feeData.lateAmount > 0) && (
                                    <Box sx={{mb: 3}}>
                                        <Typography variant="subtitle1" color="primary" gutterBottom>
                                            Additional Charges
                                        </Typography>
                                        <Stack spacing={1}>
                                            {feeData.transportAmount > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    bgcolor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`
                                                }}>
                                                    <Typography variant="body2">Transport Fee</Typography>
                                                    <Typography variant="body2" color="primary" fontWeight="bold">
                                                        ₹{feeData.transportAmount}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {feeData.lateAmount > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    bgcolor: theme.palette.background.paper,
                                                    border: `1px solid ${theme.palette.divider}`
                                                }}>
                                                    <Typography variant="body2">Late Fee</Typography>
                                                    <Typography variant="body2" color="error" fontWeight="bold">
                                                        ₹{feeData.lateAmount}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Total */}
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    borderRadius: 1,
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText
                                }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Total Amount
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        ₹{feeData.allTotalAmount}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Remarks Section */}
                        {feeData.remarks && (
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        bgcolor: theme.palette.warning.light,
                                        borderRadius: 1,
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.01)'
                                        }
                                    }}
                                >
                                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                                        Remarks
                                    </Typography>
                                    <Typography variant="body2" color="warning.dark">
                                        {feeData.remarks}
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Collapse>
        </Card>
    );
};