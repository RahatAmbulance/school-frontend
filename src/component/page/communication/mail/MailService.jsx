import React, {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {
    alpha,
    AppBar,
    Autocomplete,
    Avatar,
    Badge,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    styled,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";

import {
    Add,
    Delete,
    GroupsOutlined,
    Inbox,
    KeyboardArrowDown,
    Label,
    MailOutline,
    MoreVert,
    Refresh,
    Search as SearchIcon,
    SendOutlined,
    Star,
    StarOutline,
} from "@mui/icons-material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import {useSelector} from "react-redux";
import {formatDateTimeWithAmPm} from "../../../../commonStyle";
import {api, emailAddressFromState, selectSchoolDetails, selectUserActualData,} from "../../../../common";
import {
    AddOutlined,
    AttachFileOutlined,
    CategoryOutlined,
    ClassOutlined,
    CloseRounded,
    CloudUploadOutlined,
    CreateOutlined,
    EmailOutlined,
    GroupAddOutlined,
    GroupOutlined,
    NotificationsActiveOutlined,
    PersonOutlined,
    SaveOutlined,
    SchoolOutlined,
    SubjectOutlined,
    TextFieldsOutlined
} from "@material-ui/icons";

// Modern styled components with animations
const GmailWrapper = styled(Box)(({theme}) => ({
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f6f8fc",
    overflow: "hidden",
    position: "relative",
}));

const MainContent = styled(Box)(({theme}) => ({
    display: "flex",
    flexGrow: 1,
    height: "100vh",
    position: "relative",
    backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f6f8fc",
}));

const Sidebar = styled(motion.div)(({theme}) => ({
    width: 240,
    minWidth: 240,
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    padding: "8px 0",
    overflow: "hidden",
    top: 0,
    display: "flex",
    flexDirection: "column",
    transition: "width 0.3s ease",
    position: "relative",
    zIndex: 10,
    boxShadow: theme.shadows[1],
}));

const AppHeader = styled(AppBar)(({theme}) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
    zIndex: 20,
}));

const SearchField = styled(TextField)(({theme}) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 28,
        background: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.04),
        transition: theme.transitions.create(['background-color', 'box-shadow']),
        '&:hover': {
            background: theme.palette.mode === "dark" ? alpha(theme.palette.common.white, 0.12) : alpha(theme.palette.common.black, 0.06),
        },
        '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
            background: theme.palette.background.paper,
        },
        "& fieldset": {border: "none"},
    },
}));

const ComposeButton = styled(Button)(({theme}) => ({
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    margin: theme.spacing(1.5, 0, 2, 0),
    padding: theme.spacing(1.75, 2),
    width: "90%",
    height: "48px",
    borderRadius: "16px",
    textTransform: "none",
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "all 0.25s ease",
    "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.18),
        transform: "translateY(-1px)",
        boxShadow: theme.shadows[2],
    },
    "&:active": {
        transform: "translateY(0)",
    },
    "& .MuiButton-startIcon": {
        marginLeft: theme.spacing(1),
    },
    position: "relative",
    overflow: "hidden",
    "&::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 5,
        height: 5,
        backgroundColor: alpha(theme.palette.primary.main, 0.3),
        opacity: 0,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        transition: "0.5s",
    },
    "&:hover::after": {
        width: "105%",
        height: "105%",
        opacity: 0.2,
    },
}));

const EmailListWrapper = styled(Box)(({theme, dialogopen}) => ({
    flexGrow: 1,
    height: "100vh",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflowY: dialogopen ? "hidden" : "auto",
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    backdropFilter: "blur(8px)",
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0, 0, 0, 0),
    transition: theme.transitions.create(["margin"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
    }),
}));

const EmailListItem = styled(motion.div)(({theme, unread}) => ({
    borderRadius: 16,
    margin: theme.spacing(0.5, 1),
    overflow: "hidden",
    position: "relative",
    boxShadow: unread ? theme.shadows[1] : "none",
    background: unread
        ? alpha(theme.palette.primary.main, 0.05)
        : theme.palette.background.paper,
    borderLeft: unread ? `4px solid ${theme.palette.primary.main}` : "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: theme.shadows[3],
        backgroundColor: unread
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.action.hover, 0.7)
    }
}));

const SidebarItem = styled(ListItemButton)(({theme, selected}) => ({
    margin: "4px 8px",
    borderRadius: "12px",
    height: 56,
    padding: theme.spacing(1, 2),
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
    backgroundColor: selected ? alpha(theme.palette.primary.main, 0.12) : "transparent",
    color: selected ? theme.palette.primary.main : theme.palette.text.primary,
    "&:hover": {
        backgroundColor: selected ? alpha(theme.palette.primary.main, 0.16) : alpha(theme.palette.action.hover, 0.8),
        transform: "translateX(4px)",
    },
    "& .MuiListItemText-primary": {
        fontSize: 15,
        fontWeight: selected ? 600 : 500,
    },
    "& .MuiListItemIcon-root": {
        color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
        minWidth: 40,
    },
    "& .MuiBadge-badge": {
        backgroundColor: selected ? theme.palette.primary.main : theme.palette.grey[400],
        color: theme.palette.common.white,
    }
}));

