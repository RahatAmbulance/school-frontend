import React from 'react';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Fade,
    Grid,
    Paper,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    Announcement as AnnouncementIcon,
    CalendarMonth as SessionIcon,
    Event as EventIcon,
    Group as GroupIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {useSelector} from "react-redux";
import {motion} from 'framer-motion';
import {selectUserActualData} from "../../../common";

const StyledCard = styled(Card)(({theme}) => ({
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: theme.spacing(3),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    },
}));

const ViewNotifications = ({notifications = [], loading}) => {
    const theme = useTheme();
    const actualUsrData = useSelector(selectUserActualData);
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const getTypeIcon = (type) => {
        switch (type) {
            case 'student':
                return <GroupIcon/>;
            case 'staff':
                return <PersonIcon/>;
            default:
                return <AnnouncementIcon/>;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'student':
                return 'primary';
            case 'staff':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const formatDateTime = (dateTime) => {
        try {
            // Create a date object from the input
            const date = new Date(dateTime);

            // Convert to IST by adding 5 hours and 30 minutes
            const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));

            // Format options for date and time
            const dateOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata'
            };

            // Format the date in IST
            const formattedDate = new Intl.DateTimeFormat('en-IN', dateOptions).format(date);

            // Get relative time (e.g., "2 hours ago")
            const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
            const now = new Date();
            const diffInMinutes = Math.round((now - date) / (1000 * 60));
            const diffInHours = Math.round(diffInMinutes / 60);
            const diffInDays = Math.round(diffInHours / 24);

            let relativeTime = '';
            if (diffInMinutes < 60) {
                relativeTime = rtf.format(-diffInMinutes, 'minute');
            } else if (diffInHours < 24) {
                relativeTime = rtf.format(-diffInHours, 'hour');
            } else if (diffInDays < 30) {
                relativeTime = rtf.format(-diffInDays, 'day');
            }

            return {
                formatted: formattedDate,
                relative: relativeTime
            };
        } catch (error) {
            console.error('Error formatting date:', error);
            return {
                formatted: dateTime,
                relative: ''
            };
        }
    };

    const renderNotificationCard = (notification, index) => {
        const dateTime = formatDateTime(notification.createDateTime);

        return (
            <Grid item xs={12} key={notification.id}>
                <Fade in timeout={300 + index * 100}>
                    <StyledCard component={motion.div} whileHover={{y: -8}}>
                        <CardContent sx={{p: isMobile ? 2 : 3}}>
                            <Stack direction="row" alignItems="flex-start" spacing={2} sx={{mb: 2}}>
                                <Avatar
                                    sx={{
                                        bgcolor: `${getTypeColor(notification.type)}.main`,
                                        width: 48,
                                        height: 48,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {getTypeIcon(notification.type)}
                                </Avatar>
                                <Box sx={{flexGrow: 1}}>
                                    <Stack
                                        direction={isMobile ? "column" : "row"}
                                        alignItems={isMobile ? "flex-start" : "center"}
                                        spacing={isMobile ? 1 : 2}
                                        sx={{mb: 1}}
                                    >
                                        <Typography variant="h5" sx={{fontWeight: 700}}>
                                            {notification.title}
                                        </Typography>
                                        {notification.isHalfDay && (
                                            <Chip
                                                label="Half Day"
                                                size="small"
                                                color="warning"
                                                sx={{borderRadius: 2}}
                                            />
                                        )}
                                    </Stack>
                                    <Stack
                                        direction={isMobile ? "column" : "row"}
                                        alignItems={isMobile ? "flex-start" : "center"}
                                        spacing={isMobile ? 1 : 3}
                                        sx={{mb: 2}}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <TimeIcon fontSize="small" color="action"/>
                                            <Box>
                                                <Typography variant="body2" color="textSecondary">
                                                    {dateTime.formatted}
                                                </Typography>
                                                {dateTime.relative && (
                                                    <Typography variant="caption" color="primary" sx={{ml: 1}}>
                                                        ({dateTime.relative})
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                        <Chip
                                            label={notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                            size="small"
                                            color={getTypeColor(notification.type)}
                                            variant="outlined"
                                            sx={{borderRadius: 2}}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Typography variant="body1" sx={{mb: 3, lineHeight: 1.6}}>
                                {notification.message}
                            </Typography>

                            <Divider sx={{mb: 3}}/>

                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <SchoolIcon fontSize="small" color="action"/>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                SCHOOL ID
                                            </Typography>
                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                {notification.schoolId}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <SessionIcon fontSize="small" color="action"/>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                SESSION
                                            </Typography>
                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                {notification.session}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                {(notification.className || notification.section) && (
                                    <Grid item xs={6} sm={3}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <GroupIcon fontSize="small" color="action"/>
                                            <Box>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    CLASS
                                                </Typography>
                                                <Typography variant="body2" sx={{fontWeight: 600}}>
                                                    {notification.className} {notification.section && `- ${notification.section}`}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Grid>
                                )}
                                <Grid item xs={6} sm={3}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <PersonIcon fontSize="small" color="action"/>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                CREATED BY
                                            </Typography>
                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                {notification.createdBy}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>

                            {(notification.eventStartDate || notification.eventEndDate) && (
                                <Paper
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        bgcolor: 'primary.50',
                                        border: '1px solid',
                                        borderColor: 'primary.200',
                                        borderRadius: 2
                                    }}
                                    elevation={0}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{mb: 1}}>
                                        <EventIcon color="primary" fontSize="small"/>
                                        <Typography variant="subtitle2" color="primary" sx={{fontWeight: 600}}>
                                            Event Schedule
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" color="primary.dark">
                                        {notification.eventStartDate}
                                        {notification.eventEndDate !== notification.eventStartDate &&
                                            ` to ${notification.eventEndDate}`
                                        }
                                    </Typography>
                                </Paper>
                            )}
                        </CardContent>
                    </StyledCard>
                </Fade>
            </Grid>
        );
    };

    return (
        <>
            {/* Notifications List */}
            {loading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid item xs={12} key={item}>
                            <Card sx={{borderRadius: 3}}>
                                <CardContent>
                                    <Skeleton variant="text" width="60%" height={32}/>
                                    <Skeleton variant="text" width="40%" height={20} sx={{mt: 1}}/>
                                    <Skeleton variant="rectangular" width="100%" height={60} sx={{mt: 2}}/>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : notifications.length === 0 ? (
                <Fade in timeout={500}>
                    <Box textAlign="center" py={8}>
                        <NotificationsIcon sx={{fontSize: 80, color: 'grey.300', mb: 2, opacity: 0.7}}/>
                        <Typography variant="h5" color="textSecondary" gutterBottom sx={{fontWeight: 500}}>
                            No notifications found
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{maxWidth: 500, mx: 'auto', mt: 1}}>
                            Check back later for new notifications
                        </Typography>
                    </Box>
                </Fade>
            ) : (
                <Grid container spacing={3}>
                    {notifications.map((notification, index) => renderNotificationCard(notification, index))}
                </Grid>
            )}
        </>
    );
};

export default ViewNotifications;