import React, {useEffect, useState} from "react";
import {DataPacket_Kind, RoomEvent} from "livekit-client";
import "./PollsQuizzes.css";

export function PollsQuizzes({room, localParticipant, userName, userRole}) {
    const [polls, setPolls] = useState([]);
    const [newPollTitle, setNewPollTitle] = useState("");
    const [newPollType, setNewPollType] = useState("multiple-choice");
    const [newPollOptions, setNewPollOptions] = useState(["", ""]);
    const [newQuizQuestion, setNewQuizQuestion] = useState("");
    const [newQuizAnswers, setNewQuizAnswers] = useState(["", "", "", ""]);
    const [newQuizCorrectAnswer, setNewQuizCorrectAnswer] = useState(0);
    const [quizScores, setQuizScores] = useState({});
    const [timeLimit, setTimeLimit] = useState(0); // 0 means no time limit
    const [activeTimers, setActiveTimers] = useState({});

    const isInstructor = userRole === 'instructor' || userRole === 'moderator';

    useEffect(() => {
        if (!room) return;

        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === 'poll_action') {
                    handlePollAction(data, participant);
                }
            } catch (e) {
                console.error('Error parsing poll/quiz message:', e);
            }
        };

        room.on(RoomEvent.DataReceived, handleDataReceived);

        return () => {
            room.off(RoomEvent.DataReceived, handleDataReceived);
        };
    }, [room]);

    const handlePollAction = (data, participant) => {
        const {action, pollId, pollData, responseData} = data;

        switch (action) {
            case 'create':
                setPolls(prev => [...prev, {
                    ...pollData,
                    id: pollId,
                    creator: participant.identity,
                    createdAt: new Date(),
                    responses: {},
                    status: 'active',
                    results: {}
                }]);

                if (pollData.timeLimit > 0) {
                    startPollTimer(pollId, pollData.timeLimit);
                }
                break;

            case 'respond':
                setPolls(prev => {
                    const updatedPolls = [...prev];
                    const pollIndex = updatedPolls.findIndex(p => p.id === pollId);

                    if (pollIndex !== -1) {
                        const poll = updatedPolls[pollIndex];
                        poll.responses[participant.identity] = responseData;

                        if (poll.type === 'multiple-choice' || poll.type === 'quiz') {
                            const results = {};
                            Object.values(poll.responses).forEach(response => {
                                if (!results[response.selected]) {
                                    results[response.selected] = 0;
                                }
                                results[response.selected]++;
                            });
                            poll.results = results;
                        } else if (poll.type === 'text') {
                            poll.results = Object.values(poll.responses).map(r => r.text);
                        }

                        if (poll.type === 'quiz' && responseData.selected !== undefined) {
                            const isCorrect = parseInt(responseData.selected) === poll.correctAnswer;
                            setQuizScores(prev => {
                                const updatedScores = {...prev};
                                if (!updatedScores[participant.identity]) {
                                    updatedScores[participant.identity] = {correct: 0, total: 0};
                                }
                                updatedScores[participant.identity].total++;
                                if (isCorrect) {
                                    updatedScores[participant.identity].correct++;
                                }
                                return updatedScores;
                            });
                        }
                    }
                    return updatedPolls;
                });
                break;

            case 'end':
                setPolls(prev => {
                    const updatedPolls = [...prev];
                    const pollIndex = updatedPolls.findIndex(p => p.id === pollId);

                    if (pollIndex !== -1) {
                        updatedPolls[pollIndex].status = 'ended';
                        clearPollTimer(pollId);
                    }

                    return updatedPolls;
                });
                break;

            case 'delete':
                clearPollTimer(pollId);
                setPolls(prev => prev.filter(p => p.id !== pollId));
                break;

            default:
                console.warn(`Unknown poll action: ${action}`);
        }
    };

    const startPollTimer = (pollId, timeInSeconds) => {
        clearPollTimer(pollId);

        setActiveTimers(prev => ({
            ...prev,
            [pollId]: timeInSeconds
        }));

        const intervalId = setInterval(() => {
            setActiveTimers(prev => {
                const updatedTimers = {...prev};

                if (updatedTimers[pollId] <= 1) {
                    clearInterval(intervalId);
                    delete updatedTimers[pollId];

                    const endPollMessage = {
                        type: 'poll_action',
                        action: 'end',
                        pollId
                    };

                    const data = new TextEncoder().encode(JSON.stringify(endPollMessage));
                    room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);

                    return updatedTimers;
                }

                updatedTimers[pollId]--;
                return updatedTimers;
            });
        }, 1000);

        setActiveTimers(prev => ({
            ...prev,
            [`${pollId}_interval`]: intervalId
        }));
    };

    const clearPollTimer = (pollId) => {
        setActiveTimers(prev => {
            const updatedTimers = {...prev};

            if (updatedTimers[`${pollId}_interval`]) {
                clearInterval(updatedTimers[`${pollId}_interval`]);
                delete updatedTimers[`${pollId}_interval`];
            }

            if (updatedTimers[pollId]) {
                delete updatedTimers[pollId];
            }

            return updatedTimers;
        });
    };

    const createPoll = () => {
        if (!room || !localParticipant) return;

        if (!newPollTitle.trim()) {
            alert("Please enter a title for your poll/quiz");
            return;
        }

        if (newPollType === 'multiple-choice' || newPollType === 'quiz') {
            const validOptions = newPollOptions.filter(opt => opt.trim() !== '');
            if (validOptions.length < 2) {
                alert("Please add at least two options");
                return;
            }
        }

        if (newPollType === 'quiz' && newQuizQuestion.trim() === '') {
            alert("Please enter a question for your quiz");
            return;
        }

        const pollId = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const pollData = {
            title: newPollTitle,
            type: newPollType,
            timeLimit: parseInt(timeLimit) || 0,
            createdAt: new Date().toISOString(),
        };

        if (newPollType === 'multiple-choice') {
            pollData.options = newPollOptions.filter(opt => opt.trim() !== '');
        } else if (newPollType === 'quiz') {
            pollData.question = newQuizQuestion;
            pollData.options = newQuizAnswers.filter(opt => opt.trim() !== '');
            pollData.correctAnswer = newQuizCorrectAnswer;
        }

        const message = {
            type: 'poll_action',
            action: 'create',
            pollId,
            pollData
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);

        setNewPollTitle("");
        setNewPollType("multiple-choice");
        setNewPollOptions(["", ""]);
        setNewQuizQuestion("");
        setNewQuizAnswers(["", "", "", ""]);
        setNewQuizCorrectAnswer(0);
        setTimeLimit(0);
    };

    const submitResponse = (pollId, poll, responseData) => {
        if (!room || !localParticipant) return;

        const message = {
            type: 'poll_action',
            action: 'respond',
            pollId,
            responseData
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const endPoll = (pollId) => {
        if (!room || !localParticipant) return;

        const message = {
            type: 'poll_action',
            action: 'end',
            pollId
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const deletePoll = (pollId) => {
        if (!room || !localParticipant) return;

        const message = {
            type: 'poll_action',
            action: 'delete',
            pollId
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const handleOptionChange = (index, value, isQuiz = false) => {
        if (isQuiz) {
            const newAnswers = [...newQuizAnswers];
            newAnswers[index] = value;
            setNewQuizAnswers(newAnswers);
        } else {
            const newOptions = [...newPollOptions];
            newOptions[index] = value;
            setNewPollOptions(newOptions);
        }
    };

    const addOption = (isQuiz = false) => {
        if (isQuiz) {
            setNewQuizAnswers([...newQuizAnswers, ""]);
        } else {
            setNewPollOptions([...newPollOptions, ""]);
        }
    };

    const removeOption = (index, isQuiz = false) => {
        if (isQuiz) {
            const newAnswers = [...newQuizAnswers];
            newAnswers.splice(index, 1);
            setNewQuizAnswers(newAnswers);

            if (index === newQuizCorrectAnswer) {
                setNewQuizCorrectAnswer(0);
            } else if (index < newQuizCorrectAnswer) {
                setNewQuizCorrectAnswer(newQuizCorrectAnswer - 1);
            }
        } else {
            const newOptions = [...newPollOptions];
            newOptions.splice(index, 1);
            setNewPollOptions(newOptions);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const calculatePercentage = (option, poll) => {
        const totalResponses = Object.keys(poll.responses).length;
        if (totalResponses === 0) return 0;
        return Math.round((poll.results[option] || 0) / totalResponses * 100);
    };

    return (
        <div className="polls-quizzes-container">
            <div className="polls-header">
                <h2>Polls & Quizzes</h2>
                {isInstructor && (
                    <div className="poll-tabs">
                        <button
                            className={`tab-button ${newPollType === 'multiple-choice' ? 'active' : ''}`}
                            onClick={() => setNewPollType('multiple-choice')}
                        >
                            Poll
                        </button>
                        <button
                            className={`tab-button ${newPollType === 'text' ? 'active' : ''}`}
                            onClick={() => setNewPollType('text')}
                        >
                            Text Response
                        </button>
                        <button
                            className={`tab-button ${newPollType === 'quiz' ? 'active' : ''}`}
                            onClick={() => setNewPollType('quiz')}
                        >
                            Quiz
                        </button>
                    </div>
                )}
            </div>

            {isInstructor && (
                <div className="create-poll-section">
                    <div className="poll-form">
                        <div className="form-group">
                            <label>Title:</label>
                            <input
                                type="text"
                                value={newPollTitle}
                                onChange={(e) => setNewPollTitle(e.target.value)}
                                placeholder={newPollType === 'quiz' ? "Quiz Title" : "Poll Title"}
                            />
                        </div>

                        {newPollType === 'quiz' && (
                            <div className="form-group">
                                <label>Question:</label>
                                <input
                                    type="text"
                                    value={newQuizQuestion}
                                    onChange={(e) => setNewQuizQuestion(e.target.value)}
                                    placeholder="Enter your question"
                                />
                            </div>
                        )}

                        {(newPollType === 'multiple-choice' || newPollType === 'quiz') && (
                            <div className="form-group">
                                <label>{newPollType === 'quiz' ? "Answer Options:" : "Options:"}</label>
                                <div className="options-container">
                                    {(newPollType === 'quiz' ? newQuizAnswers : newPollOptions).map((option, index) => (
                                        <div key={index} className="option-row">
                                            {newPollType === 'quiz' && (
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={newQuizCorrectAnswer === index}
                                                    onChange={() => setNewQuizCorrectAnswer(index)}
                                                />
                                            )}
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionChange(index, e.target.value, newPollType === 'quiz')}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            <button
                                                className="remove-option-btn"
                                                onClick={() => removeOption(index, newPollType === 'quiz')}
                                                disabled={(newPollType === 'quiz' ? newQuizAnswers : newPollOptions).length <= 2}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-option-btn"
                                        onClick={() => addOption(newPollType === 'quiz')}
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Time Limit (seconds, 0 for no limit):</label>
                            <input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(e.target.value)}
                                min="0"
                                placeholder="Optional time limit"
                            />
                        </div>

                        <button
                            className="create-poll-btn"
                            onClick={createPoll}
                        >
                            {newPollType === 'quiz' ? 'Create Quiz' : 'Create Poll'}
                        </button>
                    </div>
                </div>
            )}

            <div className="polls-list">
                {polls.length === 0 ? (
                    <div className="no-polls-message">
                        {isInstructor
                            ? "Create a new poll or quiz to get started"
                            : "No active polls or quizzes at the moment"}
                    </div>
                ) : (
                    polls.map(poll => {
                        const userHasResponded = poll.responses[userName];
                        const isPollActive = poll.status === 'active';
                        const timeRemaining = activeTimers[poll.id];

                        return (
                            <div
                                key={poll.id}
                                className={`poll-item ${poll.status === 'ended' ? 'ended' : 'active'}`}
                            >
                                <div className="poll-header">
                                    <div className="poll-title-container">
                                        <h3>{poll.title}</h3>
                                        <span className="poll-type-badge">
                                            {poll.type === 'multiple-choice' ? 'Poll' :
                                                poll.type === 'text' ? 'Text Response' : 'Quiz'}
                                        </span>
                                        {poll.status === 'ended' && (
                                            <span className="poll-status-badge ended">Ended</span>
                                        )}
                                        {timeRemaining > 0 && (
                                            <span className="poll-timer">
                                                ⏱️ {formatTime(timeRemaining)}
                                            </span>
                                        )}
                                    </div>

                                    {isInstructor && isPollActive && (
                                        <div className="poll-actions">
                                            <button
                                                className="end-poll-btn"
                                                onClick={() => endPoll(poll.id)}
                                            >
                                                End
                                            </button>
                                        </div>
                                    )}

                                    {isInstructor && !isPollActive && (
                                        <div className="poll-actions">
                                            <button
                                                className="delete-poll-btn"
                                                onClick={() => deletePoll(poll.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {poll.type === 'quiz' && (
                                    <div className="quiz-question">
                                        <p>{poll.question}</p>
                                    </div>
                                )}

                                {(poll.type === 'multiple-choice' || poll.type === 'quiz') && (
                                    <div className="poll-options">
                                        {poll.options.map((option, index) => {
                                            const isSelected = userHasResponded &&
                                                parseInt(userHasResponded.selected) === index;
                                            const isCorrect = poll.type === 'quiz' &&
                                                poll.status === 'ended' &&
                                                poll.correctAnswer === index;
                                            const isIncorrect = poll.type === 'quiz' &&
                                                poll.status === 'ended' &&
                                                parseInt(userHasResponded?.selected) === index &&
                                                poll.correctAnswer !== index;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`poll-option ${isSelected ? 'selected' : ''} 
                                                        ${isCorrect ? 'correct' : ''}
                                                        ${isIncorrect ? 'incorrect' : ''}`}
                                                >
                                                    {(!userHasResponded && isPollActive) ? (
                                                        <button
                                                            className="option-btn"
                                                            onClick={() => submitResponse(poll.id, poll, {selected: index})}
                                                        >
                                                            {option}
                                                        </button>
                                                    ) : (
                                                        <div className="option-result">
                                                            <div className="option-text">
                                                                <span>{option}</span>
                                                                {isCorrect &&
                                                                    <span className="correct-badge">✓ Correct</span>}
                                                                {isIncorrect && <span className="incorrect-badge">✗ Incorrect</span>}
                                                            </div>

                                                            {poll.status === 'ended' && (
                                                                <div className="result-bar-container">
                                                                    <div
                                                                        className="result-bar"
                                                                        style={{width: `${calculatePercentage(index, poll)}%`}}
                                                                    />
                                                                    <span className="result-percentage">
                                                                        {calculatePercentage(index, poll)}%
                                                                        ({(poll.results[index] || 0)} responses)
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {poll.type === 'text' && (
                                    <div className="text-response-section">
                                        {(!userHasResponded && isPollActive) ? (
                                            <div className="text-response-form">
                                                <textarea
                                                    placeholder="Type your response here..."
                                                    id={`text-response-${poll.id}`}
                                                    rows={3}
                                                />
                                                <button
                                                    className="submit-response-btn"
                                                    onClick={() => {
                                                        const text = document.getElementById(`text-response-${poll.id}`).value;
                                                        if (text.trim()) {
                                                            submitResponse(poll.id, poll, {text});
                                                        }
                                                    }}
                                                >
                                                    Submit
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-responses">
                                                {userHasResponded && (
                                                    <div className="your-response">
                                                        <h4>Your response:</h4>
                                                        <p>{userHasResponded.text}</p>
                                                    </div>
                                                )}

                                                {(isInstructor && poll.status === 'ended' && poll.results.length > 0) && (
                                                    <div className="all-responses">
                                                        <h4>All Responses:</h4>
                                                        <ul className="response-list">
                                                            {poll.results.map((response, index) => (
                                                                <li key={index}
                                                                    className="response-item">{response}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {isInstructor && poll.type === 'quiz' && poll.status === 'ended' && (
                                    <div className="quiz-statistics">
                                        <h4>Quiz Statistics:</h4>
                                        <div className="quiz-stats">
                                            <div className="stat-item">
                                                <span className="stat-label">Participants:</span>
                                                <span className="stat-value">{Object.keys(poll.responses).length}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Correct Answers:</span>
                                                <span className="stat-value">
                                                    {Object.values(poll.responses).filter(
                                                        r => parseInt(r.selected) === poll.correctAnswer
                                                    ).length}
                                                </span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Success Rate:</span>
                                                <span className="stat-value">
                                                    {Object.keys(poll.responses).length > 0 ?
                                                        Math.round(Object.values(poll.responses).filter(
                                                            r => parseInt(r.selected) === poll.correctAnswer
                                                        ).length / Object.keys(poll.responses).length * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {isInstructor && Object.keys(quizScores).length > 0 && (
                <div className="quiz-leaderboard">
                    <h3>Quiz Leaderboard</h3>
                    <table className="leaderboard-table">
                        <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Score</th>
                            <th>Completion</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(quizScores)
                            .sort((a, b) => b[1].correct - a[1].correct)
                            .map(([participant, score]) => (
                                <tr key={participant}>
                                    <td>{participant}</td>
                                    <td>{score.correct} / {score.total}</td>
                                    <td>
                                        <div className="completion-bar-container">
                                            <div
                                                className="completion-bar"
                                                style={{
                                                    width: `${score.total > 0 ? (score.correct / score.total) * 100 : 0}%`,
                                                    backgroundColor: score.correct === score.total ? '#4caf50' :
                                                        score.correct > score.total / 2 ? '#ff9800' : '#f44336'
                                                }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}