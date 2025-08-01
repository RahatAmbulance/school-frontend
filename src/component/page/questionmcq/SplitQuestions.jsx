import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {fetchQuestionSets} from "./redux/questionSlice";
import {Button, TextField} from "@mui/material";

const SplitQuestions = () => {
    const [setSize, setSetSize] = useState(5);
    const {questionSets} = useSelector((state) => state.questions);
    const dispatch = useDispatch();

    const handleSplit = () => {
        dispatch(fetchQuestionSets(setSize));
    };

    return (
        <div>
            <h2>Split Questions</h2>
            <TextField
                type="number"
                label="Set Size"
                value={setSize}
                onChange={(e) => setSetSize(e.target.value)}
                margin="normal"
            />
            <Button onClick={handleSplit} variant="contained" color="primary">
                Split
            </Button>
            {questionSets.map((set, index) => (
                <div key={index}>
                    <h3>Set {index + 1}</h3>
                    {set.map((question) => (
                        <p key={question.id}>{question.questionText}</p>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default SplitQuestions;
