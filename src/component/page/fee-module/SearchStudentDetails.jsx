import {Box, FormControl, InputLabel, MenuItem, Select, TextField} from "@mui/material";
import React from "react";

export function searchStudentDetails(formValues, handleChange, classSections, students) {
    return <>
        <Box display="flex" gap={2} mb={3}>
            <FormControl fullWidth>
                <InputLabel>Search by</InputLabel>
                <Select
                    name="searchType"
                    value={formValues.searchType}
                    onChange={handleChange}
                    label="Search by"
                >
                    <MenuItem value="classSection">Class & Section</MenuItem>
                    {/* <MenuItem value="admissionNo">Admission Number</MenuItem>
                    <MenuItem value="classSection">Class & Section</MenuItem>*/}
                </Select>
            </FormControl>

            {formValues.searchType === "admissionNo" ? (
                <FormControl fullWidth>
                    <TextField
                        label="Enter Admission Number"
                        name="admissionOrClass"
                        value={formValues.admissionOrClass}
                        onChange={handleChange}
                    />
                </FormControl>
            ) : (
                <>
                    <FormControl fullWidth>
                        <InputLabel>Select Class</InputLabel>
                        <Select
                            name="className"
                            value={formValues.className}
                            onChange={handleChange}
                            label="Select Class"
                        >
                            {classSections && classSections.length > 0 ? (
                                classSections.map((classSection) => (
                                    <MenuItem
                                        key={classSection.id}
                                        value={classSection.name}
                                    >
                                        {classSection.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="" disabled>
                                    No Classes Available
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Choose Section</InputLabel>
                        <Select
                            name="section"
                            value={formValues.section}
                            onChange={handleChange}
                            disabled={!formValues.className}
                            label="Select Section"
                        >
                            {classSections?.find(
                                (cs) => cs.name === formValues.className
                            )?.sections?.length > 0 ? (
                                classSections
                                    .find((cs) => cs.name === formValues.className)
                                    .sections.map((section) => (
                                    <MenuItem key={section.id} value={section.name}>
                                        {section.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="" disabled>
                                    No Sections Available
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </>
            )}
        </Box>

        {formValues.searchType !== "admissionNo" && (
            <Box mt={3}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Select Student</InputLabel>
                    <Select
                        name="studentName"
                        value={formValues.studentName}
                        onChange={handleChange}
                        disabled={!students.length}
                        label="Select Student"
                    >
                        {students.map((student) => (
                            <MenuItem key={student.id} value={student.studentName}>
                                {student.studentName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        )}
    </>;
}