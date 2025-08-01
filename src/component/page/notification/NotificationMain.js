import React, {useEffect, useState} from 'react';
import {Box, Container, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useDispatch, useSelector} from "react-redux";
import CreateNotification from './CreateNotification';
import ViewNotifications from './ViewNotifications';
import NotificationHeader from './NotificationHeader';
import {selectSchoolDetails, selectUserActualData} from "../../../common";
import {createNotification, fetchNotifications} from './redux/notificationActions';

// Styled components
const MainContainer = styled(Box)(({theme}) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    pb: 4
}));

const NotificationMain = () => {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const dispatch = useDispatch();
    const actualUsrData = useSelector(selectUserActualData);
    const userData = useSelector(selectSchoolDetails);
    const notifications = useSelector(state => state.notifications.notifications);
    const loading = useSelector(state => state.notifications.loading);
    const error = useSelector(state => state.notifications.error);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchNotifications(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleCreateNotification = async (newNotification) => {
        try {
            await dispatch(createNotification(newNotification));
            setShowCreateDialog(false);
            // Refresh notifications after creating a new one
            dispatch(fetchNotifications(schoolId, session));
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    const handleFilter = async (filters) => {
        try {
            // Update the API endpoint to include filter parameters
            await dispatch(fetchNotifications(schoolId, session, filters));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    if (error) {
        return (
            <MainContainer>
                <Container maxWidth="xl" sx={{mt: 4}}>
                    <Box textAlign="center" py={8}>
                        <Typography variant="h5" color="error" gutterBottom>
                            Error: {error}
                        </Typography>
                    </Box>
                </Container>
            </MainContainer>
        );
    }

    return (
        <MainContainer>
            <NotificationHeader onCreateClick={() => setShowCreateDialog(true)}/>

            <Container maxWidth="xl" sx={{mt: 4}}>
                <ViewNotifications
                    notifications={notifications}
                    loading={loading}
                    onFilter={handleFilter}
                />
            </Container>

            <CreateNotification
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onCreate={handleCreateNotification}
            />
        </MainContainer>
    );
};

export default NotificationMain; 