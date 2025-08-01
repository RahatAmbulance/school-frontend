import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from "@mui/material";
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from 'react-toastify';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {deleteSchoolAsset} from "./redux/SchoolAssetAction";

const rowColors = ["#f5f5f5", "#ffffff"];
// assetlist =[]
const convertByteArrayToBase64 = (byteArray) => {


    if (!byteArray) return ''; // Handle null or undefined cases

    // Check if it's already a base64 encoded string
    if (typeof byteArray === 'string' && byteArray.startsWith('data:image')) {
        return byteArray;
    }

// If it's an actual byteArray, convert it to base64
    return `data:image/jpeg;base64,${byteArray}`;
};
const SchoolAssetList = ({schoolAssets, onEdit, onView}) => {
    console.log("SchoolAssetslist", schoolAssets)
    const dispatch = useDispatch();
    const [modalOpen, setModalOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState(null);
    const [assets, setAssets] = useState(schoolAssets);
    const [selectedAsset, setSelectedAsset] = useState(null);
    console.log("SchoolAssetslist assets", assets);

    const [editModalOpen, setEditModalOpen] = useState(false);


    const handleOpenModal = (id) => {
        setAssetToDelete(id);
        setModalOpen(true);
        setSelectedAsset(id)
    };

    const handleCloseModal = (id) => {
        setModalOpen(false);
        setAssetToDelete(null);
        setSelectedAsset(id)
    };

    const handleToastDelete = () => {
        if (assetToDelete) {
            dispatch(deleteSchoolAsset(assetToDelete))
                .then(() => {
                    toast.success("School asset deleted successfully.");
                    handleCloseModal();
                })
                .catch((error) => {
                    console.error("Error deleting asset:", error);
                    toast.error("Failed to delete the asset. Please try again.");
                    handleCloseModal();
                });
        }
    };

    return (
        <>
            <TableContainer component={Paper} style={{maxHeight: 520}}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{fontWeight: "bold"}}>assetName</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Type</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Quantity</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Photo</TableCell>
                            <TableCell style={{fontWeight: "bold"}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((Assets, index) => (
                            <TableRow
                                key={Assets.id}
                                style={{backgroundColor: rowColors[index % rowColors.length]}}
                            >
                                <TableCell>{Assets.assetName}</TableCell>
                                <TableCell>{Assets.type}</TableCell>
                                <TableCell>{Assets.quantity}</TableCell>
                                <TableCell>
                                    {Assets.assetPhoto ? (
                                        <img

                                            src={
                                                convertByteArrayToBase64(Assets.assetPhoto) ||
                                                "/path/to/default/image.png"
                                            }
                                            alt={`${Assets.assetName}'s photo`}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                objectFit: "cover",
                                                borderRadius: "50%", // For circular photos
                                            }}
                                        />
                                    ) : (
                                        "No Photo"
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="View Details" arrow>
                                        <IconButton
                                            onClick={() => onView(Assets)}
                                            color="primary"
                                            sx={{marginRight: 1}}
                                        >
                                            <VisibilityIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Asset" arrow>
                                        <IconButton
                                            onClick={() => onEdit(Assets)}
                                            color="secondary"
                                            sx={{marginRight: 1}}
                                        >
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete Asset" arrow>
                                        <IconButton
                                            onClick={() => handleOpenModal(Assets.id)}
                                            color="error"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete School Asset?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this school asset?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleToastDelete} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
            />
        </>
    );
};

export default SchoolAssetList;


