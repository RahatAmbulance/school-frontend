import React, {useEffect, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
    AssignmentTurnedIn as AssignmentTurnedInIcon,
    Badge as BadgeIcon,
    Dashboard as DashboardIcon,
    DirectionsBus as DirectionsBusIcon,
    EventAvailable as EventAvailableIcon,
    ExitToApp as ExitToAppIcon,
    Grade as GradeIcon,
    Mail as MailIcon,
    Notifications as NotificationsIcon,
    People as PeopleIcon,
    Quiz as QuizIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
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

const CustomTooltip = styled(({className, ...props}) => (
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
`;

const IconContainer = styled.div`
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
`;

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

const MainContainer = styled.div`
    display: flex;
    height: calc(100vh - 56px);
    overflow: hidden;
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

const StatusIndicator = styled.div`
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
`;

const SearchBar = styled.div`
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
`;


const routes = [
    {
        path: '/',
        name: 'Dashboard',
        icon: <IconContainer><DashboardIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/staff/dailyTask',
        name: 'Assignment /D.A',
        icon: (
            <IconContainer>
                <AssignmentTurnedInIcon style={{color: 'white', fontSize: '2rem'}}/>
            </IconContainer>
        )
    },
    {
        path: '/staff/gallery',
        name: 'Gallery',
        icon: <IconContainer><FaThLarge style={{color: 'white', fontSize: '2rem'}}/></IconContainer>
    },
    {
        path: '/ai',
        name: 'AI',
        icon: <IconContainer><GiArtificialIntelligence style={{color: 'white', fontSize: '2rem'}}/></IconContainer>
    },
    {
        path: '/staff/attendance',
        name: 'Attendance',
        icon: <IconContainer><EventAvailableIcon style={{color: 'white'}}/></IconContainer>,
        subRoutes: [
            {
                path: '/staff/attendance/student',
                name: 'Student',
                icon: <IconContainer><PeopleIcon style={{color: 'white'}}/></IconContainer>
            },
            {
                path: '/staff/attendance/staff',
                name: 'Staff',
                icon: <IconContainer><BadgeIcon style={{color: 'white'}}/></IconContainer>
            },
            {
                path: '/staff/attendance/leave',
                name: 'Leave',
                icon: <IconContainer><ExitToAppIcon style={{color: 'white'}}/></IconContainer>
            }
        ]
    },
    {
        path: '/staff/exam',
        name: 'Exam',
        icon: <IconContainer><QuizIcon style={{color: 'white'}}/></IconContainer>,
        subRoutes: [
            {
                path: '/staff/exam/result',
                name: 'Grading',
                icon: <IconContainer><GradeIcon style={{color: 'white'}}/></IconContainer>
            },
            {
                path: '/staff/exam/marksheet',
                name: 'MarkSheet',
                icon: <IconContainer><AssessmentIcon style={{color: 'white'}}/></IconContainer>
            }
        ]
    },
    {
        path: '/staff/communication',
        name: 'Communication',
        icon: <ChatIcon style={{color: 'white'}}/>,
        subRoutes: [
            {
                path: '/staff/communication/notification',
                name: 'Notification',
                icon: <IconContainer><NotificationsIcon style={{color: 'white'}}/></IconContainer>
            },
            {
                path: '/staff/communication/mail',
                name: 'Mail',
                icon: <MailOutlineIcon style={{color: 'white'}}/>
            },
            {
                path: '/staff/communication/chat',
                name: 'Chat',
                icon: <ChatBubbleOutlineIcon style={{color: 'white'}}/>
            },
            {
                path: '/staff/communication/meeting',
                name: 'Meeting',
                icon: <VideoCallIcon style={{color: 'white'}}/>
            }
        ]
    },
    {
        path: '/staff/studymaterial',
        name: 'Study Material',
        icon: <IconContainer><LibraryBooksIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/staff/transport',
        name: 'Transport',
        icon: <IconContainer><DirectionsBusIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/staff/timeTable',
        name: 'Time Table',
        icon: <IconContainer><TableChartIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/staff/complaint',
        name: 'Complain',
        icon: <IconContainer><ReportProblemIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/staff/help&support',
        name: 'HelpAndSupport',
        icon: <IconContainer><HelpOutlineIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/scholarship',
        name: 'Scholarship',
        icon: <IconContainer><SettingsIcon style={{color: 'white'}}/></IconContainer>
    },
    {
        path: '/logout',
        name: 'Logout',
        icon: <IconContainer><ExitToAppIcon style={{color: 'white'}}/></IconContainer>
    }
];


const settings = [
    {name: 'Dashboard', path: '/'},
    {name: 'Profile', path: '/profile'},
    {name: 'Logout', path: '/logout'}
];

const StaffSideBar = ({children}) => {
    const dispatch = useDispatch();
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const [notificationsCount, setNotificationsCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const schoolData = useSelector((state) => state.school?.schools);

    const actualUsrData = useSelector(selectUserActualData);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const [previousRoute, setPreviousRoute] = useState('');
    const allowedRoutes = ['Enquiry', 'Staff', 'Student', 'Class-Section', 'Subject', 'Religion', 'House',
        'Role', 'Holiday', 'Event', 'Period', 'grade',
        '/master/subject', '/master/religion'
        , '/master/house', '/master/role', '/master/holiday', '/master/event', '/master/period', '/master/grade'];
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const currentRouteName = getRouteName();
        if (allowedRoutes.includes(previousRoute)) {
            if (previousRoute !== currentRouteName) {
                callYourApiFunction();
            }
        }
        setPreviousRoute(currentRouteName);
    }, [location, routes, previousRoute]);

    const callYourApiFunction = async () => {
        await dispatch(fetchAllData(schoolId, session));
    };

    const convertByteArrayToBase64 = (byteArray) => {
        return `data:image/jpeg;base64,${byteArray}`;
    };
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Fetch unread mail count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await api.get(`/api/mail/unread-count?email=${actualUsrData?.email}&schoolId=${schoolId}&role=${actualUsrData?.role}`);
                const data = response.data;
                if (data.status === "success") {
                    setUnreadCount(data.unreadCount);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        if (actualUsrData?.email && schoolId && actualUsrData?.role && actualUsrData?.token) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [actualUsrData, schoolId]);
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const getRouteName = () => {
        const route = routes.find(r => r && r.path === location.pathname); // Add null check
        if (route) {
            return route.name;
        } else {
            for (const mainRoute of routes) {
                if (mainRoute.subRoutes) {
                    const subRoute = mainRoute.subRoutes.find(sr => sr && sr.path === location.pathname); // Add null check
                    if (subRoute) {
                        return subRoute.name;
                    }
                }
            }
        }
        return 'Dashboard';
    };

    const showAnimation = {
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
    };

    const handleSettingsItemClick = (path) => {
        handleCloseUserMenu();
        navigate(path);
    };

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderNavLink = (route, index) => {
        const link = (
            <StyledNavLink
                to={route.path}
                key={index}
                className={({isActive}) => isActive ? 'active' : ''}
            >
                <div className="icon">{route.icon}</div>
                <AnimatePresence>
                    {isOpen && (
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

        return !isOpen ? (
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
    };

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
                        <Tooltip title={isOnline ? "Connected" : "Offline"}>
                            <StatusIndicator isOnline={isOnline}/>
                        </Tooltip>

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

                        <Box sx={{display: 'flex', gap: '0.5rem'}}>
                            <Tooltip title="Messages">
                                <IconButton
                                    color="inherit"
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
                                        onClick={() => navigate('/communication/mail')}
                                    >
                                        <MailIcon/>
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Notifications">
                                <IconButton
                                    color="inherit"
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
                                        onClick={() => navigate('/notification')}
                                    >
                                        <NotificationsIcon/>
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Settings">
                                <IconButton
                                    onClick={handleOpenUserMenu}
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
                        </Box>
                    </Box>

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
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                        {settings.map((setting) => (
                            <MenuItem
                                key={setting.name}
                                onClick={() => handleSettingsItemClick(setting.path)}
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
                </StyledToolbar>
            </StyledAppBar>

            <MainContainer>
                <StyledSidebar
                    animate={{
                        width: isOpen ? "300px" : "100px",
                        transition: {
                            duration: 0.3,
                            type: "spring",
                            damping: 20,
                        },
                    }}
                    className="sidebar"
                >
                    {isOpen && (
                        <SearchBar>
                            <SearchIcon/>
                            <input
                                type="text"
                                placeholder="Search menu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                        isOpen={isOpen}
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
            </MainContainer>
        </>
    );
};

export default StaffSideBar;