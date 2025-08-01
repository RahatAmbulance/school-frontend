import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom"; // Import useNavigate
import {Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Snackbar, Typography} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {createBorrowBook} from "./redux/BookActions";

const BorrowBook = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Hook to navigate programmatically
    const {bookId} = useParams(); // Get the book ID from the URL
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const studentEmails = useSelector((state) => {
        return state.master.data.student;
    });

    const handleEmailChange = (event) => {
        setSelectedEmail(event.target.value);
    };

    const handleBorrow = () => {
        setOpenSnackbar(true);
        setLoading(true);
        dispatch(createBorrowBook(bookId, selectedEmail));
        // Redirect to the book list page after borrow action
        setTimeout(() => {
            // Navigate to book page
            setOpenSnackbar(false);
            navigate("/book");
        }, 20000); // 20 seconds delay
    };

    const handleClosePage = () => {
        // Navigate back to the previous page or to the book list
        navigate("/book");
    };

    return (
        <Box sx={{padding: "20px"}}>
            <Typography variant="h4" gutterBottom>
                Borrow Book
            </Typography>
            <Typography variant="body1" gutterBottom>
                You are borrowing the book with ID: {bookId}.
            </Typography>
            <FormControl fullWidth sx={{marginBottom: 2}}>
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

            {/* Button container to align buttons side by side */}
            <Box sx={{display: "flex", justifyContent: "flex-start", gap: 2}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBorrow}
                    disabled={!selectedEmail} // Disable if no email is selected
                >
                    Confirm Borrow
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleClosePage} // Handle close page functionality
                >
                    Close Page
                </Button>
                <Snackbar
                    open={openSnackbar}
                    onClose={() => setOpenSnackbar(false)}
                    autoHideDuration={null} // Keeps open until manually closed
                    anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                >
                    <Alert onClose={() => setOpenSnackbar(false)} severity="info">
                        Borring the book... Please wait for sometime...
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default BorrowBook;
