import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import {
    Assessment as AssessmentIcon,
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    CardMembership as CardMembershipIcon,
    Dashboard as DashboardIcon,
    DirectionsBus as DirectionsBusIcon,
    EventAvailable as EventAvailableIcon,
    ExitToApp as ExitToAppIcon,
    LibraryBooks as LibraryBooksIcon,
    Mail as MailIcon,
    MonetizationOn as MonetizationOnIcon,
    Notifications as NotificationsIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    TableChart as TableChartIcon,
} from '@mui/icons-material';
import {AnimatePresence, motion} from 'framer-motion';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import styled from 'styled-components';
import {Avatar, Badge, Box, Menu, MenuItem, Tooltip, Zoom} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import MenuIcon from "@mui/icons-material/Menu";
import {FaThLarge} from 'react-icons/fa';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ChatIcon from '@mui/icons-material/Chat';
import SidebarMenu from "../../Sidebar/SidebarMenu";
import {api, selectSchoolDetails, selectUserActualData} from "../../../common";
import {fetchAllData} from "../../page/dashboard/redux/masterActions";
import {GiArtificialIntelligence} from 'react-icons/gi';
// Styled Components - Memoized
const CustomTooltip = memo(styled(({className, ...props}) => (
    <Tooltip {...props} classes={{popper: className}}/>
))`
    & .MuiTooltip-tooltip {
        background: rgba(30, 30, 45, 0.95);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
`);

const IconContainer = memo(styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(8px);

    svg {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.3s ease;
    }

    &:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

        svg {
            color: white;
            transform: scale(1.1);
        }
    }
`);

const StyledAppBar = styled(AppBar)`
    background: linear-gradient(135deg, rgba(30, 30, 45, 0.98) 0%, rgba(45, 45, 68, 0.98) 100%);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    min-height: 56px;
`;

const StyledToolbar = styled(Toolbar)`
    padding: 0.5rem 1rem;
    gap: 1rem;
    min-height: 56px !important;

    .MuiTypography-root {
        font-size: 15px;
        font-weight: 500;
    }
`;

const StyledSidebar = styled(motion.div)`
    background: linear-gradient(180deg, rgba(30, 30, 45, 0.98) 0%, rgba(45, 45, 68, 0.98) 100%);
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    z-index: 1000;
    position: relative;

    &:after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 1px;
        background: linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0) 100%
        );
    }
`;

const StyledNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    margin: 0.2rem 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    font-size: 13px;

    &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 0;
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
        border-radius: 0 4px 4px 0;
        transition: height 0.3s ease;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
        transform: translateX(5px);

        &:before {
            height: 70%;
        }

        ${IconContainer} {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.1);

            svg {
                color: white;
                transform: scale(1.1);
            }
        }
    }

    &.active {
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
        color: white;

        &:before {
            height: 70%;
        }

        ${IconContainer} {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            border-color: rgba(255, 255, 255, 0.1);

            svg {
                color: white;
            }
        }
    }
`;

const StatusIndicator = memo(styled.div`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${(props) => (props.isOnline ? '#22c55e' : '#ef4444')};
    box-shadow: 0 0 8px ${(props) => (props.isOnline ? '#22c55e80' : '#ef444480')};
    transition: all 0.3s ease;
    position: relative;

    &:after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        background: ${(props) => (props.isOnline ? '#22c55e33' : '#ef444433')};
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.8;
        }
        70% {
            transform: scale(2);
            opacity: 0;
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
`);

const SearchBar = memo(styled.div`
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.4rem 0.8rem;
    margin: 0.8rem;
    transition: all 0.3s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
    }

    input {
        background: none;
        border: none;
        color: white;
        width: 100%;
        padding: 0.3rem;
        outline: none;
        font-size: 13px;

        &::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
    }

    svg {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.5);
    }
`);

