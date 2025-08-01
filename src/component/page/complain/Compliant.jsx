import React, {useState} from 'react';
import {AppBar, Box, Tab, Tabs, Typography} from '@mui/material';
import {styled} from '@mui/system';
import ComplainForm from './ComplainForm';
import ComplainList from './ComplainList';

const StyledAppBar = styled(AppBar)({
    backgroundColor: '#1565c0', // Custom AppBar color
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
});

const StyledTabs = styled(Tabs)({
    display: 'flex',
    justifyContent: 'center',
    gap: '20px', // Space between tabs
    '& .MuiTab-root': {
        fontWeight: 'bold',
        textTransform: 'none',
        fontSize: '1.1rem',
        padding: '12px 24px',
        borderRadius: '8px',
        transition: 'background-color 0.3s, color 0.3s',
        '&:hover': {
            backgroundColor: '#42a5f5',
            color: '#fff',
        },
    },
    '& .MuiTab-root.Mui-selected': {
        backgroundColor: '#1e88e5',
        color: '#fff',
        fontWeight: 'bold',
    },
});

const StyledTabPanel = styled(Box)(({theme}) => ({
    padding: theme.spacing(3),
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginTop: theme.spacing(2),
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
}));

const StyledTypography = styled(Typography)({
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#2e3b55',
});

const Complaint = ({schoolId}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box sx={{padding: '16px', maxWidth: '1200px', margin: 'auto'}}>
            <StyledTypography variant="h4">
                Complaint Management
            </StyledTypography>
            <Tabs value={tabIndex} onChange={handleChange} centered>
                <Tab label="Submit Complaint"/>
                <Tab label="View Complaints"/>
            </Tabs>

            <StyledTabPanel>
                {tabIndex === 0 && <ComplainForm schoolId={schoolId}/>}
                {tabIndex === 1 && <ComplainList schoolId={schoolId}/>}
            </StyledTabPanel>
        </Box>
    );
};

export default Complaint;
