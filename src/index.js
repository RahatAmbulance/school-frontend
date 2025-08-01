import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {Provider} from "react-redux";
import store from "./component/redux/store";
import {Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Typography} from '@mui/material';

// Custom Error Types
class NetworkError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NetworkError';
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Error Dialog Component
const ErrorDialog = ({open, message, onClose, errorType}) => {
    const getErrorColor = () => {
        switch (errorType) {
            case 'NetworkError':
                return 'warning';
            case 'ValidationError':
                return 'info';
            default:
                return 'error';
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{color: 'error.main'}}>
                {errorType || 'Error'}
            </DialogTitle>
            <DialogContent>
                <Alert severity={getErrorColor()} sx={{mb: 2}}>
                    {message}
                </Alert>
                <Typography variant="body2" color="text.secondary">
                    If this problem persists, please contact support.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
                <Button
                    onClick={() => window.location.reload()}
                    color="primary"
                    variant="contained"
                >
                    Reload Page
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Enhanced Error Boundary Component
class ErrorBoundary extends React.Component {
    state = {
        hasError: false,
        errorInfo: null,
        errorType: '',
        errorMessage: '',
        showSnackbar: false
    };

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorType: error.name,
            errorMessage: error.message
        };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to error tracking service
        console.error("Error details:", {
            error,
            errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

        this.setState({
            errorInfo,
            showSnackbar: true
        });

        // Optional: Send error to your error tracking service
        // this.logErrorToService(error, errorInfo);
    }

    handleSnackbarClose = () => {
        this.setState({showSnackbar: false});
    };

    handleErrorReset = () => {
        this.setState({
            hasError: false,
            errorInfo: null,
            errorMessage: '',
            showSnackbar: false
        });
    };

    // Optional: Implement error logging service
    logErrorToService = (error, errorInfo) => {
        // Example implementation
        const errorData = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Send to your error tracking service
        // Example: axios.post('/api/log-error', errorData);
    };

    render() {
        if (this.state.hasError) {
            return (
                <>
                    <ErrorDialog
                        open={this.state.hasError}
                        message={this.state.errorMessage}
                        errorType={this.state.errorType}
                        onClose={this.handleErrorReset}
                    />
                    <Snackbar
                        open={this.state.showSnackbar}
                        autoHideDuration={6000}
                        onClose={this.handleSnackbarClose}
                    >
                        <Alert
                            onClose={this.handleSnackbarClose}
                            severity="error"
                            sx={{width: '100%'}}
                        >
                            An error occurred. Our team has been notified.
                        </Alert>
                    </Snackbar>
                </>
            );
        }

        return this.props.children;
    }
}

// Global Error Handlers
const setupGlobalErrorHandlers = () => {
    // Handle general JavaScript errors
    window.onerror = function (message, source, lineno, colno, error) {
        console.error('Global error:', {
            message,
            source,
            lineno,
            colno,
            error,
            timestamp: new Date().toISOString()
        });

        // Show user-friendly error message
        store.dispatch({
            type: 'SET_ERROR',
            payload: {
                message: 'An unexpected error occurred.',
                type: 'ERROR'
            }
        });

        return true; // Prevents default browser error handling
    };

    // Handle unhandled Promise rejections
    window.onunhandledrejection = function (event) {
        console.error('Unhandled Promise rejection:', {
            reason: event.reason,
            timestamp: new Date().toISOString()
        });

        // Check if it's a network error
        if (event.reason instanceof NetworkError) {
            store.dispatch({
                type: 'SET_ERROR',
                payload: {
                    message: 'Network connection issue. Please check your internet connection.',
                    type: 'NETWORK_ERROR'
                }
            });
        } else {
            store.dispatch({
                type: 'SET_ERROR',
                payload: {
                    message: 'An unexpected error occurred.',
                    type: 'ERROR'
                }
            });
        }
    };

    // Handle network errors
    window.addEventListener('offline', () => {
        store.dispatch({
            type: 'SET_ERROR',
            payload: {
                message: 'You are currently offline. Please check your internet connection.',
                type: 'NETWORK_ERROR'
            }
        });
    });
};

// Setup error handlers
setupGlobalErrorHandlers();

// Render the app with error handling
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ErrorBoundary>
                <App/>
            </ErrorBoundary>
        </Provider>
    </React.StrictMode>
);

// Performance monitoring
reportWebVitals(metric => {
    // Log performance metrics
    console.log(metric);

    // Optional: Send metrics to analytics service
    if (metric.value > metric.threshold) {
        console.warn(`Performance issue detected: ${metric.name} exceeded threshold`);
    }
});

export {NetworkError, ValidationError};