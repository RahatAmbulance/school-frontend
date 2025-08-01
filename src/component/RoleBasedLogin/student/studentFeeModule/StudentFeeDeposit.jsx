import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {api, selectSchoolDetails, selectUserActualData} from "../../../../common";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    alpha,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Grid,
    Paper,
    Skeleton,
    Snackbar,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import jsPDF from "jspdf";
import "jspdf-autotable";
import {styled} from '@mui/material/styles';
import {motion} from 'framer-motion';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ErrorIcon from '@mui/icons-material/Error';
import {fetchFeeAmountDetails} from "../../../page/fee-module/fee-amout-set/redux/feeAmountSlice";

// Styled Components (keeping the same styles)
const PageContainer = styled(motion.div)(({theme}) => ({
    minHeight: '100vh',
    padding: theme.spacing(4),
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
}));

const StyledPaper = styled(Paper)(({theme}) => ({
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(10px)',
    borderRadius: 24,
    padding: theme.spacing(3),
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const GradientTypography = styled(Typography)(({theme}) => ({
    fontWeight: 800,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(4),
    textAlign: 'center',
}));

const StyledAccordion = styled(Accordion)(({theme}) => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    borderRadius: '16px !important',
    marginBottom: theme.spacing(2),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    '&:before': {
        display: 'none',
    },
    '&.Mui-expanded': {
        margin: theme.spacing(1, 0),
    },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({theme}) => ({
    borderRadius: 16,
    '&.Mui-expanded': {
        minHeight: 48,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
}));

const StyledAccordionDetails = styled(AccordionDetails)(({theme}) => ({
    padding: theme.spacing(2),
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
    },
}));

const FeeAmountBox = styled(Box)(({theme}) => ({
    padding: theme.spacing(2),
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
    marginTop: theme.spacing(2),
}));

const FeeDetailItem = styled(Box)(({theme}) => ({
    padding: theme.spacing(1.5),
    borderRadius: 8,
    backgroundColor: alpha(theme.palette.background.paper, 0.6),
    marginBottom: theme.spacing(1),
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateX(4px)',
        backgroundColor: alpha(theme.palette.primary.light, 0.05),
    },
}));

const FeeDetailTitle = styled(Typography)(({theme}) => ({
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    '&::before': {
        content: '""',
        width: 4,
        height: 16,
        backgroundColor: theme.palette.primary.main,
        marginRight: theme.spacing(1),
        borderRadius: 2,
    },
}));

const StudentInfoCard = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: 16,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const ErrorContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    textAlign: 'center',
}));

const LoadingContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
    minHeight: '200px',
}));

// Constants
const MONTHS = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const RUPEE_SYMBOL = String.fromCharCode(8377);

// Error types
const ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    API: 'API_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
};

