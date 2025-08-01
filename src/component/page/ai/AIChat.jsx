import React, {useEffect, useRef, useState} from 'react';
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    createTheme,
    CssBaseline,
    Fade,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    ThemeProvider,
    Toolbar,
    Typography
} from '@mui/material';
import {
    Clear as ClearIcon,
    Error as ErrorIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Send as SendIcon,
    SmartToy as BotIcon
} from '@mui/icons-material';
import {styled} from '@mui/system';
import {api} from "../../../common";

// Custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#667eea',
            light: '#9bb5ff',
            dark: '#3f51b5',
        },
        secondary: {
            main: '#764ba2',
            light: '#a578d4',
            dark: '#4a2c73',
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

// Styled components
const ChatContainer = styled(Box)(({theme}) => ({
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
}));

const MessagesContainer = styled(Box)(({theme}) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.05)',
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(255, 255, 255, 0.5)',
    },
}));

const MessageBubble = styled(Paper)(({theme, sender}) => ({
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(1),
    maxWidth: '75%',
    background: sender === 'user'
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'rgba(255, 255, 255, 0.95)',
    color: sender === 'user' ? 'white' : theme.palette.text.primary,
    borderRadius: sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
    boxShadow: theme.shadows[3],
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[6],
    },
}));

const StyledAppBar = styled(AppBar)(({theme}) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    color: theme.palette.text.primary,
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
}));

const InputContainer = styled(Paper)(({theme}) => ({
    padding: theme.spacing(2.5),
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: 0,
    boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.1)',
}));

const WelcomeCard = styled(Card)(({theme}) => ({
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    textAlign: 'center',
    maxWidth: 500,
    margin: 'auto',
    marginTop: theme.spacing(8),
    borderRadius: theme.spacing(3),
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
}));

const GradientAvatar = styled(Avatar)(({theme, variant}) => ({
    background: variant === 'user'
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    width: 40,
    height: 40,
}));

