import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';

export const Logout = ({setFlag}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleLogout = async () => {
            try {
                // Clear all session cookies
                document.cookie.split(";").forEach((cookie) => {
                    try {
                        const name = cookie.trim().split("=")[0];
                        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    } catch (cookieError) {
                        console.error('Error clearing cookie:', cookieError);
                        // Continue with other cookies even if one fails
                    }
                });

                // Clear local storage
                try {
                    localStorage.clear();
                } catch (storageError) {
                    console.error('Error clearing local storage:', storageError);
                    // If localStorage clearing fails, still proceed with logout
                }

                // Clear all data from the Redux store
                try {
                    //  dispatch(clearStore());
                } catch (reduxError) {
                    console.error('Error clearing Redux store:', reduxError);
                    // If Redux clearing fails, still proceed with logout
                }

                // Set flag and navigate to the home page
                setFlag(true);
                navigate('/');
            } catch (error) {
                console.error('Logout failed:', error);
                // Even if some operations fail, try to force navigate to home page
                try {
                    setFlag(true);
                    navigate('/');
                } catch (navigationError) {
                    console.error('Navigation failed:', navigationError);
                    // As a last resort, try to reload the page
                    window.location.href = '/';
                }
            }
        };

        handleLogout();
    }, [navigate, dispatch, setFlag]);

    return null;  // No need to render anything
};