// Constants - Moved outside component to prevent recreation
const ROUTES = [
    {
        path: '/',
        name: 'Dashboard',
        icon: <IconContainer><DashboardIcon/></IconContainer>
    },
    {
        path: '/dailyTask',
        name: 'Assignment /D.A',
        icon: <IconContainer><AssignmentTurnedInIcon/></IconContainer>
    },
    {
        path: '/student/gallery',
        name: 'Gallery',
        icon: <IconContainer><FaThLarge/></IconContainer>
    },
    {
        path: '/ai',
        name: 'AI',
        icon: <IconContainer><GiArtificialIntelligence style={{color: 'white', fontSize: '2rem'}}/></IconContainer>
    },
    {
        path: '/student/attendance',
        name: 'Attendance',
        icon: <IconContainer><EventAvailableIcon/></IconContainer>,
        subRoutes: [
            {
                path: '/student/attendance/student',
                name: 'Student',
                icon: <IconContainer><PeopleIcon/></IconContainer>
            },
            {
                path: '/student/attendance/leave',
                name: 'Leave',
                icon: <IconContainer><ExitToAppIcon/></IconContainer>
            }
        ]
    },
    {
        path: '/student/feeModule/deposit',
        name: 'Fee Deposit',
        icon: <IconContainer><MonetizationOnIcon/></IconContainer>,
    },
    {
        path: '/student/exam',
        name: 'Exam',
        icon: <IconContainer><QuizIcon/></IconContainer>,
        subRoutes: [
            {
                path: '/student/exam/admit',
                name: 'Admit Card',
                icon: <IconContainer><CardMembershipIcon/></IconContainer>
            },
            {
                path: '/student/exam/marksheet',
                name: 'MarkSheet',
                icon: <IconContainer><AssessmentIcon/></IconContainer>
            }
        ]
    },
    {
        path: '/student/communication',
        name: 'Communication',
        icon: <IconContainer><ChatIcon/></IconContainer>,
        subRoutes: [
            {
                path: '/student/communication/mail',
                name: 'Mail',
                icon: <IconContainer><MailOutlineIcon/></IconContainer>
            },
            {
                path: '/student/communication/chat',
                name: 'Chat',
                icon: <IconContainer><ChatBubbleOutlineIcon/></IconContainer>
            },
            {
                path: '/student/communication/meeting',
                name: 'Meeting',
                icon: <IconContainer><VideoCallIcon/></IconContainer>
            }
        ]
    },
    {
        path: '/student/studymaterial',
        name: 'Study Material',
        icon: <IconContainer><LibraryBooksIcon/></IconContainer>
    },
    {
        path: '/student/transport',
        name: 'Transport',
        icon: <IconContainer><DirectionsBusIcon/></IconContainer>
    },
    {
        path: '/student/timeTable',
        name: 'Time Table',
        icon: <IconContainer><TableChartIcon/></IconContainer>
    },
    {
        path: '/scholarship',
        name: 'Scholarship',
        icon: <IconContainer><SettingsIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/student/complaint',
        name: 'Complain',
        icon: <IconContainer><ReportProblemIcon/></IconContainer>
    },
    {
        path: '/logout',
        name: 'Logout',
        icon: <IconContainer><ExitToAppIcon/></IconContainer>
    },
];

const SETTINGS = [
    {name: 'Dashboard', path: '/'},
    {name: 'Profile', path: '/profile'},
    {name: 'Logout', path: '/logout'}
];

const ALLOWED_ROUTES = [
    'Enquiry', 'Staff', 'Student', 'Class-Section', 'Subject', 'Religion', 'House',
    'Role', 'Holiday', 'Event', 'Period', 'grade',
    '/master/subject', '/master/religion', '/master/house', '/master/role',
    '/master/holiday', '/master/event', '/master/period', '/master/grade'
];

const UNREAD_COUNT_REFRESH_INTERVAL = 60000; // 1 minute

// Memoized components
const StatusBadge = memo(({isOnline}) => (
    <Tooltip title={isOnline ? "Connected" : "Offline"}>
        <StatusIndicator isOnline={isOnline}/>
    </Tooltip>
));

const SchoolInfo = memo(({schoolData, session}) => (
    <>
        {schoolData && (
            <Typography
                variant="body1"
                sx={{
                    color: 'inherit',
                    fontWeight: 500
                }}
            >
                {schoolData.name}
            </Typography>
        )}

        {session && (
            <Typography
                variant="body2"
                sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    padding: '4px 12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                }}
            >
                {session}
            </Typography>
        )}
    </>
));

