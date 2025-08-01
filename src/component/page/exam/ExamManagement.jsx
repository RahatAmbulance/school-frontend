import React, {useState} from 'react';
import {AppBar, Box, Container, Paper, Tab, Tabs, useMediaQuery, useTheme} from '@mui/material';
import {motion} from 'framer-motion';
import ExamList from './ExamList';
import ExamForm from './ExamForm';

const ExamManagement = () => {
    const [tabValue, setTabValue] = useState(0);
    const [selectedExam, setSelectedExam] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleEditExam = (exam) => {
        setSelectedExam(exam);
        setTabValue(1);
    };

    const handleSave = () => {
        setSelectedExam(null);
        setTabValue(0);
    };

    const containerVariants = {
        hidden: {opacity: 0, y: 20},
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const tabVariants = {
        hidden: {opacity: 0, x: -20},
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.3,
                duration: 0.5
            }
        }
    };

    return (
        <Container maxWidth="xl">
            <Box
                sx={{
                    minHeight: '100vh',
                    py: 4,
                    px: {xs: 2, sm: 3},
                    bgcolor: 'background.default'
                }}
            >
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            bgcolor: 'background.paper'
                        }}
                    >
                        <AppBar
                            position="static"
                            color="inherit"
                            elevation={0}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                bgcolor: theme.palette.primary.main,
                            }}
                        >
                            <motion.div variants={tabVariants}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    variant={isMobile ? "fullWidth" : "standard"}
                                    centered={!isMobile}
                                    sx={{
                                        '& .MuiTab-root': {
                                            color: '#fff',
                                            fontSize: {xs: '0.9rem', sm: '1rem'},
                                            fontWeight: 500,
                                            textTransform: 'none',
                                            minHeight: 64,
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            },
                                            '&.Mui-selected': {
                                                color: '#fff',
                                                fontWeight: 600,
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                            },
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: '#fff',
                                            height: 3,
                                        },
                                    }}
                                >
                                    <Tab
                                        label="Exam List"
                                        sx={{
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    />
                                    <Tab
                                        label={selectedExam ? "Edit Exam" : "Add New Exam"}
                                        sx={{
                                            borderRadius: '4px 4px 0 0',
                                        }}
                                    />
                                </Tabs>
                            </motion.div>
                        </AppBar>

                        <Box sx={{p: {xs: 2, sm: 3}}}>
                            {tabValue === 0 && (
                                <motion.div
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5}}
                                >
                                    <ExamList onEditExam={handleEditExam}/>
                                </motion.div>
                            )}
                            {tabValue === 1 && (
                                <motion.div
                                    initial={{opacity: 0, y: 20}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.5}}
                                >
                                    <ExamForm examId={selectedExam?.id} onSave={handleSave}/>
                                </motion.div>
                            )}
                        </Box>
                    </Paper>
                </motion.div>
            </Box>
        </Container>
    );
};

export default ExamManagement;
