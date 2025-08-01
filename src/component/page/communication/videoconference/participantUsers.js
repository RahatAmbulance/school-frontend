import React from "react";
import {
    alpha,
    Avatar,
    Box,
    Chip,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Paper,
    Tooltip,
    Typography,
    useTheme
} from "@mui/material";
import {
    Mic as MicIcon,
    MicOff as MicOffIcon,
    Videocam as VideocamIcon,
    VideocamOff as VideocamOffIcon,
    VolumeUp as VolumeUpIcon,
} from "@mui/icons-material";

export const ParticipantUsers = ({roomInfo, userName, userRole, participants = []}) => {
    const theme = useTheme();

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRandomColor = (name) => {
        const colors = [
            '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2',
            '#1565c0', '#2e7d32', '#c62828', '#6a1b9a'
        ];
        const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[index % colors.length];
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 2,
                height: '100%',
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2
            }}
        >
            {/* Room Header */}
            <Box sx={{mb: 3}}>
                <Typography variant="h5" gutterBottom sx={{fontWeight: 600, color: theme.palette.primary.main}}>
                    {roomInfo?.name || "Video Conference"}
                </Typography>

                <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2}}>
                    <Chip
                        label={`School: ${roomInfo?.schoolId || 'N/A'}`}
                        size="small"
                        sx={{backgroundColor: theme.palette.primary.light, color: 'white'}}
                    />
                    {roomInfo?.className && (
                        <Chip
                            label={`Class: ${roomInfo.className}${roomInfo?.section ? ` - ${roomInfo.section}` : ''}`}
                            size="small"
                            sx={{backgroundColor: theme.palette.secondary.light, color: 'white'}}
                        />
                    )}
                    <Chip
                        label={`Participants: ${participants?.length || 0}`}
                        size="small"
                        sx={{backgroundColor: theme.palette.success.light, color: 'white'}}
                    />
                </Box>

                <Box sx={{
                    p: 1.5,
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Avatar
                        sx={{
                            bgcolor: getRandomColor(userName),
                            width: 32,
                            height: 32
                        }}
                    >
                        {getInitials(userName)}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                        {userName} ({userRole})
                    </Typography>
                    <Chip
                        label="You"
                        size="small"
                        sx={{
                            ml: 'auto',
                            backgroundColor: theme.palette.primary.main,
                            color: 'white'
                        }}
                    />
                </Box>
            </Box>

            <Divider sx={{mb: 2}}/>

            {/* Participants List */}
            <List sx={{
                maxHeight: 'calc(100vh - 300px)',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.primary.light,
                    borderRadius: '4px',
                },
            }}>
                {participants.map((participant) => (
                    <ListItem
                        key={participant.sid}
                        sx={{
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor: participant.isSpeaking
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'transparent',
                            transition: 'background-color 0.3s ease',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                            }
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar
                                sx={{
                                    bgcolor: getRandomColor(participant.identity),
                                    border: participant.isSpeaking
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : 'none'
                                }}
                            >
                                {getInitials(participant.identity)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1" sx={{fontWeight: 500}}>
                                    {participant.identity}
                                    {participant.identity === userName && (
                                        <Chip
                                            label="You"
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                height: 20,
                                                backgroundColor: theme.palette.primary.main,
                                                color: 'white'
                                            }}
                                        />
                                    )}
                                </Typography>
                            }
                            secondary={
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
                                    {participant.isSpeaking && (
                                        <Tooltip title="Speaking">
                                            <VolumeUpIcon
                                                sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: 18
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction sx={{display: 'flex', gap: 1}}>
                            <Tooltip title={participant.isMicrophoneEnabled ? "Microphone On" : "Microphone Off"}>
                                <IconButton size="small"
                                            sx={{color: participant.isMicrophoneEnabled ? 'success.main' : 'error.main'}}>
                                    {participant.isMicrophoneEnabled ? <MicIcon/> : <MicOffIcon/>}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={participant.isCameraEnabled ? "Camera On" : "Camera Off"}>
                                <IconButton size="small"
                                            sx={{color: participant.isCameraEnabled ? 'success.main' : 'error.main'}}>
                                    {participant.isCameraEnabled ? <VideocamIcon/> : <VideocamOffIcon/>}
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};