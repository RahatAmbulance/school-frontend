import React, {useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    List,
    Paper,
    Tooltip,
    Typography,
    useTheme,
    Zoom,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {AnimatePresence, motion} from 'framer-motion';
import InfoIcon from '@mui/icons-material/Info';

function HouseList({houses, onEdit, onDelete}) {
    const [open, setOpen] = useState(false);
    const [houseToDelete, setHouseToDelete] = useState(null);
    const theme = useTheme();

    const handleDelete = (house) => {
        setHouseToDelete(house);
        setOpen(true);
    };

    const handleConfirmDelete = () => {
        if (houseToDelete) {
            onDelete(houseToDelete.id);
        }
        setOpen(false);
        setHouseToDelete(null);
    };

    const handleCancelDelete = () => {
        setOpen(false);
        setHouseToDelete(null);
    };

    const getContrastText = (hexcolor) => {
        // Convert hex to RGB
        const r = parseInt(hexcolor.slice(1, 3), 16);
        const g = parseInt(hexcolor.slice(3, 5), 16);
        const b = parseInt(hexcolor.slice(5, 7), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };

    return (
        <Box>
            <AnimatePresence>
                {houses.length === 0 ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                py: 8,
                                opacity: 0.7,
                            }}
                        >
                            <InfoIcon sx={{fontSize: 48, mb: 2}}/>
                            <Typography variant="h6">No houses added yet</Typography>
                            <Typography variant="body2">Create a new house to get started</Typography>
                        </Box>
                    </motion.div>
                ) : (
                    <List sx={{p: 0}}>
                        {houses.map((house, index) => (
                            <motion.div
                                key={house.id}
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                transition={{duration: 0.3, delay: index * 0.1}}
                            >
                                <Paper
                                    elevation={2}
                                    sx={{
                                        mb: 2,
                                        overflow: 'hidden',
                                        borderRadius: 2,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: theme.shadows[4],
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 2,
                                            backgroundColor: house.color,
                                            color: getContrastText(house.color),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="h6" sx={{fontWeight: 600}}>
                                                {house.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{mt: 0.5, opacity: 0.9}}>
                                                {house.description}
                                            </Typography>
                                        </Box>
                                        <Box sx={{display: 'flex', gap: 1}}>
                                            <Tooltip title="Edit House" TransitionComponent={Zoom}>
                                                <IconButton
                                                    onClick={() => onEdit(house)}
                                                    sx={{
                                                        color: 'inherit',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete House" TransitionComponent={Zoom}>
                                                <IconButton
                                                    onClick={() => handleDelete(house)}
                                                    sx={{
                                                        color: 'inherit',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Paper>
                            </motion.div>
                        ))}
                    </List>
                )}
            </AnimatePresence>

            <Dialog
                open={open}
                onClose={handleCancelDelete}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 400,
                    },
                }}
            >
                <DialogTitle sx={{pb: 1}}>
                    Delete House
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{houseToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 2, pt: 1}}>
                    <Button
                        onClick={handleCancelDelete}
                        variant="outlined"
                        sx={{borderRadius: 2, textTransform: 'none'}}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{borderRadius: 2, textTransform: 'none'}}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default HouseList;
