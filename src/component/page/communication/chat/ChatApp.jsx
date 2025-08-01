import React, {useEffect, useRef, useState} from "react";
import {
    Autocomplete,
    Avatar,
    AvatarGroup,
    Badge,
    Box,
    Button,
    Card,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Paper,
    Skeleton,
    Slide,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import {
    Call,
    CallEnd,
    Cancel,
    CheckCircle,
    Close,
    Fullscreen,
    FullscreenExit,
    Group as GroupIcon,
    Mic,
    MicOff,
    Refresh,
    ScreenShare,
    Settings,
    StopScreenShare,
    VideoCall,
    Videocam,
    VideocamOff,
    Warning
} from '@mui/icons-material';
import PersonIcon from "@mui/icons-material/Person";
import {useDispatch, useSelector} from "react-redux";
import {api, baseURL, selectSchoolDetails, selectUserActualData} from "../../../../common";
import {fetchAllDetails} from "../redux/actions/chatActions";
import {Client} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import './TestingWebRTC.css';
// Optional transition for dialogs
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});
const ChatApp = () => {
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const userDataActual = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState(true);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isGroupDialogOpen, setGroupDialogOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [selectedNewContact, setSelectedNewContact] = useState(null);
    const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
    const [groupName, setGroupName] = useState("");
    // Reference to the message container for scrolling
    const messageContainerRef = useRef(null);
    const [client, setClient] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [registeredId, setRegisteredId] = useState('');
    const [callModalOpen, setCallModalOpen] = useState(false);
    const [activeCallType, setActiveCallType] = useState(null);
    const [callSessionId, setCallSessionId] = useState(null);
    // Current user info (you would get this from your auth context or props)
    const currentUser = {
        id: userDataActual.tableId,
        name: userDataActual.name,
        schoolId: userDataActual.schoolId,
        session: userDataActual.session,
        usertable: userDataActual.tableName,
        className: userDataActual.className || '',
        section: userDataActual.section || '',
        isInitiator: true
    };
    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchAllDetails(schoolId, session));
        }
    }, [dispatch, schoolId, session]);
    const allDetails = useSelector((state) => state?.allDetails?.allDetails || []);
    // Auto-scroll to bottom of message container when messages update
    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [messages]);
    const createGroup = () => {
        if (groupName.trim() === "" || selectedGroupMembers.length === 0) {
            return;
        }

        // Create a new group with a unique ID
        const groupId = `group_${Date.now()}`;

        // Add current user to group members if not already included
        const currentUserIncluded = selectedGroupMembers.some(
            member => String(member.id) === String(userDataActual.tableId)
        );

        const fullMembersList = currentUserIncluded
            ? selectedGroupMembers
            : [
                {
                    id: userDataActual.tableId,
                    name: userDataActual.name,
                    schoolId: userDataActual.schoolId,
                    session: userDataActual.session,
                    usertable: userDataActual.tableName,
                    className: userDataActual.className || '',
                    section: userDataActual.section || ''
                },
                ...selectedGroupMembers
            ];

        const newGroup = {
            id: groupId,
            name: groupName,
            avatar: groupName[0] || 'G',
            isGroup: true,
            members: fullMembersList,
            schoolId: schoolId,
            session: session,
            createdBy: userDataActual.tableId,
            createdAt: new Date().toISOString()
        };

        // Add new group to contacts and update selection
        setContacts(prevContacts => [newGroup, ...prevContacts]);
        setSelectedContact(newGroup);

        // Save group to database via API
        const createGroupRequest = typeof api === 'string'
            ? api.post(`/chat${api}/groups`, newGroup)
            : api.post("/chat/groups", newGroup);

        createGroupRequest
            .then(() => {
                console.log("Group created successfully");
            })
            .catch(error => {
                console.error('Failed to create group:', error);
            });
        setLoading(false);
        // Reset form and close dialog
        setGroupName("");
        setSelectedGroupMembers([]);
        setGroupDialogOpen(false);
    };
    const initiateChat = () => {
        if (selectedNewContact) {
            const safeString = (value) => (value != null ? String(value) : ''); // Convert only if not null/undefined

            const contactExists = contacts.some(contact =>
                contact &&
                selectedNewContact &&
                safeString(contact.id) === safeString(selectedNewContact.id) &&
                safeString(contact.table) === safeString(selectedNewContact.table) &&
                safeString(contact.session) === safeString(selectedNewContact.session) &&
                safeString(contact.schoolId) === safeString(selectedNewContact.schoolId) &&
                safeString(contact.className) === safeString(selectedNewContact.className) &&
                safeString(contact.section) === safeString(selectedNewContact.section)
            );

            if (!contactExists) {
                const newContact = {
                    id: selectedNewContact.id,
                    name: selectedNewContact.name,
                    avatar: selectedNewContact.name ? selectedNewContact.name[0] : '?',
                    className: selectedNewContact.className || '',
                    section: selectedNewContact.section || '',
                    table: selectedNewContact.table,
                    session: selectedNewContact.session,
                    schoolId: selectedNewContact.schoolId,
                    isGroup: false
                };

                // Add new contact and update selection
                setContacts(prevContacts => [newContact, ...prevContacts]);
                setSelectedContact(newContact);
            } else {
                // If contact exists, just select it
                const existingContact = contacts.find(contact =>
                    contact && selectedNewContact && String(contact.id) === String(selectedNewContact.id)
                );

                setSelectedContact(existingContact);
            }
            setLoading(false);
            // Reset selection and close dialog
            setSelectedNewContact(null);
            setDialogOpen(false);
        }
    };
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB limit");
                return;
            }
            setSelectedFile(file);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };
    const getFileIcon = (fileType) => {
        if (fileType?.startsWith("image/")) return <ImageIcon fontSize="small"/>;
        if (fileType === "application/pdf") return <PictureAsPdfIcon fontSize="small"/>;
        if (fileType?.includes("spreadsheet") || fileType?.includes("excel") || fileType?.includes("xlsx"))
            return <DescriptionIcon fontSize="small"/>;
        if (fileType?.includes("document") || fileType?.includes("doc") || fileType?.includes("docx"))
            return <DescriptionIcon fontSize="small"/>;
        return <InsertDriveFileIcon fontSize="small"/>;
    };
    const downloadFile = (fileData) => {
        if (!fileData || !fileData.data) {
            alert("File data is missing or corrupted");
            return;
        }

        // Convert base64 to blob
        const byteCharacters = atob(fileData.data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: fileData.type});
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement("a");
        a.href = url;
        a.download = fileData.name;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    };
    // Fetch messages and groups to build contact list
    useEffect(() => {
        if (userDataActual?.tableId) {
            const params = {
                userId: userDataActual.tableId,
                name: userDataActual.name,
                schoolId: userDataActual.schoolId,
                session: userDataActual.session,
                usertable: userDataActual.usertable,
                className: userDataActual.className || '',
                section: userDataActual.section || ''
            };

            // Use the appropriate API method depending on what 'api' is
            const fetchMessages = typeof api === 'string'
                ? api.get(`/chat${api}/all-messages`, {params})
                : api.get("/chat/all-messages", {params});

            fetchMessages
                .then(response => {
                    if (response.data) {
                        const uniqueContacts = extractContactsFromMessages(response.data);
                        console.log("Unique contact", uniqueContacts);

                        // Fetch groups that the user is a member of
                        const fetchGroups = typeof api === 'string'
                            ? api.get(`/chat${api}/groups`, {params})
                            : api.get("/chat/groups", {params});

                        fetchGroups
                            .then(groupsResponse => {
                                if (groupsResponse.data) {
                                    // Combine individual contacts with groups
                                    const allContacts = [
                                        ...uniqueContacts,
                                        ...groupsResponse.data.map(group => ({
                                            ...group,
                                            avatar: group.name ? group.name[0] : 'G',
                                            isGroup: true
                                        }))
                                    ];

                                    setContacts(allContacts);
                                } else {
                                    setContacts(uniqueContacts);
                                }
                                setLoading(false);
                            })
                            .catch(error => {
                                console.error('Error fetching groups:', error);
                                setContacts(uniqueContacts);
                                setLoading(false);
                            });
                    }
                })
                .catch(error => console.error('Error fetching messages for contacts:', error));
        }
    }, [userDataActual]);
    // Extract contacts from message history
    const extractContactsFromMessages = (messages) => {
        if (!Array.isArray(messages) || !messages.length) {
            return [];
        }

        const contactsMap = new Map();

        messages.forEach(msg => {
            // Skip invalid messages
            if (!msg || !msg.sender || !msg.receiver) {
                return;
            }

            const addContactIfNotExists = (contact, isSender) => {
                const contactKey = `${contact.id}-${contact.name}-${contact.schoolId}-${contact.session}-${contact.section || ''}-${contact.className || ''}`.toLowerCase();

                if (!contactsMap.has(contactKey) && contact.name) {
                    contactsMap.set(contactKey, {
                        id: contact.id,
                        name: contact.name,
                        schoolId: contact.schoolId,
                        session: contact.session,
                        section: contact.section || '',
                        className: contact.className || '',
                        usertable: contact.usertable ? String(contact.usertable).toLowerCase() : '',
                        avatar: contact.name[0] || '?',
                        lastMessage: msg.text,
                        timestamp: msg.timestamp || msg.updatedAt,
                        isGroup: false
                    });
                }
            };

            // If message is a group message
            if (msg.isGroupMessage && msg.groupId) {
                // Group messages are handled separately via the groups API
            }
            // If user is the sender, add receiver as contact
            else if (String(msg.sender.id) === String(userDataActual.tableId)) {
                addContactIfNotExists(msg.receiver, false);
            }
            // If user is the receiver, add sender as contact
            else if (String(msg.receiver.id) === String(userDataActual.tableId)) {
                addContactIfNotExists(msg.sender, true);
            }
        });

        return Array.from(contactsMap.values())
            .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    };
    // Add a contact based on message interaction
    const addContactFromMessage = (message) => {
        if (!message) {
            return;
        }
        // For group messages
        if (message.isGroupMessage && message.groupId) {
            setContacts(prevContacts => {
                // Check if group already exists in contacts
                const groupExists = prevContacts.some(contact =>
                    contact.isGroup && contact.id === message.groupId
                );
                if (!groupExists) {
                    // Fetch group details
                    const fetchGroupDetails = typeof api === 'string'
                        ? api.get(`/chat${api}/groups/${message.groupId}`)
                        : api.get(`/chat/groups/${message.groupId}`);
                    fetchGroupDetails
                        .then(response => {
                            if (response.data) {
                                const group = response.data;
                                setContacts(currentContacts => [
                                    {
                                        ...group,
                                        avatar: group.name[0] || 'G',
                                        isGroup: true,
                                        lastMessage: message.text,
                                        timestamp: message.timestamp || message.updatedAt
                                    },
                                    ...currentContacts.filter(c => c.id !== group.id)
                                ]);
                                setLoading(false);
                            }
                        })
                        .catch(error => console.error('Failed to fetch group details:', error));
                } else {
                    // Update existing group with latest message
                    return prevContacts.map(contact => {
                        if (contact.isGroup && contact.id === message.groupId) {
                            return {
                                ...contact,
                                lastMessage: message.text,
                                timestamp: message.timestamp || message.updatedAt
                            };
                        }
                        return contact;
                    }).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                }
                return prevContacts;
            });
            return;
        }

        // For direct messages
        if (!message.sender || !message.receiver) {
            return;
        }

        setContacts(prevContacts => {
            let newContact = null;

            // If user is receiver, add sender as contact
            if (String(message.receiver.id) === String(userDataActual.tableId)) {
                newContact = {
                    id: message.sender.id,
                    name: message.sender.name,
                    schoolId: message.sender.schoolId,
                    session: message.sender.session,
                    section: message.sender.section || '',
                    className: message.sender.className || '',
                    usertable: message.sender.usertable ? String(message.sender.usertable).toLowerCase() : '',
                    avatar: message.sender.name ? message.sender.name[0] : '?',
                    lastMessage: message.text,
                    timestamp: message.timestamp || message.updatedAt,
                    isGroup: false
                };
            }
            // If user is sender, add receiver as contact
            else if (String(message.sender.id) === String(userDataActual.tableId)) {
                newContact = {
                    id: message.receiver.id,
                    name: message.receiver.name,
                    schoolId: message.receiver.schoolId,
                    session: message.receiver.session,
                    section: message.receiver.section || '',
                    className: message.receiver.className || '',
                    usertable: message.receiver.usertable ? String(message.receiver.usertable).toLowerCase() : '',
                    avatar: message.receiver.name ? message.receiver.name[0] : '?',
                    lastMessage: message.text,
                    timestamp: message.timestamp || message.updatedAt,
                    isGroup: false
                };
            }

            if (newContact) {
                // Create a unique key to check for duplicates
                const newContactKey = `${newContact.id}-${newContact.name}-${newContact.schoolId}-${newContact.session}-${newContact.section}-${newContact.className}`;

                let contactExists = false;

                const updatedContacts = prevContacts.map(contact => {
                    if (contact) {
                        const existingContactKey = `${contact.id}-${contact.name}-${contact.schoolId}-${contact.session}-${contact.section}-${contact.className}`;

                        if (existingContactKey === newContactKey) {
                            contactExists = true;
                            return {
                                ...contact,
                                lastMessage: newContact.lastMessage,
                                timestamp: newContact.timestamp
                            };
                        }
                    }
                    return contact;
                });
                setLoading(false);
                if (!contactExists) {
                    return [newContact, ...updatedContacts];
                }

                return updatedContacts.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
            }

            return prevContacts;
        });
    };
    const handleIncomingMessage = (messageData) => {
        console.log("Received message:", messageData);

        // Handle normal messages
        setMessages((prevMessages) => [...prevMessages, messageData]);
        addContactFromMessage(messageData);

        // Handle direct call invitations
        if (messageData.type === "call_invitation" &&
            String(messageData.receiver.id) === String(userDataActual.tableId)) {

            console.log("Received direct call invitation:", messageData);

            // Show notification for incoming call
            const isAccepted = window.confirm(
                `Incoming ${messageData.callType} call from ${messageData.sender.name}. Accept?`
            );

            if (isAccepted) {
                // Set the contact information from the sender
                const callerContact = {
                    id: messageData.sender.id,
                    name: messageData.sender.name,
                    schoolId: messageData.sender.schoolId,
                    session: messageData.sender.session,
                    usertable: messageData.sender.usertable,
                    className: messageData.sender.className || '',
                    section: messageData.sender.section || '',
                    isGroup: false
                };

                // Join the call
                setSelectedContact(callerContact);
                setCallSessionId(messageData.sessionId);
                setActiveCallType(messageData.callType);
                setCallModalOpen(true);
            }
        }

        // Handle group call invitations
        if (messageData.type === "group_call_invitation" &&
            messageData.receiverIds.includes(String(userDataActual.tableId))) {

            console.log("Received group call invitation:", messageData);

            // Show notification for incoming group call
            const isAccepted = window.confirm(
                `Incoming group ${messageData.callType} call from ${messageData.sender.name} in ${messageData.groupName}. Accept?`
            );

            if (isAccepted) {
                // Get the group from contacts or fetch it
                const groupContact = contacts.find(c => c.id === messageData.groupId) || {
                    id: messageData.groupId,
                    name: messageData.groupName,
                    isGroup: true,
                    members: messageData.receiverMembers
                };

                // Join the call
                setSelectedContact(groupContact);
                setCallSessionId(messageData.sessionId);
                setActiveCallType(messageData.callType);
                setCallModalOpen(true);
            }
        }
    };
    const selectTargetUserId = async () => {
        const userTable = selectedContact.usertable ? selectedContact.usertable.toLowerCase() : "NAN";
        const className = selectedContact.className ? selectedContact.className : "NAN";
        const section = selectedContact.section ? selectedContact.section : "NAN";
        const topic = `/topic/webrtc/${selectedContact.id}_${selectedContact.name}_${className}_${section}_${selectedContact.schoolId}_${selectedContact.session}_${userTable}`;
        setTargetUserId(topic);
    };
    // Start a call (audio or video)
    const handleStartCall = (type) => {
        if (!selectedContact) return;

        selectTargetUserId();
        startCall();

        // Generate a unique session ID for this call using timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 10);
        const newSessionId = `${timestamp}-${randomString}`;
        setCallSessionId(newSessionId);

        console.log(`Starting ${type} call with ${selectedContact.name}`);

        // For group calls, verify the group has members
        if (selectedContact.isGroup && (!selectedContact.members || selectedContact.members.length === 0)) {
            alert("Cannot start a call in an empty group");
            return;
        }

        // Set call type and open the modal
        setActiveCallType(type);
        setCallModalOpen(true);

        // If using WebSockets, notify other users about the call
        if (client && client.connected) {
            // For direct calls
            if (!selectedContact.isGroup) {
                const callNotification = {
                    type: "call_invitation",
                    callType: type,
                    sessionId: newSessionId,
                    sender: {
                        id: userDataActual.tableId,
                        name: userDataActual.name,
                        schoolId: userDataActual.schoolId,
                        session: userDataActual.session,
                        usertable: userDataActual.tableName,
                        className: userDataActual.className || '',
                        section: userDataActual.section || ''
                    },
                    receiver: {
                        id: selectedContact.id,
                        name: selectedContact.name,
                        schoolId: selectedContact.schoolId || schoolId,
                        session: selectedContact.session || session,
                        usertable: selectedContact.usertable,
                        className: selectedContact.className || '',
                        section: selectedContact.section || ''
                    },
                    timestamp: new Date().toISOString()
                };

                console.log("Sending direct call invitation:", callNotification);

                // Send call notification via WebSocket - use the call-specific endpoint
                client.publish({
                    destination: "/app/calls",  // Changed from /app/chat
                    body: JSON.stringify(callNotification),
                });
            }
            // For group calls
            else {
                const groupCallNotification = {
                    type: "group_call_invitation",
                    callType: type,
                    sessionId: newSessionId,
                    groupId: selectedContact.id,
                    groupName: selectedContact.name,
                    sender: {
                        id: userDataActual.tableId,
                        name: userDataActual.name,
                        schoolId: userDataActual.schoolId,
                        session: userDataActual.session,
                        usertable: userDataActual.tableName,
                        className: userDataActual.className || '',
                        section: userDataActual.section || ''
                    },
                    receiverIds: selectedContact.members.map(member => member.id),
                    receiverMembers: selectedContact.members,
                    timestamp: new Date().toISOString()
                };

                // Send group call notification via WebSocket - use the call-specific endpoint
                client.publish({
                    destination: "/app/calls",  // Changed from /app/group-chat
                    body: JSON.stringify(groupCallNotification),
                });
            }
        }
    };
    // Function to close the call modal
    const handleCloseCall = () => {
        setCallModalOpen(false);
        setActiveCallType(null);
        setCallSessionId(null);
    };
    useEffect(() => {
        const socket = new SockJS(baseURL + "/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000, // Reconnect on disconnect
            onConnect: () => {
                console.log("Connected to WebSocket");
                setClient(stompClient);

                const userTable = userDataActual.tableName ? userDataActual.tableName.toLowerCase() : "NAN";
                const className = userDataActual.className ? userDataActual.className : "NAN";
                const section = userDataActual.section ? userDataActual.section : "NAN";

                const statusTopic = `/topic/status`;
                const userTopic = `/topic/online-users`;

                // ✅ First, subscribe to the status updates
                stompClient.subscribe(statusTopic, (message) => {
                    const statusData = JSON.parse(message.body);
                    setOnlineUsers((current) => {
                        if (statusData.status === 'online') {
                            return [...new Set([...current, statusData])];
                        } else {
                            return current.filter(user =>
                                user.userId !== statusData.userId ||
                                user.name !== statusData.name ||
                                user.schoolId !== statusData.schoolId ||
                                user.session !== statusData.session ||
                                user.usertable !== statusData.usertable ||
                                user.className !== statusData.className ||
                                user.section !== statusData.section
                            );
                        }
                    });
                });

                // ✅ Second, subscribe to online users list updates
                stompClient.subscribe(userTopic, (message) => {
                    const onlineUsersData = JSON.parse(message.body);
                    setOnlineUsers(onlineUsersData.onlineUsers);
                });

                // ✅ Third, Publish user as "online"
                stompClient.publish({
                    destination: "/app/status",
                    body: JSON.stringify({
                        userId: userDataActual?.tableId,
                        name: userDataActual?.name,
                        status: 'online',
                        schoolId: userDataActual?.schoolId,
                        session: userDataActual?.session,
                        className: userDataActual?.className,
                        section: userDataActual?.section,
                        usertable: userDataActual.tableName,
                    }),
                });

                // ✅ Fourth, Request the list of current online users
                stompClient.publish({
                    destination: "/app/get-online-users",
                    body: JSON.stringify({
                        requesterId: userDataActual.tableId,
                        name: userDataActual.name,
                        schoolId: userDataActual.schoolId,
                        session: userDataActual.session,
                        usertable: userDataActual.tableName,
                        className: userDataActual.className || '',
                        section: userDataActual.section || ''
                    }),
                });

                // ✅ Subscribe to direct messages
                const topic = `/topic/${userDataActual.tableId}_${userDataActual.name}_${className}_${section}_${schoolId}_${session}_${userTable}`;

                /*  const topic = `/topic/${userDataActual.tableId}_${userDataActual.name}_${className}_${section}_${userDataActual.schoolId}_${userDataActual.session}_${userTable}`;
                */
                stompClient.subscribe(topic, (message) => {
                    const messageData = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, messageData]);
                    addContactFromMessage(messageData);
                });

                // Subscribe to group messages - user ID based topic
                const groupTopic = `/topic/group/${userDataActual.tableId}_${userDataActual.name}_${className}_${section}_${schoolId}_${session}_${userTable}`;

                console.log("Group Topic:", groupTopic);
                stompClient.subscribe(groupTopic, (message) => {
                    const messageData = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, messageData]);
                    addContactFromMessage(messageData);
                });


                // 3. Subscribe to call notifications - new dedicated topic for calls
                const callTopic = `/topic/calls`;
                console.log("Subscribing to call topic:", callTopic);

                stompClient.subscribe(callTopic, (message) => {
                    console.log("Received on call topic:", message.body);
                    try {
                        const callData = JSON.parse(message.body);

                        // Process call invitations that are intended for this user
                        if ((callData.type === "call_invitation" &&
                                String(callData.receiver.id) === String(userDataActual.tableId)) ||
                            (callData.type === "group_call_invitation" &&
                                callData.receiverIds &&
                                callData.receiverIds.includes(String(userDataActual.tableId)))) {

                            handleIncomingMessage(callData);
                        }
                    } catch (error) {
                        console.error("Error processing call message:", error);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("WebSocket Error:", frame);
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient.connected) {
                stompClient.publish({
                    destination: "/app/status",
                    body: JSON.stringify({
                        userId: userDataActual?.tableId,
                        name: userDataActual?.name,
                        schoolId: userDataActual?.schoolId,
                        session: userDataActual?.session,
                        className: userDataActual?.className,
                        section: userDataActual?.section,
                        usertable: userDataActual.tableName,
                        status: 'offline'
                    }),
                });
            }
            stompClient.deactivate();
        };
    }, [userDataActual]);
    const sendMessage = async () => {
        let fileData = null;

        // Process file if selected
        if (selectedFile) {
            // Convert file to base64
            fileData = await fileToBase64(selectedFile);
        }

        if (input.trim() !== "" && selectedContact) {
            const timestamp = new Date().toISOString();

            // Construct the base message content
            const baseMessageContent = {
                text: input,
                sender: {
                    id: userDataActual.tableId,
                    name: userDataActual.name,
                    schoolId: schoolId,
                    session: session,
                    usertable: userDataActual.tableName,
                    className: userDataActual.className || '',
                    section: userDataActual.section || ''
                },
                timestamp
            };

            // Add file data if present
            if (fileData) {
                baseMessageContent.fileData = {
                    name: selectedFile.name,
                    type: selectedFile.type,
                    size: selectedFile.size,
                    data: fileData
                };
            }

            // Handling group messages
            if (selectedContact.isGroup) {
                const groupMessageContent = {
                    ...baseMessageContent,
                    groupMessage: true,
                    groupId: selectedContact.id,
                    groupName: selectedContact.name,
                    receiverIds: selectedContact.members.map(member => member.id),
                    receiverMembers: selectedContact.members,
                };

                // Add to local UI immediately for responsiveness
                setMessages(prevMessages => [...prevMessages, groupMessageContent]);
                console.log("group message", messages);
                // Update local contacts with the latest message
                addContactFromMessage(groupMessageContent);

                // Send to WebSocket for real-time delivery
                if (client && client.connected) {
                    client.publish({
                        destination: "/app/group-chat",
                        body: JSON.stringify(groupMessageContent),
                    });
                } else {
                    console.error("STOMP client is not connected.");
                }

                // Send via REST API for persistence
                const sendGroupMessageRequest = typeof api === 'string'
                    ? api.post(`/chat${api}/group-messages`, groupMessageContent)
                    : api.post("/chat/group-messages", groupMessageContent);

                await sendGroupMessageRequest
                    .then(() => {
                        setInput("");
                        setSelectedFile(null);
                    })
                    .catch(error => {
                        console.error('Failed to send group message:', error);
                        alert('Failed to send message. Please try again.');
                    });
            }
            // Handling direct messages
            else {
                const directMessageContent = {
                    ...baseMessageContent,
                    receiver: {
                        id: selectedContact.id,
                        name: selectedContact.name,
                        schoolId: schoolId,
                        session: session,
                        usertable: selectedContact.table ?? selectedContact.usertable,
                        className: selectedContact.className || '',
                        section: selectedContact.section || ''
                    }
                };

                // Add to local UI immediately for responsiveness
                setMessages(prevMessages => [...prevMessages, directMessageContent]);

                // Update local contacts
                addContactFromMessage(directMessageContent);

                // Send to WebSocket for real-time delivery
                if (client && client.connected) {
                    client.publish({
                        destination: "/app/chat",
                        body: JSON.stringify(directMessageContent),
                    });
                } else {
                    console.error("STOMP client is not connected.");
                }

                // Send via REST API for persistence
                const sendMessageRequest = typeof api === 'string'
                    ? api.post(`/chat${api}/messages`, directMessageContent)
                    : api.post("/chat/messages", directMessageContent);

                await sendMessageRequest
                    .then(() => {
                        setInput("");
                        setSelectedFile(null);
                        setLoadingMessage(false);
                    })
                    .catch(error => {
                        console.error('Failed to send message:', error);
                        alert('Failed to send message. Please try again.');
                    });
            }
        }
    };
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Extract base64 data without the prefix (e.g., "data:image/jpeg;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    };
    const selectContact = (contact) => {
        if (!contact) return;

        setSelectedContact(contact);

        // Fetch messages based on contact type (group or direct)
        if (contact.isGroup) {
            // Fetch group messages
            const fetchGroupMessagesRequest = typeof api === 'string'
                ? api.get(`/chat${api}/group-messages/${contact.id}`)
                : api.get(`/chat/group-messages/${contact.id}`);

            fetchGroupMessagesRequest
                .then(response => {
                    if (response.data) {
                        setMessages(response.data);
                        setLoadingMessage(false)
                    } else {
                        setMessages([]);
                    }
                })
                .catch(error => {
                    console.error("Error fetching group messages:", error);
                    setMessages([]);
                });
        } else {
            // Fetch direct messages
            const fetchMessagesRequest = typeof api === 'string'
                ? api.get(`/chat/${api}/messages`, {
                    params: {
                        senderId: userDataActual.tableId,
                        senderName: userDataActual.name,
                        senderSchoolId: schoolId,
                        senderSession: session,
                        senderUserTable: userDataActual.tableName,
                        receiverId: contact.id,
                        receiverName: contact.name,
                        receiverSchoolId: schoolId,
                        receiverSession: session,
                        receiverUserTable: contact.table
                    }
                })
                : api.get("/chat/messages", {
                    params: {
                        senderId: userDataActual.tableId,
                        senderName: userDataActual.name,
                        senderSchoolId: schoolId,
                        senderSession: session,
                        senderUserTable: userDataActual.tableName,
                        receiverId: contact.id,
                        receiverName: contact.name,
                        receiverSchoolId: schoolId,
                        receiverSession: session,
                        receiverUserTable: contact.table
                    }
                });

            fetchMessagesRequest
                .then(response => {
                    if (response.data && response.data) {
                        // Filter messages to only show conversation between current user and selected contact
                        const filteredMessages = response.data.filter(msg => {
                            // Ensure all IDs are compared as strings
                            const senderId = String(msg.sender?.id || '');
                            const receiverId = String(msg.receiver?.id || '');
                            const userId = String(userDataActual.tableId);
                            const contactId = String(contact.id);

                            return (senderId === userId && receiverId === contactId) ||
                                (senderId === contactId && receiverId === userId);
                        });

                        setMessages(filteredMessages);
                        setLoadingMessage(false);
                    }
                })
                .catch(error => console.error("Error fetching messages:", error));
        }
    };
    // Message display component that will update when messages state changes
    const MessageDisplay = () => {
        // Filter messages based on contact type
        let filteredMessages = [];

        if (selectedContact.isGroup) {
            // For group chats, show all messages for this group
            filteredMessages = messages.filter(msg => {
                console.log("Checking message:", msg);

                if (!msg) {
                    console.log("Skipping message: msg is null or undefined");
                    return false;
                }

                if (!msg.groupMessage) {
                    console.log(`Skipping message ${msg.id}: Not a group message`);
                    return false;
                }

                if (msg.groupId !== selectedContact.id) {
                    console.log(`Skipping message ${msg.id}: groupId (${msg.groupId}) does not match selectedContact.id (${selectedContact.id})`);
                    return false;
                }

                console.log(`Including message ${msg.id}`);
                return true;
            });

        } else {
            // For direct messages, filter by sender/receiver pairs
            filteredMessages = messages.filter((msg) => {
                if (!msg || !msg.sender || !msg.receiver || !selectedContact) {
                    return false;
                }

                const isReceiverMatch =
                    String(msg.receiver.id) === String(selectedContact.id) &&
                    msg.receiver.name === selectedContact.name &&
                    String(msg.receiver.schoolId) === String(selectedContact.schoolId) &&
                    msg.receiver.session === selectedContact.session &&
                    msg.receiver.className === (selectedContact.className || '') &&
                    msg.receiver.section === (selectedContact.section || '');

                const isSenderMatch =
                    String(msg.sender.id) === String(selectedContact.id) &&
                    msg.sender.name === selectedContact.name &&
                    String(msg.sender.schoolId) === String(selectedContact.schoolId) &&
                    msg.sender.session === selectedContact.session &&
                    msg.sender.className === (selectedContact.className || '') &&
                    msg.sender.section === (selectedContact.section || '');

                return isReceiverMatch || isSenderMatch;
            });
        }

        return (
            <Box>
                {loadingMessage ? (
                    // Show skeletons while loading
                    Array.from({length: 5}).map((_, index) => (
                        <Box key={index}
                             sx={{display: "flex", flexDirection: index % 2 ? "row-reverse" : "row", mb: 1}}>
                            <Box
                                sx={{
                                    padding: 1,
                                    background: index % 2 ? "#e1f5fe" : "#f1f1f1",
                                    borderRadius: 1,
                                    maxWidth: "70%",
                                }}
                            >
                                <Skeleton variant="text" width={100}/>
                                <Skeleton variant="rectangular" width="100%" height={40} sx={{mt: 1}}/>
                            </Box>
                        </Box>
                    ))
                ) : filteredMessages.length > 0 ? (
                    // Show actual messages
                    filteredMessages.map((msg, index) => {
                        if (!msg || !msg.sender || !msg.text) return null;

                        const isSentByUser = String(msg.sender.id) === String(userDataActual.tableId);

                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    flexDirection: isSentByUser ? "row-reverse" : "row",
                                    marginBottom: 1,
                                }}
                            >
                                <Box
                                    sx={{
                                        padding: 1,
                                        background: isSentByUser ? "#e1f5fe" : "#f1f1f1",
                                        borderRadius: 1,
                                        maxWidth: "70%",
                                    }}
                                >
                                    <Typography sx={{fontWeight: "bold", marginBottom: 0.5}}>
                                        {msg.sender.name || "Unknown"}
                                        {msg.isGroupMessage && !isSentByUser && (
                                            <Typography component="span" variant="caption"
                                                        sx={{ml: 1, color: "text.secondary"}}>
                                                (in {msg.groupName})
                                            </Typography>
                                        )}
                                    </Typography>
                                    {msg.text && <Typography sx={{wordBreak: "break-word"}}>{msg.text}</Typography>}
                                    {msg.fileData && (
                                        <Box
                                            sx={{
                                                mt: msg.text ? 1 : 0,
                                                display: "flex",
                                                alignItems: "center",
                                                bgcolor: "rgba(0,0,0,0.05)",
                                                p: 1,
                                                borderRadius: 1,
                                                cursor: "pointer",
                                            }}
                                            onClick={() => downloadFile(msg.fileData)}
                                        >
                                            {getFileIcon(msg.fileData.type)}
                                            <Box sx={{ml: 1, flexGrow: 1}}>
                                                <Typography variant="body2"
                                                            sx={{fontWeight: "bold", wordBreak: "break-word"}}>
                                                    {msg.fileData.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{color: "text.secondary"}}>
                                                    {formatFileSize(msg.fileData.size)}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small">
                                                <DownloadIcon fontSize="small"/>
                                            </IconButton>
                                        </Box>
                                    )}
                                    <Typography variant="caption"
                                                sx={{color: "text.secondary", display: "block", mt: 0.5}}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })
                ) : (
                    // No messages placeholder
                    <Typography sx={{textAlign: "center", color: "text.secondary", mt: 2}}>
                        No messages yet. Start a conversation!
                    </Typography>
                )}
            </Box>);
    };
    const isUserOnline = (contact) => {
        if (!contact) {
            console.log("❌ Contact is null or undefined.");
            return false;
        }
        // Step 2: Iterate over onlineUsers and compare each field
        const result = onlineUsers.some(user => {
            // Step 3: Ensure user is valid (not null or undefined)
            if (!user) {
                console.log("⚠️ Skipping null/undefined user entry.");
                return false;
            }
            const userClassName = user?.className ?? "";
            const contactClassName = contact?.className ?? "";
            const userSection = user?.section ?? "";
            const contactSection = contact?.section ?? "";
            // Step 5: Final comparison result for this user
            const isMatch =
                user?.name === contact?.name &&
                user?.schoolId === contact?.schoolId &&
                user?.session === contact?.session &&
                user?.usertable === contact?.usertable &&
                userClassName === contactClassName &&
                userSection === contactSection;
            return isMatch;
        });
        return result;
    };
    const getBadgeStyles = (contact) => ({
        '& .MuiBadge-badge': {
            backgroundColor: isUserOnline(contact) ? '#44b700' : '#bdbdbd',
            boxShadow: `0 0 0 2px white`,
            '&::after': {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                animation: isUserOnline(contact) ? 'ripple 1.2s infinite ease-in-out' : 'none',
                border: '1px solid currentColor',
                content: '""',
            },
        },
        '@keyframes ripple': {
            '0%': {transform: 'scale(.8)', opacity: 1},
            '100%': {transform: 'scale(2.4)', opacity: 0},
        },
    });


    {/*  Video Call Code and audio  */
    }
    const [isMinimized, setIsMinimized] = useState(false);
    const [userId, setUserId] = useState('');
    const [targetUserId, setTargetUserId] = useState('');
    const [incomingCall, setIncomingCall] = useState(false);
    const [callInProgress, setCallInProgress] = useState(false);
    const [callerId, setCallerId] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');
    const [lastError, setLastError] = useState('');
    const [pendingCandidates, setPendingCandidates] = useState([]);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const stompClientRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const remoteStreamRef = useRef(null);
