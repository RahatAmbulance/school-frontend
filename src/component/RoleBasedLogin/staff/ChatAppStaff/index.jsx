import React, {useEffect, useRef, useState} from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    Container,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Skeleton,
    Slide,
    TextField,
    Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import {useDispatch, useSelector} from "react-redux";
import {api, baseURL, selectSchoolDetails, selectUserActualData} from "../../../../common";
import {fetchAllDetails} from "../../../page/communication/redux/actions/chatActions";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const ChatAppStaff = () => {
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const userDataActual = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const messageContainerRef = useRef(null);
    const [client, setClient] = useState(null);

    const currentUser = {
        id: userDataActual.tableId,
        name: userDataActual.name,
        schoolId: userDataActual.schoolId,
        session: userDataActual.session,
        usertable: userDataActual.tableName,
        className: userDataActual.className || '',
        section: userDataActual.section || '',
    };

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchAllDetails(schoolId, session));
            initializeWebSocket();
        }
    }, [dispatch, schoolId, session]);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const initializeWebSocket = () => {
        const sock = new SockJS(`${baseURL}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => sock,
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
            console.log("Connected to WebSocket");
            stompClient.subscribe('/topic/messages', (message) => {
                const messageData = JSON.parse(message.body);
                handleIncomingMessage(messageData);
            });
        };

        stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        stompClient.activate();
        setClient(stompClient);
    };

    const handleIncomingMessage = (messageData) => {
        setMessages(prev => [...prev, messageData]);
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const sendMessage = async () => {
        if ((!input.trim() && !selectedFile) || !selectedContact) return;

        let messageData = {
            senderId: currentUser.id,
            senderName: currentUser.name,
            recipientId: selectedContact.id,
            recipientName: selectedContact.name,
            content: input,
            timestamp: new Date().toISOString(),
            schoolId: schoolId,
            session: session,
        };

        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            try {
                const response = await api.post('/chat/upload', formData);
                messageData.attachment = {
                    fileName: selectedFile.name,
                    fileUrl: response.data.fileUrl,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size,
                };
            } catch (error) {
                console.error('Error uploading file:', error);
                return;
            }
        }

        if (client && client.connected) {
            client.publish({
                destination: '/app/chat',
                body: JSON.stringify(messageData),
            });
        }

        setInput("");
        setSelectedFile(null);
        setMessages(prev => [...prev, messageData]);
    };

    const selectContact = (contact) => {
        setSelectedContact(contact);
        // Load chat history
        api.get(`/chat/history/${currentUser.id}/${contact.id}`)
            .then(response => {
                setMessages(response.data);
            })
            .catch(error => {
                console.error('Error loading chat history:', error);
            });
    };

    return (
        <Container maxWidth="lg" sx={{height: '100vh', py: 2}}>
            <Paper elevation={3} sx={{height: '100%', display: 'flex'}}>
                {/* Contacts List */}
                <Box sx={{width: 300, borderRight: 1, borderColor: 'divider', p: 2}}>
                    <Typography variant="h6" gutterBottom>
                        Contacts
                    </Typography>
                    <List>
                        {loading ? (
                            Array(5).fill(0).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    variant="rectangular"
                                    height={60}
                                    sx={{mb: 1, borderRadius: 1}}
                                />
                            ))
                        ) : (
                            contacts.map((contact) => (
                                <ListItem
                                    key={contact.id}
                                    button
                                    selected={selectedContact?.id === contact.id}
                                    onClick={() => selectContact(contact)}
                                >
                                    <ListItemAvatar>
                                        <Avatar>{contact.name[0]}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={contact.name}
                                        secondary={contact.className ? `${contact.className} ${contact.section}` : ''}
                                    />
                                </ListItem>
                            ))
                        )}
                    </List>
                </Box>

                {/* Chat Area */}
                <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <Box sx={{p: 2, borderBottom: 1, borderColor: 'divider'}}>
                                <Typography variant="h6">
                                    {selectedContact.name}
                                </Typography>
                            </Box>

                            {/* Messages */}
                            <Box
                                ref={messageContainerRef}
                                sx={{
                                    flexGrow: 1,
                                    overflowY: 'auto',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                }}
                            >
                                {messages.map((message, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            alignSelf: message.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                        }}
                                    >
                                        <Card
                                            sx={{
                                                p: 1,
                                                backgroundColor: message.senderId === currentUser.id ? 'primary.main' : 'grey.100',
                                                color: message.senderId === currentUser.id ? 'white' : 'text.primary',
                                            }}
                                        >
                                            <Typography variant="body1">
                                                {message.content}
                                            </Typography>
                                            {message.attachment && (
                                                <Box sx={{mt: 1}}>
                                                    <Chip
                                                        icon={<AttachFileIcon/>}
                                                        label={message.attachment.fileName}
                                                        onClick={() => window.open(message.attachment.fileUrl)}
                                                        clickable
                                                    />
                                                </Box>
                                            )}
                                            <Typography variant="caption" display="block" sx={{mt: 0.5}}>
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </Card>
                                    </Box>
                                ))}
                            </Box>

                            {/* Input Area */}
                            <Box sx={{p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1}}>
                                <input
                                    type="file"
                                    id="file-input"
                                    style={{display: 'none'}}
                                    onChange={handleFileSelect}
                                />
                                <IconButton
                                    color="primary"
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    <AttachFileIcon/>
                                </IconButton>
                                <TextField
                                    fullWidth
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                />
                                <Button
                                    variant="contained"
                                    onClick={sendMessage}
                                    disabled={!input.trim() && !selectedFile}
                                >
                                    Send
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                            }}
                        >
                            <Typography variant="h6" color="text.secondary">
                                Select a contact to start chatting
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default ChatAppStaff; 