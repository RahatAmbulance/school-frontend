import React, {useEffect, useState} from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import {useSelector} from "react-redux";

// Helper function to convert numbers to words
function numberToWords(num) {
    if (!num) return "";

    const units = ["", "Thousand", "Lakh", "Crore"];
    const firstTwenty = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function convertChunk(n) {
        if (n === 0) return "";
        else if (n < 20) return firstTwenty[n] + " ";
        else if (n < 100) return tens[Math.floor(n / 10)] + " " + firstTwenty[n % 10] + " ";
        else return firstTwenty[Math.floor(n / 100)] + " Hundred " + convertChunk(n % 100);
    }

    let words = "";
    let unitIndex = 0;

    while (num > 0) {
        let chunk;
        if (unitIndex === 0) {
            chunk = num % 1000;
            num = Math.floor(num / 1000);
        } else {
            chunk = num % 100;
            num = Math.floor(num / 100);
        }

        if (chunk !== 0) {
            words = convertChunk(chunk) + (units[unitIndex] ? " " + units[unitIndex] : "") + " " + words;
        }
        unitIndex++;
    }

    return words.trim();
}

const PAYMENT_MODES = [
    "Cash",
    "Cheque",
    "Bank Transfer",
    "UPI",
    "Other"
];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

function StaffSalaryForm({salary, onCancel, onSubmit}) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        month: "",
        deductions: "",
        netSalary: "",
        basicSalary: "",
        totalSubmission: "",
        paymentMode: "",
        transactionId: "",
        comment: "",
        amountInWords: "",
        bankAccountNumber: "",
        bankIfsc: "",
        bankAccountName: "",
        paymentScreenshot: null,
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const staffName = useSelector((state) => state?.master?.data?.staff);

    useEffect(() => {
        if (salary) {
            setFormData({
                ...salary,
                creationDateTime: salary.creationDateTime
                    ? dayjs(salary.creationDateTime)
                    : null,
            });
        }
    }, [salary]);

    useEffect(() => {
        const basicSalary = parseFloat(formData.basicSalary) || 0;
        const deductions = parseFloat(formData.deductions) || 0;
        const calculatedNetSalary = basicSalary - deductions;

        setFormData(prevData => ({
            ...prevData,
            netSalary: calculatedNetSalary,
            amountInWords: numberToWords(calculatedNetSalary),
        }));
    }, [formData.basicSalary, formData.deductions]);

    const handleChange = async (e) => {
        const {name, value, files} = e.target;

        if (files) {
            const file = files[0];
            const base64 = await convertToBase64(file);
            setFormData({
                ...formData,
                [name]: base64,
            });
        } else {
            setFormData((prev) => ({...prev, [name]: value}));
        }

        // Clear error when field is modified
        if (errors[name]) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                [name]: ""
            }));
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
        });
    };

    const validateForm = () => {
        const newErrors = {};

        // Required field validation
        const requiredFields = {
            name: "Name",
            month: "Month",
            basicSalary: "Basic Salary",
            bankAccountNumber: "Bank Account Number",
            bankIfsc: "Bank IFSC Code",
            bankAccountName: "Bank Account Name"
        };

        Object.entries(requiredFields).forEach(([field, label]) => {
            if (!formData[field]) {
                newErrors[field] = `${label} is required`;
            }
        });

        // Numeric field validation
        const numericFields = {
            basicSalary: "Basic Salary",
            deductions: "Deductions",
            netSalary: "Net Salary"
        };

        Object.entries(numericFields).forEach(([field, label]) => {
            if (formData[field] && isNaN(formData[field])) {
                newErrors[field] = `${label} must be a number`;
            }
        });

        // IFSC code validation
        if (formData.bankIfsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankIfsc)) {
            newErrors.bankIfsc = "Invalid IFSC code format";
        }

        // Bank account number validation
        if (formData.bankAccountNumber && !/^\d{9,18}$/.test(formData.bankAccountNumber)) {
            newErrors.bankAccountNumber = "Invalid bank account number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            setSuccessMessage("Staff salary information submitted successfully!");

            // Reset form
            setFormData({
                name: "",
                month: "",
                deductions: "",
                netSalary: "",
                basicSalary: "",
                totalSubmission: "",
                paymentMode: "",
                transactionId: "",
                comment: "",
                amountInWords: "",
                bankAccountNumber: "",
                bankIfsc: "",
                bankAccountName: "",
                paymentScreenshot: null,
            });

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: "Failed to submit salary information. Please try again."
            }));
        } finally {
            setLoading(false);
        }
    };

    const renderImageUpload = (label, name) => (
        <Grid item xs={6} key={name}>
            <input
                accept="image/*"
                style={{display: "none"}}
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
        <Container maxWidth="md">
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    '& .MuiTextField-root': {mb: 2},
                    '& .MuiFormControl-root': {mb: 2},
                }}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                        <Divider sx={{mb: 2}}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.name}>
                            <InputLabel>Staff Name</InputLabel>
                            <Select
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                label="Staff Name"
                            >
                                {staffName && staffName.length > 0 ? (
                                    staffName.map((staff) => (
                                        <MenuItem key={staff.id} value={staff.name}>
                                            {staff.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>
                                        No staff available
                                    </MenuItem>
                                )}
                            </Select>
                            {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!errors.month}>
                            <InputLabel>Month</InputLabel>
                            <Select
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                label="Month"
                            >
                                {MONTHS.map(month => (
                                    <MenuItem key={month} value={month}>
                                        {month}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.month && <FormHelperText>{errors.month}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                            Salary Details
                        </Typography>
                        <Divider sx={{mb: 2}}/>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Basic Salary"
                            name="basicSalary"
                            value={formData.basicSalary}
                            onChange={handleChange}
                            error={!!errors.basicSalary}
                            helperText={errors.basicSalary}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Deductions"
                            name="deductions"
                            value={formData.deductions}
                            onChange={handleChange}
                            error={!!errors.deductions}
                            helperText={errors.deductions}
                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Net Salary"
                            name="netSalary"
                            value={formData.netSalary}
                            InputProps={{
                                readOnly: true,
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Amount in Words"
                            name="amountInWords"
                            value={formData.amountInWords}
                            InputProps={{
                                readOnly: true,
                            }}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                            Payment Details
                        </Typography>
                        <Divider sx={{mb: 2}}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Payment Mode</InputLabel>
                            <Select
                                name="paymentMode"
                                value={formData.paymentMode}
                                onChange={handleChange}
                                label="Payment Mode"
                            >
                                {PAYMENT_MODES.map(mode => (
                                    <MenuItem key={mode} value={mode}>
                                        {mode}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Transaction ID"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{mt: 2}}>
                            Bank Details
                        </Typography>
                        <Divider sx={{mb: 2}}/>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Bank Account Number"
                            name="bankAccountNumber"
                            value={formData.bankAccountNumber}
                            onChange={handleChange}
                            error={!!errors.bankAccountNumber}
                            helperText={errors.bankAccountNumber}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="IFSC Code"
                            name="bankIfsc"
                            value={formData.bankIfsc}
                            onChange={handleChange}
                            error={!!errors.bankIfsc}
                            helperText={errors.bankIfsc}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            label="Account Holder Name"
                            name="bankAccountName"
                            value={formData.bankAccountName}
                            onChange={handleChange}
                            error={!!errors.bankAccountName}
                            helperText={errors.bankAccountName}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2}}>
                            <Button
                                onClick={onCancel}
                                variant="outlined"
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
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
                                disabled={loading}
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 500
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit"/>
                                ) : (
                                    salary ? 'Update Salary' : 'Add Salary'
                                )}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {errors.submit && (
                    <Alert severity="error" sx={{mt: 2}}>
                        {errors.submit}
                    </Alert>
                )}
            </Box>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                anchorOrigin={{vertical: "top", horizontal: "center"}}
            >
                <Alert
                    severity="success"
                    sx={{width: "100%"}}
                    elevation={6}
                    variant="filled"
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default StaffSalaryForm;

