import React from 'react';
import {
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StudentTable = ({students, handleEdit, handleDelete}) => {


    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Object.keys(students[0] || {}).map((key) => (
                            <TableCell key={key}>{key.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                        ))}
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student.id}>
                            {Object.keys(student).map((key) => (
                                <TableCell key={key}>{student[key]}</TableCell>
                            ))}
                            <TableCell>
                                <Tooltip title="Edit">
                                    <IconButton onClick={() => handleEdit(student)}>
                                        <EditIcon/>
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                    <IconButton onClick={() => handleDelete(student.id)}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StudentTable;
