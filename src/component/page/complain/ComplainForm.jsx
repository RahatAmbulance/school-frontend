import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import {useDispatch, useSelector} from 'react-redux';
import {fetchClasses} from '../master/classsection/redux/Action';
import {fetchStudents} from '../student/redux/studentActions';

const ComplainForm = ({schoolId}) => {
    const dispatch = useDispatch();

    // Fetch data from Redux
    const {classes = []} = useSelector((state) => state.classes);
    const students = useSelector((state) => state.students.list) || [];
    const designation = useSelector((state) => state.master.data?.designation || []);

    const [complainantType, setComplainantType] = useState(''); // 'Student' or 'Staff'
    const [formData, setFormData] = useState({
        name: '',
        section: '',
        class: '',
        rollNo: '',
        post: '',
        designation: '',
        complaintType: '',
        description: '',
    });

    // Complaint categories for Staff and Students
    const staffComplaintCategories = [
        'Workplace Issue',
        'Harassment',
        'Salary Issue',
        'Leave Policy Concern',
        'Infrastructure Concern',
        'Conflict with Colleagues',
        'Equipment Issue',
        'Health and Safety',
        'Discrimination',
        'Other',
    ];

    const studentComplaintCategories = [
        'Bullying',
        'Teacher Misconduct',
        'Academic Concern',
        'Transport Issue',
        'Hostel Concern',
        'Library Issue',
        'Sports Facilities',
        'Examination Concern',
        'Fees Issue',
        'Other',
    ];

    useEffect(() => {
        if (schoolId) {
            dispatch(fetchClasses(schoolId));
        }
    }, [schoolId, dispatch]);

    useEffect(() => {
        if (complainantType === 'Student') {
            dispatch(fetchStudents());
        }
    }, [complainantType, dispatch]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleTypeChange = (event) => {
        setComplainantType(event.target.value);
        setFormData({
            name: '',
            section: '',
            class: '',
            rollNo: '',
            post: '',
            designation: '',
            complaintType: '',
            description: '',
        });
    };

    const handleSubmit = () => {
        const {complaintType, description} = formData;

        if (!complainantType || !complaintType || !description) {
            alert('Please fill all required fields');
            return;
        }

        console.log({schoolId, ...formData});
        alert('Complaint submitted successfully');
    };

    return (
        <Paper elevation={3} style={{padding: '20px'}}>
            <Typography variant="h6" gutterBottom>
                Submit a Complaint
            </Typography>

            <FormControl fullWidth style={{marginBottom: '20px'}}>
                <InputLabel>Select Complainant Type</InputLabel>
                <Select label="Select Complainant Type" value={complainantType} onChange={handleTypeChange}>
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                </Select>
            </FormControl>

            {complainantType && (
                <Box><FormControl fullWidth style={{marginBottom: '20px'}}>
                    <InputLabel>Select Complaint Type</InputLabel>
                    <Select
                        label="Select Complaint Type"
                        name="complaintType"
                        value={formData.complaintType}
                        onChange={handleChange}
                    >
                        {(complainantType === 'Staff'
                                ? staffComplaintCategories
                                : studentComplaintCategories
                        ).map((type, index) => (
                            <MenuItem key={index} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                    {complainantType === 'Student' && (
                        <>
                            <FormControl fullWidth style={{marginBottom: '20px'}}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </FormControl>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth style={{marginBottom: '20px'}}>
                                        <InputLabel>Select Class</InputLabel>
                                        <Select
                                            lable="class"
                                            name="class"
                                            value={formData.class}
                                            onChange={handleChange}
                                        >
                                            {classes.length > 0 ? (
                                                classes.map((cls) => (
                                                    <MenuItem key={cls.id} value={cls.name}>
                                                        {cls.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>No classes available</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Section</InputLabel>
                                        <Select
                                            label="section"
                                            name="section"
                                            value={formData.section}
                                            onChange={handleChange}
                                        >
                                            {classes
                                                .find((cls) => cls.name === formData.class)
                                                ?.sections.map((sec) => (
                                                    <MenuItem key={sec.id} value={sec.name}>
                                                        {sec.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </>
                    )}

                    {complainantType === 'Staff' && (
                        <>
                            <FormControl fullWidth style={{marginBottom: '20px'}}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl fullWidth style={{marginBottom: '20px'}}>
                                <InputLabel>Select Designation</InputLabel>
                                <Select
                                    label="Select Designation"
                                    name="post"
                                    value={formData.post}
                                    onChange={handleChange}
                                >
                                    {designation.map((designation, index) => (
                                        <MenuItem key={index} value={designation.name}>
                                            {designation.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    )}


                    <TextField
                        fullWidth
                        label="Complaint Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        style={{marginBottom: '20px'}}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        fullWidth
                    >
                        Submit Complaint
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default ComplainForm;
