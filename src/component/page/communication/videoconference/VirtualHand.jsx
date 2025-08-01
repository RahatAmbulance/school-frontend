import React, {useEffect, useState} from 'react';
import {DataPacket_Kind} from 'livekit-client';
import {format} from 'date-fns';
import './VirtualHand.css'

export function VirtualHand({room, localParticipant, userName, userRole}) {
    const [handRaised, setHandRaised] = useState(false);
    const [handQueue, setHandQueue] = useState([]);
    const [answeredQueue, setAnsweredQueue] = useState([]);
    const [question, setQuestion] = useState('');

    // Set up data receiver for hand raise events
    useEffect(() => {
        if (!room) return;

        const handleDataReceived = (payload, participant) => {
            try {
                const data = JSON.parse(new TextDecoder().decode(payload));
                if (data.type === 'hand_action') {
                    if (data.action === 'raise') {
                        // Add to queue if not already in queue
                        setHandQueue(prevQueue => {
                            const participantExists = prevQueue.some(item => item.participantId === participant.identity);
                            if (!participantExists) {
                                return [...prevQueue, {
                                    participantId: participant.identity,
                                    name: data.name,
                                    role: data.role,
                                    timestamp: new Date(),
                                    question: data.question || ''
                                }];
                            }
                            return prevQueue;
                        });
                    } else if (data.action === 'lower') {
                        // Remove from queue
                        setHandQueue(prevQueue =>
                            prevQueue.filter(item => item.participantId !== participant.identity)
                        );
                    } else if (data.action === 'answer') {
                        // Move from hand queue to answered queue
                        const answeredParticipant = handQueue.find(item => item.participantId === data.participantId);
                        if (answeredParticipant) {
                            setAnsweredQueue(prev => [...prev, {
                                ...answeredParticipant,
                                answeredAt: new Date()
                            }]);

                            setHandQueue(prevQueue =>
                                prevQueue.filter(item => item.participantId !== data.participantId)
                            );
                        }
                    } else if (data.action === 'clear_all') {
                        // Only instructors can clear all hands
                        if (data.role === 'instructor' || data.role === 'admin') {
                            setHandQueue([]);
                            setAnsweredQueue([]);
                        }
                    }
                }
            } catch (e) {
                console.error('Error parsing hand raise message:', e);
            }
        };

        room.on('DataReceived', handleDataReceived);

        return () => {
            room.off('DataReceived', handleDataReceived);
        };
    }, [room, handQueue]);

    const raiseHand = () => {
        if (!room || !localParticipant) return;

        const message = {
            type: 'hand_action',
            action: 'raise',
            name: userName,
            role: userRole,
            timestamp: new Date().toISOString(),
            question: question
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);

        setHandRaised(true);
        setQuestion('');
    };

    const lowerHand = () => {
        if (!room || !localParticipant) return;

        const message = {
            type: 'hand_action',
            action: 'lower',
            name: userName,
            role: userRole,
            timestamp: new Date().toISOString()
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);

        setHandRaised(false);
    };

    const markAsAnswered = (participantId) => {
        if (!room || !localParticipant || userRole !== 'instructor' && userRole !== 'admin') return;

        const message = {
            type: 'hand_action',
            action: 'answer',
            participantId: participantId,
            handlerName: userName,
            role: userRole,
            timestamp: new Date().toISOString()
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    };

    const clearAllHands = () => {
        if (!room || !localParticipant || userRole !== 'instructor' && userRole !== 'admin') return;

        const message = {
            type: 'hand_action',
            action: 'clear_all',
            name: userName,
            role: userRole,
            timestamp: new Date().toISOString()
        };

        const data = new TextEncoder().encode(JSON.stringify(message));
        room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);

        setHandQueue([]);
        setAnsweredQueue([]);
    };

    const formatTime = (date) => {
        return format(date, 'HH:mm');
    };

    const isInHandQueue = () => {
        return handQueue.some(item => item.participantId === localParticipant?.identity);
    };

    // Check if the participant has their hand raised
    useEffect(() => {
        setHandRaised(isInHandQueue());
    }, [handQueue, localParticipant]);

    return (
        <div className="virtual-hand-container">
            <div className="hand-header">
                <h3>Virtual Hand Raising</h3>
                {(userRole === 'instructor' || userRole === 'admin') && (
                    <button
                        className="clear-all-button"
                        onClick={clearAllHands}
                        disabled={handQueue.length === 0}
                    >
                        Clear All
                    </button>
                )}
            </div>

            <div className="hand-content">
                {!handRaised ? (
                    <div className="raise-hand-form">
            <textarea
                placeholder="Optional: What's your question? (Press Enter to submit)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        raiseHand();
                    }
                }}
                rows={2}
            />
                        <button
                            className="raise-hand-button"
                            onClick={raiseHand}
                        >
                            Raise Hand ✋
                        </button>
                    </div>
                ) : (
                    <div className="hand-raised">
                        <div className="hand-status">
                            <span className="hand-icon">✋</span>
                            <span>Your hand is raised</span>
                        </div>
                        <button
                            className="lower-hand-button"
                            onClick={lowerHand}
                        >
                            Lower Hand
                        </button>
                    </div>
                )}

                <div className="hand-queue-container">
                    <h4>Queue ({handQueue.length})</h4>
                    {handQueue.length === 0 ? (
                        <p className="empty-queue">No hands raised at the moment.</p>
                    ) : (
                        <ul className="hand-queue-list">
                            {handQueue.map((item, index) => (
                                <li key={item.participantId} className="hand-queue-item">
                                    <div className="queue-item-header">
                                        <span className="queue-position">{index + 1}</span>
                                        <span className="queue-name">{item.name}</span>
                                        <span className="queue-role">{item.role}</span>
                                        <span className="queue-time">{formatTime(new Date(item.timestamp))}</span>
                                    </div>

                                    {item.question && (
                                        <div className="queue-question">
                                            <p>{item.question}</p>
                                        </div>
                                    )}

                                    {(userRole === 'instructor' || userRole === 'admin') && (
                                        <button
                                            className="mark-answered-button"
                                            onClick={() => markAsAnswered(item.participantId)}
                                        >
                                            Mark as Answered
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {(userRole === 'instructor' || userRole === 'admin') && answeredQueue.length > 0 && (
                    <div className="answered-queue-container">
                        <h4>Recently Answered ({answeredQueue.length})</h4>
                        <ul className="answered-queue-list">
                            {answeredQueue.map((item) => (
                                <li key={item.participantId} className="answered-queue-item">
                                    <div className="queue-item-header">
                                        <span className="queue-name">{item.name}</span>
                                        <span className="queue-role">{item.role}</span>
                                        <span className="queue-time">{formatTime(new Date(item.answeredAt))}</span>
                                    </div>

                                    {item.question && (
                                        <div className="queue-question">
                                            <p>{item.question}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}