import React, {useEffect, useState} from "react";
import {Alert, Button, Container, Grid, InputAdornment, Snackbar, TextField, Typography} from "@mui/material";
import dayjs from "dayjs";

const ExpenseForm = ({expense, onCancel, onSubmit}) => {
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        category: "",
        attachmentsData: null,
        creationDateTime: dayjs().format("YYYY-MM-DDTHH:mm"),
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        if (expense) {
            setFormData({
                ...expense,
                creationDateTime: expense.creationDateTime
                    ? dayjs(expense.creationDateTime).format("YYYY-MM-DDTHH:mm")
                    : dayjs().format("YYYY-MM-DDTHH:mm"),
            });
        }
    }, [expense]);

    const handleChange = async (e) => {
        const {name, value, files} = e.target;

        if (files) {
            const file = files[0];
            setFileName(file.name);
            const base64 = await convertToBase64(file);
            setFormData({
                ...formData,
                [name]: base64
            });
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }

        const fieldError = validateField(name, value);
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: fieldError
        }));
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'amount':
                if (!value || isNaN(value)) return "Amount must be a number";
                if (parseFloat(value) <= 0) return "Amount must be greater than 0";
                return null;
            case 'category':
                return !value ? "Category is required" : null;
            case 'description':
                return !value ? "Description is required" : null;
            default:
                return null;
        }
    };

    const validateForm = () => {
        const newErrors = {
            amount: validateField('amount', formData.amount),
            category: validateField('category', formData.category),
            description: validateField('description', formData.description),
        };

        setErrors(newErrors);
        return Object.values(newErrors).every(error => !error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const submissionData = {
            ...formData,
            amount: parseFloat(formData.amount),
            creationDateTime: new Date(formData.creationDateTime).toISOString()
        };

        onSubmit(submissionData);
        setSuccessMessage("Expense submitted successfully!");

        setFormData({
            description: "",
            amount: "",
            category: "",
            attachmentsData: null,
            creationDateTime: dayjs().format("YYYY-MM-DDTHH:mm"),
        });
        setFileName("");

        setTimeout(() => setSuccessMessage(""), 3000);
    };

    return (
        <Container>
            <form onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom>
                    Expense Form
                </Typography>

                <Grid container spacing={2}>
                    {/* Category */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            error={!!errors.category}
                            helperText={errors.category}
                        />
                    </Grid>

                    {/* Amount */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={formData.amount}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            error={!!errors.amount}
                            helperText={errors.amount}
                        />
                    </Grid>

                    {/* Date & Time */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Date & Time"
                            name="creationDateTime"
                            type="datetime-local"
                            value={formData.creationDateTime}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </Grid>

                    {/* Attachment */}
                    <Grid item xs={12}>
                        <input
                            accept="*/*"
                            style={{display: 'none'}}
                            id="expense-attachment"
                            type="file"
                            name="attachmentsData"
                            onChange={handleChange}
                        />
                        <label htmlFor="expense-attachment">
                            <Button variant="outlined" component="span">
                                Upload Attachment
                            </Button>
                        </label>
                        {fileName && <span style={{marginLeft: '1rem'}}>{fileName}</span>}
                    </Grid>
                </Grid>

                <Grid container justifyContent="flex-end" sx={{mt: 3}} spacing={2}>
                    <Grid item>
                        <Button variant="outlined" onClick={onCancel}>
                            Cancel
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button type="submit" variant="contained" color="primary">
                            {expense?.id ? "Update Expense" : "Submit Expense"}
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage("")}
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert severity="success">
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ExpenseForm;