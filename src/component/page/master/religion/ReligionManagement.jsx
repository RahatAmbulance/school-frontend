import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    alpha,
    Box,
    Button,
    Card,
    CardContent,
    Collapse,
    Grid,
    IconButton,
    Skeleton,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import {Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon} from '@mui/icons-material';
import {api, selectSchoolDetails} from "../../../../common";
import {addReligion, deleteReligion, fetchReligions, updateReligion} from "./redux/religionActions";
import {styled} from '@mui/material/styles';
import {motion} from 'framer-motion';

// Styled Components
const PageContainer = styled(Box)(({theme}) => ({
    padding: theme.spacing(4),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: '100vh',
}));

const StyledCard = styled(Card)(({theme}) => ({
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'visible',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
    },
}));

const StyledButton = styled(Button)(({theme}) => ({
    borderRadius: 12,
    padding: '10px 24px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
}));

const StyledTextField = styled(TextField)(({theme}) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
        },
        '&.Mui-focused': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        },
    },
}));

const ReligionManagement = () => {
    const dispatch = useDispatch();
    const {religions, loading} = useSelector((state) => state.religion);
    const userData = useSelector(selectSchoolDetails);
    const theme = useTheme();
    const schoolId = userData?.id;

    useEffect(() => {
        dispatch(fetchReligions());
    }, [dispatch]);

    const handleAddReligion = () => {
        dispatch(addReligion({name: '', canCreateCaste: true, castes: [], schoolId}));
    };

    const handleAddCaste = (religionIndex) => {
        const updatedReligion = {
            ...religions[religionIndex],
            castes: [...religions[religionIndex].castes, {name: ''}],
        };
        dispatch(updateReligion(updatedReligion));
    };

    const handleReligionChange = (e, index) => {
        const updatedReligion = {...religions[index], name: e.target.value};
        dispatch(updateReligion(updatedReligion));
    };

    const handleCasteChange = (e, religionIndex, casteIndex) => {
        const updatedReligion = {
            ...religions[religionIndex],
            castes: religions[religionIndex].castes.map((c, j) =>
                j === casteIndex ? {...c, name: e.target.value} : c
            ),
        };
        dispatch(updateReligion(updatedReligion));
    };

    const handleDeleteReligion = (id) => {
        dispatch(deleteReligion(id));
    };

    const handleDeleteCaste = (religionIndex, casteIndex, casteId) => {
        const updatedReligion = {
            ...religions[religionIndex],
            castes: religions[religionIndex].castes.filter((_, cIndex) => cIndex !== casteIndex),
        };
        dispatch(updateReligion(updatedReligion));
    };

    const handleSubmit = async () => {
        try {
            await api.post('/api/master/religions', religions);
            alert('Religions and castes created/updated successfully!');
        } catch (error) {
            console.error('Error creating/updating religions and castes:', error);
            alert('Error creating/updating religions and castes.');
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <Box sx={{maxWidth: 1200, margin: '0 auto'}}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={120}
                            sx={{
                                mb: 3,
                                borderRadius: 3,
                                transform: 'scale(1, 0.95)',
                            }}
                        />
                    ))}
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <Box sx={{maxWidth: 1200, margin: '0 auto'}}>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        mb: 4,
                        fontWeight: 800,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                    }}
                >
                    Religion & Caste Management
                </Typography>

                <motion.div layout>
                    {religions.map((religion, index) => (
                        <StyledCard key={index} sx={{mb: 3}}>
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={5}>
                                        <StyledTextField
                                            label={`Religion ${index + 1}`}
                                            fullWidth
                                            value={religion.name}
                                            onChange={(e) => handleReligionChange(e, index)}
                                            variant="outlined"
                                            sx={{mb: 2}}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteReligion(religion.id)}
                                            sx={{
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'rotate(8deg) scale(1.1)',
                                                    color: theme.palette.error.dark,
                                                },
                                            }}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Grid>
                                    <Grid item xs={12} sm={7}>
                                        {religion.castes.map((caste, casteIndex) => (
                                            <Collapse key={casteIndex} in={true} timeout={300}>
                                                <Grid container spacing={2} sx={{mb: 2}}>
                                                    <Grid item xs={10}>
                                                        <StyledTextField
                                                            label={`Caste ${casteIndex + 1}`}
                                                            fullWidth
                                                            value={caste.name}
                                                            onChange={(e) => handleCasteChange(e, index, casteIndex)}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDeleteCaste(index, casteIndex, caste.id)}
                                                            sx={{
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    transform: 'rotate(8deg) scale(1.1)',
                                                                    color: theme.palette.error.dark,
                                                                },
                                                            }}
                                                        >
                                                            <DeleteIcon/>
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </Collapse>
                                        ))}
                                        {religion.canCreateCaste && (
                                            <StyledButton
                                                startIcon={<AddIcon/>}
                                                onClick={() => handleAddCaste(index)}
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                sx={{mt: 1}}
                                            >
                                                Add Caste
                                            </StyledButton>
                                        )}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </StyledCard>
                    ))}
                </motion.div>

                <Box sx={{display: 'flex', gap: 2, mt: 4}}>
                    <StyledButton
                        onClick={handleAddReligion}
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                    >
                        Add Religion
                    </StyledButton>
                    <StyledButton
                        onClick={handleSubmit}
                        variant="contained"
                        color="secondary"
                        startIcon={<SaveIcon/>}
                    >
                        Save Changes
                    </StyledButton>
                </Box>
            </Box>
        </PageContainer>
    );
};

export default ReligionManagement;
