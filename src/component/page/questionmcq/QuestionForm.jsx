import React, {useEffect, useState} from "react";
import {Button, MenuItem, TextField} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {addQuestion, editQuestion, fetchSubjects} from "./redux/questionSlice";

const QuestionForm = ({selectedQuestion, onSave}) => {
    const [question, setQuestion] = useState({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        subject: "",
    });
    const {subjects} = useSelector((state) => state.questions);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedQuestion) {
            setQuestion(selectedQuestion);
        }
        dispatch(fetchSubjects());
    }, [selectedQuestion, dispatch]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setQuestion({...question, [name]: value});
    };

    const handleOptionsChange = (index, value) => {
        const newOptions = [...question.options];
        newOptions[index] = value;
        setQuestion({...question, options: newOptions});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (question.id) {
            dispatch(editQuestion({id: question.id, question}));
        } else {
            dispatch(addQuestion(question));
        }
        onSave();
        setQuestion({questionText: "", options: ["", "", "", ""], correctAnswer: "", subject: ""});
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{question.id ? "Edit Question" : "Add Question"}</h2>
            <TextField
                label="Question Text"
                name="questionText"
                value={question.questionText}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            {question.options.map((option, index) => (
                <TextField
                    key={index}
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionsChange(index, e.target.value)}
                    fullWidth
                    margin="normal"
                />
            ))}
            <TextField
                label="Correct Answer"
                name="correctAnswer"
                value={question.correctAnswer}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            />
            <TextField
                select
                label="Subject"
                name="subject"
                value={question.subject}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
            >
                {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                    </MenuItem>
                ))}
            </TextField>
            <Button type="submit" variant="contained" color="primary">
                Save
            </Button>
        </form>
    );
};

export default QuestionForm;
