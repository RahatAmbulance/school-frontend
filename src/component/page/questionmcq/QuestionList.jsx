import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import {deleteQuestion, fetchQuestions} from "./redux/questionSlice";

const QuestionList = ({onEdit}) => {
    const dispatch = useDispatch();
    const {questions, loading, error} = useSelector((state) => state.questions);

    useEffect(() => {
        dispatch(fetchQuestions());
    }, [dispatch]);

    const handleDelete = (id) => {
        dispatch(deleteQuestion(id));
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Questions</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Question Text</TableCell>
                        <TableCell>Options</TableCell>
                        <TableCell>Correct Answer</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.isArray(questions) && questions.length > 0 ? (
                        questions.map((question) => (
                            <TableRow key={question.id}>
                                <TableCell>{question.id}</TableCell>
                                <TableCell>{question.questionText}</TableCell>
                                <TableCell>{question.options.join(", ")}</TableCell>
                                <TableCell>{question.correctAnswer}</TableCell>
                                <TableCell>{question.subject.name}</TableCell>
                                <TableCell>
                                    <Button variant="contained" color="primary" onClick={() => onEdit(question)}>
                                        Edit
                                    </Button>
                                    <Button variant="contained" color="secondary"
                                            onClick={() => handleDelete(question.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6}>No questions available</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default QuestionList;
