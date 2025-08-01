import React, {useState} from 'react';
import ForgetPassword from './ForgetPassword'; // Import the ForgetPassword component
import Fade from 'react-reveal/Fade';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useDispatch} from 'react-redux';
import {Transition} from "react-transition-group";
import School from "./schools/School";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar
import {
    FaComment,
    FaEnvelope,
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaPaperPlane,
    FaTwitter,
    FaUser
} from 'react-icons/fa';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../css/LandingPage.css';
import {api, LOGINAPI} from "../../common";
import {setToken, setUser} from "./redux/userSlice.js";

import bg1 from '../Images/bg1.webp';
import bg2 from '../Images/bg2.webp';
import bg3 from '../Images/bg3.webp';
import bg4 from '../Images/bg4.webp';
import logo from '../Images/logo-1.png'
import {fetchSchoolById} from "./schools/redux/schoolActions";
import {fetchUserFailure, fetchUserSuccess} from "../page/dashboard/redux/userActions";
import {Box, Button, IconButton, InputAdornment, TextField} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility'; // Import Visibility icon
import VisibilityOff from '@mui/icons-material/VisibilityOff'; // Import VisibilityOff icon

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

const FeatureBox = ({icon, title, description}) => (
    <div className="feature-box-inner">
        <i className={`fas ${icon} feature-icon`} aria-hidden="true"></i>
        <h4 className="feature-title">{title}</h4>
        <p className="feature-description">{description}</p>
    </div>
);

