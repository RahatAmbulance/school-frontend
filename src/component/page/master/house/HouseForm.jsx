import React, {useEffect, useState} from 'react';
import {Box, Button, IconButton, Stack, TextField, Tooltip} from '@mui/material';
import {ChromePicker} from 'react-color';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import {AnimatePresence, motion} from 'framer-motion';

function HouseForm({house, onSave}) {
    const initialFormState = {
        name: '',
        description: '',
        color: '#FF5733',
    };
    const [formState, setFormState] = useState(initialFormState);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (house) {
            setFormState(house);
        } else {
            setFormState(initialFormState);
        }
        setErrors({});
    }, [house]);

    const validateForm = () => {
        const newErrors = {};
        if (!formState.name.trim()) {
            newErrors.name = 'House name is required';
        }
        if (!formState.description.trim()) {
            newErrors.description = 'Description is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const handleColorChange = (color) => {
        setFormState(prevState => ({
            ...prevState,
            color: color.hex,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formState);
            setFormState(initialFormState);
            setShowColorPicker(false);
        }
    };

    const handleReset = () => {
        setFormState(initialFormState);
        setErrors({});
        setShowColorPicker(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
                <TextField
                    fullWidth
                    label="House Name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    variant="outlined"
                    InputProps={{
                        sx: {
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: 'primary.main',
                            },
                        },
                    }}
                />

                <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    multiline
                    rows={3}
                    variant="outlined"
                    InputProps={{
                        sx: {
                            borderRadius: 2,
                            '&:hover': {
                                borderColor: 'primary.main',
                            },
                        },
                    }}
                />

                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            backgroundColor: formState.color,
                            border: '2px solid #fff',
                            boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                        }}
                    />
                    <Tooltip title="Choose Color">
                        <IconButton
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            sx={{
                                color: formState.color,
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.04)',
                                },
                            }}
                        >
                            <ColorLensIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>

                <AnimatePresence>
                    {showColorPicker && (
                        <motion.div
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.9}}
                            transition={{duration: 0.2}}
                            style={{
                                position: 'relative',
                                zIndex: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    zIndex: 2,
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                <ChromePicker
                                    color={formState.color}
                                    onChangeComplete={handleColorChange}
                                    disableAlpha
                                />
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{mt: 3}}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon/>}
                        sx={{
                            flex: 1,
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 2,
                        }}
                    >
                        {house ? "Update House" : "Add House"}
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        startIcon={<CancelIcon/>}
                        onClick={handleReset}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                        }}
                    >
                        Reset
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}

export default HouseForm;
