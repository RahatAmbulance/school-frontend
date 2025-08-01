import React, {useEffect, useState} from "react";
import {
    Box,
    Container,
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
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {useDispatch, useSelector} from "react-redux";
import {fetchGallery} from "../../../page/gallary/redux/GalleryActions";
import * as XLSX from "xlsx";
import {selectSchoolDetails} from "../../../../common";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ImageIcon from "@mui/icons-material/Image";

const GalleryPageStaff = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
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

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDownloadExcel = () => {
        const filteredData = galleryList?.map(({
                                                   images,
                                                   message,
                                                   ...rest
                                               }) => ({
            ...rest,
        })) || [];

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Gallery");
        XLSX.writeFile(workbook, "Gallery.xlsx");
    };

    const filteredGalleryList = Array.isArray(galleryList)
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
                    <Stack
                        direction={{xs: "column", md: "row"}}
                        spacing={2}
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                    >
                        <Typography variant="h4" component="h1" gutterBottom>
                            Gallery
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <IconButton
                                color="primary"
                                onClick={handleDownloadExcel}
                                sx={{
                                    backgroundColor: theme.palette.primary.light,
                                    "&:hover": {
                                        backgroundColor: theme.palette.primary.main,
                                    },
                                }}
                            >
                                <FileDownloadIcon/>
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Box sx={{mb: 3}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search gallery..."
                            value={searchQuery}
                            onChange={handleSearch}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {filteredGalleryList.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 5,
                            }}
                        >
                            <Typography variant="h6" color="text.secondary">
                                No gallery items found
                            </Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredGalleryList.map((gallery) => (
                                <Grid item xs={12} sm={6} md={4} key={gallery.id}>
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 2,
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: 200,
                                                overflow: "hidden",
                                                borderRadius: 1,
                                                mb: 2,
                                            }}
                                        >
                                            {gallery.type === "video" ? (
                                                <VideoLibraryIcon
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        color: "primary.main",
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        color: "primary.main",
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Typography variant="h6" gutterBottom>
                                            {gallery.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{mb: 2}}
                                        >
                                            {gallery.description}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Paper>
            </Container>
        </Fade>
    );
};

export default GalleryPageStaff; 