// Add these state variables to your existing state declarations
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const screenStreamRef = useRef(null);
// Function to toggle screen sharing

    useEffect(() => {
        const registerUser = async () => {
            const userTable = userDataActual.tableName ? userDataActual.tableName.toLowerCase() : "NAN";
            const className = userDataActual.className ? userDataActual.className : "NAN";
            const section = userDataActual.section ? userDataActual.section : "NAN";
            const topic = `/topic/webrtc/${userDataActual.tableId}_${userDataActual.name}_${className}_${section}_${schoolId}_${session}_${userTable}`;
            setUserId(topic);

            try {
                // Pass topic as userId in the request body
                const response = await api.post('/api/register', {userId: topic});

                if (response.status === 200) {
                    console.log('Successfully registered with ID:', topic);
                    setRegisteredId(topic);
                    setConnectionStatus('Registering...');

                    // Setup local video stream
                    setupLocalVideoStream();
                } else {
                    const error = await response.text();
                    alert(`Registration failed: ${error}`);
                }
            } catch (error) {
                console.error('Error registering user:', error);
                alert('Error registering user. Please check console for details.');
            }
        };


        registerUser();


        // Optional cleanup function
        return () => {
            // Any cleanup code if needed
        };
    }, [targetUserId, selectedContact]);

    const toggleScreenSharing = async () => {
        try {
            const pc = peerConnectionRef.current;
            if (!pc) {
                console.error('No peer connection available');
                setLastError('Cannot share screen: No active call');
                return;
            }

            if (isScreenSharing) {
                // Stop screen sharing, revert to camera
                console.log('Stopping screen sharing');

                // Stop all tracks from the screen sharing stream
                if (screenStreamRef.current) {
                    screenStreamRef.current.getTracks().forEach(track => {
                        track.stop();
                    });
                    screenStreamRef.current = null;
                }

                // Replace the screen share tracks with camera tracks
                if (localStreamRef.current) {
                    const senders = pc.getSenders();
                    const videoSender = senders.find(sender =>
                        sender.track && sender.track.kind === 'video');

                    if (videoSender) {
                        // Get the video track from local stream
                        const videoTrack = localStreamRef.current.getVideoTracks()[0];
                        if (videoTrack) {
                            await videoSender.replaceTrack(videoTrack);
                        }
                    }

                    // Update local video display
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = localStreamRef.current;
                    }
                }

                setIsScreenSharing(false);
            } else {
                // Start screen sharing
                console.log('Starting screen sharing');
                try {
                    // Get screen sharing stream
                    const screenStream = await navigator.mediaDevices.getDisplayMedia({
                        video: {
                            cursor: 'always'
                        },
                        audio: false
                    });

                    screenStreamRef.current = screenStream;

                    // Replace camera video track with screen sharing track
                    const senders = pc.getSenders();
                    const videoSender = senders.find(sender =>
                        sender.track && sender.track.kind === 'video');

                    if (videoSender && screenStream.getVideoTracks().length > 0) {
                        const screenTrack = screenStream.getVideoTracks()[0];
                        await videoSender.replaceTrack(screenTrack);

                        // Handle when user stops screen sharing via the browser UI
                        screenTrack.onended = () => {
                            toggleScreenSharing();
                        };
                    }

                    // Update local video display to show screen
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = screenStream;
                    }

                    setIsScreenSharing(true);
                } catch (error) {
                    console.error('Error starting screen sharing:', error);
                    setLastError('Failed to start screen sharing: ' + error.message);
                }
            }
        } catch (error) {
            console.error('Error toggling screen share:', error);
            setLastError('Screen sharing error: ' + error.message);
        }
    };

