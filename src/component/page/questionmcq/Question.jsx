import React, {useState} from "react";
import QuestionList from "./QuestionList";
import QuestionForm from "./QuestionForm";
import SplitQuestions from "./SplitQuestions";

const Question = () => {
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const handleEdit = (question) => {
        setSelectedQuestion(question);
    };

    const handleSave = () => {
        setSelectedQuestion(null);
        setRefresh(!refresh);
    };

    return (
        <div style={{padding: "20px"}}>
            <QuestionForm selectedQuestion={selectedQuestion} onSave={handleSave}/>
            <QuestionList onEdit={handleEdit} refresh={refresh}/>
            <SplitQuestions/>
        </div>
    );
};

export default Question;
