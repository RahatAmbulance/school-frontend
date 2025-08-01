import * as React from 'react';
import {useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import TextField from '@mui/material/TextField';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import {setUser} from "./redux/action";
import {Transition} from "react-transition-group";
import {api} from "../../common";
import School from "./schools/School";
import Alert from '@mui/material/Alert';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export const Header = ({onBooleanChange}) => {
    const LOGIN_PASSWORD = "/login";
    const pages = ['Home', 'About Us', 'Product', 'Price', 'Contact', 'Login'];

    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [phone, setPhone] = React.useState('');
    const [otpPassword, setOtpPassword] = React.useState('');
    const [invalidCred, setInvalidCred] = React.useState('');
    const [tabIndex, setTabIndex] = React.useState(0);  // State for managing tab selection

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {isLoginModalOpen, user} = useSelector(state => state);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(LOGIN_PASSWORD, {mobileNumber: phone, tempPassword: otpPassword});
            if (response.data.code === 200) {
                localStorage.setItem("username", response.data.response.mobileNumber);
                dispatch(setUser(response.data.response));
                if (response.data.response?.firstTimeLogin === 'Y') {
                    navigate("/user/business");
                }
                handleClose();
                //   onBooleanChange();
            } else {
                //  onBooleanChange();
                setInvalidCred(response.data.response || 'Invalid credentials');
            }
        } catch (error) {
            // onBooleanChange();
            console.error('Error:', error);
            setInvalidCred('An error occurred. Please try again later.');
        }
    };

    const handleClose = () => setOpen(false);

    const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);

    const handleCloseNavMenu = () => setAnchorElNav(null);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setInvalidCred('');  // Clear error message when switching tabs
    };
    useEffect(() => {
    }, [phone, otpPassword]);

    // Callback to handle successful registration
    const handleRegistrationSuccess = ({loginId, password}) => {
        // Set the login ID and password for the login form
        setPhone(loginId);
        setOtpPassword(password);
        // Switch to the login tab
        setTabIndex(0);
        // Open the modal if it's not already open
        setOpen(true);
    };


    return (
        <>
            <AppBar position='fixed' sx={{backgroundColor: "#212121"}}>
                <Container maxWidth="100%">
                    <Toolbar disableGutters>
                        <AdbIcon sx={{display: {xs: 'none', md: 'flex'}, mr: 1}}/>
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="#app-bar-with-responsive-menu"
                            sx={{
                                mr: 2,
                                display: {xs: 'none', md: 'flex'},
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            LOGO
                        </Typography>

                        <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                            <IconButton
                                size="large"
                                aria-label="menu"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                                keepMounted
                                transformOrigin={{vertical: 'top', horizontal: 'left'}}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{display: {xs: 'block', md: 'none'}}}
                            >
                                {pages.map((page) => (
                                    <MenuItem key={page} onClick={() => page === 'Login' && setOpen(true)}>
                                        <Typography textAlign="center">{page}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        <Transition in={open} timeout={400}>
                            <Modal
                                open={open}
                                onClose={handleClose}
                                aria-labelledby="modal-modal-title"
                                aria-describedby="modal-modal-description"
                                sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                            >
                                <Box sx={style}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <ModalClose variant="plain" sx={{m: 1}} onClick={handleClose}/>

                                        {invalidCred && (
                                            <Alert severity="error" sx={{width: '100%', mt: 2}}>
                                                {invalidCred}
                                            </Alert>
                                        )}

                                        <Tabs value={tabIndex} onChange={handleTabChange}
                                              aria-label="login registration tabs">
                                            <Tab label="Login"/>
                                            <Tab label="Registration"/>
                                        </Tabs>

                                        {tabIndex === 0 && (
                                            <Box component="form" onSubmit={handleSubmit} noValidate
                                                 sx={{mt: 3, width: 400}}>
                                                <TextField
                                                    margin="normal"
                                                    fullWidth
                                                    value={phone}  //
                                                    label="Email Address/Phone Number"
                                                    onChange={(e) => setPhone(e.target.value)}
                                                />
                                                <TextField
                                                    margin="normal"
                                                    label="Password"
                                                    fullWidth
                                                    type="password"
                                                    value={otpPassword}  // Set the value prop to the state variable
                                                    onChange={(e) => setOtpPassword(e.target.value)}
                                                />
                                                <Button
                                                    type="submit"
                                                    fullWidth
                                                    variant="contained"
                                                    sx={{mt: 3, mb: 2, color: "whitesmoke", background: '#212121'}}
                                                >
                                                    Login
                                                </Button>
                                            </Box>
                                        )}

                                        {tabIndex === 1 && (
                                            <Box sx={{mt: 3, width: '100%'}}>
                                                <School onRegistrationSuccess={handleRegistrationSuccess}/>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Modal>
                        </Transition>

                        <Box sx={{flexGrow: 0, display: {xs: 'none', md: 'flex'}}}>
                            {pages.map((page) => (
                                <Button
                                    key={page}
                                    onClick={() => page === 'Login' ? setOpen(true) : handleCloseNavMenu()}
                                    sx={{my: 2, color: 'white', display: 'block'}}
                                >
                                    {page}
                                </Button>
                            ))}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </>
    );
};
