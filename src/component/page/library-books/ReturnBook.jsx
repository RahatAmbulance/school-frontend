import React, {useState} from "react";
import {Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography,} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useDispatch, useSelector} from "react-redux"; // Assuming you're using Redux
import {useNavigate, useParams} from "react-router-dom";
import {returnBorrowBook} from "./redux/BookActions";

const ReturnBook = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {bookId} = useParams();
    const [loading, setLoading] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [lateFines, setLateFines] = useState(0);
    const [submitDate, setSubmitDate] = useState(null); // Store submit date
    const [fine, setFine] = useState(null);

    const studentEmails = useSelector((state) => state.master.data.student);

    const returnBook = useSelector((storeData) => {
        // Check if bookList exists and is an array
        const bookList = storeData.book.bookList;
        return Array.isArray(bookList)
            ? bookList.filter((book) => book.id == bookId)
            : [];
    });

    if (returnBook.length === 0) {
        return <div>Updating The Book please wait...</div>;
    }

    const handleEmailChange = (event) => {
        setSelectedEmail(event.target.value);
    };

    const handleDateChange = (date) => {
        setSubmitDate(date);
    };

    const handleLateFineChange = (event) => {
        setLateFines(event.target.value);
    };

    const handleClosePage = () => {
        navigate("/book"); // Redirect to book list page
    };

    const handleReturnBook = () => {
        setLoading(true);
        dispatch(returnBorrowBook(bookId, submitDate, lateFines));
        setTimeout(() => {
            // Navigate to book page
            navigate("/book");
        }, 20000); // 20 seconds delay
    };

    return (
        <Box sx={{padding: "20px"}}>
            <Typography variant="h4" gutterBottom>
                Return Book
            </Typography>
            <Typography variant="body1" gutterBottom>
                You're Returning book ID: {bookId}.
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel id="student-email-select-label">
                            Select Student Email
                        </InputLabel>
                        <Select
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
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label="Submit Date"
                            value={submitDate}
                            onChange={handleDateChange}
                            renderInput={(params) => <TextField {...params} fullWidth/>}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        name="lateFines"
                        value={
                            returnBook && returnBook[0] && returnBook[0].lateFine != null
                                ? returnBook[0].lateFine
                                : 0
                        }
                        onClick={handleLateFineChange}
                    />
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
                    onClick={handleReturnBook}
                    disabled={!selectedEmail || !submitDate}
                >
                    {loading ? "Returning..." : "Return"}
                </Button>

                <Button variant="contained" color="secondary" onClick={handleClosePage}>
                    Close
                </Button>
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

export default ReturnBook;