// Function to toggle audio mute
    const toggleAudioMute = () => {
        if (localStreamRef.current) {
            const audioTracks = localStreamRef.current.getAudioTracks();

            audioTracks.forEach(track => {
                track.enabled = isAudioMuted;
                console.log(`Audio track ${track.id} ${isAudioMuted ? 'unmuted' : 'muted'}`);
            });

            setIsAudioMuted(!isAudioMuted);
        } else {
            console.warn('No local stream available to mute audio');
        }
    };

// Function to toggle video mute
    const toggleVideoMute = () => {
        if (localStreamRef.current) {
            const videoTracks = localStreamRef.current.getVideoTracks();

            videoTracks.forEach(track => {
                track.enabled = isVideoMuted;
                console.log(`Video track ${track.id} ${isVideoMuted ? 'unmuted' : 'muted'}`);
            });

            setIsVideoMuted(!isVideoMuted);
        } else {
            console.warn('No local stream available to mute video');
        }
    };
    // ICE servers configuration for WebRTC - with more STUN servers for reliability
    const iceServers = {
        iceServers: [
            {urls: 'stun:stun.l.google.com:19302'},
            {urls: 'stun:stun1.l.google.com:19302'},
            {urls: 'stun:stun2.l.google.com:19302'},
            {urls: 'stun:stun3.l.google.com:19302'},
            {urls: 'stun:stun4.l.google.com:19302'},
            // Add free TURN servers (replace with your own in production)
            /*          {
                          urls: 'turn:openrelay.metered.ca:80',
                          username: 'openrelayproject',
                          credential: 'openrelayproject'
                      },
                      {
                          urls: 'turn:openrelay.metered.ca:443',
                          username: 'openrelayproject',
                          credential: 'openrelayproject'
                      },
                      {
                          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                          username: 'openrelayproject',
                          credential: 'openrelayproject'
                      }*/
        ],
        iceCandidatePoolSize: 10 // Pre-gather ICE candidates
    };

    // Dedicated function to handle updating the video element
    // Modified updateRemoteVideo function to fix the timing issue
    const updateRemoteVideo = (stream) => {
        if (!remoteVideoRef.current) return;

        console.log('Updating remote video element with stream:', stream.id);

        try {
            // Safety check - detach any existing streams first
            if (remoteVideoRef.current.srcObject) {
                console.log('Removing old stream from video element');
                remoteVideoRef.current.srcObject = null;
            }

            // Ensure all tracks are enabled
            stream.getTracks().forEach(track => {
                track.enabled = true;
                console.log(`Ensuring track is enabled: ${track.kind} (${track.id})`);
            });

            // Force stream to refresh by cloning it
            const clonedStream = new MediaStream();
            stream.getTracks().forEach(track => {
                console.log(`Adding track to cloned stream: ${track.kind} (${track.id})`);
                clonedStream.addTrack(track);
            });

            // Apply the stream to the video element
            remoteVideoRef.current.srcObject = clonedStream;
            remoteVideoRef.current.muted = false;

            // Force play with improved retry mechanism
            const tryPlay = (attempts = 0) => {
                console.log(`Attempt ${attempts + 1} to play video`);

                // Make sure we're accessing the DOM in a safe way
                if (!remoteVideoRef.current) return;

                // First make sure that the video element is properly loaded and ready
                remoteVideoRef.current.load();

                // Then attempt to play
                const playPromise = remoteVideoRef.current.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Video playback started successfully');
                    }).catch(error => {
                        console.error('Error playing video:', error);

                        if (attempts < 5) {  // Increased retry attempts
                            // Try again with increasing delay
                            setTimeout(() => tryPlay(attempts + 1), 500 * (attempts + 1));
                        } else if (error.name === 'NotAllowedError') {
                            // If autoplay was blocked after retries, try muted playback
                            console.log('Autoplay blocked, trying muted playback');
                            remoteVideoRef.current.muted = true;
                            remoteVideoRef.current.play().then(() => {
                                console.log('Muted playback successful');
                                setLastError('Audio muted due to browser autoplay policy. Click screen to unmute.');

                                // Allow unmuting with click
                                const unmute = () => {
                                    remoteVideoRef.current.muted = false;
                                    document.removeEventListener('click', unmute);
                                    setLastError('');
                                };
                                document.addEventListener('click', unmute);
                            }).catch(e => console.error('Even muted playback failed:', e));
                        }
                    });
                }
            };

            // Try to play after a brief delay to ensure the video element is ready
            setTimeout(() => tryPlay(), 200);
        } catch (err) {
            console.error('Error in updateRemoteVideo:', err);
            setLastError('Error updating video: ' + err.message);
        }
    };
    // Initialize WebSocket connection
    useEffect(() => {
        if (!registeredId) return;
        const socket = new SockJS(baseURL + '/ws?userId=' + registeredId);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        client.onConnect = () => {
            console.log('Connected to WebSocket');
            setConnectionStatus('Connected');
            client.subscribe(`/topic/${registeredId}/queue/messages`, message => {
                try {
                    const payload = JSON.parse(message.body);
                    console.log("Received message: private topic", payload);
                    handleSignalingData(payload);
                } catch (error) {
                    console.error("Error parsing message:", error);
                }
            });
            client.subscribe(`/topic/messages`, message => {
                console.log("Received message:", message.body);
            });
            client.subscribe(`/user/queue/errors`, message => {
                console.error("Error received:", message.body);
                setLastError(message.body);
            });
        };
        client.onStompError = (frame) => {
            console.error('STOMP Error:', frame);
            setConnectionStatus('Error: ' + frame.headers.message);
        };
        client.onWebSocketClose = () => {
            console.log('WebSocket connection closed');
            setConnectionStatus('Disconnected');
        };

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (client && client.active) {
                client.deactivate();
            }
        };
    }, [registeredId]);

    // Register user ID with the server
    const registerUser = async () => {
        if (!userId || userId.trim() === '') {
            alert('Please enter a valid user ID');
            return;
        }

        try {
            const response = await api.post('/api/register', {userId});

            if (response.status === 200) {
                console.log('Successfully registered with ID:', userId);
                setRegisteredId(userId);
                setConnectionStatus('Registering...');

                // Setup local video stream
                setupLocalVideoStream();
            } else {
                const error = await response.text();
                alert(`Registration failed: ${error}`);
            }
        } catch (error) {
            console.error('Error registering user:', error);
            alert('Error registering user. Please check console for details.');
        }
    };

    // Setup local video stream
    const setupLocalVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: {ideal: 1280},
                    height: {ideal: 720}
                },
                audio: true
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            localStreamRef.current = stream;
            console.log('Local stream set up successfully');
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('Failed to access camera and microphone: ' + error.message);
        }
    };

    // Initialize WebRTC connection - FIX: Ensure we close any existing connection first
    const initializePeerConnection = (destination) => {
        console.log('Initializing peer connection with destination:', destination);

        // First, properly close any existing connection
        if (peerConnectionRef.current) {
            console.log('Closing existing peer connection before creating a new one');
            // Clear any existing interval
            if (peerConnectionRef.current.streamCheckInterval) {
                clearInterval(peerConnectionRef.current.streamCheckInterval);
                peerConnectionRef.current.streamCheckInterval = null;
            }

            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Store the current call destination
        if (destination) {
            pc.currentCallTarget = destination;
        }

        // Add local stream to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
                console.log('Added track to peer connection:', track.kind);
            });
        } else {
            console.warn('No local stream available');
        }

        // Handle ICE candidates
        pc.onicecandidate = event => {
            if (event.candidate) {
                console.log('New ICE candidate:', event.candidate);

                // Use the stored target ID directly from the peer connection
                const currentTarget = pc.currentCallTarget || (callInProgress ?
                    (callerId || targetUserId) :
                    targetUserId);

                // Only send if we have a valid target
                if (currentTarget && currentTarget.trim() !== '') {
                    sendSignalingData({
                        type: 'ICE_CANDIDATE',
                        candidate: event.candidate,
                        targetUserId: currentTarget
                    });
                } else {
                    console.warn('Cannot send ICE candidate: No valid target user ID');
                    setLastError('Cannot send ICE candidate: No valid target user ID');
                }
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
            // Log more detailed connection state information for debugging
            console.log('Connection states - ICE:', pc.iceConnectionState,
                'Gathering:', pc.iceGatheringState,
                'Signaling:', pc.signalingState);

            if (pc.iceConnectionState === 'failed') {
                console.log('ICE connection failed, attempting restart...');
                pc.restartIce();
            }
        };

        // Completely rewritten ontrack handler for more reliable video display
        pc.ontrack = event => {
            console.log('Track received:', event.track.kind, event.track.id);
            console.log(`Track details - ID: ${event.track.id}, Kind: ${event.track.kind}, Enabled: ${event.track.enabled}, Muted: ${event.track.muted}, ReadyState: ${event.track.readyState}`);

            if (event.streams && event.streams[0]) {
                const stream = event.streams[0];
                console.log(`Remote stream received: ID=${stream.id}, tracks=${stream.getTracks().length}`);

                // Ensure video tracks are enabled and unmuted
                stream.getTracks().forEach(track => {
                    console.log(`Stream contains track: ${track.kind} (${track.id}), enabled: ${track.enabled}, muted: ${track.muted}`);
                    track.enabled = true;
                    if (track.kind === 'video' && track.muted) {
                        console.log('Attempting to unmute video track');
                    }
                });

                // Store the stream reference
                remoteStreamRef.current = stream;

                // Set up track-specific listeners
                event.track.onunmute = () => {
                    console.log(`Track unmuted: ${event.track.kind}`);
                    if (remoteStreamRef.current) {
                        console.log('Track unmuted, updating video display');
                        updateRemoteVideo(remoteStreamRef.current);
                    }
                };

                // Immediately update the remote video with a slight delay to ensure readiness
                setTimeout(() => {
                    updateRemoteVideo(stream);
                }, 100);

                // Set up periodic checks to ensure video is playing
                if (pc.streamCheckInterval) {
                    clearInterval(pc.streamCheckInterval);
                }

                pc.streamCheckInterval = setInterval(() => {
                    if (remoteVideoRef.current && remoteStreamRef.current) {
                        if (remoteVideoRef.current.paused ||
                            !remoteVideoRef.current.srcObject ||
                            remoteVideoRef.current.readyState === 0) {
                            console.log('Video not playing, reconnecting stream');
                            updateRemoteVideo(remoteStreamRef.current);
                        }
                    }
                }, 3000);
            }
        };

        // Enhanced connection state monitoring
        pc.onconnectionstatechange = () => {
            console.log('Connection state changed:', pc.connectionState);
            setConnectionStatus(`WebRTC: ${pc.connectionState}`);

            if (pc.connectionState === 'connected') {
                console.log('Peer connection successfully established!');

                // Once connected, check again to make sure video is playing
                setTimeout(() => {
                    if (remoteVideoRef.current && (!remoteVideoRef.current.srcObject || remoteVideoRef.current.paused) && remoteStreamRef.current) {
                        console.log('Connected but video not showing, reconnecting stream');
                        updateRemoteVideo(remoteStreamRef.current);
                    }
                }, 1000);
            } else if (pc.connectionState === 'failed') {
                console.error('Peer connection failed');
                setLastError('Connection failed. Attempting auto-recovery...');

                // More aggressive recovery
                setTimeout(() => diagnoseAndRecoverConnection(), 1000);
            } else if (pc.connectionState === 'disconnected') {
                console.warn('Peer connection disconnected, attempting to recover');

                // Wait briefly to see if it reconnects on its own
                setTimeout(() => {
                    if (pc.connectionState === 'disconnected') {
                        pc.restartIce();
                    }
                }, 2000);
            }
        };

        return pc;
    };

    // Send signaling data to the server
    const sendSignalingData = (data) => {
        if (stompClientRef.current && stompClientRef.current.connected) {
            console.log('Sending signal:', data);
            stompClientRef.current.publish({
                destination: '/app/signal',
                body: JSON.stringify({
                    ...data,
                    senderUserId: registeredId
                })
            });
        } else {
            console.error('WebSocket connection not established. Cannot send:', data);
            setLastError('WebSocket connection not established');
        }
    };

    const diagnoseAndRecoverConnection = async () => {
        console.log('Diagnosing WebRTC connection issues...');

        const pc = peerConnectionRef.current;
        if (!pc) {
            console.log('No peer connection to diagnose');
            return;
        }

        // Log complete connection state
        console.log('Connection state diagnosis:');
        console.log('- Signaling state:', pc.signalingState);
        console.log('- ICE connection state:', pc.iceConnectionState);
        console.log('- ICE gathering state:', pc.iceGatheringState);
        console.log('- Connection state:', pc.connectionState);

        // Check remote stream status
        if (remoteStreamRef.current) {
            console.log('Remote stream exists with tracks:', remoteStreamRef.current.getTracks().length);
            remoteStreamRef.current.getTracks().forEach(track => {
                console.log(`Track: ${track.kind}, enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);

                // Ensure tracks are enabled
                if (!track.enabled) {
                    console.log(`Enabling disabled ${track.kind} track`);
                    track.enabled = true;
                }
            });
        } else {
            console.log('No remote stream available');
        }

        // Check video element status
        if (remoteVideoRef.current) {
            console.log('Video element status:');
            console.log('- Has srcObject:', remoteVideoRef.current.srcObject ? 'Yes' : 'No');
            console.log('- ReadyState:', remoteVideoRef.current.readyState);
            console.log('- Paused:', remoteVideoRef.current.paused);
            console.log('- Seeking:', remoteVideoRef.current.seeking);
            console.log('- Duration:', remoteVideoRef.current.duration);
            console.log('- Network state:', remoteVideoRef.current.networkState);
        }

        // Connection recovery attempts based on diagnosis
        try {
            // 1. Try ICE restart if connection is failed/disconnected
            if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
                console.log('Attempting ICE restart...');

                pc.restartIce();

                // Only create a new offer if we're in a stable state
                if (pc.signalingState === 'stable') {
                    console.log('Creating new offer after ICE restart...');
                    const offer = await pc.createOffer({iceRestart: true});
                    await pc.setLocalDescription(offer);

                    // Send the new offer to the peer
                    sendSignalingData({
                        type: 'OFFER',
                        offer: pc.localDescription,
                        targetUserId: pc.currentCallTarget
                    });
                }
            }

            // 2. For 'new' state that's stuck, try to initialize the connection properly
            if (pc.iceConnectionState === 'new' && pc.connectionState === 'new') {
                console.log('Connection appears to be stuck in new state');

                if (pc.signalingState === 'stable' && pc.currentCallTarget) {
                    console.log('Creating initial offer...');
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    sendSignalingData({
                        type: 'OFFER',
                        offer: pc.localDescription,
                        targetUserId: pc.currentCallTarget
                    });
                }
            }

            // 3. Re-apply any pending ICE candidates
            if (pendingCandidates.length > 0) {
                console.log('Re-applying pending ICE candidates:', pendingCandidates.length);
                await applyPendingCandidates();
            }

            // 4. Try to reconnect video if connection appears ok but video isn't showing
            if ((pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed' ||
                    pc.iceConnectionState === 'checking') && remoteStreamRef.current &&
                (!remoteVideoRef.current.srcObject || remoteVideoRef.current.paused)) {

                console.log('Connection seems OK but video not showing, reconnecting stream...');
                updateRemoteVideo(remoteStreamRef.current);
            }
        } catch (err) {
            console.error('Error in recovery attempts:', err);
            setLastError('Recovery attempt failed: ' + err.message);
        }

        // Final fallback: If everything else failed, try a complete renegotiation
        if (pc.iceConnectionState === 'failed' && pc.connectionState === 'failed') {
            console.log('Connection completely failed, attempting full renegotiation');

            // Recreate the peer connection from scratch
            resetCall();

            // Wait a moment before reestablishing
            setTimeout(() => {
                if (pc.currentCallTarget) {
                    const target = pc.currentCallTarget;
                    initializePeerConnection(target);

                    // Start a new call after brief delay
                    setTimeout(() => {
                        console.log('Reinitiating call to', target);
                        setTargetUserId(target);
                        startCall();
                    }, 1000);
                }
            }, 2000);
        }
    };

    // Apply pending ICE candidates
    const applyPendingCandidates = async () => {
        const pc = peerConnectionRef.current;
        if (pc && pc.remoteDescription && pendingCandidates.length > 0) {
            console.log('Applying stored ICE candidates:', pendingCandidates.length);

            const promises = pendingCandidates.map(async (candidateData) => {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidateData));
                    console.log('Applied stored ICE candidate successfully');
                    return true;
                } catch (err) {
                    console.error('Error applying stored candidate:', err);
                    return false;
                }
            });

            await Promise.all(promises);
            setPendingCandidates([]);
        }
    };

    // Handle incoming signaling data
    const handleSignalingData = async (data) => {
        const {type, senderUserId} = data;
        console.log('Handling signal:', type, 'from', senderUserId);

        if (data.errorMessage) {
            setLastError(data.errorMessage);
            alert('Error: ' + data.errorMessage);
            return;
        }

        switch (type) {
            case 'CALL_REQUEST':
                console.log('Received call request from:', senderUserId);
                setIncomingCall(true);
                setCallerId(senderUserId);
                break;

            case 'CALL_ACCEPTED':
                console.log('Call accepted by:', senderUserId);
                // Create and send offer if call is accepted
                let pc = initializePeerConnection(senderUserId);

                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    console.log('Created offer:', offer);

                    sendSignalingData({
                        type: 'OFFER',
                        offer: pc.localDescription,
                        targetUserId: senderUserId
                    });

                    setCallInProgress(true);
                } catch (error) {
                    console.error('Error creating offer:', error);
                    setLastError('Error creating offer: ' + error.message);
                }
                break;

            case 'OFFER':
                console.log('Received offer from:', senderUserId);
                // Initialize peer connection with sender as target and set remote description
                const peerConn = initializePeerConnection(senderUserId);

                try {
                    await peerConn.setRemoteDescription(new RTCSessionDescription(data.offer));
                    console.log('Set remote description from offer');
                    await applyPendingCandidates();
                    const answer = await peerConn.createAnswer();
                    await peerConn.setLocalDescription(answer);
                    console.log('Created answer:', answer);

                    sendSignalingData({
                        type: 'ANSWER',
                        answer: peerConn.localDescription,
                        targetUserId: senderUserId
                    });

                    setCallInProgress(true);
                } catch (error) {
                    console.error('Error handling offer:', error);
                    setLastError('Error handling offer: ' + error.message);
                }
                break;

            case 'ANSWER':
                console.log('Received answer from:', senderUserId);
                try {
                    const pc = peerConnectionRef.current;
                    if (pc) {
                        // Check the signaling state before applying the remote description
                        if (pc.signalingState === 'have-local-offer') {
                            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                            console.log('Set remote description from answer');

                            // Apply any pending ICE candidates
                            await applyPendingCandidates();

                            // Force a check of the video stream connection
                            setTimeout(() => {
                                if (remoteStreamRef.current && !remoteVideoRef.current.srcObject) {
                                    console.log('Reconnecting remote stream after answer processing');
                                    updateRemoteVideo(remoteStreamRef.current);
                                }
                            }, 1000);
                        } else {
                            console.warn(`Cannot set remote description in signaling state: ${pc.signalingState}`);
                            setLastError(`Invalid signaling state for answer: ${pc.signalingState}`);

                            // If peer connection is in stable state, we might need to recreate the offer
                            if (pc.signalingState === 'stable') {
                                console.log('Connection in stable state, recreating offer...');
                                try {
                                    const offer = await pc.createOffer();
                                    await pc.setLocalDescription(offer);

                                    sendSignalingData({
                                        type: 'OFFER',
                                        offer: pc.localDescription,
                                        targetUserId: senderUserId
                                    });
                                } catch (e) {
                                    console.error('Error recreating offer:', e);
                                }
                            }
                        }
                    } else {
                        console.error('No peer connection established');
                        setLastError('No peer connection established');
                    }
                } catch (error) {
                    console.error('Error setting remote description:', error);
                    setLastError('Error setting remote description: ' + error.message);
                }
                break;

            case 'CALL_REJECTED':
                console.log('Call rejected by:', senderUserId);
                alert(`Call rejected by ${senderUserId}`);
                resetCall();
                break;

            case 'ICE_CANDIDATE':
                console.log('Received ICE candidate from:', senderUserId);
                try {
                    const candidate = new RTCIceCandidate(data.candidate);

                    // If we don't have a peer connection yet, create one
                    let pc = peerConnectionRef.current;
                    if (!pc) {
                        console.log('Creating new peer connection for ICE candidate');
                        pc = initializePeerConnection(senderUserId);
                    }

                    if (pc.remoteDescription) {
                        console.log('Adding ICE candidate immediately');
                        await pc.addIceCandidate(candidate);
                    } else {
                        console.log('Storing ICE candidate for later');
                        setPendingCandidates(prev => [...prev, data.candidate]);
                    }
                } catch (error) {
                    console.error('Error handling ICE candidate:', error);
                    setLastError('Error handling ICE candidate: ' + error.message);
                }
                break;

            case 'HANG_UP':
                console.log('Call ended by:', senderUserId);
                alert(`Call ended by ${senderUserId}`);
                resetCall();
                break;

            default:
                console.log('Unknown signal type:', type);
        }
    };

    // Initiate a call to another user
    const startCall = () => {
        if (!targetUserId || targetUserId.trim() === '') {
            alert('Please enter a target user ID');
            return;
        }

        console.log('Initiating call to:', targetUserId);
        sendSignalingData({
            type: 'CALL_REQUEST',
            targetUserId: targetUserId
        });
    };

    // Accept incoming call
    const acceptCall = () => {
        console.log('Accepting call from:', callerId);
        setIncomingCall(false);
        setCallInProgress(true);
        setTargetUserId(callerId);

        // Initialize peer connection with the caller ID
        initializePeerConnection(callerId);

        // Then send the acceptance
        sendSignalingData({
            type: 'CALL_ACCEPTED',
            targetUserId: callerId
        });
        //opening a modal for call interation
        setCallModalOpen(true);
    };

    // Reject incoming call
    const rejectCall = () => {
        console.log('Rejecting call from:', callerId);
        setIncomingCall(false);

        sendSignalingData({
            type: 'CALL_REJECTED',
            targetUserId: callerId
        });

        setCallerId('');
    };

    // End the current call
    const endCall = () => {
        const currentTarget = callInProgress ? (callerId || targetUserId) : targetUserId;
        console.log('Ending call with:', currentTarget);

        sendSignalingData({
            type: 'HANG_UP',
            targetUserId: currentTarget
        });
        handleCloseCall();
        resetCall();
    };

    // Improved reset call state function
    const resetCall = () => {
        console.log('Resetting call state');
        setCallInProgress(false);
        setIncomingCall(false);
        setCallerId('');

        // Clear any stream check intervals
        if (peerConnectionRef.current && peerConnectionRef.current.streamCheckInterval) {
            clearInterval(peerConnectionRef.current.streamCheckInterval);
            peerConnectionRef.current.streamCheckInterval = null;
        }

        // Stop all tracks from the remote stream
        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`Stopped remote track: ${track.kind}`);
            });
            remoteStreamRef.current = null;
        }

        // Clean up and close the peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Clear the remote video element
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        // Reset state
        setPendingCandidates([]);
    };

    // Force refresh remote video stream
    const forceRefreshRemoteVideo = () => {
        if (remoteStreamRef.current) {
            console.log('Forcing video refresh');
            updateRemoteVideo(remoteStreamRef.current);
        } else {
            console.log('No remote stream to refresh');
            setLastError('No remote stream available');
        }
    };

    // Clean up when component unmounts
    useEffect(() => {
        return () => {
            // Clean up any existing peer connection
            if (peerConnectionRef.current) {
                // Clear any interval
                if (peerConnectionRef.current.streamCheckInterval) {
                    clearInterval(peerConnectionRef.current.streamCheckInterval);
                    peerConnectionRef.current.streamCheckInterval = null;
                }

                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }

            // Stop all tracks from local stream
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log(`Stopped local track: ${track.kind}`);
                });
                localStreamRef.current = null;
            }

            // Stop all tracks from remote stream
            if (remoteStreamRef.current) {
                remoteStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log(`Stopped remote track: ${track.kind}`);
                });
                remoteStreamRef.current = null;
            }

            // Close WebSocket connection
            if (stompClientRef.current && stompClientRef.current.active) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
            }

            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log(`Stopped screen sharing track: ${track.kind}`);
                });
                screenStreamRef.current = null;
            }
        };
    }, []);
    return (
        <Container maxWidth={true} sx={{height: "87vh", display: "flex", flexDirection: "column"}}>
            <Box sx={{display: "flex", height: "100%", border: "1px solid #e0e0e0", borderRadius: 1}}>
                {/* Contacts sidebar */}
                <Box
                    sx={{
                        width: 300,
                        borderRight: "1px solid #e0e0e0",
                        overflow: "auto",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Box sx={{p: 2, display: "flex", justifyContent: "space-between"}}>
                        <Typography variant="h6">Contacts</Typography>
                        <Box>
                            <IconButton onClick={() => setDialogOpen(true)} title="New Chat">
                                <PersonIcon/>
                            </IconButton>
                            <IconButton onClick={() => setGroupDialogOpen(true)} title="New Group">
                                <GroupIcon/>
                            </IconButton>
                        </Box>
                    </Box>

                    <List sx={{flexGrow: 1, overflow: "auto"}}>
                        {loading
                            ? // Show Skeletons while loading
                            Array.from({length: 5}).map((_, index) => (
                                <ListItem key={index} sx={{borderBottom: "1px solid #f0f0f0"}}>
                                    <ListItemAvatar>
                                        <Skeleton variant="circular" width={40} height={40}/>
                                    </ListItemAvatar>
                                    <ListItemText primary={<Skeleton width="60%"/>}
                                                  secondary={<Skeleton width="80%"/>}/>
                                </ListItem>
                            ))
                            : contacts.length > 0
                                ? // Show Contacts if available
                                contacts.map((contact, index) => (
                                    <ListItem
                                        key={contact.id || index}
                                        button
                                        selected={selectedContact && selectedContact.id === contact.id}
                                        onClick={() => selectContact(contact)}
                                        sx={{
                                            borderBottom: "1px solid #f0f0f0",
                                            "&.Mui-selected": {backgroundColor: "#e3f2fd"},
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge overlap="circular"
                                                   anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                                   variant="dot" sx={getBadgeStyles(contact)}>
                                                {contact.isGroup ? (
                                                    <Avatar sx={{bgcolor: "#9c27b0"}}>
                                                        <GroupIcon/>
                                                    </Avatar>
                                                ) : (
                                                    <Avatar sx={{bgcolor: "#1976d2"}}>{contact.avatar}</Avatar>
                                                )}
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                                    <Typography sx={{fontWeight: "bold"}}>{contact.name}</Typography>
                                                    {contact.timestamp && (
                                                        <Typography variant="caption" sx={{color: "text.secondary"}}>
                                                            {new Date(contact.timestamp).toLocaleDateString()}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    {contact.lastMessage && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                whiteSpace: "nowrap",
                                                                maxWidth: "180px",
                                                            }}
                                                        >
                                                            {contact.lastMessage}
                                                        </Typography>
                                                    )}
                                                    <Typography variant="caption" sx={{color: "text.secondary"}}>
                                                        {contact.usertable}
                                                        {contact.className && ` ${contact.className}`}
                                                        {contact.section && ` ${contact.section}`}
                                                    </Typography>
                                                    {!contact.isGroup && (
                                                        <Typography variant="caption" sx={{
                                                            color: isUserOnline(contact) ? '#44b700' : '#bdbdbd',
                                                            ml: 1
                                                        }}>
                                                            {isUserOnline(contact) ? 'online' : 'offline'}
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))
                                : // Show "No Contacts" Message if list is empty
                                !loading && (
                                    <ListItem>
                                        <ListItemText primary="No contacts available"
                                                      sx={{textAlign: "center", color: "text.secondary"}}/>
                                    </ListItem>
                                )}
                    </List>
                </Box>
                {/* Incoming Call Dialog */}
                <Dialog
                    open={incomingCall}
                    TransitionComponent={Transition}
                    keepMounted
                >
                    <DialogTitle>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Call sx={{mr: 1, color: 'primary.main'}}/>
                            Incoming Call
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            {`${callerId} is calling you`}
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{justifyContent: 'center', pb: 2}}>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle/>}
                            onClick={acceptCall}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Cancel/>}
                            onClick={rejectCall}
                        >
                            Decline
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Video Call Dialog */}
                <Dialog
                    open={callModalOpen}
                    onClose={endCall}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        style: {
                            backgroundColor: '#121218',
                            color: 'white',
                            height: isMinimized ? '120px' : '90vh',
                            maxHeight: isMinimized ? '120px' : '90vh',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.22)'
                        }
                    }}
                    disableEscapeKeyDown
                >
                    <DialogContent sx={{
                        p: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%'
                    }}>
                        {/* Sleek header with gradient accent */}
                        <Box sx={{
                            background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <Typography variant="subtitle1" sx={{
                                fontWeight: 600,
                                ml: 1,
                                fontSize: '1.1rem',
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Videocam fontSize="small"/> Video/Audio Call
                            </Typography>
                            <Box sx={{display: 'flex', gap: 1}}>
                                <Chip
                                    label={connectionStatus}
                                    color={connectionStatus === "Connected" ? "success" : connectionStatus === "Online" ? "primary" : "default"}
                                    size="small"
                                    sx={{
                                        mr: 2,
                                        '& .MuiChip-label': {
                                            fontWeight: 500
                                        },
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }}
                                />
                                {registeredId && (
                                    <Chip
                                        label={`User: ${registeredId}`}
                                        variant="outlined"
                                        color="secondary"
                                        size="small"
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            '& .MuiChip-label': {
                                                fontWeight: 500
                                            }
                                        }}
                                    />
                                )}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Call/>}
                                    onClick={startCall}
                                    sx={{
                                        background: 'linear-gradient(45deg, #43a047 30%, #66bb6a 90%)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                                        }
                                    }}
                                >
                                    Call
                                </Button>
                                <IconButton
                                    size="small"
                                    onClick={() => setIsMinimized(prev => !prev)}
                                    sx={{
                                        color: 'white',
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(5px)',
                                        '&:hover': {
                                            background: 'rgba(255,255,255,0.2)'
                                        }
                                    }}
                                >
                                    {isMinimized ? <Fullscreen fontSize="small"/> : <FullscreenExit fontSize="small"/>}
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={endCall}
                                    sx={{
                                        color: 'white',
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(5px)',
                                        '&:hover': {
                                            background: 'rgba(255,0,0,0.2)'
                                        }
                                    }}
                                >
                                    <Close fontSize="small"/>
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Main container with sleek dark theme */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            bgcolor: '#1a1c23',
                            visibility: isMinimized ? 'hidden' : 'visible',
                            overflow: isMinimized ? 'hidden' : 'visible',
                        }}>
                            {/* Main Content - Fixed with proper flex */}
                            <Box sx={{
                                flexGrow: 1,
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'auto',
                                height: 'calc(100% - 64px - 68px)',
                                background: 'linear-gradient(to bottom, #1a1c23 0%, #131419 100%)'
                            }}>
                                {/* Error Display */}
                                {lastError && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            mb: 2,
                                            p: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            bgcolor: 'rgba(220, 38, 38, 0.1)',
                                            border: '1px solid rgba(220, 38, 38, 0.3)',
                                            color: '#ef5350',
                                            borderRadius: '8px',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                    >
                                        <Warning color="error" sx={{mr: 1}}/>
                                        <Typography variant="body2">{lastError}</Typography>
                                    </Paper>
                                )}

                                {/* Video Container - Modern layout with shadows */}
                                <Box sx={{
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: {xs: 'column', md: 'row'},
                                    gap: 3,
                                    height: {xs: 'auto', md: 'calc(100% - 70px)'},
                                    minHeight: {xs: '400px', md: '0'}
                                }}>
                                    {/* Local Video */}
                                    <Card sx={{
                                        flex: {xs: '1 1 auto', md: '0 0 30%'},
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                        bgcolor: '#0a0a0a',
                                        minHeight: {xs: '200px', md: '100%'},
                                        height: {xs: '200px', md: 'auto'},
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-5px)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.5)'
                                        }
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            zIndex: 2,
                                            background: 'rgba(0,0,0,0.4)',
                                            backdropFilter: 'blur(4px)',
                                            borderRadius: '8px',
                                            padding: '2px'
                                        }}>
                                            <Chip
                                                label="You"
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    opacity: 0.9,
                                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                            background: 'radial-gradient(circle, #1e2130 0%, #0a0a0a 100%)'
                                        }}>
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                muted
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: isVideoMuted ? 'none' : 'block',
                                                    transition: 'opacity 0.3s ease'
                                                }}
                                            />
                                            {isVideoMuted && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    animation: 'pulse 2s infinite ease-in-out',
                                                    '@keyframes pulse': {
                                                        '0%': {opacity: 0.6},
                                                        '50%': {opacity: 1},
                                                        '100%': {opacity: 0.6}
                                                    }
                                                }}>
                                                    <VideocamOff sx={{fontSize: 40, mb: 1}}/>
                                                    <Typography variant="body2" sx={{fontWeight: 500}}>Camera
                                                        Off</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Card>

                                    {/* Remote Video */}
                                    <Card sx={{
                                        flex: {xs: '1 1 auto', md: '1 1 70%'},
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: '#0a0a0a',
                                        minHeight: {xs: '200px', md: '100%'},
                                        height: {xs: '200px', md: 'auto'},
                                        position: 'relative',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            zIndex: 2,
                                            background: 'rgba(0,0,0,0.5)',
                                            backdropFilter: 'blur(5px)',
                                            borderRadius: '8px',
                                            padding: '3px'
                                        }}>
                                            <Chip
                                                label={targetUserId || "Remote User"}
                                                size="small"
                                                color="secondary"
                                                sx={{
                                                    opacity: 0.95,
                                                    background: 'linear-gradient(45deg, #9c27b0 30%, #d500f9 90%)',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </Box>

                                        {callInProgress && (
                                            <Box sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                zIndex: 2
                                            }}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    sx={{
                                                        bgcolor: 'rgba(0,0,0,0.6)',
                                                        backdropFilter: 'blur(5px)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(33,150,243,0.3)'
                                                        }
                                                    }}
                                                    onClick={forceRefreshRemoteVideo}
                                                >
                                                    <Refresh fontSize="small"/>
                                                </IconButton>
                                            </Box>
                                        )}

                                        <Box sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                            background: 'radial-gradient(ellipse at center, #1e2130 0%, #0a0a0a 100%)'
                                        }}>
                                            <video
                                                ref={remoteVideoRef}
                                                autoPlay
                                                playsInline
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: callInProgress ? 'block' : 'none',
                                                    transition: 'opacity 0.5s ease'
                                                }}
                                            />
                                            {!callInProgress && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    color: 'rgba(255,255,255,0.7)',
                                                    animation: 'fadeInOut 3s infinite ease-in-out',
                                                    '@keyframes fadeInOut': {
                                                        '0%': {opacity: 0.7},
                                                        '50%': {opacity: 1},
                                                        '100%': {opacity: 0.7}
                                                    }
                                                }}>
                                                    <Videocam sx={{fontSize: 60, mb: 2}}/>
                                                    <Typography
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            fontWeight: 500,
                                                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                                        }}
                                                    >
                                                        Ready to connect
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mt: 1,
                                                            color: 'rgba(255,255,255,0.6)'
                                                        }}
                                                    >
                                                        Click the call button to start
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Card>
                                </Box>
                            </Box>

                            {/* Controls - Beautiful and intuitive */}
                            {callInProgress && (
                                <Paper
                                    elevation={6}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: 3,
                                        bgcolor: 'rgba(15, 15, 20, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        position: 'relative',
                                        zIndex: 3,
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: '0px -4px 20px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <IconButton
                                        color={isAudioMuted ? "default" : "primary"}
                                        onClick={toggleAudioMute}
                                        sx={{
                                            bgcolor: isAudioMuted ? 'rgba(120,120,120,0.2)' : 'rgba(33, 150, 243, 0.15)',
                                            p: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                bgcolor: isAudioMuted ? 'rgba(120,120,120,0.3)' : 'rgba(33, 150, 243, 0.25)',
                                            },
                                            boxShadow: isAudioMuted ? 'none' : '0 0 10px rgba(33, 150, 243, 0.5)'
                                        }}
                                    >
                                        {isAudioMuted ? <MicOff/> : <Mic/>}
                                    </IconButton>

                                    <IconButton
                                        color={isVideoMuted ? "default" : "primary"}
                                        onClick={toggleVideoMute}
                                        sx={{
                                            bgcolor: isVideoMuted ? 'rgba(120,120,120,0.2)' : 'rgba(33, 150, 243, 0.15)',
                                            p: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                bgcolor: isVideoMuted ? 'rgba(120,120,120,0.3)' : 'rgba(33, 150, 243, 0.25)',
                                            },
                                            boxShadow: isVideoMuted ? 'none' : '0 0 10px rgba(33, 150, 243, 0.5)'
                                        }}
                                    >
                                        {isVideoMuted ? <VideocamOff/> : <Videocam/>}
                                    </IconButton>

                                    <IconButton
                                        color={isScreenSharing ? "secondary" : "default"}
                                        onClick={toggleScreenSharing}
                                        sx={{
                                            bgcolor: isScreenSharing ? 'rgba(156, 39, 176, 0.15)' : 'rgba(120,120,120,0.2)',
                                            p: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                bgcolor: isScreenSharing ? 'rgba(156, 39, 176, 0.25)' : 'rgba(120,120,120,0.3)',
                                            },
                                            boxShadow: isScreenSharing ? '0 0 10px rgba(156, 39, 176, 0.5)' : 'none'
                                        }}
                                    >
                                        {isScreenSharing ? <StopScreenShare/> : <ScreenShare/>}
                                    </IconButton>

                                    <IconButton
                                        color="error"
                                        onClick={endCall}
                                        sx={{
                                            bgcolor: 'rgba(211, 47, 47, 0.15)',
                                            p: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                bgcolor: 'rgba(211, 47, 47, 0.3)',
                                            }
                                        }}
                                    >
                                        <CallEnd/>
                                    </IconButton>

                                    <IconButton
                                        color="info"
                                        onClick={diagnoseAndRecoverConnection}
                                        sx={{
                                            bgcolor: 'rgba(2, 136, 209, 0.15)',
                                            p: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                bgcolor: 'rgba(2, 136, 209, 0.25)',
                                            }
                                        }}
                                    >
                                        <Settings/>
                                    </IconButton>
                                </Paper>
                            )}
                        </Box>

                        {/* Minimized state content - Elegant compact display */}
                        {isMinimized && (
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                height: '100%',
                                background: 'linear-gradient(90deg, #1a1c23 0%, #262a35 100%)',
                                borderTop: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                        boxShadow: '0 2px 8px rgba(33, 150, 243, 0.5)',
                                        mr: 2
                                    }}>
                                        <Videocam sx={{color: 'white'}}/>
                                    </Box>
                                    <Box>
                                        <Typography variant="body1" sx={{color: 'white', fontWeight: 600}}>
                                            {callInProgress ? `Call with ${targetUserId}` : 'WebRTC Video Meetings'}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: callInProgress ? '#81c784' : '#bbb',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                            {callInProgress ? (
                                                <>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#4caf50',
                                                        marginRight: 4
                                                    }}></span>
                                                    Call in progress
                                                </>
                                            ) : 'Ready to connect'}
                                        </Typography>
                                    </Box>
                                </Box>

                                {callInProgress && (
                                    <Box sx={{display: 'flex', gap: 1}}>
                                        <IconButton
                                            size="small"
                                            color={isAudioMuted ? "default" : "primary"}
                                            sx={{
                                                bgcolor: 'rgba(0,0,0,0.3)',
                                                '&:hover': {bgcolor: 'rgba(0,0,0,0.5)'}
                                            }}
                                        >
                                            {isAudioMuted ? <MicOff fontSize="small"/> : <Mic fontSize="small"/>}
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            sx={{
                                                bgcolor: 'rgba(211, 47, 47, 0.2)',
                                                '&:hover': {bgcolor: 'rgba(211, 47, 47, 0.4)'}
                                            }}
                                            onClick={endCall}
                                        >
                                            <CallEnd fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Main chat area */}
                <Box sx={{flexGrow: 1, display: "flex", flexDirection: "column", bgcolor: "#fafafa"}}>
                    {selectedContact ? (
                        <>
                            {/* Contact header */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderBottom: "1px solid #e0e0e0",
                                    bgcolor: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between"
                                }}
                            >
                                {/* Left side with contact info */}
                                <Box sx={{display: "flex", alignItems: "center", flexGrow: 1}}>
                                    {selectedContact.isGroup ? (
                                        <>
                                            <Avatar sx={{bgcolor: "#9c27b0", mr: 2}}>
                                                <GroupIcon/>
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6">{selectedContact.name}</Typography>
                                                {selectedContact.members && (
                                                    <Box sx={{display: "flex", alignItems: "center"}}>
                                                        <AvatarGroup max={3} sx={{mr: 1}}>
                                                            {selectedContact.members.map((member, idx) => (
                                                                <Avatar
                                                                    key={idx}
                                                                    sx={{width: 24, height: 24, fontSize: 12}}
                                                                >
                                                                    {member.name ? member.name[0] : "?"}
                                                                </Avatar>
                                                            ))}
                                                        </AvatarGroup>
                                                        <Typography variant="caption" sx={{color: "text.secondary"}}>
                                                            {selectedContact.members.length} members
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </>
                                    ) : (
                                        <>
                                            <Badge
                                                overlap="circular"
                                                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                                variant="dot"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        backgroundColor: isUserOnline(selectedContact) ? '#44b700' : '#bdbdbd',
                                                        boxShadow: `0 0 0 2px white`,
                                                        '&::after': {
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            animation: isUserOnline(selectedContact) ? 'ripple 1.2s infinite ease-in-out' : 'none',
                                                            border: '1px solid currentColor',
                                                            content: '""',
                                                        },
                                                    },
                                                    '@keyframes ripple': {
                                                        '0%': {
                                                            transform: 'scale(.8)',
                                                            opacity: 1,
                                                        },
                                                        '100%': {
                                                            transform: 'scale(2.4)',
                                                            opacity: 0,
                                                        },
                                                    },
                                                }}
                                            >
                                                <Avatar
                                                    sx={{bgcolor: "#1976d2", mr: 2}}>{selectedContact.avatar}</Avatar>
                                            </Badge>
                                            <Box>
                                                <Typography variant="h6">{selectedContact.name}</Typography>
                                                <Box sx={{display: "flex", alignItems: "center"}}>
                                                    {selectedContact.className && (
                                                        <Typography variant="caption"
                                                                    sx={{color: "text.secondary", mr: 1}}>
                                                            {selectedContact.className} {selectedContact.section}
                                                        </Typography>
                                                    )}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: isUserOnline(selectedContact) ? '#44b700' : '#bdbdbd',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 8,
                                                                height: 8,
                                                                borderRadius: '50%',
                                                                bgcolor: isUserOnline(selectedContact) ? '#44b700' : '#bdbdbd',
                                                                mr: 0.5
                                                            }}
                                                        />
                                                        {isUserOnline(selectedContact) ? 'online' : 'offline'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </>
                                    )}
                                </Box>

                                {/* Right side with call buttons */}
                                <Box sx={{display: "flex", alignItems: "center", ml: 2}}>
                                    <Tooltip title={`${selectedContact.isGroup ? "Group " : ""}Audio Call`}>
                                    <span>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleStartCall("audio")}
                                            disabled={!isUserOnline(selectedContact) && !selectedContact.isGroup}
                                        >
                                            <Call/>
                                        </IconButton>
                                    </span>
                                    </Tooltip>
                                    <Tooltip title={`${selectedContact.isGroup ? "Group " : ""}Video Call`}>
                                    <span>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => handleStartCall("video")}
                                            disabled={!isUserOnline(selectedContact) && !selectedContact.isGroup}
                                        >
                                            <VideoCall/>
                                        </IconButton>
                                    </span>
                                    </Tooltip>
                                </Box>
                            </Box>

                            {/* Messages container */}
                            <Box
                                ref={messageContainerRef}
                                sx={{
                                    flexGrow: 1,
                                    overflow: "auto",
                                    p: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {selectedContact && <MessageDisplay/>}
                            </Box>

                            {/* Selected file preview */}
                            {selectedFile && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        p: 1,
                                        bgcolor: "#e3f2fd",
                                        borderTop: "1px solid #e0e0e0",
                                    }}
                                >
                                    {getFileIcon(selectedFile.type)}
                                    <Typography variant="body2" sx={{ml: 1, flexGrow: 1}}>
                                        {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                    </Typography>
                                    <IconButton size="small" onClick={() => setSelectedFile(null)}>
                                        <ClearIcon fontSize="small"/>
                                    </IconButton>
                                </Box>
                            )}

                            {/* Input area */}
                            <Box sx={{p: 2, borderTop: "1px solid #e0e0e0", bgcolor: "#fff"}}>
                                <Box sx={{display: "flex"}}>
                                    <TextField
                                        fullWidth
                                        placeholder="Type a message..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        variant="outlined"
                                        size="small"
                                        multiline
                                        maxRows={3}
                                    />
                                    <input
                                        accept="*/*"
                                        id="file-input"
                                        type="file"
                                        onChange={handleFileSelect}
                                        style={{display: "none"}}
                                    />
                                    <label htmlFor="file-input">
                                        <IconButton component="span" sx={{ml: 1}}>
                                            <AttachFileIcon/>
                                        </IconButton>
                                    </label>
                                    <Button
                                        variant="contained"
                                        onClick={sendMessage}
                                        sx={{ml: 1}}
                                        disabled={!selectedContact || (input.trim() === "" && !selectedFile)}
                                    >
                                        Send
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                            }}
                        >
                            <Typography variant="h6" sx={{color: "text.secondary"}}>
                                Select a contact to start chatting
                            </Typography>
                            <Box sx={{mt: 2}}>
                                <Button
                                    variant="outlined"
                                    startIcon={<PersonIcon/>}
                                    onClick={() => setDialogOpen(true)}
                                    sx={{mr: 1}}
                                >
                                    New Chat
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<GroupIcon/>}
                                    onClick={() => setGroupDialogOpen(true)}
                                >
                                    New Group
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* New Chat Dialog */}
            <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Start New Chat</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{mb: 2}}>
                        Select a user to start a conversation with:
                    </Typography>
                    <Autocomplete
                        options={allDetails || []}
                        getOptionLabel={(option) => {
                            return `${option.name} (${option.tableName} - ${option.className || ''} ${option.section || ''})`;
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Avatar sx={{mr: 2, bgcolor: "#1976d2"}}>{option.name[0]}</Avatar>
                                <Box>
                                    <Typography>{option.name}</Typography>
                                    <Typography variant="caption" sx={{color: "text.secondary"}}>
                                        {option.tableName} - {option.className || ''} {option.section || ''}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label="Search users" variant="outlined" fullWidth/>
                        )}
                        onChange={(_, value) => {
                            setSelectedNewContact(value ? {
                                id: value.id || "",        // Ensures ID is included
                                name: value.name || "",
                                usertable: value.table || "",
                                className: value.className || "",
                                section: value.section || "",
                                schoolId: value.schoolId || "",
                                session: value.session || ""
                            } : null);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={initiateChat} disabled={!selectedNewContact} variant="contained">
                        Start Chat
                    </Button>
                </DialogActions>
            </Dialog>

            {/* New Group Dialog */}
            <Dialog open={isGroupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        sx={{mb: 2}}
                    />

                    <Typography variant="body2" sx={{mb: 1}}>
                        Add members to your group:
                    </Typography>

                    <Autocomplete
                        multiple
                        options={allDetails || []}
                        getOptionLabel={(option) => {
                            if (!option) return ""; // Handle null or undefined option
                            return `${option.id || ""} - ${option.name || ""} (${option.table || ""} - ${option.className || ""} ${option.section || ""} | School: ${option.schoolId || ""} | Session: ${option.session || ""})`;
                        }}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Avatar sx={{mr: 2, bgcolor: "#1976d2"}}>{option.name[0]}</Avatar>
                                <Box>
                                    <Typography>{option.name}</Typography>
                                    <Typography variant="caption" sx={{color: "text.secondary"}}>
                                        {option.table} - {option.className || ''} {option.section || ''}
                                    </Typography>
                                </Box>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField {...params} label="Search users" variant="outlined" fullWidth/>
                        )}
                        onChange={(_, value) => {
                            const members = value.map(val => ({
                                id: val.id || "",        // Ensures ID is included
                                name: val.name || "",
                                usertable: val.table || "",
                                className: val.className || "",
                                section: val.section || "",
                                schoolId: val.schoolId || "",
                                session: val.session || ""
                            }));
                            setSelectedGroupMembers(members);
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    avatar={<Avatar>{option.name[0]}</Avatar>}
                                    label={option.name}
                                    {...getTagProps({index})}
                                />
                            ))
                        }
                    />

                    {selectedGroupMembers.length > 0 && (
                        <Box sx={{mt: 2}}>
                            <Typography variant="body2" sx={{mb: 1}}>
                                Selected members ({selectedGroupMembers.length}):
                            </Typography>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                {selectedGroupMembers.map((member, index) => (
                                    <Chip
                                        key={index}
                                        avatar={<Avatar>{member.name[0]}</Avatar>}
                                        label={member.name}
                                        onDelete={() => {
                                            const newMembers = [...selectedGroupMembers];
                                            newMembers.splice(index, 1);
                                            setSelectedGroupMembers(newMembers);
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={createGroup}
                        disabled={!groupName.trim() || selectedGroupMembers.length === 0}
                        variant="contained"
                    >
                        Create Group
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ChatApp;