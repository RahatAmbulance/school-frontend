import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import {fetchVehicles} from "../../../page/Transports/transport/redux/vehicleActions";
import {useNavigate} from "react-router-dom";
import {selectSchoolDetails, selectUserActualData} from "../../../../common";

const VehiclesStaff = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userData = useSelector(selectSchoolDetails);
    const userActualData = useSelector(selectUserActualData);
    const schoolId = userData?.id;
    const session = userData?.session;
    useEffect(() => {
        if (schoolId && session) {
            dispatch(fetchVehicles(schoolId, session));
        }
    }, [dispatch, schoolId, session]);
    useEffect(() => {
        if (userActualData?.vehicleId) {
            navigate(`/staff/transport/${userActualData.vehicleId}`);
        }
    }, [userActualData, navigate]);
    return (
        <div className="container mt-4">
            {userActualData?.vehicleId ? (
                <div className="text-center">
                    <p>Redirecting to your vehicle details...</p>
                </div>
            ) : (
                <div className="alert alert-info text-center">
                    <h5>No vehicle assigned</h5>
                    <p>You don't have any vehicle assigned to your account.</p>
                </div>
            )}
        </div>
    );
};

export default VehiclesStaff;