// Main Component
const StudentFeeDeposit = () => {
    const dispatch = useDispatch();

    // State
    const [responseDataFeeDeposit, setResponseDataFeeDeposit] = useState([]);
    const [paidMonths, setPaidMonths] = useState([]);
    const [dueMonths, setDueMonths] = useState([]);

    // Separate state for due months and paid months selections
    const [selectedDueMonths, setSelectedDueMonths] = useState([]);
    const [selectedPaidMonths, setSelectedPaidMonths] = useState([]);

    const [totalFee, setTotalFee] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    // Selectors with error handling
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const feeAmountState = useSelector(state => state.feeAmount || {});
    const feeAmountList = feeAmountState.feeAmounts || [];
    const feeAmountLoading = feeAmountState.loading || false;
    const feeAmountError = feeAmountState.error || null;

    // Validation helpers
    const validateRequiredData = useCallback(() => {
        const errors = [];

        if (!userData?.id) errors.push('School information is missing');
        if (!userData?.session) errors.push('Session information is missing');
        if (!userActualData?.tableId) errors.push('Student information is missing');
        if (!userActualData?.className) errors.push('Student class information is missing');

        return errors;
    }, [userData, userActualData]);

    // Safe data extraction with defaults
    const schoolId = userData?.id || null;
    const session = userData?.session || null;

    const studentData = useMemo(() => ({
        id: userActualData?.tableId || null,
        name: userActualData?.name || 'N/A',
        admissionNo: userActualData?.admissionNo || 'N/A',
        rollNo: userActualData?.rollNo || 'N/A',
        fatherName: userActualData?.fatherName || 'N/A',
        className: userActualData?.className || '',
        section: userActualData?.section || 'N/A',
        vehiclePrice: parseFloat(userActualData?.vehiclePrice) || 0,
    }), [userActualData]);

    // Utility Functions with error handling
    const formatCurrency = useCallback((amount) => {
        try {
            const numAmount = parseFloat(amount) || 0;
            return `${RUPEE_SYMBOL}${numAmount.toLocaleString("en-IN")}`;
        } catch (error) {
            console.error('Error formatting currency:', error);
            return `${RUPEE_SYMBOL}0`;
        }
    }, []);

    const isLateFeeApplicable = useCallback((currentMonth, selectedMonth) => {
        try {
            const selectedMonthIndex = new Date(`${selectedMonth} 1, 2024`).getMonth();
            const sessionStartMonth = 3; // April (0-indexed)

            if (currentMonth >= sessionStartMonth && selectedMonthIndex >= sessionStartMonth) {
                return selectedMonthIndex < currentMonth;
            } else if (currentMonth < sessionStartMonth && selectedMonthIndex >= sessionStartMonth) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking late fee applicability:', error);
            return false;
        }
    }, []);

    const filterList = useCallback((month) => {
        try {
            if (!studentData.className || !Array.isArray(feeAmountList) || feeAmountList.length === 0) {
                return [];
            }

            return feeAmountList.filter(feeAmount =>
                feeAmount?.className === studentData.className &&
                feeAmount?.session === session &&
                feeAmount?.months?.[month] === true
            ) || [];
        } catch (error) {
            console.error('Error filtering fee list:', error);
            return [];
        }
    }, [studentData.className, feeAmountList, session]);

    // Error handling helper
    const handleError = useCallback((error, context) => {
        console.error(`Error in ${context}:`, error);

        let errorType = ERROR_TYPES.UNKNOWN;
        let message = 'An unexpected error occurred';

        if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
            errorType = ERROR_TYPES.NETWORK;
            message = 'Network connection error. Please check your internet connection.';
        } else if (error.response) {
            errorType = ERROR_TYPES.API;
            message = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
            errorType = ERROR_TYPES.NETWORK;
            message = 'Unable to connect to server. Please try again.';
        }

        setError({type: errorType, message, context});
        setErrorMessage(message);
        setOpenSnackbar(true);
    }, []);

    // API Functions with comprehensive error handling
    const fetchFeeStatus = useCallback(async (studentId, retries = 3) => {
        if (!studentId || !schoolId || !session) {
            console.warn('Missing required parameters for fetchFeeStatus');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.get("/api/fees/fee-deposit/search", {
                params: {studentId, schoolId, session},
                timeout: 10000, // 10 second timeout
            });

            if (response.data && Array.isArray(response.data)) {
                setResponseDataFeeDeposit(response.data);
                setRetryCount(0);
            } else {
                setResponseDataFeeDeposit([]);
            }
        } catch (error) {
            if (retries > 0 && (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT')) {
                console.log(`Retrying fetchFeeStatus... ${retries} attempts remaining`);
                setTimeout(() => fetchFeeStatus(studentId, retries - 1), 2000);
                return;
            }

            handleError(error, 'fetchFeeStatus');
            setResponseDataFeeDeposit([]);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [schoolId, session, handleError]);

    // Enhanced month processing with error handling
    const processMonthsData = useCallback(() => {
        try {
            const trueMonthsSet = new Set();

            if (Array.isArray(responseDataFeeDeposit) && responseDataFeeDeposit.length > 0) {
                responseDataFeeDeposit.forEach(item => {
                    if (item && typeof item === 'object') {
                        Object.keys(item).forEach(month => {
                            if (item[month] === true && MONTHS.includes(month)) {
                                trueMonthsSet.add(month);
                            }
                        });
                    }
                });
            }

            const trueMonthsArray = Array.from(trueMonthsSet);
            const dueMonthsArray = MONTHS.filter(month => !trueMonthsArray.includes(month));

            setPaidMonths(trueMonthsArray);
            setDueMonths(dueMonthsArray);
        } catch (error) {
            console.error('Error processing months data:', error);
            setPaidMonths([]);
            setDueMonths(MONTHS);
        }
    }, [responseDataFeeDeposit]);

    // Effects with proper dependency management
    useEffect(() => {
        const validationErrors = validateRequiredData();
        if (validationErrors.length > 0) {
            setError({
                type: ERROR_TYPES.VALIDATION,
                message: validationErrors.join(', '),
                context: 'validation'
            });
            setInitialLoading(false);
            return;
        }

        if (studentData.id && schoolId && session) {
            fetchFeeStatus(studentData.id);
        }
    }, [studentData.id, schoolId, session, fetchFeeStatus, validateRequiredData]);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchFeeAmountDetails({schoolId, session}))
                .catch(error => handleError(error, 'fetchFeeAmountDetails'));
        }
    }, [schoolId, session, dispatch, handleError]);

    useEffect(() => {
        processMonthsData();
    }, [processMonthsData]);

    // Calculate total fee with error handling for due months only
    const calculateTotalFee = useCallback((selectedMonthsList) => {
        try {
            const currentMonth = new Date().getMonth();

            return selectedMonthsList.reduce((total, selectedMonth) => {
                const filteredMonthList = filterList(selectedMonth);
                const monthFee = filteredMonthList.reduce((monthTotal, feeAmount) => {
                    if (!feeAmount || typeof feeAmount !== 'object') return monthTotal;

                    const safeAmount = parseFloat(feeAmount.amount) || 0;
                    const safeVehiclePrice = parseFloat(studentData.vehiclePrice) || 0;

                    if (feeAmount.selectedFee === 'transportationFee' && feeAmount.feeTypeMode === 'Dynamic') {
                        return monthTotal + safeVehiclePrice;
                    }
                    if (feeAmount.selectedFee === 'lateFee' && isLateFeeApplicable(currentMonth, selectedMonth)) {
                        return monthTotal + safeAmount;
                    }
                    if (feeAmount.selectedFee !== 'lateFee') {
                        return monthTotal + safeAmount;
                    }
                    return monthTotal;
                }, 0);
                return total + (monthFee || 0);
            }, 0);
        } catch (error) {
            console.error('Error calculating total fee:', error);
            return 0;
        }
    }, [filterList, studentData.vehiclePrice, isLateFeeApplicable]);

    // Separate event handlers for due months and paid months
    const handleDueMonthSelection = useCallback((month) => {
        try {
            if (!MONTHS.includes(month)) {
                console.warn('Invalid month selected:', month);
                return;
            }

            setSelectedDueMonths((prevSelected) => {
                const newSelected = prevSelected.includes(month)
                    ? prevSelected.filter((selectedMonth) => selectedMonth !== month)
                    : [...prevSelected, month];

                const newTotalFee = calculateTotalFee(newSelected);
                setTotalFee(newTotalFee);
                return newSelected;
            });
        } catch (error) {
            handleError(error, 'handleDueMonthSelection');
        }
    }, [calculateTotalFee, handleError]);

    const handlePaidMonthSelection = useCallback((month) => {
        try {
            if (!MONTHS.includes(month)) {
                console.warn('Invalid month selected:', month);
                return;
            }

            setSelectedPaidMonths((prevSelected) => {
                return prevSelected.includes(month)
                    ? prevSelected.filter((selectedMonth) => selectedMonth !== month)
                    : [...prevSelected, month];
            });
        } catch (error) {
            handleError(error, 'handlePaidMonthSelection');
        }
    }, [handleError]);

    const handleSubmitPayment = useCallback(async () => {
        if (selectedDueMonths.length === 0) {
            setErrorMessage('Please select at least one due month');
            setOpenSnackbar(true);
            return;
        }

        // Validate required data
        const validationErrors = validateRequiredData();
        if (validationErrors.length > 0) {
            setErrorMessage(validationErrors.join(', '));
            setOpenSnackbar(true);
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const dataToSend = selectedDueMonths.map((month) => {
                const feeAmounts = filterList(month).reduce((acc, feeAmount) => {
                    if (feeAmount?.selectedFee && feeAmount?.amount) {
                        acc[feeAmount.selectedFee] = parseFloat(feeAmount.amount) || 0;
                    }
                    return acc;
                }, {});

                let totalAmount = 0;
                let transportAmount = 0;
                let lateAmount = 0;

                Object.entries(feeAmounts).forEach(([selectedFee, amount]) => {
                    const numericAmount = parseFloat(amount) || 0;
                    switch (selectedFee) {
                        case 'lateFee':
                            lateAmount += numericAmount;
                            break;
                        case 'transportationFee':
                            transportAmount += numericAmount;
                            break;
                        default:
                            totalAmount += numericAmount;
                    }
                });

                return {
                    [month]: true,
                    totalAmount,
                    transportAmount,
                    lateAmount,
                    allTotalAmount: totalAmount + transportAmount + lateAmount,
                    feeAmounts,
                    schoolId,
                    session,
                    studentId: studentData.id,
                    studentName: studentData.name,
                    admissionNo: studentData.admissionNo,
                    rollNo: studentData.rollNo,
                    className: studentData.className,
                    section: studentData.section,
                    status: 'Paid'
                };
            });

            const response = await api.post('/api/fees/fee-deposit', dataToSend, {
                timeout: 15000, // 15 second timeout
            });

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage('Payment submitted successfully!');
                setOpenSnackbar(true);
                setSelectedDueMonths([]);
                setTotalFee(0);

                // Refresh fee status
                await fetchFeeStatus(studentData.id);
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }

        } catch (error) {
            handleError(error, 'handleSubmitPayment');
        } finally {
            setSubmitting(false);
        }
    }, [selectedDueMonths, validateRequiredData, filterList, schoolId, session, studentData, fetchFeeStatus, handleError]);

    const handleDownload = useCallback(() => {
        const monthsToDownload = selectedPaidMonths.length > 0 ? selectedPaidMonths : selectedDueMonths;

        if (monthsToDownload.length === 0) {
            setErrorMessage("Please select months to download receipt.");
            setOpenSnackbar(true);
            return;
        }

        try {
            const doc = new jsPDF("p", "mm", "a4");

            // School Details with safe access
            doc.setFontSize(16);
            doc.setFont("Roboto", "bold");
            doc.text(userData?.name || "School Name", 105, 16, {align: "center"});

            doc.setFontSize(12);
            doc.setFont("Roboto", "normal");
            doc.text(userData?.address || "School Address", 105, 23, {align: "center"});
            doc.text(`Contact: ${userData?.phone || "N/A"}`, 105, 30, {align: "center"});
            doc.text(`Email: ${userData?.email || "N/A"}`, 105, 37, {align: "center"});

            // Receipt Title
            doc.setFontSize(14);
            doc.text("Fee Receipt", 105, 46, {align: "center"});

            // Student Details with safe access
            doc.setFontSize(12);
            doc.text(`Receipt No.: ${Date.now()}`, 14, 55);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 55);
            doc.text(`Student Name: ${studentData.name}`, 14, 62);
            doc.text(`Father's Name: ${studentData.fatherName}`, 140, 62);
            doc.text(`Class & Section: ${studentData.className} - ${studentData.section}`, 14, 69);
            doc.text(`Admission No: ${studentData.admissionNo}`, 140, 69);
            doc.text(`Fee For Month(s): ${monthsToDownload.join(", ")}`, 14, 76);

            // Fee Table with error handling
            const feeSummary = {
                "Lab Fee": [],
                "Tuition Fee": [],
                "Admission Fee": [],
                "Exam Fee": [],
                "Library Fee": [],
                "Sports Fee": [],
                "Transport Fee": [],
                "Other Fee": [],
                "Total": []
            };

            let totalReceiptAmount = 0;

            monthsToDownload.forEach((month) => {
                const filteredList = filterList(month);
                const feeObj = {
                    laboratoryFee: 0,
                    tuitionFee: 0,
                    admissionFee: 0,
                    examFee: 0,
                    libraryFee: 0,
                    sportsFee: 0,
                    transportationFee: 0,
                    otherFee: 0,
                    total: 0
                };

                filteredList.forEach(fee => {
                    if (!fee || typeof fee !== 'object') return;

                    const amount = parseFloat(fee.amount) || 0;
                    const feeType = fee.selectedFee;

                    if (feeObj.hasOwnProperty(feeType)) {
                        feeObj[feeType] += amount;
                    } else {
                        feeObj.otherFee += amount;
                    }
                    feeObj.total += amount;
                });

                totalReceiptAmount += feeObj.total;

                feeSummary["Lab Fee"].push(`₹${feeObj.laboratoryFee}`);
                feeSummary["Tuition Fee"].push(`₹${feeObj.tuitionFee}`);
                feeSummary["Admission Fee"].push(`₹${feeObj.admissionFee}`);
                feeSummary["Exam Fee"].push(`₹${feeObj.examFee}`);
                feeSummary["Library Fee"].push(`₹${feeObj.libraryFee}`);
                feeSummary["Sports Fee"].push(`₹${feeObj.sportsFee}`);
                feeSummary["Transport Fee"].push(`₹${feeObj.transportationFee}`);
                feeSummary["Other Fee"].push(`₹${feeObj.otherFee}`);
                feeSummary["Total"].push(`₹${feeObj.total}`);
            });

            const columnWiseData = [
                ["Fee Type", ...monthsToDownload],
                ...Object.entries(feeSummary).map(([key, values]) => [key, ...values])
            ];

            doc.autoTable({
                startY: 85,
                head: [columnWiseData[0]],
                body: columnWiseData.slice(1),
                theme: "grid",
                styles: {fontSize: 10, halign: "center"},
                columnStyles: {0: {halign: "left", fontStyle: "bold"}},
            });

            // Payment Information
            doc.text("Payment Information", 14, doc.lastAutoTable.finalY + 10);
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                head: [["S.No", "Pay Mode", "Bank Number", "Amount"]],
                body: [["1", "Online", "N/A", `₹${totalReceiptAmount.toLocaleString()}`]],
                theme: "grid",
            });

            // Remarks
            doc.text("Remarks:", 14, doc.lastAutoTable.finalY + 10);
            doc.text(`Total in words: Rupees ${totalReceiptAmount.toLocaleString()} Only`, 14, doc.lastAutoTable.finalY + 16);
            doc.text("This is a System Generated Slip, No Signature Required.", 14, doc.lastAutoTable.finalY + 22);

            doc.save(`Fee_Receipt_${studentData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`);

            setSuccessMessage('Receipt downloaded successfully!');
            setOpenSnackbar(true);

        } catch (error) {
            handleError(error, 'handleDownload');
        }
    }, [selectedPaidMonths, selectedDueMonths, userData, studentData, filterList, handleError]);

    const handleRetry = useCallback(() => {
        setError(null);
        setInitialLoading(true);
        if (studentData.id) {
            fetchFeeStatus(studentData.id);
        }
    }, [studentData.id, fetchFeeStatus]);

    const handleSnackbarClose = useCallback((event, reason) => {
        if (reason === 'clickaway') return;
        setOpenSnackbar(false);
        setSuccessMessage('');
        setErrorMessage('');
    }, []);

    // Render Functions with error handling
    const renderFeeDetails = useCallback((month) => {
        try {
            const filteredList = filterList(month);
            const currentMonth = new Date().getMonth();

            const monthTotal = filteredList.reduce((total, feeAmount) => {
                if (!feeAmount || typeof feeAmount !== 'object') return total;

                const safeAmount = parseFloat(feeAmount?.amount) || 0;
                const safeVehiclePrice = parseFloat(studentData?.vehiclePrice) || 0;

                if (feeAmount.selectedFee === 'transportationFee' && feeAmount.feeTypeMode === 'Dynamic') {
                    return total + safeVehiclePrice;
                }
                if (feeAmount.selectedFee === 'lateFee' && isLateFeeApplicable(currentMonth, month)) {
                    return total + safeAmount;
                }
                if (feeAmount.selectedFee !== 'lateFee') {
                    return total + safeAmount;
                }
                return total;
            }, 0);

            return (
                <Box>
                    <FeeDetailTitle variant="subtitle1">
                        Fee Details for {month}
                    </FeeDetailTitle>
                    {filteredList.length > 0 ? (
                        <>
                            {filteredList.map((feeAmount, index) => {
                                if (!feeAmount || typeof feeAmount !== 'object') return null;

                                return (
                                    <FeeDetailItem key={`${month}-${index}`}>
                                        {feeAmount.selectedFee === 'transportationFee' && feeAmount.feeTypeMode === 'Dynamic' ? (
                                            <Typography variant="body2">
                                                <strong>Transportation
                                                    Fee:</strong> {formatCurrency(studentData?.vehiclePrice ?? 0)}
                                            </Typography>
                                        ) : feeAmount.selectedFee === 'lateFee' && isLateFeeApplicable(new Date().getMonth(), month) ? (
                                            <Typography variant="body2">
                                                <strong>Late Fee:</strong> {formatCurrency(feeAmount.amount)}
                                            </Typography>
                                        ) : feeAmount.selectedFee !== 'lateFee' && (
                                            <Typography variant="body2">
                                                <strong>{feeAmount.selectedFee?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown Fee'}:</strong> {formatCurrency(feeAmount.amount)}
                                            </Typography>
                                        )}
                                    </FeeDetailItem>
                                );
                            })}
                            <FeeAmountBox>
                                <Typography variant="subtitle2" fontWeight="600">
                                    Total: {formatCurrency(monthTotal)}
                                </Typography>
                            </FeeAmountBox>
                        </>
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{fontStyle: 'italic'}}>
                            No fees found for {month}.
                        </Typography>
                    )}
                </Box>
            );
        } catch (error) {
            console.error('Error rendering fee details:', error);
            return (
                <Typography variant="body2" color="error">
                    Error loading fee details for {month}
                </Typography>
            );
        }
    }, [filterList, studentData.vehiclePrice, isLateFeeApplicable, formatCurrency]);

    const renderDueMonthAccordions = useCallback((monthsList, color) => {
        if (!Array.isArray(monthsList)) return null;

        return monthsList.length > 0 ? (
            monthsList.map((month) => (
                <StyledAccordion key={month}>
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Box display="flex" alignItems="center" width="100%">
                            <Checkbox
                                checked={selectedDueMonths.includes(month)}
                                onChange={() => handleDueMonthSelection(month)}
                                sx={{
                                    '&.Mui-checked': {
                                        color: `${color}.main`,
                                    }
                                }}
                            />
                            <Typography>{month}</Typography>
                        </Box>
                    </StyledAccordionSummary>
                    <StyledAccordionDetails>
                        {renderFeeDetails(month)}
                    </StyledAccordionDetails>
                </StyledAccordion>
            ))
        ) : (
            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                No months found
            </Typography>
        );
    }, [selectedDueMonths, handleDueMonthSelection, renderFeeDetails]);

    const renderPaidMonthAccordions = useCallback((monthsList, color) => {
        if (!Array.isArray(monthsList)) return null;

        return monthsList.length > 0 ? (
            monthsList.map((month) => (
                <StyledAccordion key={month}>
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Box display="flex" alignItems="center" width="100%">
                            <Checkbox
                                checked={selectedPaidMonths.includes(month)}
                                onChange={() => handlePaidMonthSelection(month)}
                                sx={{
                                    '&.Mui-checked': {
                                        color: `${color}.main`,
                                    }
                                }}
                            />
                            <Typography>{month}</Typography>
                        </Box>
                    </StyledAccordionSummary>
                    <StyledAccordionDetails>
                        {renderFeeDetails(month)}
                    </StyledAccordionDetails>
                </StyledAccordion>
            ))
        ) : (
            <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 4}}>
                No months found
            </Typography>
        );
    }, [selectedPaidMonths, handlePaidMonthSelection, renderFeeDetails]);

    const renderErrorState = () => (
        <ErrorContainer>
            <ErrorIcon sx={{fontSize: 64, color: 'error.main', mb: 2}}/>
            <Typography variant="h6" gutterBottom>
                {error?.message || 'Something went wrong'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
                {error?.context && `Error in: ${error.context}`}
            </Typography>
            <ActionButton
                variant="contained"
                color="primary"
                onClick={handleRetry}
                disabled={loading}
            >
                Try Again
            </ActionButton>
        </ErrorContainer>
    );

    const renderLoadingState = () => (
        <LoadingContainer>
            <CircularProgress size={60} sx={{mb: 2}}/>
            <Typography variant="h6" gutterBottom>
                Loading fee information...
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Please wait while we fetch your data
            </Typography>
        </LoadingContainer>
    );

    const renderSkeletonLoader = () => (
        <Grid container spacing={4} mt={1}>
            <Grid item xs={12} md={6}>
                <StyledPaper elevation={0}>
                    <Skeleton variant="text" height={40} width="60%" sx={{mb: 2}}/>
                    {[1, 2, 3].map((item) => (
                        <Box key={item} sx={{mb: 2}}>
                            <Skeleton variant="rectangular" height={60} sx={{borderRadius: 2}}/>
                        </Box>
                    ))}
                </StyledPaper>
            </Grid>
            <Grid item xs={12} md={6}>
                <StyledPaper elevation={0}>
                    <Skeleton variant="text" height={40} width="60%" sx={{mb: 2}}/>
                    {[1, 2, 3].map((item) => (
                        <Box key={item} sx={{mb: 2}}>
                            <Skeleton variant="rectangular" height={60} sx={{borderRadius: 2}}/>
                        </Box>
                    ))}
                </StyledPaper>
            </Grid>
        </Grid>
    );

    // Main render with comprehensive error handling
    if (error && error.type === ERROR_TYPES.VALIDATION) {
        return (
            <PageContainer
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <StyledPaper elevation={0}>
                    {renderErrorState()}
                </StyledPaper>
            </PageContainer>
        );
    }

    if (initialLoading || (loading && responseDataFeeDeposit.length === 0)) {
        return (
            <PageContainer
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
            >
                <StyledPaper elevation={0}>
                    <GradientTypography variant="h4" gutterBottom>
                        Fee Deposit Management
                    </GradientTypography>
                    {feeAmountLoading ? renderSkeletonLoader() : renderLoadingState()}
                </StyledPaper>
            </PageContainer>
        );
    }

    return (
        <PageContainer
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
        >
            <StyledPaper elevation={0}>
                <GradientTypography variant="h4" gutterBottom>
                    Fee Deposit Management
                </GradientTypography>

                {/* Student Information Card */}
                <StudentInfoCard elevation={0}>
                    <Typography variant="h6" gutterBottom color="primary.main" fontWeight="600">
                        Student Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Student Name</Typography>
                            <Typography variant="body1" fontWeight="500">{studentData.name}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Admission No</Typography>
                            <Typography variant="body1" fontWeight="500">{studentData.admissionNo}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Class & Section</Typography>
                            <Typography variant="body1"
                                        fontWeight="500">{studentData.className} - {studentData.section}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary">Roll No</Typography>
                            <Typography variant="body1" fontWeight="500">{studentData.rollNo}</Typography>
                        </Grid>
                    </Grid>
                </StudentInfoCard>

                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={5000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={errorMessage ? "error" : "success"}
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {errorMessage || successMessage}
                    </Alert>
                </Snackbar>

                {feeAmountError && (
                    <Alert severity="warning" sx={{mb: 2}}>
                        Error loading fee amounts: {feeAmountError}
                    </Alert>
                )}

                <Grid container spacing={4} mt={1}>
                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={0}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <PaymentIcon sx={{mr: 1, color: 'primary.main'}}/>
                                <Typography variant="h6" fontWeight="600">Due Months</Typography>
                            </Box>

                            {loading ? (
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <CircularProgress size={40}/>
                                    <Typography variant="body2" sx={{mt: 2}}>
                                        Loading due months...
                                    </Typography>
                                </Box>
                            ) : (
                                renderDueMonthAccordions(dueMonths, 'primary')
                            )}

                            {selectedDueMonths.length > 0 && (
                                <FeeAmountBox>
                                    <Typography variant="h6" fontWeight="600" color="success.main">
                                        Total Fee: {formatCurrency(totalFee)}
                                    </Typography>
                                </FeeAmountBox>
                            )}

                            <Box mt={3}>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSubmitPayment}
                                    startIcon={submitting ? <CircularProgress size={20} color="inherit"/> :
                                        <PaymentIcon/>}
                                    disabled={selectedDueMonths.length === 0 || submitting || loading}
                                >
                                    {submitting ? 'Processing Payment...' : 'Submit Payment'}
                                </ActionButton>
                            </Box>
                        </StyledPaper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={0}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <ReceiptIcon sx={{mr: 1, color: 'secondary.main'}}/>
                                <Typography variant="h6" fontWeight="600">Paid Months</Typography>
                            </Box>

                            {loading ? (
                                <Box sx={{textAlign: 'center', py: 4}}>
                                    <CircularProgress size={40}/>
                                    <Typography variant="body2" sx={{mt: 2}}>
                                        Loading paid months...
                                    </Typography>
                                </Box>
                            ) : (
                                renderPaidMonthAccordions(paidMonths, 'secondary')
                            )}

                            <Box mt={3}>
                                <ActionButton
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={handleDownload}
                                    startIcon={<ReceiptIcon/>}
                                    disabled={selectedPaidMonths.length === 0 && selectedDueMonths.length === 0}
                                >
                                    Download Fee Receipt
                                </ActionButton>
                            </Box>
                        </StyledPaper>
                    </Grid>
                </Grid>
            </StyledPaper>
        </PageContainer>
    );
};

export default StudentFeeDeposit;
