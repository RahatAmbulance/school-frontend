import {api} from "../../../common";

export function feeDepositFetchingCommon(
    setFormValues,
    errors,
    setErrors,
    formValues,
    students,
    schoolId,
    session,
    setStudents,
    setResponseDataFeeDeposit,
    setSelectedStudent
) {
    const handleChange = async (e) => {
        const {name, value} = e.target;

        // Update form values immediately using callback to ensure latest state
        setFormValues(prevValues => {
            const newValues = {
                ...prevValues,
                [name]: value,
            };

            // Handle async operations after state update
            handleAsyncOperations(name, value, newValues);

            return newValues;
        });

        // Clear errors if numeric value is valid
        if (errors[name] && value && !isNaN(value) && parseFloat(value) >= 0) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: "",
            }));
        }
    };

    const handleAsyncOperations = async (name, value, currentFormValues) => {
        try {
            // Handle admission number search
            if (name === "admissionOrClass" && currentFormValues.searchType === "admissionNo") {
                await fetchStudentByAdmissionNo(value);
            }
            // Handle class/section changes
            else if (
                (name === "className" && currentFormValues.section) ||
                (name === "section" && currentFormValues.className)
            ) {
                await fetchStudents(
                    name === "className" ? value : currentFormValues.className,
                    name === "section" ? value : currentFormValues.section
                );
            }
            // Handle student selection
            else if (name === "studentName") {
                await handleStudentSelection(value);
            }
            // Handle month selection
            else if (name === "selectedMonth") {
                handleMonthSelection(value);
            }
        } catch (error) {
            console.error("Error in handleAsyncOperations:", error);
            // You might want to set some error state here
        }
    };

    const handleStudentSelection = async (studentName) => {
        const selectedStudent = students.find(
            student => student.studentName === studentName
        );

        if (selectedStudent) {
            setSelectedStudent(selectedStudent);

            // Update form with selected student details
            setFormValues(prevValues => ({
                ...prevValues,
                studentId: selectedStudent.id,
                admissionNo: selectedStudent.admissionNo,
                fatherName: selectedStudent.fatherName,
                rollNo: selectedStudent.rollNo,
                className: selectedStudent.className,
                section: selectedStudent.section,
                oldBalance: selectedStudent.oldBalance,
                tuitionFee: selectedStudent.tuitionFee,
            }));

            await fetchFeeStatus(selectedStudent.id);
        }
    };

    const handleMonthSelection = (selectedMonths) => {
        const updatedFeeStatus = {};
        selectedMonths.forEach(month => {
            updatedFeeStatus[month] = true;
        });

        setFormValues(prevValues => ({
            ...prevValues,
            selectedMonth: selectedMonths,
            feeStatus: updatedFeeStatus,
        }));
    };

    const fetchFeeStatus = async (studentId) => {
        try {
            const response = await api.get("/api/fees/fee-deposit/search", {
                params: {
                    studentId,
                    schoolId,
                    session,
                },
            });
            setResponseDataFeeDeposit(response.data);
        } catch (error) {
            console.error("Error fetching fee status:", error);
            setResponseDataFeeDeposit([]); // Set empty array on error
        }
    };

    const fetchStudentByAdmissionNo = async (admissionNo) => {
        try {
            const response = await api.get("/api/students/admissionNo", {
                params: {
                    admissionNo,
                    schoolId,
                    session,
                },
            });

            const student = response.data;
            if (student) {
                setFormValues(prevValues => ({
                    ...prevValues,
                    studentId: student.id,
                    studentName: student.studentName,
                    admissionNo: student.admissionNo,
                    rollNo: student.rollNo,
                    fatherName: student.fatherName,
                    className: student.sclass,
                    section: student.ssection,
                    oldBalance: student.oldBalance,
                    tuitionFee: student.tuitionFee,
                    motherName: student?.motherName,
                    gardiamName: student?.localGuardianName,
                    stEmailAddress: student?.email,
                    fatherEmailAddress: student?.fatherEmailAddress,
                    motherEmailAddress: student?.motherEmailAddress,
                    gardianEmailAddress: student?.guardianEmailAddress,
                    mobileNumber: student?.mobileNo,
                    fatherMobileNumber: student?.fatherMobile,
                    motherMobileNumber: student?.motherMobile,
                    gardianMobileNumber: student?.guardianMobileNo,
                    studentDetails: student,
                }));
            }
        } catch (error) {
            console.error("Error fetching student by admission number:", error);
            // Reset relevant form fields on error
            setFormValues(prevValues => ({
                ...prevValues,
                studentId: "",
                studentName: "",
                // Add other fields that should be reset
            }));
        }
    };

    const fetchStudents = async (className, section) => {
        try {
            const response = await api.get("/api/students/class/section/school", {
                params: {
                    className,
                    section,
                    schoolId,
                    session,
                },
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]); // Set empty array on error
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        validateForm();
    };

    const validateForm = () => {
        const newErrors = {};

        // Add your validation logic here
        // Example:
        if (!formValues.studentName) {
            newErrors.studentName = "Student name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return {
        handleChange,
        handleSubmit,
        fetchFeeStatus,
        fetchStudentByAdmissionNo,
        fetchStudents,
    };
}