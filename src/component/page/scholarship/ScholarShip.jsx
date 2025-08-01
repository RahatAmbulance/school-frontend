import React, {useEffect, useState} from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Chip,
    Collapse,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Fab,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Paper,
    Rating,
    Select,
    Skeleton,
    Snackbar,
    Step,
    StepContent,
    StepLabel,
    Stepper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import {
    AccountBalance,
    Add,
    Assignment,
    AttachMoney,
    Bookmark,
    BookmarkBorder,
    Business,
    CalendarToday,
    CheckCircle,
    CloudUpload,
    Description,
    EmojiEvents,
    ExpandLess,
    ExpandMore,
    FilterAlt,
    GridView,
    Group,
    LocationOn,
    Refresh,
    School,
    Search,
    Star,
    TrendingUp,
    ViewList
} from '@mui/icons-material';

const ScholarShip = () => {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedClass, setSelectedClass] = useState('all');
    const [selectedAmount, setSelectedAmount] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [viewMode, setViewMode] = useState('grid');
    const [tabValue, setTabValue] = useState(0);
    const [applicationDialog, setApplicationDialog] = useState(false);
    const [selectedScholarship, setSelectedScholarship] = useState(null);
    const [bookmarkedScholarships, setBookmarkedScholarships] = useState(new Set());
    const [applicationStep, setApplicationStep] = useState(0);
    const [applicationData, setApplicationData] = useState({
        studentName: '',
        studentId: '',
        class: '',
        parentIncome: '',
        reason: '',
        documents: [],
        guardianName: '',
        guardianPhone: '',
        guardianEmail: '',
        address: '',
        previousScholarships: '',
        achievements: '',
        financialNeed: ''
    });
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});
    const [appliedScholarships, setAppliedScholarships] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [quickApplyDialog, setQuickApplyDialog] = useState(false);

    // Mock user details
    const userDetails = {
        name: 'John Doe',
        id: 'ST001',
        class: '10',
        schoolId: 'SCH001',
        session: '2024-25'
    };

    // Class options from Kindergarten to 12
    const classOptions = [
        {value: 'kg', label: 'Kindergarten'},
        {value: '1', label: 'Class 1'},
        {value: '2', label: 'Class 2'},
        {value: '3', label: 'Class 3'},
        {value: '4', label: 'Class 4'},
        {value: '5', label: 'Class 5'},
        {value: '6', label: 'Class 6'},
        {value: '7', label: 'Class 7'},
        {value: '8', label: 'Class 8'},
        {value: '9', label: 'Class 9'},
        {value: '10', label: 'Class 10'},
        {value: '11', label: 'Class 11'},
        {value: '12', label: 'Class 12'}
    ];

    // Enhanced sample scholarship data
    const sampleScholarships = [
        {
            id: 1,
            name: 'Early Childhood Excellence Award',
            category: 'class',
            type: 'Class-based',
            class: 'kg,1,2,3',
            amount: '₹10,000',
            eligibility: 'Students showing exceptional early learning skills',
            openDate: '2024-01-15',
            closeDate: '2024-12-15',
            description: 'Encouraging young minds with early academic recognition',
            provider: 'Early Learning Foundation',
            requirements: ['Parent recommendation', 'Learning assessment', 'Activity portfolio'],
            status: 'active',
            rating: 4.8,
            applicants: 150,
            awarded: 25,
            trending: true,
            featured: true
        },
        {
            id: 2,
            name: 'Primary Education Support Grant',
            category: 'central',
            type: 'Central Government',
            class: '1,2,3,4,5',
            amount: '₹15,000',
            eligibility: 'Students from economically weaker sections',
            openDate: '2024-02-01',
            closeDate: '2024-12-30',
            description: 'Supporting primary education for underprivileged children',
            provider: 'Ministry of Education',
            requirements: ['Income certificate', 'School enrollment proof', 'Guardian identity'],
            status: 'active',
            rating: 4.7,
            applicants: 2500,
            awarded: 500,
            trending: false,
            featured: true
        },
        {
            id: 3,
            name: 'Middle School Merit Scholarship',
            category: 'state',
            type: 'State/Regional',
            class: '6,7,8',
            amount: '₹20,000',
            eligibility: 'Students with 80% or above in previous grade',
            openDate: '2024-01-20',
            closeDate: '2024-11-20',
            description: 'Recognizing academic excellence in middle school',
            provider: 'State Education Department',
            requirements: ['Academic transcripts', 'Progress report', 'Character certificate'],
            status: 'active',
            rating: 4.6,
            applicants: 1200,
            awarded: 200,
            trending: true,
            featured: false
        },
        {
            id: 4,
            name: 'High School Leadership Award',
            category: 'community',
            type: 'Community-based',
            class: '9,10,11,12',
            amount: '₹25,000',
            eligibility: 'Students with leadership qualities and community service',
            openDate: '2024-02-10',
            closeDate: '2024-11-10',
            description: 'Fostering leadership skills in high school students',
            provider: 'Community Leadership Trust',
            requirements: ['Leadership portfolio', 'Community service record', 'Peer recommendations'],
            status: 'active',
            rating: 4.9,
            applicants: 800,
            awarded: 50,
            trending: false,
            featured: true
        },
        {
            id: 5,
            name: 'Senior Secondary Excellence Grant',
            category: 'private',
            type: 'Private',
            class: '11,12',
            amount: '₹50,000',
            eligibility: 'Students pursuing Science/Commerce with 85%+ marks',
            openDate: '2024-01-01',
            closeDate: '2024-02-28',
            description: 'Supporting academic excellence in senior secondary',
            provider: 'Excellence Foundation',
            requirements: ['Academic records', 'Stream certificate', 'Future goals essay'],
            status: 'expired',
            rating: 4.8,
            applicants: 3000,
            awarded: 100,
            trending: false,
            featured: false
        }
    ];

    const [scholarships, setScholarships] = useState(sampleScholarships);
    const [filteredScholarships, setFilteredScholarships] = useState(sampleScholarships);

    // Application steps
    const applicationSteps = [
        {label: 'Basic Information', description: 'Personal and academic details'},
        {label: 'Guardian Details', description: 'Parent/Guardian information'},
        {label: 'Financial Information', description: 'Income and financial need'},
        {label: 'Documents Upload', description: 'Required documents'},
        {label: 'Review & Submit', description: 'Review all information'}
    ];

    useEffect(() => {
        fetchScholarships();
    }, []);

    const fetchScholarships = async () => {
        try {
            setLoading(true);
            // Simulate API call
            setTimeout(() => {
                setScholarships(sampleScholarships);
                setFilteredScholarships(sampleScholarships);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching scholarships:', error);
            setLoading(false);
            setSnackbar({
                open: true,
                message: 'Error loading scholarships',
                severity: 'error'
            });
        }
    };

    // Enhanced filtering logic
    useEffect(() => {
        let filtered = scholarships;

        // Filter by search term
        if (searchTerm) {
            filtered = scholarships.filter(scholarship =>
                scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scholarship.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scholarship.type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(scholarship => scholarship.category === selectedCategory);
        }

        // Filter by class
        if (selectedClass !== 'all') {
            filtered = filtered.filter(scholarship =>
                scholarship.class === 'all' ||
                scholarship.class.includes(selectedClass)
            );
        }

        // Filter by amount
        if (selectedAmount !== 'all') {
            filtered = filtered.filter(scholarship => {
                const amount = parseInt(scholarship.amount.replace(/[₹,]/g, ''));
                switch (selectedAmount) {
                    case 'low':
                        return amount <= 20000;
                    case 'medium':
                        return amount > 20000 && amount <= 40000;
                    case 'high':
                        return amount > 40000;
                    default:
                        return true;
                }
            });
        }

        // Filter by tab
        switch (tabValue) {
            case 0: // All
                break;
            case 1: // Featured
                filtered = filtered.filter(scholarship => scholarship.featured);
                break;
            case 2: // Trending
                filtered = filtered.filter(scholarship => scholarship.trending);
                break;
            case 3: // Applied
                filtered = filtered.filter(scholarship => appliedScholarships.has(scholarship.id));
                break;
            case 4: // Bookmarked
                filtered = filtered.filter(scholarship => bookmarkedScholarships.has(scholarship.id));
                break;
        }

        // Sort scholarships
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'deadline':
                    return new Date(a.closeDate) - new Date(b.closeDate);
                case 'amount':
                    return parseInt(b.amount.replace(/[₹,]/g, '')) - parseInt(a.amount.replace(/[₹,]/g, ''));
                case 'rating':
                    return b.rating - a.rating;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        setFilteredScholarships(filtered);
    }, [scholarships, searchTerm, selectedCategory, selectedClass, selectedAmount, sortBy, tabValue, appliedScholarships, bookmarkedScholarships]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'expired':
                return 'error';
            case 'upcoming':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'class':
                return <School/>;
            case 'central':
                return <AccountBalance/>;
            case 'state':
                return <LocationOn/>;
            case 'community':
                return <Group/>;
            case 'private':
                return <Business/>;
            case 'sports':
                return <EmojiEvents/>;
            case 'arts':
                return <Star/>;
            default:
                return <School/>;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'class':
                return '#2196f3';
            case 'central':
                return '#4caf50';
            case 'state':
                return '#ff9800';
            case 'community':
                return '#9c27b0';
            case 'private':
                return '#f44336';
            case 'sports':
                return '#ff5722';
            case 'arts':
                return '#e91e63';
            default:
                return '#757575';
        }
    };

    const isApplicationDeadlinePassed = (closeDate) => {
        return new Date(closeDate) < new Date();
    };

    const getDaysRemaining = (closeDate) => {
        const today = new Date();
        const deadline = new Date(closeDate);
        const timeDiff = deadline.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff;
    };

    const handleApplyClick = (scholarship) => {
        if (appliedScholarships.has(scholarship.id)) {
            setSnackbar({
                open: true,
                message: 'You have already applied for this scholarship',
                severity: 'info'
            });
            return;
        }

        if (isApplicationDeadlinePassed(scholarship.closeDate)) {
            setSnackbar({
                open: true,
                message: 'Application deadline has passed',
                severity: 'error'
            });
            return;
        }

        setSelectedScholarship(scholarship);
        setApplicationDialog(true);
        setApplicationStep(0);
        setApplicationData({
            studentName: userDetails?.name || '',
            studentId: userDetails?.id || '',
            class: userDetails?.class || '',
            parentIncome: '',
            reason: '',
            documents: [],
            guardianName: '',
            guardianPhone: '',
            guardianEmail: '',
            address: '',
            previousScholarships: '',
            achievements: '',
            financialNeed: ''
        });
    };

    const handleQuickApply = () => {
        const eligibleScholarships = filteredScholarships.filter(s =>
            !isApplicationDeadlinePassed(s.closeDate) &&
            !appliedScholarships.has(s.id) &&
            (s.class === 'all' || s.class.includes(userDetails.class))
        );

        if (eligibleScholarships.length > 0) {
            setQuickApplyDialog(true);
        } else {
            setSnackbar({
                open: true,
                message: 'No eligible scholarships available for quick apply',
                severity: 'info'
            });
        }
    };

    const handleBookmark = (scholarshipId) => {
        setBookmarkedScholarships(prev => {
            const newSet = new Set(prev);
            if (newSet.has(scholarshipId)) {
                newSet.delete(scholarshipId);
                setSnackbar({
                    open: true,
                    message: 'Removed from bookmarks',
                    severity: 'info'
                });
            } else {
                newSet.add(scholarshipId);
                setSnackbar({
                    open: true,
                    message: 'Added to bookmarks',
                    severity: 'success'
                });
            }
            return newSet;
        });
    };

    const handleApplicationSubmit = async () => {
        try {
            // Validate required fields
            if (!applicationData.studentName || !applicationData.class || !applicationData.reason) {
                setSnackbar({
                    open: true,
                    message: 'Please fill all required fields',
                    severity: 'error'
                });
                return;
            }

            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);

            // Simulate API call
            setTimeout(() => {
                setAppliedScholarships(prev => new Set([...prev, selectedScholarship.id]));
                setApplicationDialog(false);
                setSnackbar({
                    open: true,
                    message: `Application submitted successfully for ${selectedScholarship.name}!`,
                    severity: 'success'
                });
                setUploadProgress(0);
            }, 2000);
        } catch (error) {
            console.error('Error submitting application:', error);
            setSnackbar({
                open: true,
                message: 'Error submitting application',
                severity: 'error'
            });
        }
    };

    const handleInputChange = (field, value) => {
        setApplicationData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNextStep = () => {
        setApplicationStep(prev => prev + 1);
    };

    const handlePrevStep = () => {
        setApplicationStep(prev => prev - 1);
    };

    const renderApplicationStep = () => {
        switch (applicationStep) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Student Name *"
                                value={applicationData.studentName}
                                onChange={(e) => handleInputChange('studentName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Student ID"
                                value={applicationData.studentId}
                                onChange={(e) => handleInputChange('studentId', e.target.value)}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Class *</InputLabel>
                                <Select
                                    value={applicationData.class}
                                    onChange={(e) => handleInputChange('class', e.target.value)}
                                    label="Class *"
                                >
                                    {classOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Address *"
                                value={applicationData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Guardian Name *"
                                value={applicationData.guardianName}
                                onChange={(e) => handleInputChange('guardianName', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Guardian Phone *"
                                value={applicationData.guardianPhone}
                                onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Guardian Email"
                                value={applicationData.guardianEmail}
                                onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Annual Family Income *"
                                value={applicationData.parentIncome}
                                onChange={(e) => handleInputChange('parentIncome', e.target.value)}
                                placeholder="e.g., ₹2,00,000"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Financial Need Description *"
                                value={applicationData.financialNeed}
                                onChange={(e) => handleInputChange('financialNeed', e.target.value)}
                                placeholder="Explain your financial situation..."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Previous Scholarships (if any)"
                                value={applicationData.previousScholarships}
                                onChange={(e) => handleInputChange('previousScholarships', e.target.value)}
                            />
                        </Grid>
                    </Grid>
                );
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Upload Required Documents
                        </Typography>
                        <List>
                            {selectedScholarship?.requirements.map((req, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <Description/>
                                    </ListItemIcon>
                                    <ListItemText primary={req}/>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CloudUpload/>}
                                        size="small"
                                    >
                                        Upload
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                        {uploadProgress > 0 && (
                            <Box sx={{mt: 2}}>
                                <LinearProgress variant="determinate" value={uploadProgress}/>
                                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                    Uploading... {uploadProgress}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Application
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Student Name</Typography>
                                <Typography variant="body1">{applicationData.studentName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Class</Typography>
                                <Typography variant="body1">
                                    {classOptions.find(c => c.value === applicationData.class)?.label}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Guardian Name</Typography>
                                <Typography variant="body1">{applicationData.guardianName}</Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">Annual Income</Typography>
                                <Typography variant="body1">{applicationData.parentIncome}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Reason for Application</Typography>
                                <Typography variant="body1">{applicationData.reason}</Typography>
                            </Grid>
                        </Grid>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Reason for Application *"
                            value={applicationData.reason}
                            onChange={(e) => handleInputChange('reason', e.target.value)}
                            placeholder="Please explain why you are applying for this scholarship..."
                            sx={{mt: 2}}
                        />
                    </Box>
                );
            default:
                return null;
        }
    };

    const renderScholarshipCard = (scholarship) => {
        const daysRemaining = getDaysRemaining(scholarship.closeDate);
        const isExpired = isApplicationDeadlinePassed(scholarship.closeDate);
        const isApplied = appliedScholarships.has(scholarship.id);
        const isBookmarked = bookmarkedScholarships.has(scholarship.id);

        return (
            <Card
                key={scholarship.id}
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: isExpired ? 0.7 : 1
                }}
                elevation={3}
            >
                {scholarship.featured && (
                    <Chip
                        label="Featured"
                        color="primary"
                        size="small"
                        sx={{position: 'absolute', top: 8, left: 8, zIndex: 1}}
                    />
                )}
                {scholarship.trending && (
                    <Chip
                        label="Trending"
                        color="secondary"
                        size="small"
                        icon={<TrendingUp/>}
                        sx={{position: 'absolute', top: 8, right: 48, zIndex: 1}}
                    />
                )}

                <CardHeader
                    avatar={
                        <Avatar sx={{bgcolor: getCategoryColor(scholarship.category)}}>
                            {getCategoryIcon(scholarship.category)}
                        </Avatar>
                    }
                    action={
                        <IconButton onClick={() => handleBookmark(scholarship.id)}>
                            {isBookmarked ? <Bookmark color="primary"/> : <BookmarkBorder/>}
                        </IconButton>
                    }
                    title={
                        <Typography variant="h6" component="div" noWrap>
                            {scholarship.name}
                        </Typography>
                    }
                    subheader={
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <Chip
                                label={scholarship.type}
                                size="small"
                                color={getStatusColor(scholarship.status)}
                            />
                            <Typography variant="body2" color="text.secondary">
                                by {scholarship.provider}
                            </Typography>
                        </Box>
                    }
                />

                <CardContent sx={{flexGrow: 1}}>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {scholarship.description}
                    </Typography>

                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <AttachMoney color="success"/>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                            {scholarship.amount}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        <strong>Eligibility:</strong> {scholarship.eligibility}
                    </Typography>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 2}}>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <CalendarToday fontSize="small" color="action" sx={{mr: 1}}/>
                            <Typography variant="body2">
                                {isExpired ? 'Expired' : `${daysRemaining} days left`}
                            </Typography>
                        </Box>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Rating value={scholarship.rating} readOnly size="small"/>
                            <Typography variant="body2" sx={{ml: 1}}>
                                ({scholarship.rating})
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                        <Typography variant="body2" color="text.secondary">
                            Applicants: {scholarship.applicants}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Awarded: {scholarship.awarded}
                        </Typography>
                    </Box>

                    <LinearProgress
                        variant="determinate"
                        value={(scholarship.awarded / scholarship.applicants) * 100}
                        sx={{height: 6, borderRadius: 3}}
                    />
                </CardContent>

                <CardActions sx={{justifyContent: 'space-between', p: 2}}>
                    <Button
                        size="small"
                        onClick={() => handleApplyClick(scholarship)}
                        variant={isApplied ? "outlined" : "contained"}
                        disabled={isExpired}
                        startIcon={isApplied ? <CheckCircle/> : <Assignment/>}
                        color={isApplied ? "success" : "primary"}
                    >
                        {isApplied ? 'Applied' : isExpired ? 'Expired' : 'Apply Now'}
                    </Button>
                    <Button size="small" color="secondary">
                        View Details
                    </Button>
                </CardActions>
            </Card>
        );
    };

    const renderListView = () => {
        return (
            <Box>
                {filteredScholarships.map((scholarship) => {
                    const daysRemaining = getDaysRemaining(scholarship.closeDate);
                    const isExpired = isApplicationDeadlinePassed(scholarship.closeDate);
                    const isApplied = appliedScholarships.has(scholarship.id);
                    const isBookmarked = bookmarkedScholarships.has(scholarship.id);

                    return (
                        <Paper key={scholarship.id} sx={{p: 3, mb: 2, opacity: isExpired ? 0.7 : 1}}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} md={8}>
                                    <Box sx={{display: 'flex', alignItems: 'center', mb: 1}}>
                                        <Avatar sx={{bgcolor: getCategoryColor(scholarship.category), mr: 2}}>
                                            {getCategoryIcon(scholarship.category)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" component="div">
                                                {scholarship.name}
                                                {scholarship.featured && (
                                                    <Chip label="Featured" color="primary" size="small" sx={{ml: 1}}/>
                                                )}
                                                {scholarship.trending && (
                                                    <Chip label="Trending" color="secondary" size="small" sx={{ml: 1}}/>
                                                )}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {scholarship.provider} • {scholarship.type}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" paragraph>
                                        {scholarship.description}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Eligibility:</strong> {scholarship.eligibility}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{textAlign: 'right'}}>
                                        <Typography variant="h5" color="success.main" fontWeight="bold">
                                            {scholarship.amount}
                                        </Typography>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            mt: 1
                                        }}>
                                            <CalendarToday fontSize="small" sx={{mr: 1}}/>
                                            <Typography variant="body2">
                                                {isExpired ? 'Expired' : `${daysRemaining} days left`}
                                            </Typography>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            mt: 1
                                        }}>
                                            <Rating value={scholarship.rating} readOnly size="small"/>
                                            <Typography variant="body2" sx={{ml: 1}}>
                                                ({scholarship.rating})
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end'}}>
                                            <IconButton onClick={() => handleBookmark(scholarship.id)}>
                                                {isBookmarked ? <Bookmark color="primary"/> : <BookmarkBorder/>}
                                            </IconButton>
                                            <Button
                                                onClick={() => handleApplyClick(scholarship)}
                                                variant={isApplied ? "outlined" : "contained"}
                                                disabled={isExpired}
                                                startIcon={isApplied ? <CheckCircle/> : <Assignment/>}
                                                color={isApplied ? "success" : "primary"}
                                            >
                                                {isApplied ? 'Applied' : isExpired ? 'Expired' : 'Apply'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    );
                })}
            </Box>
        );
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{py: 4}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                    <EmojiEvents sx={{fontSize: 40, mr: 2, color: 'primary.main'}}/>
                    <Typography variant="h3" component="h1" fontWeight="bold">
                        Scholarships
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <Grid item xs={12} md={6} lg={4} key={item}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="80%" height={40}/>
                                    <Skeleton variant="text" width="60%" height={20}/>
                                    <Skeleton variant="rectangular" width="100%" height={120} sx={{my: 2}}/>
                                    <Skeleton variant="text" width="40%" height={20}/>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{py: 4}}>
            {/* Header */}
            <Box sx={{display: 'flex', alignItems: 'center', mb: 4}}>
                <EmojiEvents sx={{fontSize: 40, mr: 2, color: 'primary.main'}}/>
                <Typography variant="h3" component="h1" fontWeight="bold">
                    Scholarships
                </Typography>
                <Box sx={{ml: 'auto', display: 'flex', gap: 1}}>
                    <Button
                        variant="contained"
                        startIcon={<Assignment/>}
                        onClick={handleQuickApply}
                        color="secondary"
                        size="large"
                    >
                        Quick Apply
                    </Button>
                    <IconButton onClick={fetchScholarships} color="primary">
                        <Refresh/>
                    </IconButton>
                    <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                        {viewMode === 'grid' ? <ViewList/> : <GridView/>}
                    </IconButton>
                </Box>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={2} sx={{mb: 3}}>
                <Grid item xs={6} md={3}>
                    <Paper sx={{p: 2, textAlign: 'center'}}>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {filteredScholarships.filter(s => s.status === 'active').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Active</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Paper sx={{p: 2, textAlign: 'center'}}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                            {appliedScholarships.size}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Applied</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Paper sx={{p: 2, textAlign: 'center'}}>
                        <Typography variant="h4" color="warning.main" fontWeight="bold">
                            {bookmarkedScholarships.size}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Bookmarked</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Paper sx={{p: 2, textAlign: 'center'}}>
                        <Typography variant="h4" color="secondary.main" fontWeight="bold">
                            ₹{filteredScholarships.reduce((sum, s) => sum + parseInt(s.amount.replace(/[₹,]/g, '')), 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Total Worth</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{mb: 3}}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{borderBottom: 1, borderColor: 'divider'}}
                >
                    <Tab label="All Scholarships"/>
                    <Tab label="Featured"/>
                    <Tab label="Trending"/>
                    <Tab label="Applied"/>
                    <Tab label="Bookmarked"/>
                </Tabs>
            </Paper>

            {/* Filters */}
            <Paper sx={{p: 3, mb: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <FilterAlt sx={{mr: 1}}/>
                    <Typography variant="h6">Filters</Typography>
                    <Button
                        size="small"
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{ml: 'auto'}}
                    >
                        {showFilters ? <ExpandLess/> : <ExpandMore/>}
                    </Button>
                </Box>
                <Collapse in={showFilters}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                placeholder="Search scholarships..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{mr: 1, color: 'text.secondary'}}/>
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    label="Category"
                                >
                                    <MenuItem value="all">All Categories</MenuItem>
                                    <MenuItem value="class">Class-based</MenuItem>
                                    <MenuItem value="central">Central Government</MenuItem>
                                    <MenuItem value="state">State/Regional</MenuItem>
                                    <MenuItem value="community">Community-based</MenuItem>
                                    <MenuItem value="private">Private</MenuItem>
                                    <MenuItem value="sports">Sports</MenuItem>
                                    <MenuItem value="arts">Arts & Culture</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Class</InputLabel>
                                <Select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    label="Class"
                                >
                                    <MenuItem value="all">All Classes</MenuItem>
                                    {classOptions.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Amount Range</InputLabel>
                                <Select
                                    value={selectedAmount}
                                    onChange={(e) => setSelectedAmount(e.target.value)}
                                    label="Amount Range"
                                >
                                    <MenuItem value="all">All Amounts</MenuItem>
                                    <MenuItem value="low">₹0 - ₹20,000</MenuItem>
                                    <MenuItem value="medium">₹20,001 - ₹40,000</MenuItem>
                                    <MenuItem value="high">₹40,000+</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel>Sort By</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Sort By"
                                >
                                    <MenuItem value="deadline">Deadline</MenuItem>
                                    <MenuItem value="amount">Amount</MenuItem>
                                    <MenuItem value="rating">Rating</MenuItem>
                                    <MenuItem value="name">Name</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                    setSelectedClass('all');
                                    setSelectedAmount('all');
                                    setSortBy('deadline');
                                }}
                                sx={{height: '56px'}}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                </Collapse>
            </Paper>

            {/* Results Summary */}
            <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="h6">
                    Showing {filteredScholarships.length} scholarships
                </Typography>
                {filteredScholarships.length === 0 && (
                    <Alert severity="info" sx={{flex: 1, ml: 2}}>
                        No scholarships found matching your criteria. Try adjusting your filters.
                    </Alert>
                )}
            </Box>

            {/* Scholarship Display */}
            {viewMode === 'grid' ? (
                <Grid container spacing={3}>
                    {filteredScholarships.map((scholarship) => (
                        <Grid item xs={12} md={6} lg={4} key={scholarship.id}>
                            {renderScholarshipCard(scholarship)}
                        </Grid>
                    ))}
                </Grid>
            ) : (
                renderListView()
            )}

            {/* Application Dialog */}
            <Dialog
                open={applicationDialog}
                onClose={() => setApplicationDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Apply for {selectedScholarship?.name}
                    <Typography variant="body2" color="text.secondary">
                        Amount: {selectedScholarship?.amount}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={applicationStep} orientation="vertical" sx={{mb: 3}}>
                        {applicationSteps.map((step, index) => (
                            <Step key={step.label}>
                                <StepLabel>{step.label}</StepLabel>
                                <StepContent>
                                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                                        {step.description}
                                    </Typography>
                                </StepContent>
                            </Step>
                        ))}
                    </Stepper>
                    {renderApplicationStep()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApplicationDialog(false)}>
                        Cancel
                    </Button>
                    {applicationStep > 0 && (
                        <Button onClick={handlePrevStep}>
                            Previous
                        </Button>
                    )}
                    {applicationStep < applicationSteps.length - 1 ? (
                        <Button onClick={handleNextStep} variant="contained">
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleApplicationSubmit}
                            variant="contained"
                            color="success"
                        >
                            Submit Application
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Quick Apply Dialog */}
            <Dialog
                open={quickApplyDialog}
                onClose={() => setQuickApplyDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Quick Apply</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        Apply to multiple eligible scholarships with one click using your saved profile information.
                    </Typography>
                    <Alert severity="info" sx={{mb: 2}}>
                        This will use your existing profile data and apply basic eligibility filters.
                    </Alert>
                    <Typography variant="h6" gutterBottom>
                        Eligible Scholarships ({filteredScholarships.filter(s =>
                        !isApplicationDeadlinePassed(s.closeDate) &&
                        !appliedScholarships.has(s.id) &&
                        (s.class === 'all' || s.class.includes(userDetails.class))
                    ).length})
                    </Typography>
                    <List>
                        {filteredScholarships
                            .filter(s =>
                                !isApplicationDeadlinePassed(s.closeDate) &&
                                !appliedScholarships.has(s.id) &&
                                (s.class === 'all' || s.class.includes(userDetails.class))
                            )
                            .map(scholarship => (
                                <ListItem key={scholarship.id}>
                                    <ListItemIcon>
                                        {getCategoryIcon(scholarship.category)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={scholarship.name}
                                        secondary={`${scholarship.amount} • ${scholarship.provider}`}
                                    />
                                </ListItem>
                            ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuickApplyDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const eligibleScholarships = filteredScholarships.filter(s =>
                                !isApplicationDeadlinePassed(s.closeDate) &&
                                !appliedScholarships.has(s.id) &&
                                (s.class === 'all' || s.class.includes(userDetails.class))
                            );
                            eligibleScholarships.forEach(s => {
                                setAppliedScholarships(prev => new Set([...prev, s.id]));
                            });
                            setQuickApplyDialog(false);
                            setSnackbar({
                                open: true,
                                message: `Successfully applied to ${eligibleScholarships.length} scholarships!`,
                                severity: 'success'
                            });
                        }}
                    >
                        Apply to All
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({...snackbar, open: false})}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Floating Action Button for Quick Actions */}
            <Fab
                color="primary"
                sx={{position: 'fixed', bottom: 16, right: 16}}
                onClick={handleQuickApply}
            >
                <Add/>
            </Fab>
        </Container>
    );
};

export default ScholarShip;
