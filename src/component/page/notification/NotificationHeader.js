import React from 'react';
import {AppBar, Avatar, Box, Button, Toolbar, Typography} from '@mui/material';
import {Add as AddIcon, Notifications as NotificationsIcon} from '@mui/icons-material';
import {styled} from '@mui/material/styles';
import {useSelector} from "react-redux";
import {selectUserActualData} from "../../../common";

const GradientAppBar = styled(AppBar)(({theme}) => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
}));

const GradientButton = styled(Button)(({theme}) => ({
    background: 'rgba(255,255,255,0.2)',
    borderRadius: theme.spacing(3),
    textTransform: 'none',
    fontWeight: 600,
    padding: theme.spacing(1.5, 3),
    '&:hover': {
        background: 'rgba(255,255,255,0.3)',
    },
}));

const NotificationHeader = ({onCreateClick}) => {
    const actualUsrData = useSelector(selectUserActualData);
    return (
        <GradientAppBar position="sticky" elevation={0}>
            <Toolbar>
                <Avatar sx={{mr: 2, bgcolor: 'rgba(255,255,255,0.2)'}}>
                    <NotificationsIcon/>
                </Avatar>
                <Box sx={{flexGrow: 1}}>
                    <Typography variant="h5" component="div" sx={{fontWeight: 700}}>
                        Scholiq Notification Center
                    </Typography>
                    <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.8)'}}>
                        Manage school notifications and announcements
                    </Typography>
                </Box>
                {actualUsrData?.tableName === 'school' && (
                    <GradientButton
                        variant="contained"
                        startIcon={<AddIcon/>}
                        onClick={onCreateClick}
                    >
                        Create Notification
                    </GradientButton>
                )}
            </Toolbar>
        </GradientAppBar>
    );
};

export default NotificationHeader; 