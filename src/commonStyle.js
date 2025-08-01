import {alpha, styled} from "@mui/material/styles";
import TableCell, {tableCellClasses} from "@mui/material/TableCell";
import InputBase from "@mui/material/InputBase";
import TableRow from "@mui/material/TableRow";
import {Box, TextField} from "@mui/material";
import React from "react";

export const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));
export const StyledTableCellForInvoice = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 8,
        padding: theme.spacing(0.5), // Adjust the padding to reduce size
        border: 'none', // Remove the border
        textAlign: 'center', // Center align the content
    },
}));
export const CenteredTextField = styled(TextField)(({theme}) => ({
    '& .MuiInputBase-input': {
        textAlign: 'center', // Center align the text inside TextField
    },
    '& .MuiInputBase-root': {
        textAlign: 'center', // Center align the input root
    },
    '& .Mui-disabled': {
        textAlign: 'center', // Ensure disabled text is centered
    }
}));

export const StyledTableCellPOSBILLING = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        fontSize: 12,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

export const StyledTableCellTableView = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#E2E2E2", // Updated color
        color: theme.palette.common.black,
        fontWeight: "bold", // Apply bold font weight
        fontSize: 10,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 8,
    },
}));


export const StyledTableRow = styled(TableRow)(({theme}) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));
export const Search = styled("div")(({theme}) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.15),
    "&:hover": {
        backgroundColor: alpha(theme.palette.common.black, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
}));
export const SearchIconWrapper = styled("div")(({theme}) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));
export const StyledInputBase = styled(InputBase)(({theme}) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "150%",
        [theme.breakpoints.up("md")]: {
            width: "50ch",
        },
    },
}));

export const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 700,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 1,
};

export function formatDateTimeWithAmPm(datetimeString) {
    const date = new Date(datetimeString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;  // Convert to 12-hour format and handle midnight (0 becomes 12)

    return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${amPm}`;
}

export function formatDate(datetimeString) {
    const date = new Date(datetimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() returns 0-11
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const getDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const TabPanel = (props) => {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    {children}
                </Box>
            )}
        </div>
    );
};


export const sessionOptions = [
    {value: '2024-2025', label: '2024-2025'},
    {value: '2025-2026', label: '2025-2026'},
    {value: '2026-2027', label: '2026-2027'},
    {value: '2027-2028', label: '2027-2028'},
    {value: '2028-2029', label: '2028-2029'},
    {value: '2029-2030', label: '2029-2030'},
    {value: '2030-2031', label: '2030-2031'},
];
