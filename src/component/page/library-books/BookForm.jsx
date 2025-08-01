import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";

const BookForm = ({book, onSubmit, onCancel}) => {
    const theme = useTheme();
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        title: "",
        author: "",
        borrowed: "false",
        isbn: "",
        borrowedBy: "",
        borrowedEmail: "",
        price: "",
        lateFine: "",
        fine: "false",
        issueDate: "",
        returnLastDate: "",
        submittedDate: "",
        creationDateTime: null,
        totalNoPage: "",
        typeOfBinding: "",
        writtenLanguage: "",
        roomNo: "",
        rackNo: "",
        rowNo: "",
        barCode: "",
    });

    useEffect(() => {
        if (book) {
            setFormData({
                ...book,
                creationDateTime: book.creationDateTime
                    ? dayjs(book.creationDateTime).format("YYYY-MM-DD")
                    : null,
            });
        }
    }, [book]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});

        setErrors({...errors, [name]: ""}); // Clear error on change

        if (errors[name]) validateField(name, value); // Remove error if field becomes valid

    };

    const handleDateChange = (name, date) => {
        setFormData({...formData, [name]: date});

        setErrors({...errors, [name]: ""}); // Clear error on change

        if (errors[name]) validateField(name, date); // Remove error if date becomes valid

    };

    const handleClose = () => {
        if (onCancel) onCancel();
    };

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "title":
                if (!value) error = "Title is required.";
                break;
            case "author":
                if (!value) error = "Author is required.";
                break;
            case "isbn":
                if (!value) error = "ISBN is required.";
                else if (!/^\d{10,13}$/.test(value)) error = "ISBN should be 10-13 digits.";
                break;
            case "price":
                if (!value) error = "Price is required.";
                else if (isNaN(value)) error = "Price must be a number.";
                break;
            case "totalNoPage":
                if (!value) error = "Total Number of Pages is required.";
                else if (isNaN(value)) error = "Must be a number.";
                break;
            case "typeOfBinding":
                if (!value) error = "Select Type of Binding.";
                break;
            case "writtenLanguage":
                if (!value) error = "Select Written Language.";
                break;
            case "roomNo":
                if (!value) error = "Select Room No.";
                break;
            case "rackNo":
                if (!value) error = "Select Rack No.";
                break;
            case "rowNo":
                if (!value) error = "Select Row No.";
                break;
            case "barCode":
                if (!value) error = "Bar Code is required.";
                break;
            case "creationDateTime":
                if (!value) error = "Creation Date is required.";
                break;
            default:
                break;
        }

        setErrors((prevErrors) => ({...prevErrors, [name]: error}));
        return error === "";
    };
    const validate = () => {
        const fieldNames = [
            "title",
            "author",
            "isbn",
            "price",
            "totalNoPage",
            "typeOfBinding",
            "writtenLanguage",
            "roomNo",
            "rackNo",
            "rowNo",
            "barCode",
            "creationDateTime",
        ];

        let isValid = true;
        fieldNames.forEach((field) => {
            if (!validateField(field, formData[field])) isValid = false;
        });

        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
            window.alert("Book added successfully!");
        }
    };

    return (
        <Container>
            <Box
                component={Paper}
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: 2,
                }}
            >
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary" gutterBottom>
                                Basic Information
                            </Typography>
                            <Divider sx={{mb: 2}}/>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                error={!!errors.title}
                                helperText={errors.title}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Author"
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                error={!!errors.author}
                                helperText={errors.author}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="ISBN"
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleChange}
                                error={!!errors.isbn}
                                helperText={errors.isbn}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                error={!!errors.price}
                                helperText={errors.price}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Total Pages"
                                name="totalNoPage"
                                type="number"
                                value={formData.totalNoPage}
                                onChange={handleChange}
                                error={!!errors.totalNoPage}
                                helperText={errors.totalNoPage}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Creation Date"
                                    value={formData.creationDateTime ? dayjs(formData.creationDateTime) : null}
                                    onChange={(date) => handleChange({
                                        target: {
                                            name: 'creationDateTime',
                                            value: date ? date.format('YYYY-MM-DD') : null
                                        }
                                    })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            error={!!errors.creationDateTime}
                                            helperText={errors.creationDateTime}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                }
                                            }}
                                        />
                                    )}
                                />
                            </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary" gutterBottom sx={{mt: 2}}>
                                Additional Details
                            </Typography>
                            <Divider sx={{mb: 2}}/>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Type of Binding</InputLabel>
                                <Select
                                    name="typeOfBinding"
                                    value={formData.typeOfBinding}
                                    onChange={handleChange}
                                    error={!!errors.typeOfBinding}
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    <MenuItem value="Hardcover binding">Hardcover binding</MenuItem>
                                    <MenuItem value="spiral binding">Spiral binding</MenuItem>
                                </Select>
                                {errors.typeOfBinding && (
                                    <Typography color="error" variant="caption">
                                        {errors.typeOfBinding}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Written Language</InputLabel>
                                <Select
                                    name="writtenLanguage"
                                    value={formData.writtenLanguage}
                                    onChange={handleChange}
                                    error={!!errors.writtenLanguage}
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    <MenuItem value="Hindi">Hindi</MenuItem>
                                    <MenuItem value="English">English</MenuItem>
                                    <MenuItem value="Urdu">Urdu</MenuItem>
                                </Select>
                                {errors.writtenLanguage && (
                                    <Typography color="error" variant="caption">
                                        {errors.writtenLanguage}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary" gutterBottom sx={{mt: 2}}>
                                Location Information
                            </Typography>
                            <Divider sx={{mb: 2}}/>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Room No</InputLabel>
                                <Select
                                    name="roomNo"
                                    value={formData.roomNo}
                                    onChange={handleChange}
                                    error={!!errors.roomNo}
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    {Array.from({length: 9}, (_, i) => i + 1).map((num) => (
                                        <MenuItem key={num} value={num}>
                                            {num}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.roomNo && (
                                    <Typography color="error" variant="caption">
                                        {errors.roomNo}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Rack No</InputLabel>
                                <Select
                                    name="rackNo"
                                    value={formData.rackNo}
                                    onChange={handleChange}
                                    error={!!errors.rackNo}
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    {Array.from({length: 9}, (_, i) => i + 1).map((num) => (
                                        <MenuItem key={num} value={num}>
                                            {num}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.rackNo && (
                                    <Typography color="error" variant="caption">
                                        {errors.rackNo}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Row No</InputLabel>
                                <Select
                                    name="rowNo"
                                    value={formData.rowNo}
                                    onChange={handleChange}
                                    error={!!errors.rowNo}
                                    sx={{
                                        borderRadius: 2,
                                    }}
                                >
                                    {Array.from({length: 9}, (_, i) => i + 1).map((num) => (
                                        <MenuItem key={num} value={num}>
                                            {num}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.rowNo && (
                                    <Typography color="error" variant="caption">
                                        {errors.rowNo}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Barcode"
                                name="barCode"
                                value={formData.barCode}
                                onChange={handleChange}
                                error={!!errors.barCode}
                                helperText={errors.barCode}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2}}>
                        <Button
                            onClick={onCancel}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                py: 1,
                                textTransform: 'none',
                                fontWeight: 500
                            }}
                        >
                            {book ? 'Update Book' : 'Add Book'}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default BookForm;

