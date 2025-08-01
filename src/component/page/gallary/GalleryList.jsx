import React, {useState} from "react";
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Fade,
    Grow,
    IconButton,
    ImageList,
    ImageListItem,
    Typography,
    useMediaQuery,
    useTheme,
    Zoom,
} from "@mui/material";
import "react-toastify/dist/ReactToastify.css";
import {toast, ToastContainer} from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import ImageIcon from "@mui/icons-material/Image";
import {useDispatch} from "react-redux";
import {deleteGallery} from "./redux/GalleryActions";
import {motion} from "framer-motion";

const GalleryList = ({
                         galleryList,
                         onEdit,
                         onDelete,
                         onView,
                         showDeleteButton = true,
                         showEditButton = true,
                     }) => {
    const [open, setOpen] = useState(false);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [galleries, setGalleries] = useState(galleryList);
    const [galleryToDelete, setGalleryToDelete] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const dispatch = useDispatch();

    const handleClickOpen = (id) => {
        setGalleryToDelete(id);
        setSelectedGallery(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedGallery(null);
    };

    const handlePreviewOpen = (imageData) => {
        setPreviewImage(imageData);
        setPreviewOpen(true);
    };

    const handlePreviewClose = () => {
        setPreviewOpen(false);
        setPreviewImage("");
    };

    const handleToastDelete = () => {
        if (galleryToDelete) {
            dispatch(deleteGallery(galleryToDelete))
                .then(() => {
                    toast.success("Gallery item deleted successfully");
                    handleClose();
                    setGalleries((prev) => prev.filter((g) => g.id !== galleryToDelete));
                })
                .catch((error) => {
                    console.error("Error deleting Gallery:", error);
                    toast.error("Failed to delete the gallery item. Please try again.");
                    handleClose();
                });
        }
    };

    const getTypeIcon = (type) => {
        return type?.toLowerCase().includes("video") ? (
            <VideoLibraryIcon color="primary"/>
        ) : (
            <ImageIcon color="secondary"/>
        );
    };

    const getColumnCount = () => {
        if (isMobile) return 1;
        if (fullScreen) return 2;
        return 3;
    };

    return (
        <>
            <ImageList
                variant="masonry"
                cols={getColumnCount()}
                gap={24}
                sx={{
                    mb: 8,
                    "& .MuiImageListItem-root": {
                        overflow: "hidden",
                        borderRadius: 2,
                    }
                }}
            >
                {galleries.map((gallery, index) => (
                    <ImageListItem key={gallery.id}>
                        <Grow
                            in={true}
                            timeout={300 + index * 100}
                            style={{transformOrigin: "0 0 0"}}
                        >
                            <Card
                                component={motion.div}
                                whileHover={{scale: 1.02}}
                                transition={{duration: 0.2}}
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    position: "relative",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    "&:hover": {
                                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                                        "& .gallery-actions": {
                                            opacity: 1,
                                        },
                                    },
                                }}
                            >
                                {gallery.type?.toLowerCase().includes("video") ? (
                                    <Box
                                        sx={{
                                            position: "relative",
                                            paddingTop: "56.25%", // 16:9 aspect ratio
                                            bgcolor: "grey.200",
                                        }}
                                    >
                                        <iframe
                                            src={gallery.videoURL}
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
                                ) : (
                                    <CardMedia
                                        component="img"
                                        image={gallery.images ? `data:image/jpeg;base64,${gallery.images}` : "https://via.placeholder.com/300x200?text=No+Image"}
                                        alt={gallery.title}
                                        sx={{
                                            height: 200,
                                            objectFit: "cover",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => gallery.images && handlePreviewOpen(`data:image/jpeg;base64,${gallery.images}`)}
                                    />
                                )}

                                <CardContent sx={{flexGrow: 1, pb: 1}}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        {getTypeIcon(gallery.type)}
                                        <Chip
                                            label={gallery.type}
                                            size="small"
                                            sx={{ml: 1}}
                                            color={gallery.type?.toLowerCase().includes("video") ? "primary" : "secondary"}
                                        />
                                    </Box>
                                    <Typography variant="h6" gutterBottom noWrap>
                                        {gallery.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                            mb: 1,
                                            minHeight: "2.5em",
                                        }}
                                    >
                                        {gallery.description}
                                    </Typography>
                                </CardContent>

                                <CardActions
                                    className="gallery-actions"
                                    sx={{
                                        justifyContent: "flex-end",
                                        p: 2,
                                        opacity: 0,
                                        transition: "opacity 0.2s ease-in-out",
                                        bgcolor: "rgba(255,255,255,0.9)",
                                        borderTop: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <IconButton
                                        onClick={() => onView(gallery)}
                                        size="small"
                                        color="primary"
                                        sx={{"&:hover": {transform: "scale(1.1)"}}}
                                    >
                                        <VisibilityIcon/>
                                    </IconButton>
                                    {showEditButton && (
                                        <IconButton
                                            onClick={() => onEdit(gallery)}
                                            size="small"
                                            color="secondary"
                                            sx={{"&:hover": {transform: "scale(1.1)"}}}
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    )}
                                    {showDeleteButton && (
                                        <IconButton
                                            onClick={() => handleClickOpen(gallery.id)}
                                            size="small"
                                            color="error"
                                            sx={{"&:hover": {transform: "scale(1.1)"}}}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    )}
                                </CardActions>
                            </Card>
                        </Grow>
                    </ImageListItem>
                ))}
            </ImageList>

            <Dialog
                open={open}
                onClose={handleClose}
                fullScreen={fullScreen}
                TransitionComponent={Fade}
                transitionDuration={300}
                PaperProps={{
                    elevation: 24,
                    sx: {
                        borderRadius: 3,
                        minWidth: {xs: "90%", sm: "400px"},
                        maxWidth: "500px",
                    },
                }}
            >
                <DialogContent sx={{p: 4}}>
                    <DialogContentText
                        sx={{
                            textAlign: "center",
                            fontSize: "1.1rem",
                            fontWeight: 500,
                            color: "text.primary",
                        }}
                    >
                        Are you sure you want to delete this gallery item?
                    </DialogContentText>
                    <DialogContentText
                        sx={{
                            textAlign: "center",
                            fontSize: "0.9rem",
                            color: "text.secondary",
                            mt: 1,
                        }}
                    >
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{p: 3, justifyContent: "center", gap: 2}}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: "none",
                            fontSize: "1rem",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleToastDelete}
                        color="error"
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: "none",
                            fontSize: "1rem",
                            "&:hover": {
                                backgroundColor: "error.dark",
                            },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={previewOpen}
                onClose={handlePreviewClose}
                maxWidth="lg"
                fullScreen={isMobile}
                TransitionComponent={Zoom}
            >
                <DialogContent sx={{p: 0, overflow: "hidden"}}>
                    <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "90vh",
                            objectFit: "contain",
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{justifyContent: "center", p: 2}}>
                    <Button
                        onClick={handlePreviewClose}
                        variant="contained"
                        color="primary"
                        sx={{borderRadius: 2}}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </>
    );
};

export default GalleryList;
