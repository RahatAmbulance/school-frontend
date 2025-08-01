import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    Container,
    Fade,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Tooltip,
    Typography,
    useTheme,
} from "@mui/material";
import {fetchEnquiries} from "./redux/enquiryActions.js";
import AddEnquiryForm from "./AddEnquiryForm";
import * as XLSX from "xlsx";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EnquiryTable from "./EnquiryTable";
import {selectSchoolDetails} from "../../../common";
import {styled} from "@mui/material/styles";

// Styled components
const StyledPaper = styled(Paper)(({theme}) => ({
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    background: "#ffffff",
    transition: "all 0.3s ease",
    "&:hover": {
        boxShadow: "0 6px 25px rgba(0, 0, 0, 0.08)",
    },
}));

const SearchTextField = styled(TextField)(({theme}) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: theme.spacing(2),
        transition: "all 0.3s ease",
        backgroundColor: theme.palette.background.paper,
        "&:hover": {
            backgroundColor: "#f8f9fa",
        },
        "& fieldset": {
            borderColor: "rgba(0, 0, 0, 0.1)",
        },
        "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
        },
    },
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: theme.spacing(2),
    textTransform: "none",
    padding: theme.spacing(1.5, 3),
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
}));

const LoadingContainer = styled(Box)(({theme}) => ({
    padding: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    "& .MuiSkeleton-root": {
        borderRadius: theme.spacing(1),
        "&:nth-of-type(odd)": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        "&:nth-of-type(even)": {
            backgroundColor: "rgba(0, 0, 0, 0.06)",
        },
    },
}));

export const Enquiry = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const {enquiries, loading, error} = useSelector((state) => state.enquiries);
    const [searchQuery, setSearchQuery] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchEnquiries(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const filteredEnquiries = Array.isArray(enquiries)
        ? enquiries.filter((enquiry) => {
            const name = enquiry.firstName?.toLowerCase().trim() || "";
            const fatherName = enquiry.fatherName?.toLowerCase().trim() || "";
            const motherName = enquiry.motherName?.toLowerCase().trim() || "";
            const phoneNumber = enquiry.phoneNumber.toString().trim() || "";
            const query = searchQuery.toLowerCase().trim();

            return (
                name.includes(query) ||
                fatherName.includes(query) ||
                motherName.includes(query) ||
                phoneNumber.includes(query)
            );
        })
        : [];

    const handleDownloadExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredEnquiries);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");
        XLSX.writeFile(workbook, "enquiries.xlsx");
    };

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const highlightText = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, index) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span
                        key={index}
                        style={{
                            backgroundColor: theme.palette.warning.light,
                            fontWeight: 600,
                            borderRadius: "2px",
                            padding: "0 2px",
                        }}
                    >
          {part}
        </span>
                ) : (
                    part
                )
        );
    };

    return (
        <Container maxWidth="xl">
            <Fade in timeout={800}>
                <StyledPaper elevation={0}>
                    <Box sx={{p: {xs: 2, md: 3}}}>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={7}>
                                <SearchTextField
                                    fullWidth
                                    placeholder="Search by name, parents name, or phone number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && dispatch(fetchEnquiries(schoolId, session))
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action"/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleClearSearch}
                                                    sx={{color: "text.secondary"}}
                                                >
                                                    <ClearIcon/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={() => setOpenForm(true)}
                                    startIcon={<AddIcon/>}
                                >
                                    Add New Enquiry
                                </ActionButton>
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Tooltip title="Download as Excel" arrow>
                                    <ActionButton
                                        variant="outlined"
                                        color="primary"
                                        fullWidth
                                        onClick={handleDownloadExcel}
                                        startIcon={<FileDownloadIcon/>}
                                    >
                                        Export
                                    </ActionButton>
                                </Tooltip>
                            </Grid>
                        </Grid>

                        {loading ? (
                            <LoadingContainer>
                                <Box sx={{
                                    width: "100%",
                                    height: "400px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Typography variant="h6" color="text.secondary">
                                        Loading enquiries...
                                    </Typography>
                                </Box>
                            </LoadingContainer>
                        ) : error ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    p: 4,
                                }}
                            >
                                <Typography color="error" variant="h6">
                                    {error}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{mt: 4}}>
                                <EnquiryTable
                                    filteredEnquiries={filteredEnquiries.map((enquiry) => ({
                                        ...enquiry,
                                        firstName: highlightText(enquiry.firstName || "", searchQuery),
                                        fatherName: highlightText(enquiry.fatherName || "", searchQuery),
                                        motherName: highlightText(enquiry.motherName || "", searchQuery),
                                        phoneNumber: highlightText(
                                            enquiry.phoneNumber.toString() || "",
                                            searchQuery
                                        ),
                                    }))}
                                />
                            </Box>
                        )}

                        <AddEnquiryForm
                            open={openForm}
                            handleClose={() => setOpenForm(false)}
                            refreshData={() => dispatch(fetchEnquiries(schoolId, session))}
                        />
                    </Box>
                </StyledPaper>
            </Fade>
        </Container>
    );
};
