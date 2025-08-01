import React, {useState} from 'react';
import {Box, Container, Paper, Tab, Tabs, Typography} from '@mui/material';
import {Group, Person, School} from '@mui/icons-material';
import PromotionStudent from './PromotionStudent';
import PromotionStaff from './PromotionStaff';
import PromotionSchool from "./PromotionSchool";

const PromotionMain = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const tabConfig = [
        {label: "Student Promotions", icon: <Person/>, component: <PromotionStudent/>},
        {label: "Staff Promotions", icon: <Group/>, component: <PromotionStaff/>},
        {label: "School Promotions", icon: <School/>, component: <PromotionSchool/>}
    ];

    return (
        <Container maxWidth="xl">
            <Paper elevation={3} sx={{mt: 3, p: 2, borderRadius: 2}}>
                <Typography variant="h4" sx={{mb: 3, fontWeight: 600, color: 'primary.main', textAlign: 'center'}}>
                    Promotion Management
                </Typography>

                <Box sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px 3px 0 0'
                    }
                }}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        centered
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                            '& .MuiTab-root': {
                                minHeight: 64,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                '&.Mui-selected': {
                                    color: 'primary.main'
                                }
                            }
                        }}
                    >
                        {tabConfig.map((tab, index) => (
                            <Tab
                                key={index}
                                label={tab.label}
                                icon={tab.icon}
                                iconPosition="start"
                            />
                        ))}
                    </Tabs>
                </Box>

                <Box sx={{mt: 3, minHeight: 'calc(100vh - 300px)'}}>
                    {tabConfig[selectedTab].component}
                </Box>
            </Paper>
        </Container>
    );
};

export default PromotionMain;
