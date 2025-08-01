import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {api, selectSchoolDetails} from "../../../../common";
import {fetchFeeAmountDetails} from "../fee-amout-set/redux/feeAmountSlice";
import {feeDepositFetchingCommon} from "../feeDepositFetchingCommon";
import {searchStudentDetails} from "../SearchStudentDetails";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    alpha,
    Box,
    Button,
    Checkbox,
    Grid,
    Paper,
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

// Styled Components
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

const FeeDeposit = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const dispatch = useDispatch();

    const [responseDataFeeDeposit, setResponseDataFeeDeposit] = useState([]);
    const [months] = useState(["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"]);
    const [paidMonths, setPaidMonths] = useState([]);
    const [dueMonths, setDueMonths] = useState([]);
    const [selectedMonths, setSelectedMonths] = useState([]);
    const [totalFee, setTotalFee] = useState(0);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
// Use String.fromCharCode(8377) to get the ₹ symbol
    const rupeeSymbol = String.fromCharCode(8377);

// Function to format currency values correctly with ₹
    const formatCurrency = (amount) => `${rupeeSymbol}${Number(amount).toLocaleString("en-IN")}`;

    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const classSections = useSelector((state) => state.master.data.classSections);
    const feeAmountList = useSelector(state => state.feeAmount.feeAmounts);

    const [formValues, setFormValues] = useState({
        searchType: 'classSection',
        admissionOrClass: '',
        className: '',
        section: '',
        studentName: '',
        studentId: ''
    });

    useEffect(() => {
        if (responseDataFeeDeposit.length > 0) {
            const trueMonthsSet = new Set();
            responseDataFeeDeposit.forEach(item => {
                Object.keys(item).forEach(month => {
                    if (item[month] === true) {
                        trueMonthsSet.add(month);
                    }
                });
            });
            const trueMonthsArray = Array.from(trueMonthsSet);
            setPaidMonths(trueMonthsArray);
            const dueMonthsArray = months.filter(month => !trueMonthsArray.includes(month));
            setDueMonths(dueMonthsArray);
        } else {
            setDueMonths(months);
            setPaidMonths([]);
        }
    }, [formValues.className, feeAmountList, responseDataFeeDeposit, months]);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchFeeAmountDetails({schoolId, session}));
        }
    }, [schoolId, session, dispatch]);

    useEffect(() => {
        if (formValues.searchType === 'classSection') {
            setFormValues((prevValues) => ({
                ...prevValues,
                studentName: '',
            }));
        }
    }, [formValues.searchType]);

    const {
        handleChange,
        handleSubmit
    } = feeDepositFetchingCommon(setFormValues, errors, setErrors, formValues, students, schoolId, session, setStudents, setResponseDataFeeDeposit, setSelectedStudent);

    const isLateFeeApplicable = (currentMonth, selectedMonth) => {
        const selectedMonthIndex = new Date(`${selectedMonth} 1`).getMonth();
        const sessionStartMonth = 3; // April (0-indexed)

        if (currentMonth >= sessionStartMonth && selectedMonthIndex >= sessionStartMonth) {
            return selectedMonthIndex < currentMonth;
        } else if (currentMonth < sessionStartMonth && selectedMonthIndex >= sessionStartMonth) {
            return true;
        }
        return false;
    };

    const filterList = (month) => {
        const selectedClassName = formValues.className;
        if (selectedClassName && feeAmountList && Array.isArray(feeAmountList)) {
            return feeAmountList.filter(feeAmount =>
                feeAmount.className === selectedClassName &&
                feeAmount.session === session &&
                feeAmount.months[month] === true
            );
        }
        return [];
    };

    const handleMonthSelection = (month) => {
        const currentMonth = new Date().getMonth();

        setSelectedMonths((prevSelected) => {
            const newSelected = prevSelected.includes(month)
                ? prevSelected.filter((selectedMonth) => selectedMonth !== month)
                : [...prevSelected, month];

            const newTotalFee = newSelected.reduce((total, selectedMonth) => {
                const filteredMonthList = filterList(selectedMonth) || [];
                const monthFee = filteredMonthList.reduce((monthTotal, feeAmount) => {
                    if (!feeAmount) return monthTotal;
                    const safeAmount = parseFloat(feeAmount.amount) || 0;
                    const safeVehiclePrice = parseFloat(selectedStudent?.vehiclePrice) || 0;

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

            setTotalFee(newTotalFee);
            return newSelected;
        });
    };

    const renderFeeDetails = (month) => {
        const filteredList = filterList(month);
        const currentMonth = new Date().getMonth();
        const selectedMonth = new Date(`${month} 1`).getMonth();

        const totalFee = filteredList.reduce((total, feeAmount) => {
            if (!feeAmount || typeof feeAmount !== 'object') return total;

            const safeAmount = parseFloat(feeAmount?.amount) || 0;
            const safeVehiclePrice = parseFloat(selectedStudent?.vehiclePrice) || 0;

            if (feeAmount.selectedFee === 'transportationFee' && feeAmount.feeTypeMode === 'Dynamic') {
                return total + safeVehiclePrice;
            }
            if (feeAmount.selectedFee === 'lateFee' && isLateFeeApplicable(currentMonth, selectedMonth)) {
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
                        {filteredList.map((feeAmount, index) => (
                            <FeeDetailItem key={index}>
                                {feeAmount.selectedFee === 'transportationFee' && feeAmount.feeTypeMode === 'Dynamic' ? (
                                    <Typography variant="body2">
                                        <strong>Transportation
                                            Fee:</strong> {formatCurrency(selectedStudent?.vehiclePrice ?? 0)}
                                    </Typography>
                                ) : feeAmount.selectedFee === 'lateFee' && isLateFeeApplicable(currentMonth, selectedMonth) ? (
                                    <Typography variant="body2">
                                        <strong>Late Fee:</strong> {formatCurrency(feeAmount.amount)}
                                    </Typography>
                                ) : feeAmount.selectedFee !== 'lateFee' && (
                                    <Typography variant="body2">
                                        <strong>{feeAmount.selectedFee.replace(/([A-Z])/g, ' $1').trim()}:</strong> {formatCurrency(feeAmount.amount)}
                                    </Typography>
                                )}
                            </FeeDetailItem>
                        ))}
                        <FeeAmountBox>
                            <Typography variant="subtitle2" fontWeight="600">
                                Total: {formatCurrency(totalFee)}
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
    };

    const handleSubmitforSelected = async (e) => {
        e.preventDefault();

        if (!selectedStudent?.id) {
            alert('Please select a student first');
            return;
        }

        if (selectedMonths.length > 0) {
            let dataToSend = selectedMonths.map((month) => {
                const feeAmounts = filterList(month).reduce((acc, feeAmount) => {
                    acc[feeAmount.selectedFee] = feeAmount.amount;
                    return acc;
                }, {});

                let totalAmount = 0;
                let transportAmount = 0;
                let lateAmount = 0;

                Object.entries(feeAmounts).forEach(([selectedFee, amount]) => {
                    const numericAmount = parseFloat(amount);
                    if (!isNaN(numericAmount)) {
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
                    }
                });
                const allTotalAmount = totalAmount + transportAmount + lateAmount;

                return {
                    [month]: true,
                    totalAmount,
                    transportAmount,
                    lateAmount,
                    allTotalAmount,
                    feeAmounts,
                    schoolId,
                    session,
                    ...formValues,
                    status: 'Paid'
                };
            });

            // Loop through and ensure each object has studentId
            dataToSend = dataToSend.map(item => ({
                ...item,
                studentId: selectedStudent.id,
                admissionNo: selectedStudent.admissionNo,
                rollNo: selectedStudent.rollNo,
            }));

            try {
                // Validate required fields
                if (dataToSend.some(data => !data.className || !data.studentName || !data.studentId)) {
                    alert('Cannot save: Missing required fields (Class or Student Name or Student Id)');
                    return;
                }

                await api.post('/api/fees/fee-deposit', dataToSend);
                setSuccessMessage('Save successful!');
                setOpenSnackbar(true);
                setSelectedMonths([]);
                setTotalFee(0);
                await fetchFeeStatus(selectedStudent.id, schoolId, session);

                setTimeout(() => {
                    setSuccessMessage('');
                }, 5000);
            } catch (error) {
                console.error('Error updating fee deposit:', error);
            }
        } else {
            alert('Please select at least one month');
        }
    };

    const handleDownload = () => {
        if (!selectedStudent) {
            alert("Please select a student first.");
            return;
        }

        const doc = new jsPDF("p", "mm", "a4"); // Portrait mode, millimeters, A4 size

        // === Center-aligned School Details ===
        doc.setFontSize(16);
        doc.setFont("Roboto", "bold");
        doc.text(userData?.name || "Delhi Public School, Gautam Buddh Nagar", 105, 16, {align: "center"});

        doc.setFontSize(12);
        doc.setFont("Roboto", "normal");
        doc.text(userData?.address || "NA", 105, 23, {align: "center"});
        doc.text(`Contact No: ${userData?.phone || "NA"}`, 105, 30, {align: "center"});
        doc.text(`Website: ${userData?.email || "NA"}`, 105, 37, {align: "center"});
        // === Fee Receipt Title ===
        doc.setFontSize(14);
        doc.text("Fee Receipt", 105, 46, {align: "center"});

        // === Student Details ===
        doc.setFontSize(12);
        doc.text(`Receipt No.: ₹{selectedStudent?.receiptNo || "DPS-0991"}`, 14, 55);
        doc.text(`Date: ₹{new Date().toLocaleDateString()}`, 140, 55);
        doc.text(`Student Name: ₹{selectedStudent?.studentName || "N/A"}`, 14, 62);
        doc.text(`Father's Name: ₹{selectedStudent?.fatherName || "N/A"}`, 140, 62);
        doc.text(`Class & Section: ₹{formValues.className} - ₹{formValues.section}`, 14, 69);
        doc.text(`Admission No: ₹{selectedStudent?.admissionNo || "N/A"}`, 140, 69);
        doc.text(`FEE For Month(s): ₹{selectedMonths.join(", ")}`, 14, 76);

        // === Prepare Fee Data for Column-Wise Table ===
        let feeSummary = {
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

        selectedMonths.forEach((month) => {
            const filteredList = filterList(month);
            let feeObj = {
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
                const amount = parseFloat(fee.amount) || 0;
                if (fee.selectedFee === "laboratoryFee") feeObj.laboratoryFee += amount;
                else if (fee.selectedFee === "tuitionFee") feeObj.tuitionFee += amount;
                else if (fee.selectedFee === "admissionFee") feeObj.admissionFee += amount;
                else if (fee.selectedFee === "examFee") feeObj.examFee += amount;
                else if (fee.selectedFee === "libraryFee") feeObj.libraryFee += amount;
                else if (fee.selectedFee === "sportsFee") feeObj.sportsFee += amount;
                else if (fee.selectedFee === "transportationFee") feeObj.transportationFee += amount;
                else feeObj.otherFee += amount;

                feeObj.total += amount;
            });

            feeSummary["Lab Fee"].push(`₹₹{feeObj.laboratoryFee}`);
            feeSummary["Tuition Fee"].push(`₹₹{feeObj.tuitionFee}`);
            feeSummary["Admission Fee"].push(`₹₹{feeObj.admissionFee}`);
            feeSummary["Exam Fee"].push(`₹₹{feeObj.examFee}`);
            feeSummary["Library Fee"].push(`₹₹{feeObj.libraryFee}`);
            feeSummary["Sports Fee"].push(`₹₹{feeObj.sportsFee}`);
            feeSummary["Transport Fee"].push(`₹₹{feeObj.transportationFee}`);
            feeSummary["Other Fee"].push(`₹₹{feeObj.otherFee}`);
            feeSummary["Total"].push(`₹₹{feeObj.total}`);
        });

        // === Convert Fee Summary to Table Format ===
        let columnWiseData = [
            ["Fee Type", ...selectedMonths], // Header Row
            ["Lab Fee", ...feeSummary["Lab Fee"]],
            ["Tuition Fee", ...feeSummary["Tuition Fee"]],
            ["Admission Fee", ...feeSummary["Admission Fee"]],
            ["Exam Fee", ...feeSummary["Exam Fee"]],
            ["Library Fee", ...feeSummary["Library Fee"]],
            ["Sports Fee", ...feeSummary["Sports Fee"]],
            ["Transport Fee", ...feeSummary["Transport Fee"]],
            ["Other Fee", ...feeSummary["Other Fee"]],
            ["Total", ...feeSummary["Total"]]
        ];

        // === Fee Breakdown Table (Column Wise) ===
        doc.autoTable({
            startY: 85,
            head: [columnWiseData[0]], // Column Headers (Months)
            body: columnWiseData.slice(1), // Fee Breakdown
            theme: "grid",
            styles: {fontSize: 10, halign: "center"},
            columnStyles: {
                0: {halign: "left", fontStyle: "bold"}, // Align "Fee Type" column to left
            },
        });

        // === Payment Information ===
        doc.text("Payment Information", 14, doc.lastAutoTable.finalY + 10);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [["S.No", "Pay Mode", "Bank Number", "Amount"]],
            body: [["1", "Online", selectedStudent?.bankNumber || "N/A", `₹{totalFee}`]],
            theme: "grid",
        });

        // === Remarks ===
        doc.text("Remarks:", 14, doc.lastAutoTable.finalY + 10);
        doc.text(`Total in words: Rupees ₹{totalFee.toLocaleString()} Only`, 14, doc.lastAutoTable.finalY + 16);
        doc.text("This is a System Generated Slip, No Signature Required.", 14, doc.lastAutoTable.finalY + 22);
        doc.text("NOTE: Due date for fee payment is 10th of first month of the quarter.", 14, doc.lastAutoTable.finalY + 28);
        doc.text("A fine of Rs. 20/- per day will be charged thereafter.", 14, doc.lastAutoTable.finalY + 34);

        // Save the PDF
        doc.save(`Fee_Receipt_₹{selectedStudent?.studentName || "Student"}.pdf`);
    };
    const fetchFeeStatus = async (studentId, schoolId, session) => {
        try {
            const response = await api.get("/api/fees/fee-deposit/search", {
                params: {studentId, schoolId, session}
            });
            setResponseDataFeeDeposit(response.data);
        } catch (error) {
            console.error("Error fetching fee status:", error);
        }
    };

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

                <form onSubmit={handleSubmit}>
                    {searchStudentDetails(formValues, handleChange, classSections, students)}
                </form>

                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={5000}
                    onClose={() => setOpenSnackbar(false)}
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                >
                    <Alert
                        onClose={() => setOpenSnackbar(false)}
                        severity="success"
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {successMessage}
                    </Alert>
                </Snackbar>

                <Grid container spacing={4} mt={3}>
                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={0}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <PaymentIcon sx={{mr: 1, color: 'primary.main'}}/>
                                <Typography variant="h6" fontWeight="600">Due Months</Typography>
                            </Box>
                            {dueMonths.map((month) => (
                                <StyledAccordion key={month}>
                                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <Box display="flex" alignItems="center" width="100%">
                                            <Checkbox
                                                checked={selectedMonths.includes(month)}
                                                onChange={() => handleMonthSelection(month)}
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: 'primary.main',
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
                            ))}

                            <FeeAmountBox>
                                <Typography variant="h6" fontWeight="600" color="success.main">
                                    Total Fee: {formatCurrency(totalFee)}
                                </Typography>
                            </FeeAmountBox>

                            <Box mt={3}>
                                <ActionButton
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSubmitforSelected}
                                    startIcon={<PaymentIcon/>}
                                >
                                    Submit Payment
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
                            {paidMonths.map((month) => (
                                <StyledAccordion key={month}>
                                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                        <Box display="flex" alignItems="center" width="100%">
                                            <Checkbox
                                                checked={selectedMonths.includes(month)}
                                                onChange={() => handleMonthSelection(month)}
                                                disabled={false}
                                                sx={{
                                                    '&.Mui-checked': {
                                                        color: 'secondary.main',
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
                            ))}

                            <Box mt={3}>
                                <ActionButton
                                    variant="contained"
                                    color="secondary"
                                    fullWidth
                                    onClick={handleDownload}
                                    startIcon={<ReceiptIcon/>}
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

export default FeeDeposit;