export const LandingPage = ({onBooleanChange}) => {
    const [openLogin, setOpenLogin] = useState(false);
    const [openForgetPassword, setOpenForgetPassword] = useState(false);

    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [otpPassword, setOtpPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [invalidCred, setInvalidCred] = React.useState('');
    const [tabIndex, setTabIndex] = React.useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar state for popup

    const dispatch = useDispatch();

    const handleOpenModal = () => setOpen(true);
    const handleCloseModal = () => setOpen(false);
    const handleOpenForgetPassword = () => {
        setOpenLogin(false);
        setOpenForgetPassword(true);
    };

    const handleCloseForgetPassword = () => {
        setOpenForgetPassword(false);

    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        setInvalidCred('');

        // Validation for email and password
        if (!phone && !otpPassword) {
            setInvalidCred('Please Enter Email Address And Password');
            return;
        } else if (!phone) {
            setInvalidCred('Please Enter Email Address');
            return;
        } else if (!otpPassword) {
            setInvalidCred('Please Enter Password');
            return;
        }
        const LOGIN_PASSWORD = "/auth/login";
        try {
            const responseIsEmail = await LOGINAPI.get(`/api/master/isUserExist/${phone}`);
            const emailExists = responseIsEmail.data === true; // Check if the response is true
            console.log("emailExists==", emailExists);
            if (emailExists) {
                const response = await LOGINAPI.post(LOGIN_PASSWORD, {email: phone, password: otpPassword});
                if (response.status === 200) {
                    const token = response.data.token; // Adjust according to your API response structure
                    dispatch(setUser(response.data.loginId)); // Set user info in Redux
                    dispatch(setToken(token)); // Store token in Redux
                    localStorage.setItem('token', token);
                    if (response.data.loginId) {
                        try {
                            const responseUser = await api.get(`/api/user/${response.data.loginId}`);
                            dispatch(fetchUserSuccess(responseUser.data));
                            if (responseUser.data) {
                                dispatch(fetchSchoolById(responseUser.data.schoolId));
                                //  dispatch(fetchSchool(responseUser.data.schoolId));
                                handleClose();
                                onBooleanChange();
                            }
                        } catch (error) {
                            dispatch(fetchUserFailure(error.message));
                        }
                    }

                } else {
                    //  onBooleanChange();
                    setInvalidCred(response.data.response || 'Invalid credentials');
                }
            } else {
                setInvalidCred("EmailId does not exist in our records. Please check the emailId and try again.");
            }
        } catch (error) {
            // onBooleanChange();
            console.error('Error:', error);

            if (error.response.data.status === 401) {
                setInvalidCred(error.response.data.description);
            } else if (error.response.data.status === 403) {
                setInvalidCred(error.response.data.description);
            } else if (error.response.data.status === 500) {
                setInvalidCred(error.response.data.description);
            } else {
                setInvalidCred("An error occurred. Please try again later.");
            }

        }
    };
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword); // Toggle the showPassword state
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true,
        pauseOnHover: false,


    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };


    const handleClose = () => setOpen(false);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
        setInvalidCred('');
    };
    const handleRegistrationSuccess = ({email, password}) => {
        setPhone(email);
        setOtpPassword(password);
        setTabIndex(0);
        setOpen(true);
        setSnackbarOpen(true); // Show success popup

    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <>

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
                                        type={showPassword ? 'text' : 'password'} // Toggle between text and password
                                        value={otpPassword}
                                        onChange={(e) => setOtpPassword(e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleClickShowPassword}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{mt: 3, mb: 2, color: "whitesmoke", background: '#212121'}}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        onClick={handleOpenForgetPassword}
                                        fullWidth
                                        variant="text"
                                        sx={{mt: 2, color: "#212121"}}
                                    >
                                        Forgot Password
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
            {/* Centered Snackbar for success notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000} // Duration to auto-hide the Snackbar
                onClose={handleSnackbarClose}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}} // Centered horizontally
                sx={{
                    position: 'absolute',
                    top: '20%', // Adjust position to be above the modal
                    left: '50%',
                    transform: 'translate(-50%, -20%)',
                    width: '400px',
                    zIndex: 1500,
                }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="success"
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '20px', // Increase padding
                        fontSize: '18px', // Increase font size for better readability
                        textAlign: 'center', // Center the text inside the Alert
                    }}
                >
                    <strong>Congratulations!</strong> Your account has been successfully created.
                </Alert>
            </Snackbar>
            <Transition in={openForgetPassword} timeout={400}>
                <Modal
                    open={openForgetPassword}
                    onClose={handleCloseForgetPassword}
                    aria-labelledby="forget-password-modal"
                    aria-describedby="forget-password-description"
                    sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                >
                    <Box sx={style}>
                        <ForgetPassword onClose={handleCloseForgetPassword}/>
                    </Box>
                </Modal>
            </Transition>

            <nav className="navbar">
                <div className="nav-container">
                    {/* Logo */}

                    <div className="logo" style={{display: 'flex', alignItems: 'center'}}>
                        <a href="#home" onClick={() => setIsMenuOpen(false)}
                           style={{textDecoration: 'none', color: 'inherit', cursor: 'pointer'}}>
                            <img
                                src={logo}
                                alt="YourLogo"

                            />
                        </a>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="nav-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <i className={isMenuOpen ? 'fa fa-times' : 'fa fa-bars'}></i>
                    </div>

                    {/* Navigation Links */}
                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
                        <li><a href="#about" onClick={() => setIsMenuOpen(false)}>About</a></li>
                        <li><a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a></li>
                        <li><a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a></li>
                        <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
                        <li>
                            <button className="btn login" onClick={() => {
                                setIsMenuOpen(false);
                                handleOpenModal();
                            }}>
                                Login / Sign Up
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
            <section id="home" className="home-section">
                <div className="slider-container">
                    <Slider {...settings}>

                        <div className="slide">
                            <img src={bg2} alt="Welcome to Our School" className="slide-image"/>
                            <div className="overlay">
                                <div className="text-content animated fadeInLeft delay-1s">
                                    <h1 className="animated slideInLeft">Welcome to Our School</h1>
                                    <p className="animated slideInLeft delay-1s">School Management System</p>
                                    <p className="animated slideInLeft delay-2s">Empowering students to achieve their
                                        potential.</p>
                                    <button className="slide-button animated bounceInLeft delay-3s"
                                            onClick={handleOpenModal}>Get Started
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="slide">
                            <img src={bg1} alt="Explore Our Programs" className="slide-image"/>
                            <div className="overlay">
                                <div className="text-content animated fadeInDown delay-1s">
                                    <h1 className="animated fadeInDown">Explore Our Programs</h1>
                                    <p className="animated fadeInDown delay-1s">Learn more about what we offer</p>
                                    <p className="animated fadeInDown delay-2s">Innovative curriculum tailored to your
                                        needs.</p>
                                    <button className="slide-button animated fadeInUp delay-3s">Learn More</button>
                                </div>
                            </div>
                        </div>


                        <div className="slide">
                            <img src={bg3} alt="Join Our Community" className="slide-image"/>
                            <div className="overlay">
                                <div className="text-content animated fadeInUp delay-3s">
                                    <h1 className="animated zoomIn">Join Our Community</h1>
                                    <p className="animated zoomIn delay-1s">Be a part of our vibrant community</p>
                                    <p className="animated zoomIn delay-2s">Connect, grow, and thrive together.</p>
                                    <button className="slide-button animated zoomIn delay-3s"
                                            onClick={handleOpenModal}>Sign
                                        Up
                                    </button>
                                </div>
                            </div>
                        </div>

                    </Slider>
                </div>
            </section>
            {/* About Us Section */}
            <section id="about" className="about-section">
                <div className="container">
                    <div className="row">
                        <div className="col-md-6 image-container">
                            <img src={bg4} alt="About Us" className="about-image"/>
                        </div>
                        <div className="col-md-6 text-container">
                            <h2 className="title">
                                Welcome to Our <span className="highlight">School</span>
                            </h2>
                            <p className="description">
                                Our school is dedicated to providing a top-notch education and a nurturing environment
                                for
                                our students.
                                <p>We focus on holistic development and innovative teaching methods to ensure each
                                    student reaches their full potential.</p>
                            </p>
                            <p className="quote">
                                "Education is the most powerful weapon which you can use to change the world." - Nelson
                                Mandela
                            </p>
                            <button className="btn btn-learn-more">Learn More</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}

            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">Our Amazing Features</h2>
                    <div className="row feature-row">
                        <div className="col-md-4 feature-box">
                            <FeatureBox
                                icon="fa-globe-asia"
                                title="Global"
                                description="Expand your horizons with our global reach capabilities. Manage operations seamlessly across borders and enjoy smooth international transactions."
                            />
                        </div>
                        <div className="col-md-4 feature-box">
                            <FeatureBox
                                icon="fa-cloud"
                                title="Infrastructure"
                                description="Our robust cloud infrastructure ensures your data is secure and easily accessible. Benefit from high availability and disaster recovery features."
                            />
                        </div>
                        <div className="col-md-4 feature-box">
                            <FeatureBox
                                icon="fa-user-cog"
                                title="24/7 Support"
                                description="Our dedicated support team is here to assist you around the clock. From troubleshooting to guidance, we're always here to help you succeed."
                            />
                        </div>
                        <div className="col-md-4 feature-box">
                            <FeatureBox
                                icon="fa-calendar"
                                title="Flexible Scheduling"
                                description="We offer flexible scheduling options to fit your needs."
                            />
                        </div>
                        <div className="col-md-4 feature-box">
                            <FeatureBox
                                icon="fa-chalkboard-teacher"
                                title="Experienced Teachers"
                                description="Our educators are experts in their fields with a passion for teaching."
                            />
                        </div>
                        <div className="col-md-4 feature-box">
                            <FeatureBox
                                icon="fa-user-graduate"
                                title="Modern Education"
                                description="Innovative approaches to education that foster learning and growth."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="container">
                    <Fade bottom>
                        <h2 className="section-title">Our Pricing Plans</h2>
                        <div className="pricing-content">

                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h3 className="pricing-title">Plan 1</h3>
                                    <p className="pricing-price">₹2000/year</p>
                                </div>
                                <ul className="pricing-features">
                                    <li>School ERP (100+ Module)</li>
                                    <li>Whatsapp Integration</li>
                                    <li>SMS Integration</li>
                                    <li>Biometric/Facial Recognition Integration</li>
                                    <li>Payment Gateway Integration</li>
                                    <li>Student/Parents Web Login</li>
                                    <li>Student/Parents Mobile APP (Android)</li>
                                    <li>Teacher Mobile APP (Android)</li>
                                    <li>Admin Mobile APP (Android)</li>
                                    <li>Website</li>
                                    <li>Driver Mobile APP</li>
                                    <li>Library Module</li>
                                    <li>Student/Parents Mobile APP (IOS)</li>
                                </ul>
                                <button className="btn-buy animated bounceIn">Buy Now</button>
                            </div>

                            {/* <!-- Plan 2 --> */}
                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h3 className="pricing-title">Plan 2</h3>
                                    <p className="pricing-price">₹5000/year</p>
                                </div>
                                <ul className="pricing-features">
                                    <li>School ERP (100+ Module)</li>
                                    <li>Whatsapp Integration</li>
                                    <li>SMS Integration</li>
                                    <li>Biometric/Facial Recognition Integration</li>
                                    <li>Payment Gateway Integration</li>
                                    <li>Student/Parents Web Login</li>
                                    <li>Student/Parents Mobile APP (Android)</li>
                                    <li>Teacher Mobile APP (Android)</li>
                                    <li>Admin Mobile APP (Android)</li>
                                    <li>Website</li>
                                    <li>Driver Mobile APP</li>
                                    <li>Library Module</li>
                                    <li>Student/Parents Mobile APP (IOS)</li>
                                </ul>
                                <button className="btn-buy animated bounceIn">Buy Now</button>
                            </div>

                            {/* <!-- Plan 3 --> */}
                            <div className="pricing-card">
                                <div className="pricing-header">
                                    <h3 className="pricing-title">Plan 3</h3>
                                    <p className="pricing-price">₹10000/year</p>
                                </div>
                                <ul className="pricing-features">
                                    <li>School ERP (100+ Module)</li>
                                    <li>Whatsapp Integration</li>
                                    <li>SMS Integration</li>
                                    <li>Biometric/Facial Recognition Integration</li>
                                    <li>Payment Gateway Integration</li>
                                    <li>Student/Parents Web Login</li>
                                    <li>Student/Parents Mobile APP (Android)</li>
                                    <li>Teacher Mobile APP (Android)</li>
                                    <li>Admin Mobile APP (Android)</li>
                                    <li>Website</li>
                                    <li>Driver Mobile APP</li>
                                    <li>Library Module</li>
                                    <li>Student/Parents Mobile APP (IOS)</li>
                                </ul>
                                <button className="btn-buy animated bounceIn">Buy Now</button>
                            </div>
                        </div>
                    </Fade>
                </div>
            </section>


            {/* Admissions Section */}
            {/* <section id="admissions" className="admissions-section">
                <div className="container">
                    <Fade bottom>
                        <h2 className="section-title">Admissions</h2>
                        <div className="admissions-content">
                            <img src={bg5} alt="Admissions" className="admissions-image"/>
                            <div className="admissions-text">
                                <p className="description">
                                    Join our vibrant community of learners. Our admissions process is designed to be
                                    smooth and straightforward, allowing you to focus on what's important - your
                                    education.
                                </p>
                                <ul className="admissions-benefits">
                                    <li>Seamless online application process</li>
                                    <li>Access to scholarships and financial aid</li>
                                    <li>Dedicated support for international students</li>
                                </ul>
                                <button className="btn-apply animated bounceIn">Apply Now</button>
                            </div>
                        </div>
                    </Fade>
                </div>
            </section> */}

            {/* Contact Us Section */}
            <section id="contact" className="contact-us-section">
                <div className="container">
                    <h2 className="section-title">Contact Us</h2>
                    <div className="contact-content">
                        {/* Left Column: Contact Information */}
                        <div className="contact-info">
                            <h3>Our Office</h3>
                            <p><strong>Address:</strong> 123 Main Street, City, Country</p>
                            <p><strong>Phone:</strong> +123 456 7890</p>
                            <p><strong>Email:</strong> info@example.com</p>
                            <p><strong>Working Hours:</strong> Mon - Fri: 9:00 AM - 6:00 PM</p>
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="contact-form">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">
                                        <FaUser className="form-icon"/>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Your Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FaEnvelope className="form-icon"/>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            placeholder="Your Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="subject">
                                        <FaComment className="form-icon"/>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            placeholder="Subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        />
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">
              <textarea
                  id="message"
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
              ></textarea>
                                    </label>
                                </div>
                                <button type="submit" className="btn btn-submit">
                                    <FaPaperPlane className="btn-icon"/>
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="row footer-row">
                        {/* Column 1: Quick Links */}
                        <div className="col-md-4 footer-column">
                            <h4 className="footer-heading">Quick Links</h4>
                            <ul className="footer-links">
                                <li><a href="#about">About Us</a></li>
                                <li><a href="#features">Features</a></li>
                                <li><a href="#contact">Contact</a></li>
                                <li><a href="#faq">FAQ</a></li>
                                <li><a href="#privacy">Privacy Policy</a></li>
                            </ul>
                        </div>

                        {/* Column 2: Contact Information */}
                        <div className="col-md-4 footer-column">
                            <h4 className="footer-heading">Contact Information</h4>
                            <ul className="footer-contact">
                                <li><i className="fas fa-map-marker-alt"></i> 123 School St, Education City, EC 12345
                                </li>
                                <li><i className="fas fa-phone-alt"></i> (123) 456-7890</li>
                                <li><i className="fas fa-envelope"></i> info@ourschool.com</li>
                            </ul>
                        </div>

                        {/* Column 3: Social Media */}
                        <div className="col-md-4 footer-column">
                            <h4 className="footer-heading">Follow Us</h4>
                            <div className="footer-social">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                                   className="animated fadeIn social-icon"><FaFacebookF/></a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                                   className="animated fadeIn social-icon"><FaTwitter/></a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                                   className="animated fadeIn social-icon"><FaLinkedinIn/></a>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                                   className="animated fadeIn social-icon"><FaInstagram/></a>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 text-center mt-4">
                            <p>&copy; {new Date().getFullYear()} Our School. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    );
};
