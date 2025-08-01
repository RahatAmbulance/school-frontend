import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {
    AttachMoney,
    Build,
    CalendarToday,
    CheckCircle,
    Delete,
    ExpandMore,
    HelpOutline,
    History,
    InboxOutlined,
    InfoOutlined,
    PendingActions,
    SupportAgent
} from '@mui/icons-material';
import {keyframes} from '@emotion/react';
import {createTicket, fetchTicketsBySchoolId, updateTicket} from '../help&support/redux/HelpSupportAction';
import {selectSchoolDetails, selectUserActualData} from '../../../common';

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Individual Ticket Component
const TicketItem = ({ticket, onStatusUpdate, onDelete, onExpand}) => {
    // Each ticket manages its own status state
    const [enquiryStatusValue, setEnquiryStatusValue] = useState(ticket.status);
    const dispatch = useDispatch();

// Inside your component
    const handleSubmitForStatus = (ticketId, newStatus) => {
        // Create PROPERLY DEFINED update data
        const updateData = {
            status: newStatus,
            // Include other required fields if needed
        };

        // Dispatch with ticket ID and update data
        dispatch(updateTicket(ticketId, updateData));
    }
    return (
        <Card
            key={ticket.id}
            sx={{
                boxShadow: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                },
                borderLeft: `4px solid ${ticket.status === 'resolved' ? '#4CAF50' : '#FF9800'}`
            }}
        >
            <CardContent>
                {/* Header Section */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                        {ticket.category === 'Technical' && <Build color="primary"/>}
                        {ticket.category === 'Billing' && <AttachMoney color="secondary"/>}
                        {ticket.category === 'General' && <HelpOutline color="action"/>}
                        <Typography variant="h6" sx={{fontWeight: 600}}>
                            {ticket.title}
                        </Typography>
                    </Box>
                </Box>

                {/* Meta Information */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    color: 'text.secondary'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 1,
                        color: 'text.secondary'
                    }}>
                        <CalendarToday fontSize="small" sx={{color: 'action.active'}}/>
                        <Typography variant="body2">
                            {new Date(ticket.createdDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                            <Box component="span" sx={{mx: 1}}>•</Box>
                            {new Date(ticket.createdDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Typography>
                    </Box>
                    <Chip
                        label={ticket.subject}
                        size="small"
                        variant="outlined"
                        color="primary"
                    />
                </Box>

                {/* Status Update Form */}
                <Typography variant="h6" gutterBottom>
                    Update Status for {ticket.studentName || "this ticket"}
                </Typography>
                <form onSubmit={handleSubmitForStatus}>
                    <TextField
                        margin="dense"
                        label="Enquiry Status"
                        select
                        fullWidth
                        value={enquiryStatusValue}
                        onChange={(e) => setEnquiryStatusValue(e.target.value)}
                        required
                    >
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                        <MenuItem value="resolved">Resolved</MenuItem>
                    </TextField>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{mt: 2}}
                    >
                        Update Status
                    </Button>
                </form>

                {/* Description */}
                <Typography
                    variant="body2"
                    sx={{
                        mt: 2,
                        lineHeight: 1.6,
                        color: 'text.secondary'
                    }}
                >
                    {ticket.description}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    pt: 1,
                    mt: 2
                }}>
                    <Button
                        size="small"
                        onClick={() => onExpand(ticket.id)}
                        startIcon={<InfoOutlined/>}
                        sx={{textTransform: 'none'}}
                    >
                        View Details
                    </Button>
                    <IconButton
                        onClick={() => onDelete(ticket.id)}
                        sx={{color: 'error.main'}}
                    >
                        <Delete/>
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
};

const HelpSupport = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({
        category: '',
        description: '',
    });

    // Redux state
    const {tickets, loading, error} = useSelector((state) => state.tickets);
    const schoolData = useSelector(selectSchoolDetails);
    const userData = useSelector(selectUserActualData);

    // Fetch tickets when component mounts
    useEffect(() => {
        if (schoolData?.id) {
            dispatch(fetchTicketsBySchoolId(schoolData.id));
        }
    }, [dispatch, schoolData]);
    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            // Dispatch the updateTicket action
            await dispatch(updateTicket({
                id: ticketId,
                status: newStatus
            })).unwrap();

            // Optionally: Show success message or refetch tickets
            // dispatch(fetchTicketsBySchoolId(schoolData.id));
        } catch (error) {
            console.error('Failed to update ticket status:', error);
            // Handle error (show notification, etc.)
        }
    };
    const faqItems = [
        {
            question: "How do I reset my password?",
            answer: "Go to Account Settings > Security > Reset Password"
        },
        {
            question: "Where can I find my payment history?",
            answer: "Navigate to Billing section in your dashboard"
        },
        {
            question: "How to contact support?",
            answer: "Use this support form or email support@company.com"
        }
    ];


    const handleExpandTicket = (ticketId) => {
        console.log(`Expanding ticket ${ticketId}`);
    };

    const handleDeleteTicket = (id) => {
        console.log('Delete ticket:', id);
    };

    const handleSubmitTicket = (e) => {
        e.preventDefault();
        const ticketData = {
            category: formData.category,
            description: formData.description,
            title: `${formData.category} Issue`,
        };
        dispatch(createTicket(ticketData));
        setFormData({category: '', description: ''});
    };

    return (
        <Box sx={{
            maxWidth: 800,
            mx: 'auto',
            p: 3,
            animation: `${fadeIn} 0.5s ease-out`
        }}>
            <Typography variant="h4" gutterBottom sx={{
                fontWeight: 700,
                mb: 4,
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}>
                <SupportAgent fontSize="large"/>
                Help & Support Center
            </Typography>

            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

            <Tabs
                value={tabValue}
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="fullWidth"
                sx={{
                    mb: 4,
                    '& .MuiTabs-indicator': {
                        height: 3,
                        background: theme.palette.primary.main
                    }
                }}
            >
                <Tab label="New Request" icon={<PendingActions/>}/>
                <Tab label="My Tickets" icon={<History/>}/>
                <Tab label="FAQs" icon={<HelpOutline/>}/>
            </Tabs>

            {tabValue === 0 && (
                <Card sx={{boxShadow: 3}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{mb: 3}}>
                            Create New Support Ticket
                        </Typography>
                        <form onSubmit={handleSubmitTicket}>
                            <Select
                                fullWidth
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                displayEmpty
                                required
                                sx={{mb: 2}}
                            >
                                <MenuItem value="" disabled>
                                    Select Issue Category
                                </MenuItem>
                                <MenuItem value="Technical">Technical Issues</MenuItem>
                                <MenuItem value="Billing">Billing & Payments</MenuItem>
                                <MenuItem value="Account">Account Management</MenuItem>
                                <MenuItem value="Other">Other Issues</MenuItem>
                            </Select>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Describe your issue"
                                variant="outlined"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                required
                                sx={{mb: 3}}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    fontWeight: 600
                                }}
                            >
                                {loading ? <CircularProgress size={24}/> : 'Submit Ticket'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {tabValue === 1 && (
                <Box sx={{
                    '& > *': {mb: 2},
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderRadius: 2
                }}>
                    {loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                            <CircularProgress/>
                        </Box>
                    ) : tickets.length > 0 ? (
                        // Render TicketItems for each ticket
                        [...tickets].reverse().map((ticket) => (
                            <TicketItem
                                key={ticket.id}
                                ticket={ticket}
                                onStatusUpdate={handleStatusUpdate}
                                onDelete={handleDeleteTicket}
                                onExpand={handleExpandTicket}
                            />
                        ))
                    ) : (
                        <Box sx={{
                            textAlign: 'center',
                            p: 4,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2,
                            maxWidth: 500,
                            margin: '0 auto'
                        }}>
                            <InboxOutlined sx={{fontSize: 48, color: 'text.disabled', mb: 2}}/>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No Tickets Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Create your first ticket to get started
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}

            {tabValue === 2 && (
                <Box>
                    {faqItems.map((faq, index) => (
                        <Accordion
                            key={index}
                            sx={{
                                mb: 1,
                                boxShadow: 2,
                                '&:before': {display: 'none'}
                            }}
                        >
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Typography variant="subtitle1" sx={{fontWeight: 600}}>
                                    {faq.question}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body1" sx={{color: 'text.secondary'}}>
                                    <CheckCircle
                                        color="primary"
                                        sx={{verticalAlign: 'middle', mr: 1}}
                                    />
                                    {faq.answer}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default HelpSupport;