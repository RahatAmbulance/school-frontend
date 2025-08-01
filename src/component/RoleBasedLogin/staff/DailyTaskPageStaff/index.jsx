import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    InputAdornment,
    Paper,
    Skeleton,
    styled,
    TextField,
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {useDispatch, useSelector} from "react-redux";
import {selectSchoolDetails} from "../../../../common";
import {fetchDailyTask} from "../../../page/daily-task/redux/DailyTaskActions";
import * as XLSX from "xlsx";

// Styled Components
const StyledContainer = styled(Container)(({theme}) => ({
    padding: theme.spacing(3),
    minHeight: '100vh',
    '& .MuiPaper-root': {
        borderRadius: 12,
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
    }
}));

const SearchContainer = styled(Paper)(({theme}) => ({
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: '#fff',
}));

const ActionButton = styled(Button)(({theme}) => ({
    borderRadius: 8,
    padding: theme.spacing(1, 3),
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    }
}));

const DailyTaskPageStaff = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedDailyTask, setSelectedDailyTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {dailyTaskList, loading, error} = useSelector((state) => state.dailyTask);

    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchDailyTask(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDownloadExcel = () => {
        const filteredData = dailyTaskList?.map(({
                                                     docs,
                                                     message,
                                                     ...rest
                                                 }) => ({
            ...rest,
        })) || [];

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "DailyTask");
        XLSX.writeFile(workbook, "DailyTask.xlsx");
    };

    const filteredDailyTaskList = Array.isArray(dailyTaskList)
        ? dailyTaskList.filter((dailyTask) => {
            const type = dailyTask.type?.toLowerCase() || "";
            const title = dailyTask.title?.toLowerCase() || "";
            const className = dailyTask.className?.toLowerCase() || "";
            const query = searchQuery.toLowerCase();

            return (
                type.includes(query) ||
                title.includes(query) ||
                className.includes(query)
            );
        })
        : [];

    return (
        <StyledContainer maxWidth="lg">
            <Box sx={{minHeight: '200px'}}>
                {loading ? (
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{borderRadius: 2}}/>
                        <Skeleton variant="rectangular" width="100%" height={400} sx={{borderRadius: 2}}/>
                    </Box>
                ) : error ? (
                    <Alert severity="error">
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Box sx={{mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant="h5" fontWeight={600}>
                                Daily Tasks
                            </Typography>
                            <Box sx={{display: 'flex', gap: 2}}>
                                <ActionButton
                                    variant="contained"
                                    color="primary"
                                    startIcon={<FileDownloadIcon/>}
                                    onClick={handleDownloadExcel}
                                >
                                    Export
                                </ActionButton>
                            </Box>
                        </Box>

                        <SearchContainer>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search daily tasks..."
                                value={searchQuery}
                                onChange={handleSearch}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action"/>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </SearchContainer>

                        {filteredDailyTaskList.length === 0 ? (
                            <Box sx={{textAlign: 'center', mt: 4}}>
                                <Typography variant="h6" color="text.secondary">
                                    No daily tasks found
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{mt: 3}}>
                                {/* Add your task list component here */}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </StyledContainer>
    );
};

export default DailyTaskPageStaff; 