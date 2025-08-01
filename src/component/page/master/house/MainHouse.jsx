import React, {useEffect, useState} from 'react';
import {Alert, Box, Container, Grid, Paper, Snackbar, Typography} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import HouseForm from './HouseForm';
import HouseList from './HouseList';
import {AnimatePresence, motion} from 'framer-motion';
import {selectSchoolDetails} from "../../../../common";
import {addHouse, deleteHouse, fetchHouses, updateHouse} from "./redux/actions";

function MainHouse() {
    const dispatch = useDispatch();
    const houses = useSelector((state) => state.house.houses);
    const [currentHouse, setCurrentHouse] = useState(null);
    const [notification, setNotification] = useState({open: false, message: '', severity: 'success'});
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchHouses(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const saveHouse = (house) => {
        const schoolId = userData?.id;
        house['schoolId'] = schoolId;
        house['session'] = session;

        if (house.id) {
            dispatch(updateHouse(house));
            showNotification('House updated successfully!', 'success');
        } else {
            dispatch(addHouse(house));
            showNotification('House added successfully!', 'success');
        }

        setCurrentHouse(null);
    };

    const handleDelete = (id) => {
        dispatch(deleteHouse(id));
        showNotification('House deleted successfully!', 'success');
    };

    const handleEdit = (house) => {
        setCurrentHouse(house);
    };

    const showNotification = (message, severity) => {
        setNotification({open: true, message, severity});
    };

    const handleCloseNotification = () => {
        setNotification({...notification, open: false});
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{py: 4}}>
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            mb: 4,
                            fontWeight: 600,
                            textAlign: 'center',
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        House Management
                    </Typography>
                </motion.div>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentHouse ? 'edit' : 'add'}
                                initial={{opacity: 0, x: -20}}
                                animate={{opacity: 1, x: 0}}
                                exit={{opacity: 0, x: 20}}
                                transition={{duration: 0.3}}
                            >
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 3,
                                            fontWeight: 600,
                                            textAlign: 'center',
                                            color: (theme) => theme.palette.primary.main,
                                        }}
                                    >
                                        {currentHouse ? 'Edit House' : 'Add New House'}
                                    </Typography>
                                    <HouseForm house={currentHouse} onSave={saveHouse}/>
                                </Paper>
                            </motion.div>
                        </AnimatePresence>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <motion.div
                            initial={{opacity: 0, x: 20}}
                            animate={{opacity: 1, x: 0}}
                            transition={{duration: 0.5}}
                        >
                            <Paper
                                elevation={3}
                                sx={{
                                    height: '70vh',
                                    overflow: 'hidden',
                                    borderRadius: 2,
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                                        fontWeight: 600,
                                        color: (theme) => theme.palette.primary.main,
                                        position: 'sticky',
                                        top: 0,
                                        backgroundColor: 'white',
                                        zIndex: 1,
                                    }}
                                >
                                    House List
                                </Typography>
                                <Box sx={{height: 'calc(70vh - 60px)', overflowY: 'auto', p: 2}}>
                                    <HouseList houses={houses} onEdit={handleEdit} onDelete={handleDelete}/>
                                </Box>
                            </Paper>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{width: '100%'}}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default MainHouse;
