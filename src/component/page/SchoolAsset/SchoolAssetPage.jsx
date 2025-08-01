import React, {useEffect, useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
    Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {useDispatch, useSelector} from 'react-redux';
import {createSchoolAsset, deleteSchoolAsset, fetchSchoolAssets, updateSchoolAsset} from './redux/SchoolAssetAction';
import SchoolAssetList from './SchoolAssetList';
import SchoolAssetForm from "./SchoolAssetForm";
import * as XLSX from 'xlsx';
import ClearIcon from '@mui/icons-material/Clear';
import {selectSchoolDetails} from "../../../common";

const SchoolAssetPage = () => {
    const [openForm, setOpenForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState("");
    const [openDetails, setOpenDetails] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();


    const userData = useSelector(selectSchoolDetails);
    const schoolId = userData?.id;
    const session = userData?.session;
    const {assetList, loading, error} = useSelector((state) => state.Assets);
    console.log("asssetliat", assetList)
    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchSchoolAssets(schoolId, session));
        }
    }, [dispatch, schoolId, session]);

    const handleAddAsset = () => {
        setSelectedAsset(null);
        setOpenForm(true);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleEditAsset = (Assets) => {
        // setSelectedAsset(Assets);
        setOpenForm(true);
        console.log("On Edit Block");
        console.log('assets', Assets);
        setSelectedAsset(Assets); // Ensure selected task is passed to form

    };

    const handleViewAsset = (Assets) => {
        setSelectedAsset(Assets);
        setOpenDetails(true);
    };

    const handleFormSubmit = (formData) => {
        if (formData.id) {
            // Update existing asset
            dispatch(updateSchoolAsset(formData.id, formData))
                .then(() => dispatch(fetchSchoolAssets(schoolId, session))) // Re-fetch updated data
                .catch((error) => console.error("Error updating school asset:", error));
        } else {
            // Create new asset
            dispatch(createSchoolAsset(formData))
                .then(() => dispatch(fetchSchoolAssets(schoolId, session))) // Re-fetch updated data
                .catch((error) => console.error("Error creating school asset:", error));
        }

        setOpenForm(false); // Close the form modal
    };


    const handleDeleteAsset = (id) => {
        dispatch(deleteSchoolAsset(id));
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDownloadExcel = () => {
        const filteredData = assetList.map(
            ({image, ...asset}) => asset // Exclude image or other large properties if not needed
        );

        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');
        XLSX.writeFile(workbook, 'school_assets.xlsx');
    };

    // Ensure assetList is an array before applying array methods
    const filteredAssetList = Array.isArray(assetList)

        ? assetList.filter((Assets) => {
            const assetName = Assets.assetName?.toLowerCase() || '';
            const assetType = Assets.type?.toLowerCase() || '';
            const query = searchQuery.toLowerCase();

            return assetName.includes(query) || assetType.includes(query);
        })
        : [];

    return (

        <Container maxWidth="lg">
            {loading ? (
                <Box>
                    <Skeleton variant="rectangular" width="100%" height={40}/>
                    <Skeleton variant="rectangular" width="100%" height={40} style={{marginTop: '16px'}}/>
                    <Skeleton variant="rectangular" width="100%" height={400} style={{marginTop: '16px'}}/>
                </Box>
            ) : error ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <Alert severity="error">{error}</Alert>
                </Box>
            ) : (
                <>

                    <Box sx={{marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <TextField
                            label="Search by Asset Name or Type"
                            variant="outlined"
                            value={searchQuery}
                            onChange={handleSearch}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton aria-label="search">
                                            <SearchIcon/>
                                        </IconButton>
                                        {searchQuery && (
                                            <IconButton aria-label="clear" onClick={handleClearSearch}>
                                                <ClearIcon/>
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                            sx={{flexGrow: 1}}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddAsset}
                            style={{margin: '0 16px'}}
                        >
                            Add Asset
                        </Button>
                        <Tooltip title="Download all asset details">
                            <IconButton aria-label="download" color="primary" onClick={handleDownloadExcel}>
                                <FileDownloadIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Grid container>
                        <Grid item xs={12}>
                            <SchoolAssetList
                                schoolAssets={filteredAssetList}
                                onEdit={handleEditAsset}
                                onDelete={handleDeleteAsset}
                                onView={handleViewAsset}
                            />
                        </Grid>
                    </Grid>

                    <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="md">
                        <DialogTitle>{selectedAsset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
                        <DialogContent>
                            <SchoolAssetForm
                                asset={selectedAsset}
                                onSubmit={handleFormSubmit}
                                onCancel={() => setOpenForm(false)}

                            />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={openDetails} onClose={() => setOpenDetails(false)} fullWidth maxWidth="md">
                        <DialogTitle>Asset Details</DialogTitle>
                        <DialogContent>
                            {selectedAsset ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center", // Horizontally center the content
                                        alignItems: "center", // Vertically center the content
                                        textAlign: "center", // Center-align the text
                                        minHeight: "200px", // Set minimum height to prevent collapse
                                    }}
                                >
                                    <Table>
                                        <TableBody>
                                            {[
                                                {label: "Name", value: selectedAsset.assetName},
                                                {label: "Type", value: selectedAsset.type},


                                                {label: "quantity", value: selectedAsset.quantity},
                                                {
                                                    label: "description",
                                                    value: selectedAsset.description,
                                                },
                                                {
                                                    label: "schoolId",
                                                    value: selectedAsset.schoolId,
                                                },
                                                {label: "session", value: selectedAsset.session},
                                                {
                                                    label: "Date of Creation",

                                                    value: new Date().toLocaleDateString(),
                                                },
                                            ].map((item) => (
                                                <TableRow key={item.label}>
                                                    <TableCell>
                                                        <strong>{item.label}</strong>
                                                    </TableCell>
                                                    <TableCell>{item.value || "Not available"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ) : (
                                <Skeleton variant="rectangular" width="100%" height={200}/>
                            )}
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </Container>
    );
};

export default SchoolAssetPage;