const NotificationBadges = memo(({unreadCount, notificationsCount, onMailClick, onNotificationClick}) => (
    <Box sx={{display: 'flex', gap: '0.5rem'}}>
        <Tooltip title="Messages">
            <IconButton
                color="inherit"
                onClick={onMailClick}
                sx={{
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            background: '#ef4444',
                        },
                        cursor: 'pointer'
                    }}
                >
                    <MailIcon/>
                </Badge>
            </IconButton>
        </Tooltip>

        <Tooltip title="Notifications">
            <IconButton
                color="inherit"
                onClick={onNotificationClick}
                sx={{
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <Badge
                    badgeContent={notificationsCount}
                    color="error"
                    sx={{
                        '& .MuiBadge-badge': {
                            background: '#ef4444',
                        }
                    }}
                >
                    <NotificationsIcon/>
                </Badge>
            </IconButton>
        </Tooltip>
    </Box>
));

const UserAvatar = memo(({userData, schoolData, onClick}) => {
    const convertByteArrayToBase64 = useCallback((byteArray) => {
        return `data:image/jpeg;base64,${byteArray}`;
    }, []);

    return (
        <Tooltip title="Settings">
            <IconButton
                onClick={onClick}
                sx={{
                    p: 0,
                    '&:hover': {
                        transform: 'scale(1.05)',
                    },
                    transition: 'transform 0.2s ease'
                }}
            >
                <Avatar
                    alt="User Avatar"
                    src={userData?.logo ? convertByteArrayToBase64(userData.logo) : null}
                    sx={{
                        width: 40,
                        height: 40,
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    }}
                >
                    {!userData?.logo && schoolData?.name
                        ? schoolData.name.charAt(0).toUpperCase()
                        : null}
                </Avatar>
            </IconButton>
        </Tooltip>
    );
});

const SettingsMenu = memo(({anchorEl, isOpen, onClose, settings, onItemClick}) => (
    <Menu
        sx={{
            mt: '45px',
            '& .MuiPaper-root': {
                background: '#1e1e2d',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }
        }}
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        open={isOpen}
        onClose={onClose}
    >
        {settings.map((setting) => (
            <MenuItem
                key={setting.name}
                onClick={() => onItemClick(setting.path)}
                sx={{
                    color: 'white',
                    '&:hover': {
                        background: 'rgba(255, 255, 255, 0.05)',
                    }
                }}
            >
                <Typography textAlign="center">{setting.name}</Typography>
            </MenuItem>
        ))}
    </Menu>
));

// Main Component
const StudentSideBar = memo(({children}) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    // Combined state for UI
    const [uiState, setUiState] = useState({
        anchorElUser: null,
        isOpen: true,
        searchTerm: ''
    });

    // Combined state for data
    const [dataState, setDataState] = useState({
        notificationsCount: 0,
        unreadCount: 0,
        isOnline: navigator.onLine,
        previousRoute: ''
    });

    // Selectors
    const schoolData = useSelector((state) => state.school?.schools);
    const actualUsrData = useSelector(selectUserActualData);
    const userData = useSelector(selectSchoolDetails);

    // Memoized values
    const schoolId = useMemo(() => userData?.id, [userData?.id]);
    const session = useMemo(() => userData?.session, [userData?.session]);

    // Memoized route finding function
    const getRouteName = useCallback(() => {
        const route = ROUTES.find(r => r?.path === location.pathname);
        if (route) {
            return route.name;
        }

        for (const mainRoute of ROUTES) {
            if (mainRoute.subRoutes) {
                const subRoute = mainRoute.subRoutes.find(sr => sr?.path === location.pathname);
                if (subRoute) {
                    return subRoute.name;
                }
            }
        }
        return 'Dashboard';
    }, [location.pathname]);

    // Memoized filtered routes
    const filteredRoutes = useMemo(() =>
        ROUTES.filter(route =>
            route.name.toLowerCase().includes(uiState.searchTerm.toLowerCase())
        ), [uiState.searchTerm]
    );

    // API call function
    const callApiFunction = useCallback(async () => {
        if (!schoolId || !session) return;

        try {
            console.log('Calling fetchAllData');
            await dispatch(fetchAllData(schoolId, session));
        } catch (error) {
            console.error('Error in fetchAllData:', error);
        }
    }, [dispatch, schoolId, session]);

    // Fetch unread count function
    const fetchUnreadCount = useCallback(async () => {
        if (!actualUsrData?.email || !schoolId || !actualUsrData?.role || !actualUsrData?.token) {
            return;
        }

        try {
            const response = await api.get(
                `/api/mail/unread-count?email=${actualUsrData.email}&schoolId=${schoolId}&role=${actualUsrData.role}`
            );

            if (response.data?.status === "success") {
                setDataState(prev => ({
                    ...prev,
                    unreadCount: response.data.unreadCount
                }));
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [actualUsrData?.email, actualUsrData?.role, actualUsrData?.token, schoolId]);

    // Event handlers
    const handleOpenUserMenu = useCallback((event) => {
        setUiState(prev => ({...prev, anchorElUser: event.currentTarget}));
    }, []);

    const handleCloseUserMenu = useCallback(() => {
        setUiState(prev => ({...prev, anchorElUser: null}));
    }, []);

    const toggleSidebar = useCallback(() => {
        setUiState(prev => ({...prev, isOpen: !prev.isOpen}));
    }, []);

    const handleSettingsItemClick = useCallback((path) => {
        handleCloseUserMenu();
        navigate(path);
    }, [navigate, handleCloseUserMenu]);

    const handleSearchChange = useCallback((e) => {
        setUiState(prev => ({...prev, searchTerm: e.target.value}));
    }, []);

    const handleMailClick = useCallback(() => {
        navigate('/communication/mail');
    }, [navigate]);

    const handleNotificationClick = useCallback(() => {
        navigate('/notification');
    }, [navigate]);

    const handleOnlineStatusChange = useCallback(() => {
        setDataState(prev => ({...prev, isOnline: navigator.onLine}));
    }, []);

    // Effects
    useEffect(() => {
        const handleOnline = () => handleOnlineStatusChange();
        const handleOffline = () => handleOnlineStatusChange();

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [handleOnlineStatusChange]);

    useEffect(() => {
        const currentRouteName = getRouteName();

        if (ALLOWED_ROUTES.includes(dataState.previousRoute) &&
            dataState.previousRoute !== currentRouteName) {
            callApiFunction();
        }

        setDataState(prev => ({...prev, previousRoute: currentRouteName}));
    }, [location, getRouteName, dataState.previousRoute, callApiFunction]);

    useEffect(() => {
        if (actualUsrData?.email && schoolId && actualUsrData?.role && actualUsrData?.token) {
            fetchUnreadCount();

            const interval = setInterval(fetchUnreadCount, UNREAD_COUNT_REFRESH_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [fetchUnreadCount]);

    // Memoized animations
    const showAnimation = useMemo(() => ({
        hidden: {
            opacity: 0,
            x: -20,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        show: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    }), []);

    const sidebarAnimation = useMemo(() => ({
        width: uiState.isOpen ? "300px" : "100px",
        transition: {
            duration: 0.3,
            type: "spring",
            damping: 20,
        },
    }), [uiState.isOpen]);

    // Render nav link function
    const renderNavLink = useCallback((route, index) => {
        const link = (
            <StyledNavLink
                to={route.path}
                key={index}
                className={({isActive}) => isActive ? 'active' : ''}
            >
                <div className="icon">{route.icon}</div>
                <AnimatePresence>
                    {uiState.isOpen && (
                        <motion.div
                            variants={showAnimation}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            className="link_text"
                        >
                            {route.name}
                        </motion.div>
                    )}
                </AnimatePresence>
            </StyledNavLink>
        );

        return !uiState.isOpen ? (
            <CustomTooltip
                key={index}
                title={route.name}
                placement="right"
                TransitionComponent={Zoom}
                arrow
            >
                <div>{link}</div>
            </CustomTooltip>
        ) : (
            link
        );
    }, [uiState.isOpen, showAnimation]);

    return (
        <>
            <StyledAppBar position="static">
                <StyledToolbar variant="dense">
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleSidebar}
                        sx={{
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.1)',
                            }
                        }}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Typography
                        variant="h6"
                        color="inherit"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        {getRouteName()}
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <StatusBadge isOnline={dataState.isOnline}/>

                        <SchoolInfo schoolData={schoolData} session={session}/>

                        <NotificationBadges
                            unreadCount={dataState.unreadCount}
                            notificationsCount={dataState.notificationsCount}
                            onMailClick={handleMailClick}
                            onNotificationClick={handleNotificationClick}
                        />

                        <UserAvatar
                            userData={userData}
                            schoolData={schoolData}
                            onClick={handleOpenUserMenu}
                        />
                    </Box>

                    <SettingsMenu
                        anchorEl={uiState.anchorElUser}
                        isOpen={Boolean(uiState.anchorElUser)}
                        onClose={handleCloseUserMenu}
                        settings={SETTINGS}
                        onItemClick={handleSettingsItemClick}
                    />
                </StyledToolbar>
            </StyledAppBar>

            <div className="main-container">
                <StyledSidebar
                    animate={sidebarAnimation}
                    className="sidebar"
                >
                    {uiState.isOpen && (
                        <SearchBar>
                            <SearchIcon/>
                            <input
                                type="text"
                                placeholder="Search menu..."
                                value={uiState.searchTerm}
                                onChange={handleSearchChange}
                            />
                        </SearchBar>
                    )}

                    <section
                        className="routes"
                        style={{
                            height: 'calc(100vh - 56px)',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '0.5rem 0'
                        }}
                    >
                        {filteredRoutes.map((route, index) => {
                            if (route.subRoutes) {
                                return (
                                    <SidebarMenu
                                        key={route.path}
                                        route={route}
                                        showAnimation={showAnimation}
                                        isOpen={uiState.isOpen}
                                    />
                                );
                            }
                            return renderNavLink(route, index);
                        })}
                    </section>
                </StyledSidebar>

                <main style={{
                    height: 'calc(100vh - 56px)',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '1.2rem',
                    background: '#f8fafc',
                    width: '100%'
                }}>
                    {children}
                </main>
            </div>
        </>
    );
});

StudentSideBar.displayName = 'StudentSideBar';

export default StudentSideBar;
