import React, {useEffect, useState} from "react";
import {
    Box,
    Chip,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import {useDispatch, useSelector} from "react-redux";

import * as XLSX from "xlsx";
import ClearIcon from "@mui/icons-material/Clear";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ImageIcon from "@mui/icons-material/Image";
import {selectSchoolDetails} from "../../../../common";
import {createGallery, deleteGallery, fetchGallery, updateGallery} from "../../../page/gallary/redux/GalleryActions";
import GalleryForm from "../../../page/gallary/GalleryForm";
import GalleryList from "../../../page/gallary/GalleryList";

const StudentGallery = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    const {galleryList, loading, error} = useSelector((state) => state.gallery);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchGallery(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddGallery = () => {
        setSelectedGallery(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const handleEditGallery = (gallery) => {
        setSelectedGallery(gallery);
        setOpenForm(true);
    };

    const handleViewGallery = (gallery) => {
        setSelectedGallery(gallery);
        setOpenDetails(true);
    };

    const handleFormSubmit = (formData) => {
        if (formData.id) {
            dispatch(updateGallery(formData.id, formData));
        } else {
            dispatch(createGallery(formData));
        }
        setOpenForm(false);
    };

    const handleDeleteGallery = (id) => {
        dispatch(deleteGallery(id));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDownloadExcel = () => {
        const filteredData = galleryList.map(
            ({
                 images,
                 identificationDocuments,
                 educationalCertificate,
                 professionalQualifications,
                 experienceCertificates,
                 bankAccount,
                 previousEmployer,
                 message,
                 ...rest
             }) => ({
                ...rest,
            })
        );

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Gallery");
        XLSX.writeFile(workbook, "Gallery.xlsx");
    };

    const filteredDailyTaskList = Array.isArray(galleryList)
        ? galleryList.filter((gallery) => {
            const type = gallery.type?.toLowerCase() || "";
            const title = gallery.title?.toLowerCase() || "";
            const className = gallery.className?.toLowerCase() || "";
            const query = searchQuery.toLowerCase();

            return (
                type.includes(query) ||
                title.includes(query) ||
                className.includes(query)
            );
        })
        : [];

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Stack spacing={2}>
                    <Skeleton variant="rectangular" width="100%" height={60}/>
                    <Skeleton variant="rectangular" width="100%" height={400}/>
                </Stack>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg">
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        mt: 3,
                        textAlign: "center",
                        backgroundColor: theme.palette.error.light,
                    }}
                >
                    <Typography variant="h6" color="error">
                        {error}
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Fade in timeout={500}>
            <Container maxWidth="lg" sx={{py: 4}}>
                <Paper elevation={3} sx={{p: 3, mb: 4}}>


                    <TextField
                        fullWidth
                        placeholder="Search by type, title, or section..."
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action"/>
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={handleClearSearch}
                                        size="small"
                                    >
                                        <ClearIcon/>
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                backgroundColor: theme.palette.background.paper,
                            },
                        }}
                        sx={{mb: 4}}
                    />

                    <GalleryList
                        galleryList={filteredDailyTaskList}
                        onEdit={handleEditGallery}
                        onDelete={handleDeleteGallery}
                        onView={handleViewGallery}
                    />
                </Paper>

                <Dialog
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    fullWidth
                    maxWidth="md"
                    fullScreen={isMobile}
                    TransitionComponent={Fade}
                    TransitionProps={{timeout: 500}}
                >
                    <DialogTitle
                        sx={{
                            pb: 2,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Typography variant="h6">
                                {selectedGallery ? "Edit Gallery" : "Add New Gallery"}
                            </Typography>
                            <IconButton
                                edge="end"
                                onClick={() => setOpenForm(false)}
                                aria-label="close"
                            >
                                <CloseIcon/>
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{pt: 3}}>
                        <GalleryForm
                            gallery={selectedGallery}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setOpenForm(false)}
                        />
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={openDetails}
                    onClose={() => setOpenDetails(false)}
                    fullWidth
                    maxWidth="md"
                    fullScreen={isMobile}
                    TransitionComponent={Fade}
                    TransitionProps={{timeout: 500}}
                >
                    <DialogTitle>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Typography variant="h6">Gallery Details</Typography>
                            <IconButton
                                edge="end"
                                onClick={() => setOpenDetails(false)}
                                aria-label="close"
                            >
                                <CloseIcon/>
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent>
                        {selectedGallery && (
                            <Box sx={{py: 2}}>
                                <Stack spacing={3}>
                                    {/* Media Display */}
                                    {selectedGallery.type?.toLowerCase().includes("video") ? (
                                        <Box
                                            sx={{
                                                position: "relative",
                                                width: "100%",
                                                paddingTop: "56.25%", // 16:9 aspect ratio
                                                bgcolor: "grey.200",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <iframe
                                                src={selectedGallery.videoURL}
                                                style={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%",
                                                    height: "100%",
                                                    border: "none",
                                                }}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </Box>
                                    ) : selectedGallery.images ? (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                            }}
                                        >
                                            <img
                                                src={`data:image/jpeg;base64,${selectedGallery.images}`}
                                                alt={selectedGallery.title}
                                                style={{
                                                    width: "100%",
                                                    height: "auto",
                                                    display: "block",
                                                }}
                                            />
                                        </Box>
                                    ) : null}

                                    {/* Title and Type */}
                                    <Box>
                                        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                            <Typography variant="h5" component="h2">
                                                {selectedGallery.title}
                                            </Typography>
                                            <Chip
                                                icon={selectedGallery.type?.toLowerCase().includes("video") ?
                                                    <VideoLibraryIcon/> : <ImageIcon/>}
                                                label={selectedGallery.type}
                                                color={selectedGallery.type?.toLowerCase().includes("video") ?
                                                    "primary" : "secondary"}
                                            />
                                        </Stack>
                                        <Typography variant="body1" color="text.secondary" paragraph>
                                            {selectedGallery.description}
                                        </Typography>
                                    </Box>

                                    {/* Additional Details */}
                                    <Grid container spacing={2}>
                                        {[
                                            {
                                                label: "Created Date",
                                                value: new Date(selectedGallery.createdDate).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }
                                                )
                                            },
                                            {label: "Session", value: selectedGallery.session},
                                            {label: "School ID", value: selectedGallery.schoolId},
                                        ].map((item) => (
                                            <Grid item xs={12} sm={4} key={item.label}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: "background.default",
                                                        borderRadius: 2,
                                                        border: 1,
                                                        borderColor: "divider",
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        color="text.secondary"
                                                        gutterBottom
                                                    >
                                                        {item.label}
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {item.value || "Not available"}
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Stack>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Fade>
    );
};

export default StudentGallery;