const ActionButton = styled(IconButton)(({theme}) => ({
    color: theme.palette.text.secondary,
    transition: "all 0.2s ease",
    "&:hover": {
        backgroundColor: alpha(theme.palette.action.hover, 0.8),
        transform: "scale(1.1)",
    },
}));

const AttachmentPreview = ({file}) => {
    const theme = useTheme();

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <motion.div
            whileHover={{scale: 1.03, y: -3}}
            transition={{duration: 0.2}}
        >
            <Paper
                elevation={2}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1,
                    borderRadius: 2,
                    width: 200,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <InsertDriveFileIcon sx={{color: theme.palette.primary.main, mr: 1}}/>
                <Box sx={{overflow: "hidden"}}>
                    <Typography noWrap variant="body2" sx={{fontWeight: 500}}>
                        {file.name}
                    </Typography>
                    <Typography variant="caption" sx={{color: theme.palette.text.secondary}}>
                        {formatFileSize(file.size)}
                    </Typography>
                </Box>
            </Paper>
        </motion.div>
    );
};

// Main component
const MailService = () => {
    const theme = useTheme();
    const [filterText, setFilterText] = useState("");
    const classSections = useSelector((state) => state.master.data.classSections || []);
    const [list, setlist] = useState("");
    const userActualData = useSelector(selectUserActualData);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const emailAddresses = useSelector(emailAddressFromState);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [composeOpen, setComposeOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mainType, setMainType] = useState("Information");
    const [recipientType, setRecipientType] = useState("individual");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedPeople, setSelectedPeople] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [messageDetailsOpen, setMessageDetailsOpen] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [selectedEmails, setSelectedEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isStarred, setIsStarred] = useState({});

    const [newEmail, setNewEmail] = useState({
        subject: "",
        to: "",
        content: "",
        userData: userActualData?.email,
        type: "individual",
        mailType: mainType,
        schoolId: schoolId,
        session,
        role: userActualData?.role,
        date: new Date(),
        attachmentData: null,
    });

    const emailListRef = useRef(null);

    // Navigation items for sidebar
    const navItems = [
        {
            icon: Inbox,
            label: "Inbox",
            count: messages.filter(m => !m.read).length,
            tabIndex: 0,
            color: theme.palette.primary.main
        },
        {
            icon: SendOutlined,
            label: "Sent",
            tabIndex: 1,
            color: theme.palette.secondary.main
        }
    ];

    // Color utility functions
    const getRandomColor = (str = "") => {
        const colors = [
            "#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5",
            "#2196f3", "#03a9f4", "#00bcd4", "#009688", "#4caf50",
            "#8bc34a", "#cddc39", "#ffc107", "#ff9800", "#ff5722"
        ];
        if (!str || typeof str !== "string" || str.length === 0) {
            return colors[0];
        }
        const hash = str?.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return colors[hash % colors.length];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Data fetching
    const loadInboxMessages = async () => {
        setLoading(true);
        try {
            const params = {email: userActualData.email, schoolId, role: userActualData?.role};
            const response = await api.get("/api/mail/inbox", {params});
            setMessages(response.data);
        } catch (error) {
            console.error("Error loading inbox messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadSentMessages = async () => {
        setLoading(true);
        try {
            const params = {email: userActualData.email, schoolId, role: userActualData?.role};
            const response = await api.get("/api/mail/sent", {params});
            setMessages(response.data);
        } catch (error) {
            console.error("Error loading sent messages:", error);
        } finally {
            setLoading(false);
        }
    };

    // Handle functions
    const handleComposeClick = () => {
        setComposeOpen(true);
        if (selectedPerson) {
            setNewEmail({...newEmail, to: selectedPerson.email});
        }
    };

    const handleCloseCompose = () => {
        setComposeOpen(false);
        setNewEmail({
            subject: "",
            to: "",
            content: "",
            mailType: mainType,
            userData: userActualData.email,
            type: "individual",
            schoolId: schoolId,
            date: new Date(),
            role: userActualData?.role,
            session,
        });
        setRecipientType("individual");
        setSelectedClass("");
        setSelectedSection("");
        setSelectedPeople([]);
        setAttachments([]);
    };

    const handleRecipientTypeChange = (e) => {
        setRecipientType(e.target.value);
        setNewEmail({...newEmail, type: e.target.value});
    };

    const handleChange = (e) => {
        setNewEmail({...newEmail, [e.target.name]: e.target.value});
    };

    const handleTabChange = (newValue) => {
        setActiveTab(newValue);
        newValue === 0 ? loadInboxMessages() : loadSentMessages();
    };

    const handleEmailDelete = async (messageId) => {
        try {
            // Pass messageId in the request body
            await api.delete(`/api/mail/delete`, {
                data: {
                    messageId,
                    schoolId,
                    email: userActualData.email,
                    role: userActualData?.role
                }
            });

            // Remove from local state after successful deletion
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            setSelectedEmails((prev) => prev.filter((id) => id !== messageId));

            // Close message details if the deleted message was being viewed
            if (selectedMessage?.messageId === messageId) {
                setMessageDetailsOpen(false);
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    // Update bulk delete handler
    const handleBulkDelete = async () => {
        try {
            // Send all messageIds in a single request
            await api.delete(`/api/mail/bulk-delete`, {
                data: {
                    messageIds: selectedEmails,
                    schoolId,
                    email: userActualData.email,
                    role: userActualData?.role
                }
            });

            // Update local state
            setMessages((prev) => prev.filter((m) => !selectedEmails.includes(m.messageId)));
            setSelectedEmails([]);

            // Close message details if the deleted message was being viewed
            if (selectedMessage && selectedEmails.includes(selectedMessage.id)) {
                setMessageDetailsOpen(false);
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error("Error deleting messages:", error);
        }
    };

    const handleEmailSelect = (emailId, e) => {
        e.stopPropagation();
        setSelectedEmails((prev) =>
            prev.includes(emailId)
                ? prev.filter((messageId) => messageId !== emailId)
                : [...prev, emailId]
        );
    };

    const handlePersonClick = async (message) => {
        setSelectedMessage(message);
        setMessageDetailsOpen(true);

        if (!message.read) {
            try {
                await api.put(`/api/mail/messages/${message.id}`, {read: true});
                setMessages(
                    messages.map((msg) =>
                        msg.id === message.id ? {...msg, read: true} : msg
                    )
                );
            } catch (error) {
                console.error("Error marking message as read:", error);
            }
        }
    };

    const handleToggleStar = (messageId, e) => {
        e.stopPropagation();
        setIsStarred(prev => ({
            ...prev,
            [messageId]: !prev[messageId]
        }));
    };

    const handleSendEmail = async () => {
        let recipients = [];

        if (newEmail.type === "class") {
            recipients.push(`${selectedClass}`);
        } else if (newEmail.type === "section") {
            recipients.push(`${selectedClass}.${selectedSection}`);
        } else if (newEmail.type === "group") {
            recipients = selectedPeople.map((person) => person.email);
        } else {
            recipients.push(newEmail.to);
        }

        const formData = new FormData();
        formData.append("subject", newEmail.subject);
        formData.append("content", newEmail.content);
        formData.append("from", userActualData.email);
        formData.append("type", newEmail.type);
        formData.append("schoolId", schoolId);
        formData.append("class", selectedClass);
        formData.append("section", selectedSection);
        formData.append("date", new Date());
        formData.append("role", userActualData?.role);
        formData.append("mailType", mainType);
        formData.append("senderName", userActualData.name || userActualData.email);

        if (newEmail.type !== "class" && newEmail.type !== "section") {
            recipients.forEach((email) => formData.append("to[]", email));
        }

        attachments.forEach((file) => formData.append("attachments", file));

        try {
            await api.post("/api/mail/send", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Email sent to:", recipients);
        } catch (error) {
            console.error("Error sending email:", error);
        }

        handleCloseCompose();
    };

    // People data preparation
    const people = emailAddresses.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        role: person.role,
        type: person.role.toLowerCase(),
    }));

    const filteredPeople = (people || []).filter(
        (person) =>
            (person.name &&
                person.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (person.email &&
                person.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (person.subject &&
                person.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Initial data loading
    useEffect(() => {
        loadInboxMessages();
    }, []);
    const noticeTypes = [
        "Information",
        "Announcement",
        "Reminder",
        "Event",
        "Urgent",
        "Academic",
        "Administrative"
    ];
    return (
        <GmailWrapper>
            <AppHeader position="sticky" elevation={0}>
                <Toolbar sx={{gap: 2, py: 0.75}}>
                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                letterSpacing: "0.5px"
                            }}
                        >
                            Mail
                        </Typography>
                    </Box>

                    <Box sx={{flexGrow: 1, maxWidth: 720, mx: "auto"}}>
                        <SearchField
                            fullWidth
                            variant="outlined"
                            placeholder="Search in mail"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{color: theme.palette.text.secondary, mr: 1}}/>,
                            }}
                        />
                    </Box>

                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                        <Tooltip title="Refresh">
                            <ActionButton onClick={loadInboxMessages}>
                                <Refresh/>
                            </ActionButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppHeader>

            <MainContent>
                <Sidebar
                    initial={{x: -20, opacity: 0}}
                    animate={{x: 0, opacity: 1}}
                    transition={{duration: 0.4}}
                >
                    <Box sx={{px: 2, mt: 2, mb: 3}}>
                        <ComposeButton
                            startIcon={<Add/>}
                            onClick={handleComposeClick}
                            sx={{
                                width: "100%",
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                color: "white",
                                "&:hover": {
                                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                }
                            }}
                        >
                            Compose
                        </ComposeButton>
                    </Box>

                    <List sx={{px: 1}}>
                        {navItems.map((item) => (
                            <motion.div
                                key={item.label}
                                whileHover={{scale: 1.02}}
                                transition={{duration: 0.2}}
                            >
                                <SidebarItem
                                    onClick={() => item.tabIndex !== undefined && handleTabChange(item.tabIndex)}
                                    selected={item.tabIndex === activeTab}
                                >
                                    <ListItemIcon>
                                        <item.icon
                                            sx={{
                                                fontSize: 24,
                                                color: item.tabIndex === activeTab ? item.color : 'inherit'
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        sx={{
                                            '& .MuiTypography-root': {
                                                fontSize: '1rem',
                                                fontWeight: item.tabIndex === activeTab ? 600 : 500
                                            }
                                        }}
                                    />
                                    {item.count > 0 && (
                                        <Badge
                                            badgeContent={item.count}
                                            color="primary"
                                            sx={{
                                                '& .MuiBadge-badge': {
                                                    fontSize: '0.75rem',
                                                    height: 20,
                                                    minWidth: 20,
                                                    borderRadius: '10px'
                                                }
                                            }}
                                        />
                                    )}
                                </SidebarItem>
                            </motion.div>
                        ))}
                    </List>

                    <Box sx={{mt: 'auto', p: 2}}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
                                {activeTab === 0 ? 'Inbox Status' : 'Sent Status'}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{fontWeight: 600}}>
                                {activeTab === 0
                                    ? `${messages.filter(m => !m.read).length} unread`
                                    : `${messages.length} sent`
                                }
                            </Typography>
                        </Box>
                    </Box>
                </Sidebar>

                <EmailListWrapper
                    ref={emailListRef}
                    dialogopen={messageDetailsOpen ? 1 : 0}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 1,
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            backgroundColor: theme.palette.background.paper,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Checkbox
                            indeterminate={selectedEmails.length > 0 && selectedEmails.length < messages.length}
                            checked={messages.length > 0 && selectedEmails.length === messages.length}
                            onChange={() => {
                                if (selectedEmails.length === messages.length) {
                                    setSelectedEmails([]);
                                } else {
                                    setSelectedEmails(messages.map(m => m.messageId));
                                }
                            }}
                            sx={{
                                borderRadius: 1,
                                '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                },
                            }}
                        />

                        <Tooltip title="Refresh">
                            <ActionButton onClick={loadInboxMessages}>
                                <Refresh/>
                            </ActionButton>
                        </Tooltip>

                        <Tooltip title="Delete">
              <span>
                <ActionButton
                    disabled={selectedEmails.length === 0}
                    onClick={handleBulkDelete}
                >
                  <Delete/>
                </ActionButton>
              </span>
                        </Tooltip>

                        <Tooltip title="Add label">
              <span>
                <ActionButton disabled={selectedEmails.length === 0}>
                  <Label/>
                </ActionButton>
              </span>
                        </Tooltip>

                        <Tooltip title="More">
              <span>
                <ActionButton disabled={selectedEmails.length === 0}>
                  <MoreVert/>
                </ActionButton>
              </span>
                        </Tooltip>

                        <Box sx={{flexGrow: 1}}/>

                        <Typography variant="caption" sx={{color: theme.palette.text.secondary, mr: 1}}>
                            {`${messages.length > 0 ? 1 : 0}-${messages.length} of ${messages.length}`}
                        </Typography>

                        <ActionButton>
                            <KeyboardArrowDown/>
                        </ActionButton>
                    </Box>

                    <AnimatePresence>
                        {loading ? (
                            <Box sx={{p: 2}}>
                                {Array(8).fill().map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rectangular"
                                        height={72}
                                        sx={{mb: 1, borderRadius: 2}}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <List sx={{pt: 0, pb: 2}}>
                                {messages.length === 0 ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 300,
                                            p: 3,
                                        }}
                                    >
                                        <MailOutline
                                            sx={{
                                                fontSize: 60,
                                                color: alpha(theme.palette.text.secondary, 0.5),
                                                mb: 2
                                            }}
                                        />
                                        <Typography variant="h6" color="textSecondary" fontWeight={500}>
                                            No messages found
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" align="center" sx={{mt: 1}}>
                                            {activeTab === 0
                                                ? "Your inbox is empty. Messages you receive will appear here."
                                                : "You haven't sent any messages yet."}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Add/>}
                                            sx={{mt: 3}}
                                            onClick={handleComposeClick}
                                        >
                                            Compose new message
                                        </Button>
                                    </Box>
                                ) : (
                                    [...messages]
                                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                                        .map((message) => (
                                            <EmailListItem
                                                key={message.id}
                                                unread={!message.read}
                                                whileHover={{scale: 1.01}}
                                                transition={{type: "spring", stiffness: 500}}
                                                initial={{opacity: 0, y: 10}}
                                                animate={{opacity: 1, y: 0}}
                                                exit={{opacity: 0, y: -10}}
                                            >
                                                <ListItemButton
                                                    onClick={() => handlePersonClick(message)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        px: 2,
                                                        py: 1.5
                                                    }}
                                                >
                                                    <Box sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        width: "100%",
                                                        gap: 1
                                                    }}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', mr: 1}}>
                                                            <Checkbox
                                                                checked={selectedEmails.includes(message.id)}
                                                                onClick={(e) => handleEmailSelect(message.id, e)}
                                                                sx={{p: 0.5}}
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => handleToggleStar(message.id, e)}
                                                                sx={{color: isStarred[message.id] ? 'warning.main' : 'text.disabled'}}
                                                            >
                                                                {isStarred[message.id] ? <Star fontSize="small"/> :
                                                                    <StarOutline fontSize="small"/>}
                                                            </IconButton>
                                                        </Box>

                                                        <Avatar
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                bgcolor: getRandomColor(message.sender),
                                                                fontWeight: 600,
                                                                fontSize: '0.95rem'
                                                            }}
                                                        >
                                                            {message.sender?.[0]?.toUpperCase() || "?"}
                                                        </Avatar>

                                                        <Box sx={{
                                                            flexGrow: 1,
                                                            ml: 1,
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            flexDirection: 'column'
                                                        }}>
                                                            <Box sx={{
                                                                display: "flex",
                                                                justifyContent: 'space-between',
                                                                alignItems: 'baseline',
                                                                mb: 0.5
                                                            }}>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    noWrap
                                                                    sx={{
                                                                        fontWeight: message.read ? 400 : 700,
                                                                        color: message.read ? theme.palette.text.secondary : theme.palette.text.primary,
                                                                        maxWidth: '40%'
                                                                    }}
                                                                >
                                                                    {message.sender || "Unknown Sender"}
                                                                </Typography>

                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{
                                                                        color: message.read ? theme.palette.text.secondary : theme.palette.primary.main,
                                                                        fontWeight: message.read ? 400 : 600,
                                                                        ml: 'auto',
                                                                        minWidth: 80,
                                                                        textAlign: 'right'
                                                                    }}
                                                                >
                                                                    {formatDateTimeWithAmPm(message.date)}
                                                                </Typography>
                                                            </Box>

                                                            <Box
                                                                sx={{display: 'flex', justifyContent: 'space-between'}}>
                                                                <Typography
                                                                    variant="body2"
                                                                    noWrap
                                                                    sx={{
                                                                        fontWeight: message.read ? 400 : 600,
                                                                        color: message.read ? theme.palette.text.secondary : theme.palette.text.primary,
                                                                        maxWidth: '70%'
                                                                    }}
                                                                >
                                                                    {message.subject}
                                                                </Typography>

                                                                <Box sx={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    ml: 1
                                                                }}>
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEmailDelete(message.messageId);
                                                                        }}
                                                                        sx={{
                                                                            p: 0.5,
                                                                            visibility: 'hidden',
                                                                            '.MuiListItemButton-root:hover &': {
                                                                                visibility: 'visible',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <DeleteOutlineIcon fontSize="small"/>
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>

                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: theme.palette.text.secondary,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    fontSize: '0.85rem',
                                                                    mt: 0.5
                                                                }}
                                                            >
                                                                {message.content?.substring(0, 80) || "No content available"}
                                                                {message.content?.length > 80 ? "..." : ""}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </ListItemButton>
                                            </EmailListItem>
                                        ))
                                )}
                            </List>
                        )}
                    </AnimatePresence>
                </EmailListWrapper>
                <Dialog
                    open={composeOpen}
                    onClose={handleCloseCompose}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{
                        component: motion.div,
                        initial: {opacity: 0, y: 20, scale: 0.95},
                        animate: {opacity: 1, y: 0, scale: 1},
                        exit: {opacity: 0, y: 20, scale: 0.95},
                        transition: {type: "spring", stiffness: 300, damping: 25},
                        sx: {
                            borderRadius: 4,
                            overflow: 'hidden',
                            minHeight: '75vh',
                            maxHeight: '90vh',
                            boxShadow: theme.shadows[10],
                            background: theme.palette.mode === "dark"
                                ? `linear-gradient(135deg, ${alpha('#1a1a1a', 0.95)} 70%, ${alpha(theme.palette.primary.dark, 0.25)})`
                                : `linear-gradient(135deg, ${theme.palette.background.paper} 70%, ${alpha(theme.palette.primary.light, 0.15)})`,
                            border: theme.palette.mode === "dark"
                                ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                : 'none',
                        }
                    }}
                    BackdropProps={{
                        sx: {
                            backgroundColor: alpha(theme.palette.common.black, 0.75),
                            backdropFilter: "blur(8px)",
                        },
                    }}
                >
                    {/* Header with animated gradient */}
                    <Box
                        sx={{
                            position: 'relative',
                            overflow: 'hidden',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            py: 2,
                            px: 3,
                            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                        }}
                    >
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.primary.light, 0.4)}, transparent 70%)`,
                                zIndex: 0,
                            }}
                            animate={{
                                x: [0, 40, 0],
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 10,
                                ease: "easeInOut",
                            }}
                        />

                        <Box sx={{display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1}}>
                            <Typography
                                variant="h5"
                                component="h2"
                                sx={{
                                    fontWeight: 700,
                                    color: '#fff',
                                    textShadow: '0px 2px 4px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                }}
                            >
                                <CreateOutlined fontSize="medium"/>
                                Compose New Message
                            </Typography>

                            <Box sx={{ml: 'auto'}}>
                                <IconButton
                                    onClick={handleCloseCompose}
                                    sx={{
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.common.white, 0.15),
                                            transform: 'rotate(90deg)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                >
                                    <CloseRounded/>
                                </IconButton>
                            </Box>
                        </Box>
                    </Box>

                    <DialogContent
                        sx={{
                            p: {xs: 2, sm: 3, md: 4},
                            background: 'transparent',
                            overflowY: 'auto',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: alpha(theme.palette.primary.main, 0.05),
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: alpha(theme.palette.primary.main, 0.2),
                                borderRadius: '10px',
                                '&:hover': {
                                    background: alpha(theme.palette.primary.main, 0.3),
                                },
                            },
                        }}
                    >
                        <Grid container spacing={3}>
                            {/* Top Section with Feature Pills */}
                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1.5,
                                        mb: 3,
                                    }}
                                >
                                    <Chip
                                        icon={<EmailOutlined/>}
                                        label="New Message"
                                        color="primary"
                                        variant="filled"
                                        sx={{
                                            fontWeight: 500,
                                            borderRadius: 3,
                                            boxShadow: theme.shadows[1],
                                        }}
                                    />
                                    <Chip
                                        icon={<NotificationsActiveOutlined/>}
                                        label={mainType}
                                        color="secondary"
                                        variant="filled"
                                        sx={{
                                            fontWeight: 500,
                                            borderRadius: 3,
                                            boxShadow: theme.shadows[1],
                                        }}
                                    />
                                    <Chip
                                        icon={<GroupOutlined/>}
                                        label={recipientType === "individual" ? "Individual" :
                                            recipientType === "group" ? "Multiple Recipients" :
                                                recipientType === "class" ? "Full Class" : "Class Section"}
                                        variant="filled"
                                        sx={{
                                            fontWeight: 500,
                                            borderRadius: 3,
                                            bgcolor: alpha(theme.palette.info.main, 0.8),
                                            color: '#fff',
                                            boxShadow: theme.shadows[1],
                                        }}
                                    />
                                </Box>
                            </Grid>

                            {/* Recipient Type & Message Type Selection */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="recipient-type-label">Recipient Type</InputLabel>
                                    <Select
                                        labelId="recipient-type-label"
                                        value={recipientType}
                                        onChange={handleRecipientTypeChange}
                                        label="Recipient Type"
                                        sx={{
                                            borderRadius: 2,
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.primary.main,
                                                borderWidth: 2,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.primary.main,
                                            },
                                            boxShadow: `inset 0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                                            background: alpha(theme.palette.background.paper, 0.8),
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    borderRadius: 2,
                                                    boxShadow: theme.shadows[4],
                                                    mt: 0.5,
                                                }
                                            }
                                        }}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <PersonOutlined color="primary"/>
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value="individual">Individual</MenuItem>
                                        <MenuItem value="class">Class</MenuItem>
                                        <MenuItem value="section">Class Section</MenuItem>
                                        <MenuItem value="group">Group</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Notice Type */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="notice-type-label">Message Type</InputLabel>
                                    <Select
                                        labelId="notice-type-label"
                                        value={mainType}
                                        onChange={(e) => setMainType(e.target.value)}
                                        label="Message Type"
                                        sx={{
                                            borderRadius: 2,
                                            '.MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha(theme.palette.secondary.main, 0.2),
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.secondary.main,
                                                borderWidth: 2,
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.secondary.main,
                                            },
                                            boxShadow: `inset 0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                                            background: alpha(theme.palette.background.paper, 0.8),
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    borderRadius: 2,
                                                    boxShadow: theme.shadows[4],
                                                    mt: 0.5,
                                                }
                                            }
                                        }}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <CategoryOutlined color="secondary"/>
                                            </InputAdornment>
                                        }
                                    >
                                        {noticeTypes.map((type, index) => (
                                            <MenuItem key={index} value={type}>
                                                {type}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Conditional Form Fields Based on Recipient Type */}
                            {recipientType === "individual" && (
                                <Grid item xs={12}>
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <Autocomplete
                                            autoFocus
                                            options={filteredPeople}
                                            getOptionLabel={(option) => `${option.name} (${option.email}) (${option.type})`}
                                            value={filteredPeople.find((person) => person.email === newEmail.to) || null}
                                            onChange={(event, newValue) => {
                                                setNewEmail({...newEmail, to: newValue ? newValue.email : ""});
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Recipient"
                                                    variant="outlined"
                                                    placeholder="Search by name or email"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <>
                                                                <InputAdornment position="start">
                                                                    <PersonOutlined color="primary"/>
                                                                </InputAdornment>
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        )
                                                    }}
                                                    sx={{
                                                        borderRadius: 2,
                                                        '.MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                                                            '&:hover': {
                                                                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <MenuItem
                                                    {...props}
                                                    sx={{
                                                        borderRadius: 1,
                                                        my: 0.5,
                                                        py: 1,
                                                        px: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            fontSize: '0.75rem',
                                                            bgcolor: getRandomColor(option.email)
                                                        }}
                                                    >
                                                        {option.name?.[0]?.toUpperCase() || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {option.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.email} • {option.type}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            )}
                                        />
                                    </motion.div>
                                </Grid>
                            )}

                            {recipientType === "class" && (
                                <Grid item xs={12}>
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel id="class-label">Class</InputLabel>
                                            <Select
                                                labelId="class-label"
                                                value={selectedClass}
                                                onChange={(e) => setSelectedClass(e.target.value)}
                                                label="Class"
                                                sx={{
                                                    borderRadius: 2,
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: alpha(theme.palette.primary.main, 0.2),
                                                    },
                                                    boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                                                }}
                                                startAdornment={
                                                    <InputAdornment position="start">
                                                        <SchoolOutlined color="primary"/>
                                                    </InputAdornment>
                                                }
                                            >
                                                {classSections.map((cls) => (
                                                    <MenuItem key={cls.id} value={cls.name}>
                                                        {cls.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </motion.div>
                                </Grid>
                            )}

                            {recipientType === "section" && (
                                <Grid item xs={12}>
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel id="class-label">Class</InputLabel>
                                                    <Select
                                                        labelId="class-label"
                                                        value={selectedClass}
                                                        onChange={(e) => setSelectedClass(e.target.value)}
                                                        label="Class"
                                                        sx={{
                                                            borderRadius: 2,
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            },
                                                            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                                                        }}
                                                        startAdornment={
                                                            <InputAdornment position="start">
                                                                <ClassOutlined color="primary"/>
                                                            </InputAdornment>
                                                        }
                                                    >
                                                        {classSections.map((cls) => (
                                                            <MenuItem key={cls.id} value={cls.name}>
                                                                {cls.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel id="section-label">Section</InputLabel>
                                                    <Select
                                                        labelId="section-label"
                                                        value={selectedSection}
                                                        onChange={(e) => setSelectedSection(e.target.value)}
                                                        label="Section"
                                                        disabled={!selectedClass}
                                                        sx={{
                                                            borderRadius: 2,
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            },
                                                            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
                                                        }}
                                                        startAdornment={
                                                            <InputAdornment position="start">
                                                                <GroupsOutlined color="primary"/>
                                                            </InputAdornment>
                                                        }
                                                    >
                                                        {classSections?.find((cs) => cs.name === selectedClass)?.sections?.length > 0 ? (
                                                            classSections.find((cs) => cs.name === selectedClass).sections.map((section) => (
                                                                <MenuItem key={section.id} value={section.name}>
                                                                    {section.name}
                                                                </MenuItem>
                                                            ))
                                                        ) : (
                                                            <MenuItem value="" disabled>
                                                                No Sections Available
                                                            </MenuItem>
                                                        )}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </motion.div>
                                </Grid>
                            )}

                            {recipientType === "group" && (
                                <Grid item xs={12}>
                                    <motion.div
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{duration: 0.3}}
                                    >
                                        <Autocomplete
                                            multiple
                                            options={filteredPeople}
                                            getOptionLabel={(option) => `${option.name} (${option.email}) (${option.type})`}
                                            value={selectedPeople}
                                            onChange={(event, newValue) => {
                                                setSelectedPeople(newValue);
                                                setNewEmail({...newEmail, to: ""});
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Recipients"
                                                    placeholder="Search recipients"
                                                    variant="outlined"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <>
                                                                <InputAdornment position="start">
                                                                    <GroupAddOutlined color="primary"/>
                                                                </InputAdornment>
                                                                {params.InputProps.startAdornment}
                                                            </>
                                                        )
                                                    }}
                                                    sx={{
                                                        borderRadius: 2,
                                                        '.MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                                                            '&:hover': {
                                                                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                            },
                                                            '&.Mui-focused': {
                                                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                            }
                                                        }
                                                    }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        avatar={
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: getRandomColor(option.email),
                                                                    width: 24,
                                                                    height: 24,
                                                                    fontSize: '0.7rem'
                                                                }}
                                                            >
                                                                {option.name?.[0]?.toUpperCase() || '?'}
                                                            </Avatar>
                                                        }
                                                        label={option.name}
                                                        size="small"
                                                        {...getTagProps({index})}
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            fontWeight: 500,
                                                            py: 0.5
                                                        }}
                                                    />
                                                ))
                                            }
                                            renderOption={(props, option) => (
                                                <MenuItem
                                                    {...props}
                                                    sx={{
                                                        borderRadius: 1,
                                                        my: 0.5,
                                                        py: 1,
                                                        px: 2,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Avatar
                                                        sx={{
                                                            width: 28,
                                                            height: 28,
                                                            fontSize: '0.75rem',
                                                            bgcolor: getRandomColor(option.email)
                                                        }}
                                                    >
                                                        {option.name?.[0]?.toUpperCase() || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {option.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {option.email} • {option.type}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            )}
                                        />
                                    </motion.div>
                                </Grid>
                            )}

                            {/* Subject - Enhanced with visual indicator */}
                            <Grid item xs={12}>
                                <Box sx={{position: 'relative'}}>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        id="subject"
                                        label="Subject"
                                        placeholder="Enter message subject"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        name="subject"
                                        value={newEmail.subject}
                                        onChange={handleChange}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SubjectOutlined sx={{color: theme.palette.primary.main}}/>
                                                </InputAdornment>
                                            ),
                                            sx: {fontWeight: 600}
                                        }}
                                        sx={{
                                            '.MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                },
                                                '&.Mui-focused': {
                                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}`,
                                                }
                                            }
                                        }}
                                    />
                                    {newEmail.subject && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                height: 8,
                                                width: 8,
                                                borderRadius: '50%',
                                                backgroundColor: theme.palette.primary.main,
                                                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                                            }}
                                        />
                                    )}
                                </Box>
                            </Grid>

                            {/* Content - Enhanced with rich text appearance */}
                            <Grid item xs={12}>
                                <TextField
                                    margin="dense"
                                    id="content"
                                    label="Message Content"
                                    placeholder="Write your message here..."
                                    type="text"
                                    fullWidth
                                    multiline
                                    rows={8}
                                    variant="outlined"
                                    name="content"
                                    value={newEmail.content}
                                    onChange={handleChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start"
                                                            sx={{alignSelf: 'flex-start', mt: 1.5, mr: 1}}>
                                                <TextFieldsOutlined sx={{color: theme.palette.secondary.main}}/>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '.MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            boxShadow: `0 0 0 1px ${alpha(theme.palette.secondary.main, 0.2)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                boxShadow: `0 0 0 1px ${alpha(theme.palette.secondary.main, 0.5)}`,
                                            },
                                            '&.Mui-focused': {
                                                boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.5)}`,
                                            }
                                        },
                                        '.MuiInputBase-inputMultiline': {
                                            fontSize: '1rem',
                                            lineHeight: 1.6
                                        }
                                    }}
                                />
                            </Grid>

                            {/* File Upload - Redesigned with drag and drop zone */}
                            <Grid item xs={12}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                                        background: alpha(theme.palette.primary.main, 0.04),
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            background: alpha(theme.palette.primary.main, 0.06),
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                >
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 2
                                    }}>
                                        <Typography variant="subtitle1" fontWeight={600}
                                                    sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <AttachFileOutlined color="primary"/>
                                            Attachments
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<AddOutlined/>}
                                            sx={{
                                                borderRadius: 6,
                                                textTransform: "none",
                                                fontWeight: 500,
                                                px: 2,
                                                color: theme.palette.primary.main,
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                                background: alpha(theme.palette.background.paper, 0.8),
                                                '&:hover': {
                                                    background: alpha(theme.palette.primary.main, 0.08),
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            Add Files
                                            <input
                                                type="file"
                                                multiple
                                                hidden
                                                onChange={(e) => setAttachments(Array.from(e.target.files))}
                                            />
                                        </Button>
                                    </Box>

                                    {attachments.length > 0 ? (
                                        <Box sx={{display: "flex", flexWrap: "wrap", gap: 1.5, mt: 2}}>
                                            {attachments.map((file, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{opacity: 0, scale: 0.9}}
                                                    animate={{opacity: 1, scale: 1}}
                                                    transition={{duration: 0.2}}
                                                >
                                                    <Paper
                                                        elevation={2}
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            px: 2,
                                                            py: 1,
                                                            borderRadius: 2,
                                                            background: theme.palette.background.paper,
                                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                            boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`
                                                        }}
                                                    >
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            mr: 2,
                                                            p: 1,
                                                            borderRadius: 1,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                                                        }}>
                                                            <InsertDriveFileIcon fontSize="small"
                                                                                 sx={{color: theme.palette.primary.main}}/>
                                                        </Box>
                                                        <Box sx={{mr: 2}}>
                                                            <Typography variant="body2"
                                                                        sx={{fontWeight: 500, maxWidth: 180}} noWrap>
                                                                {file.name}
                                                            </Typography>
                                                            <Typography variant="caption"
                                                                        sx={{color: theme.palette.text.secondary}}>
                                                                {(file.size / 1024).toFixed(1)} KB
                                                            </Typography>
                                                        </Box>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                                                            sx={{
                                                                color: theme.palette.error.main,
                                                                p: 0.5,
                                                                ml: 'auto',
                                                                '&:hover': {
                                                                    background: alpha(theme.palette.error.main, 0.1)
                                                                }
                                                            }}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small"/>
                                                        </IconButton>
                                                    </Paper>
                                                </motion.div>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                py: 3,
                                                color: theme.palette.text.secondary
                                            }}
                                        >
                                            <CloudUploadOutlined sx={{
                                                fontSize: 40,
                                                color: alpha(theme.palette.primary.main, 0.5),
                                                mb: 1
                                            }}/>
                                            <Typography variant="body2" align="center">
                                                Drag & drop files here or click Add Files button
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            p: 3,
                            gap: 2,
                            background: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(8px)',
                            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Button
                            startIcon={<SaveOutlined/>}
                            onClick={() => console.log("Save draft")}
                            sx={{
                                borderRadius: 6,
                                textTransform: "none",
                                fontWeight: 500,
                                px: 2.5,
                                color: theme.palette.text.secondary,
                                border: `1px solid ${alpha(theme.palette.grey[400], 0.5)}`,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.grey[400], 0.1),
                                    borderColor: theme.palette.grey[400],
                                }
                            }}
                        >
                            Save Draft
                        </Button>

                        <Box sx={{display: 'flex', gap: 1}}>
                            <Button
                                onClick={handleCloseCompose}
                                sx={{
                                    borderRadius: 6,
                                    textTransform: "none",
                                    fontWeight: 500,
                                    px: 2.5,
                                    color: theme.palette.text.secondary,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.grey[400], 0.15),
                                    }
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSendEmail}
                                variant="contained"
                                startIcon={<SendOutlined/>}
                                sx={{
                                    borderRadius: 6,
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                                        transform: 'translateY(-2px)'
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)',
                                        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    },
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0))',
                                        opacity: 0.5,
                                    }
                                }}
                            >
                                Send Message
                            </Button>
                        </Box>
                    </DialogActions>
                </Dialog>
            </MainContent>
        </GmailWrapper>
    );
};

export default MailService;