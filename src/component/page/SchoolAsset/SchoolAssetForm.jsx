import React, {useEffect, useState} from "react";
import {Alert, Avatar, Button, Container, DialogActions, Grid, Snackbar, TextField, Typography,} from "@mui/material";
import dayjs from "dayjs";

const SchoolAssetForm = ({Assets, onCancel, onSubmit, asset}) => {
    const [formData, setFormData] = useState({
        type: "",
        staffName: "",
        description: "",
        quantity: "",
        creationDateTime: null,
        assetPhoto: null,
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [fileName, setFileName] = useState("");
    useEffect(() => {
        if (Assets) {
            setFormData({
                ...Assets,
                creationDateTime: Assets.creationDateTime
                    ? dayjs(Assets.creationDateTime)
                    : null,
            });
        }
    }, [Assets]);


    useEffect(() => {
        if (asset) {
            setFormData({
                assetName: asset.assetName || '',
                type: asset.type || '',
                quantity: asset.quantity || '',
            });
        }
    }, [asset]);


    const handleChange = async (e) => {
        const {name, value, files} = e.target;

        if (files) {
            const file = files[0];
            const base64 = await convertToBase64(file);
            setFormData({
                ...formData,
                [name]: base64
            });
        } else {
            //   setFormData({
            //     ...formData,
            //     [name]: value
            // });
            setFormData((prev) => ({...prev, [name]: value}));
        }
// Validate the changed field
        const fieldError = validateForm(name, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: fieldError
        }));
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };


    const validateForm = () => {
        const newErrors = {};
        if (!formData.type) newErrors.type = "Asset type is required";
        if (!formData.assetName) newErrors.assetName = "Asset name is required";
        if (!formData.quantity || isNaN(formData.quantity))
            newErrors.quantity = "Quantity must be a number";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleSubmit = () => {
    //   const assetData = {
    //     ...formData,
    //     id: asset?.id || null, // Include id for updates; null for new asset
    //   };
    //   onSubmit(assetData);
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // const data = { ...formData };
        onSubmit(formData);
        console.log(formData)
        // handleSave(formData);
        setSuccessMessage("Asset information submitted successfully!");

        setFormData({
            type: "",
            assetName: "",


            description: "",

            quantity: "",
            creationDateTime: null,
            assetPhoto: null,
        });

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
    };

    const renderImageUpload = (label, name) => (
        <Grid item xs={6} key={name}>
            <input
                accept="image/*"
                style={{display: 'none'}}
                id={`upload-${name}`}
                type="file"
                name={name}
                onChange={handleChange}
            />
            <label htmlFor={`upload-${name}`}>
                <Button variant="contained" color="primary" component="span">
                    Upload {label}
                </Button>
            </label>
            {formData[name] && (
                <Avatar
                    src={`data:image/jpeg;base64,${formData[name]}`}
                    alt={label}
                    sx={{width: 56, height: 56, mt: 2}}
                />
            )}
        </Grid>
    );
    return (
        <Container>
            <form onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                    School Asset Form
                </Typography>

                <Grid container spacing={2}>
                    {/* Asset Type */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Asset Type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            error={!!errors.type}
                            helperText={errors.type}
                            sx={{mb: 2}}
                        />
                    </Grid>

                    {/* Asset Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Asset Name"
                            name="assetName"
                            value={formData.assetName}
                            onChange={handleChange}
                            error={!!errors.assetName}
                            helperText={errors.assetName}
                            sx={{mb: 2}}
                        />
                    </Grid>

                    {/* Quantity */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                            sx={{mb: 2}}
                        />
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            sx={{mb: 2}}
                        />
                    </Grid>


                    {/* Asset Photo */}
                    {renderImageUpload("asset Photo", "assetPhoto")}

                </Grid>

                {/* Action Buttons */}
                <Grid container spacing={2} justifyContent="flex-end" style={{marginTop: "16px"}}>
                    <Grid item>
                        <DialogActions>
                            <Button variant="outlined" onClick={onCancel}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </Grid>
                    <Grid item>
                        <DialogActions>
                            <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                                {formData.id ? "Update asset" : "Submit asset"}
                            </Button>
                        </DialogActions>
                    </Grid>
                </Grid>
            </form>
            <Grid/>
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage("")}
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert
                    onClose={() => setSuccessMessage("")}
                    severity="success"
                    sx={{width: "100%"}}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default SchoolAssetForm;

