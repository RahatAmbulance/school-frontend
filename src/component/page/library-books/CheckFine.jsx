import React, {useState} from "react";
import {
    Alert,
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useDispatch, useSelector} from "react-redux"; // Assuming you're using Redux
import {useNavigate, useParams} from "react-router-dom";
import {checkFineOnBorrowBook} from "./redux/BookActions";

const CheckFine = () => {
    const [selectedEmail, setSelectedEmail] = useState("");
    const [fine, setFine] = useState(null);
    const [submitDate, setSubmitDate] = useState(null); // Store submit date
    const [openForm, setOpenForm] = useState(false); // Manage form visibility
    const {bookId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const studentEmails = useSelector((state) => state.master.data.student);

    const handleEmailChange = (event) => {
        setSelectedEmail(event.target.value);
    };

    const handleDateChange = (date) => {
        setSubmitDate(date);
    };

    const handleClosePage = () => {
        navigate("/book"); // Redirect to book list page
    };

    const handleCheckFine = async () => {
        dispatch(checkFineOnBorrowBook(bookId, selectedEmail, submitDate));
        setOpenForm(true); // Show the close page button
        setOpenSnackbar(true);
        setTimeout(() => {
            // Navigate to book page
            setOpenSnackbar(false);
            navigate("/book");
        }, 5000); // 20 seconds delay
    };

    return (
        <Box sx={{padding: "20px"}}>
            <Typography variant="h4" gutterBottom>
                Check Fine
            </Typography>
            <Typography variant="body1" gutterBottom>
                You are checking fines for book with ID: {bookId}.
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel id="student-email-select-label">
                            Select Student Email
                        </InputLabel>
                        {/* <Select
              labelId="student-email-select-label"
              id="student-email-select"
              value={selectedEmail}
              label="Select Student Email"
              onChange={handleEmailChange}
            >
              {studentEmails.length > 0 ? (
                studentEmails.map((student) => (
                  <MenuItem key={student.id} value={student.email}>
                    {student.email}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Students Available</MenuItem>
              )}
            </Select> */}
                        <Select
                            labelId="student-email-select-label"
                            id="student-email-select"
                            value={selectedEmail}
                            label="Select Student Email"
                            onChange={handleEmailChange}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 48 * 4.5 + 8, // Adjust height here, this example is 4.5 items in view.
                                    },
                                },
                            }}
                        >
                            {studentEmails.length > 0 ? (
                                studentEmails.map((student) => (
                                    <MenuItem key={student.id} value={student.email}>
                                        {student.email}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No Students Available</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Submit Date"
                            value={submitDate}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} fullWidth/>}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>

            {/* Button container to align buttons side by side */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 2,
                    marginTop: 2,
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCheckFine}
                    disabled={!selectedEmail || !submitDate}
                >
                    Check Fine
                </Button>

                <Button variant="contained" color="secondary" onClick={handleClosePage}>
                    Close
                </Button>
                <Snackbar
                    open={openSnackbar}
                    onClose={() => setOpenSnackbar(false)}
                    autoHideDuration={null} // Keeps open until manually closed
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="info">
                        Checking Fine for the book... Please wait for sometime...
                    </Alert>
                </Snackbar>
            </Box>

            {fine !== null && (
                <Typography
                    variant="body1"
                    color={fine > 0 ? "error" : "success"}
                    sx={{marginTop: 2}}
                >
                    Fine Amount: ${fine}
                </Typography>
            )}
        </Box>
    );
};

export default CheckFine;
