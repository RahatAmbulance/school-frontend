import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    DialogActions,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import {styled} from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";

// Styled components
const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    background: "#ffffff",
}));

const ImagePreview = styled(Box)(({theme}) => ({
    width: "100%",
    height: 200,
    borderRadius: theme.spacing(1),
    overflow: "hidden",
    position: "relative",
    marginTop: theme.spacing(2),
    border: "2px dashed #ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& img": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
}));

const GalleryForm = ({gallery, onSubmit, onCancel}) => {
    const [formData, setFormData] = useState({
        id: "",
        type: "",
        images: null,
        videoURL: "",
        title: "",
        description: "",
        schoolId: "",
        session: "",
        creationDateTime: "",
    });
    const [errors, setErrors] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success"});

    const classSections = useSelector((state) => state.master.data.classSections);
    const sections = useSelector((state) => state.master.data.sections);

    useEffect(() => {
        if (gallery) {
            setFormData({
                ...gallery,
                creationDateTime: gallery.creationDateTime
                    ? dayjs(gallery.creationDateTime)
                    : null,
            });
            if (gallery.images) {
                setPreviewUrl(`data:image/jpeg;base64,${gallery.images}`);
            }
        }
    }, [gallery]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors((prev) => ({...prev, [name]: ""}));
        }
    };

    const handleDateChange = (name, date) => {
        setFormData({...formData, [name]: date});
    };

    const handleClose = () => {
        if (onCancel) onCancel();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                setSnackbar({
                    open: true,
                    message: "File size should be less than 5MB",
                    severity: "error",
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(",")[1];
                setFormData((prev) => ({...prev, images: base64String}));
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({...prev, images: null}));
        setPreviewUrl(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.type) newErrors.type = "Please select a type";
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (formData.type === "image" && !formData.images) {
            newErrors.images = "Please upload an image";
        }
        if (formData.type === "video" && !formData.videoURL.trim()) {
            newErrors.videoURL = "Video URL is required";
        }
        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Description should be less than 500 characters";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSnackbar({
                open: true,
                message: "Please fix the errors before submitting",
                severity: "error",
            });
            return;
        }

        try {
            await onSubmit(formData);
            setSnackbar({
                open: true,
                message: "Gallery item saved successfully!",
                severity: "success",
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.message || "Failed to save gallery item",
                severity: "error",
            });
        }
    };

    return (
        <Container maxWidth="md">
            <StyledPaper elevation={0}>
                <Typography variant="h5" gutterBottom color="primary" sx={{mb: 4}}>
                    {formData.id ? "Update Gallery Item" : "Add New Gallery Item"}
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    label="Type"
                                    startAdornment={
                                        formData.type === "image" ? (
                                            <ImageIcon color="primary" sx={{mr: 1}}/>
                                        ) : (
                                            <VideoLibraryIcon color="primary" sx={{mr: 1}}/>
                                        )
                                    }
                                >
                                    <MenuItem value="image">Image</MenuItem>
                                    <MenuItem value="video">Video</MenuItem>
                                </Select>
                                {errors.type && (
                                    <Typography color="error" variant="caption">
                                        {errors.type}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                error={!!errors.title}
                                helperText={errors.title}
                                InputLabelProps={{shrink: true}}
                            />
                        </Grid>

                        {formData.type === "image" && (
                            <Grid item xs={12}>
                                <Stack spacing={2} alignItems="center">
                                    <Button
                                        component="label"
                                        variant="contained"
                                        startIcon={<CloudUploadIcon/>}
                                    >
                                        Upload Image
                                        <VisuallyHiddenInput
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </Button>

                                    {previewUrl && (
                                        <ImagePreview>
                                            <img src={previewUrl} alt="Preview"/>
                                            <IconButton
                                                sx={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: "rgba(255,255,255,0.8)",
                                                }}
                                                onClick={handleRemoveImage}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </ImagePreview>
                                    )}

                                    {errors.images && (
                                        <Typography color="error" variant="caption">
                                            {errors.images}
                                        </Typography>
                                    )}
                                </Stack>
                            </Grid>
                        )}

                        {formData.type === "video" && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Video URL"
                                    name="videoURL"
                                    value={formData.videoURL}
                                    onChange={handleChange}
                                    error={!!errors.videoURL}
                                    helperText={errors.videoURL}
                                    placeholder="Enter YouTube or Vimeo URL"
                                    InputLabelProps={{shrink: true}}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                error={!!errors.description}
                                helperText={
                                    errors.description ||
                                    `${formData.description.length}/500 characters`
                                }
                                InputLabelProps={{shrink: true}}
                            />
                        </Grid>
                    </Grid>

                    <DialogActions sx={{mt: 4, px: 0}}>
                        <Button
                            onClick={onCancel}
                            color="inherit"
                            variant="outlined"
                            sx={{mr: 1}}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disableElevation
                        >
                            {formData.id ? "Update Gallery" : "Add Gallery"}
                        </Button>
                    </DialogActions>
                </form>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                >
                    <Alert
                        onClose={() => setSnackbar({...snackbar, open: false})}
                        severity={snackbar.severity}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </StyledPaper>
        </Container>
    );
};

export default GalleryForm;