const AIChat = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [context, setContext] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // API configuration
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const AI_ENDPOINT = `${API_BASE_URL}/api/ai/chat`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        if (!inputMessage.trim()) {
            setError('Message cannot be empty');
            setTimeout(() => setError(null), 3000);
            return;
        }

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/api/ai/chat', {
                message: inputMessage,
                context: context.trim() || null
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000
            });

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date(),
                success: response.data.success
            };

            setMessages(prev => [...prev, aiMessage]);

            if (!response.data.success && response.data.error) {
                setError(response.data.error);
            }

        } catch (err) {
            console.error('API Error:', err);

            let errorMessage = 'Failed to get AI response';

            if (err.response) {
                errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
            } else if (err.request) {
                errorMessage = 'No response from server. Please check your connection.';
            } else if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. Please try again.';
            }

            setError(errorMessage);

            const errorMsg = {
                id: Date.now() + 1,
                text: errorMessage,
                sender: 'system',
                timestamp: new Date(),
                isError: true
            };

            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
        setContext('');
        inputRef.current?.focus();
    };

    const formatTime = (timestamp) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(timestamp);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const MessageComponent = ({message}) => (
        <Fade in timeout={500}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    mb: 3,
                    px: 1
                }}
            >
                <GradientAvatar
                    variant={message.sender}
                    sx={{
                        mx: 1.5,
                        ...(message.isError && {
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)'
                        })
                    }}
                >
                    {message.sender === 'user' ? <PersonIcon/> :
                        message.isError ? <ErrorIcon/> : <BotIcon/>}
                </GradientAvatar>

                <Box sx={{maxWidth: '75%'}}>
                    <MessageBubble
                        sender={message.sender}
                        elevation={message.isError ? 0 : 4}
                        sx={{
                            ...(message.isError && {
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                                color: 'white'
                            })
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                mb: 0.5,
                                lineHeight: 1.6,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word'
                            }}
                        >
                            {message.text}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                opacity: 0.8,
                                fontSize: '0.75rem',
                                fontWeight: 500
                            }}
                        >
                            {formatTime(message.timestamp)}
                        </Typography>
                    </MessageBubble>
                </Box>
            </Box>
        </Fade>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <ChatContainer>
                {/* Header */}
                <StyledAppBar position="static" elevation={0}>
                    <Toolbar sx={{minHeight: '80px !important'}}>
                        <GradientAvatar sx={{mr: 2, width: 48, height: 48}}>
                            <SchoolIcon sx={{fontSize: 28}}/>
                        </GradientAvatar>
                        <Box sx={{flexGrow: 1}}>
                            <Typography variant="h5" component="div" sx={{fontWeight: 700, mb: 0.5}}>
                                SchoolIQ AI Assistant
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{fontWeight: 500}}>
                                Powered by intelligent learning • Ask anything about your studies
                            </Typography>
                        </Box>
                        <Button
                            onClick={clearChat}
                            startIcon={<ClearIcon/>}
                            variant="outlined"
                            size="large"
                            sx={{
                                borderRadius: 3,
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3
                            }}
                        >
                            Clear Chat
                        </Button>
                    </Toolbar>

                    {/* Context Input */}
                    <Box sx={{px: 3, pb: 3}}>
                        <TextField
                            fullWidth
                            size="medium"
                            placeholder="Add context (e.g., 'Grade 10 Mathematics', 'Physics Chapter 5')"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: 3,
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 1)',
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SchoolIcon color="action"/>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>
                </StyledAppBar>

                {/* Error Display */}
                {error && (
                    <Container maxWidth="lg" sx={{mt: 2}}>
                        <Alert
                            severity="error"
                            onClose={() => setError(null)}
                            sx={{
                                borderRadius: 3,
                                backdropFilter: 'blur(10px)',
                                background: 'rgba(255, 235, 238, 0.95)'
                            }}
                        >
                            <Typography variant="body2" sx={{fontWeight: 500}}>
                                {error}
                            </Typography>
                        </Alert>
                    </Container>
                )}

                {/* Messages */}
                <MessagesContainer>
                    <Container maxWidth="lg">
                        {messages.length === 0 ? (
                            <WelcomeCard elevation={8}>
                                <CardContent sx={{p: 5}}>
                                    <GradientAvatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            mb: 3
                                        }}
                                    >
                                        <BotIcon sx={{fontSize: 40}}/>
                                    </GradientAvatar>
                                    <Typography variant="h4" gutterBottom sx={{fontWeight: 700, mb: 2}}>
                                        Welcome to SchoolIQ AI
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{mb: 4, lineHeight: 1.7}}>
                                        Your intelligent study companion is here to help! Ask questions about any
                                        subject,
                                        get explanations for complex topics, or receive guidance on your homework.
                                    </Typography>
                                    <Box sx={{display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap'}}>
                                        <Chip
                                            label="📊 Mathematics"
                                            variant="outlined"
                                            sx={{fontWeight: 600, fontSize: '0.9rem'}}
                                        />
                                        <Chip
                                            label="🔬 Science"
                                            variant="outlined"
                                            sx={{fontWeight: 600, fontSize: '0.9rem'}}
                                        />
                                        <Chip
                                            label="📚 Literature"
                                            variant="outlined"
                                            sx={{fontWeight: 600, fontSize: '0.9rem'}}
                                        />
                                        <Chip
                                            label="🌍 History"
                                            variant="outlined"
                                            sx={{fontWeight: 600, fontSize: '0.9rem'}}
                                        />
                                    </Box>
                                </CardContent>
                            </WelcomeCard>
                        ) : (
                            messages.map((message) => (
                                <MessageComponent key={message.id} message={message}/>
                            ))
                        )}

                        {isLoading && (
                            <Box sx={{display: 'flex', justifyContent: 'center', my: 3}}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: 3
                                    }}
                                    elevation={4}
                                >
                                    <CircularProgress size={24}/>
                                    <Typography variant="body1" color="text.secondary" sx={{fontWeight: 600}}>
                                        AI is thinking...
                                    </Typography>
                                </Paper>
                            </Box>
                        )}

                        <div ref={messagesEndRef}/>
                    </Container>
                </MessagesContainer>

                {/* Input */}
                <InputContainer elevation={12}>
                    <Container maxWidth="lg">
                        <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-end'}}>
                            <TextField
                                ref={inputRef}
                                fullWidth
                                multiline
                                maxRows={4}
                                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                variant="outlined"
                                disabled={isLoading}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 4,
                                        bgcolor: 'white',
                                        fontSize: '1rem',
                                        '&:hover': {
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                                        },
                                        '&.Mui-focused': {
                                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                                        }
                                    }
                                }}
                            />
                            <IconButton
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputMessage.trim()}
                                sx={{
                                    width: 56,
                                    height: 56,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                                        transform: 'translateY(-2px)',
                                    },
                                    '&:disabled': {
                                        background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                                        color: 'white',
                                        opacity: 0.6
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isLoading ? (
                                    <CircularProgress size={24} color="inherit"/>
                                ) : (
                                    <SendIcon/>
                                )}
                            </IconButton>
                        </Box>
                    </Container>
                </InputContainer>
            </ChatContainer>
        </ThemeProvider>
    );
};

export default AIChat;