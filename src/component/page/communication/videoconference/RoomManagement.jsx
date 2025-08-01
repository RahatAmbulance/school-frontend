import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, Card, Input} from '@mui/material';
import {
    EmojiEvents as Crown,
    Mic,
    MicOff,
    People as Users,
    PersonAdd as UserPlus,
    ScreenShare as Monitor,
    Send,
    StopCircle,
    Videocam,
    VideocamOff
} from '@mui/icons-material';
import {io} from 'socket.io-client';

const SOCKET_SERVER_URL = 'https://node.ummahhub.com';
const RoomManagement = () => {
    const [socket, setSocket] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [hostRoom, setHostRoom] = useState(null);
    const [joinRequests, setJoinRequests] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [joinRoomId, setJoinRoomId] = useState('');
    const [userName, setUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenShareUser, setScreenShareUser] = useState(null);
    const [pendingCandidates] = useState(new Map()); // Add this line for storing pending ICE candidates
    const [mediaStream, setMediaStream] = useState(null);
    const [mediaStatus, setMediaStatus] = useState({video: false, audio: false});
    const localVideoRef = useRef(null);
    const remoteVideosRef = useRef(new Map());
    const videoRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [peerConnections] = useState(new Map());
    const localStreamRef = useRef(null);
    const initializeMediaConnection = async (participantId, stream) => {
        try {
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    {urls: 'stun:stun1.l.google.com:19302'},
                    {urls: 'stun:stun2.l.google.com:19302'}
                ]
            });

            // Add local tracks to the connection
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            // Handle incoming tracks
            peerConnection.ontrack = (event) => {
                const remoteVideo = document.createElement('video');
                remoteVideo.srcObject = event.streams[0];
                remoteVideo.autoplay = true;
                remoteVideo.playsInline = true;
                remoteVideosRef.current.set(participantId, remoteVideo);
            };

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('media-signal', {
                        roomId,
                        userId: participantId,
                        signal: {
                            type: 'ice-candidate',
                            candidate: event.candidate
                        }
                    });
                }
            };

            // Create and send offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            socket.emit('media-signal', {
                roomId,
                userId: participantId,
                signal: offer
            });

            peerConnections.set(participantId, peerConnection);
        } catch (error) {
            console.error('Error initializing media connection:', error);
            setErrorMessage('Failed to initialize media connection');
        }
    };
    const toggleVideo = () => {
        if (mediaStream) {
            const videoTrack = mediaStream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setMediaStatus(prev => ({
                ...prev,
                video: !prev.video
            }));

            socket.emit('media-status-change', {
                roomId,
                video: !mediaStatus.video,
                audio: mediaStatus.audio
            });
        }
    };
    const toggleAudio = () => {
        if (mediaStream) {
            const audioTrack = mediaStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setMediaStatus(prev => ({
                ...prev,
                audio: !prev.audio
            }));

            socket.emit('media-status-change', {
                roomId,
                video: mediaStatus.video,
                audio: !mediaStatus.audio
            });
        }
    };
    useEffect(() => {
        if (!socket) return;

        socket.on('media-signal', async ({userId, signal}) => {
            try {
                let peerConnection = peerConnections.get(userId);

                if (!peerConnection) {
                    peerConnection = await initializeMediaConnection(userId, mediaStream);
                }

                if (signal.type === 'offer') {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    socket.emit('media-signal', {
                        roomId,
                        userId,
                        signal: answer
                    });
                } else if (signal.type === 'answer') {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                } else if (signal.type === 'ice-candidate') {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
                }
            } catch (error) {
                console.error('Error handling media signal:', error);
                setErrorMessage('Failed to handle media signal');
            }
        });

        socket.on('participant-media-update', ({userId, userName, mediaStatus}) => {
            // Update UI to reflect participant's media status
            setParticipants(prev =>
                prev.map(p =>
                    p.id === userId
                        ? {...p, mediaStatus}
                        : p
                )
            );
        });

        return () => {
            socket.off('media-signal');
            socket.off('participant-media-update');
        };
    }, [socket, peerConnections, mediaStream]);
    useEffect(() => {
        const newSocket = io(SOCKET_SERVER_URL, {
            withCredentials: true
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('error', ({message}) => {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 3000);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);
    useEffect(() => {
        if (!socket) return;

        socket.on('webrtc-signal', async ({userId, signal}) => {
            try {
                let peerConnection = peerConnections.get(userId);

                if (!peerConnection) {
                    peerConnection = new RTCPeerConnection({
                        iceServers: [
                            {urls: 'stun:stun1.l.google.com:19302'},
                            {urls: 'stun:stun2.l.google.com:19302'}
                        ],
                    });

                    // Handle incoming tracks for screen sharing
                    peerConnection.ontrack = (event) => {
                        if (videoRef.current && event.streams[0]) {
                            videoRef.current.srcObject = event.streams[0];
                        }
                    };

                    peerConnections.set(userId, peerConnection);
                }

                if (signal.type === 'offer') {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    socket.emit('webrtc-signal', {
                        roomId,
                        userId,
                        signal: answer
                    });
                } else if (signal.type === 'answer') {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
                } else if (signal.type === 'ice-candidate' && signal.candidate) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
                }
            } catch (error) {
                console.error('Error handling WebRTC signal:', error);
                setErrorMessage('Failed to handle WebRTC signal');
            }
        });

        return () => {
            socket.off('webrtc-signal');
        };
    }, [socket, peerConnections, roomId]);
    useEffect(() => {
        if (!socket) return;

        // Room creation response
        socket.on('room-created', ({roomId, userName}) => {
            setHostRoom({id: roomId, hostName: userName});
            setRoomId(roomId);
            setParticipants([{id: socket.id, userName, isHost: true}]);
        });

        // New join request
        socket.on('join-requested', (request) => {
            setJoinRequests(prev => [...prev, request]);
        });

        socket.on('join-accepted', ({roomId, participants, messages}) => {
            // Update this section
            setHostRoom({id: roomId}); // Keep the room data
            setRoomId(roomId); // Set the room ID for joined user

            // Convert participants data from array to objects
            const participantsList = participants.map(([id, data]) => ({
                id,
                userName: data.userName,
                isHost: data.isHost
            }));
            setParticipants(participantsList);
            setMessages(messages);
        });

        // Join request rejected
        socket.on('join-rejected', () => {
            setErrorMessage('Join request was rejected');
            setTimeout(() => setErrorMessage(''), 3000);
        });

        socket.on('participant-joined', ({userId, userName}) => {
            setParticipants(prev => [
                ...prev,
                {id: userId, userName, isHost: false}
            ]);
            addSystemMessage(`${userName} has joined the room`);
        });

        // Participant left
        socket.on('participant-left', ({userId, userName}) => {
            setParticipants(prev => prev.filter(p => p.id !== userId));
            addSystemMessage(`${userName} has left the room`);
        });

        // Host disconnected
        socket.on('host-disconnected', () => {
            setErrorMessage('Host has disconnected. Room closed.');
            setHostRoom(null);
            setRoomId('');
            setParticipants([]);
            setMessages([]);
        });

        // New message received
        socket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
            setTimeout(scrollToBottom, 100);
        });

        // Screen sharing events
        socket.on('screen-share-started', ({userName}) => {
            setScreenShareUser(userName);
            setIsScreenSharing(true);
            addSystemMessage(`${userName} started sharing their screen`);
        });

        socket.on('screen-share-stopped', () => {
            setIsScreenSharing(false);
            setScreenShareUser(null);
            addSystemMessage(`Screen sharing stopped`);
        });

        return () => {
            socket.off('room-created');
            socket.off('join-requested');
            socket.off('join-accepted');
            socket.off('join-rejected');
            socket.off('participant-joined');
            socket.off('participant-left');
            socket.off('host-disconnected');
            socket.off('new-message');
            socket.off('screen-share-started');
            socket.off('screen-share-stopped');
        };
    }, [socket]);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };
    const createRoom = () => {
        try {
            const trimmedUserName = userName.trim();

            if (!trimmedUserName) {
                setErrorMessage('Please enter your name first');
                return;
            }

            const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            socket.emit('create-room', {roomId: newRoomId, userName: trimmedUserName});
        } catch (error) {
            setErrorMessage('Error creating room: ' + error.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };
    const requestToJoin = () => {
        try {
            const trimmedJoinRoomId = joinRoomId.trim().toUpperCase();
            const trimmedUserName = userName.trim();

            if (!trimmedJoinRoomId || !trimmedUserName) {
                setErrorMessage('Please enter both room ID and your name');
                return;
            }

            socket.emit('join-request', {roomId: trimmedJoinRoomId, userName: trimmedUserName});
            setErrorMessage('Join request sent to host');
            setTimeout(() => setErrorMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Error sending join request: ' + error.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };
    const acceptRequest = (request) => {
        try {
            socket.emit('join-response', {
                roomId,
                userId: request.id,
                accepted: true
            });
            setJoinRequests(prev => prev.filter(req => req.id !== request.id));
        } catch (error) {
            setErrorMessage('Error accepting request: ' + error.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };
    const declineRequest = (requestId) => {
        try {
            socket.emit('join-response', {
                roomId,
                userId: requestId,
                accepted: false
            });
            setJoinRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (error) {
            setErrorMessage('Error declining request: ' + error.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };
    const sendMessage = () => {
        try {
            if (!newMessage.trim()) return;

            socket.emit('send-message', {
                roomId,
                message: newMessage.trim()
            });

            setNewMessage('');
        } catch (error) {
            setErrorMessage('Error sending message: ' + error.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };
    const startScreenShare = async () => {
        try {
            if (!navigator?.mediaDevices?.getDisplayMedia) {
                throw new Error('Screen sharing is not supported in your browser.');
            }

            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });

            // Store the stream reference
            localStreamRef.current = stream;

            // Set video source for local preview and for the main video display
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
            }

            // Create new RTCPeerConnection for each participant
            for (const participant of participants) {
                if (participant.id !== socket.id) {
                    try {
                        let peerConnection = peerConnections.get(participant.id);

                        if (!peerConnection) {
                            peerConnection = new RTCPeerConnection({
                                iceServers: [
                                    {urls: 'stun:stun1.l.google.com:19302'},
                                    {urls: 'stun:stun2.l.google.com:19302'}
                                ]
                            });

                            // Set up ICE handling
                            peerConnection.onicecandidate = (event) => {
                                if (event.candidate) {
                                    socket.emit('webrtc-signal', {
                                        roomId,
                                        userId: participant.id,
                                        signal: {
                                            type: 'ice-candidate',
                                            candidate: event.candidate
                                        }
                                    });
                                }
                            };

                            peerConnections.set(participant.id, peerConnection);
                        } else {
                            // Remove existing tracks
                            const senders = peerConnection.getSenders();
                            await Promise.all(senders.map(sender => peerConnection.removeTrack(sender)));
                        }

                        // Add the screen share tracks
                        stream.getTracks().forEach(track => {
                            peerConnection.addTrack(track, stream);
                        });

                        // Create and send offer
                        const offer = await peerConnection.createOffer();
                        await peerConnection.setLocalDescription(offer);

                        socket.emit('webrtc-signal', {
                            roomId,
                            userId: participant.id,
                            signal: offer
                        });
                    } catch (error) {
                        console.error(`Error setting up connection for participant ${participant.id}:`, error);
                    }
                }
            }

            // Notify server about screen sharing
            socket.emit('start-screen-share', {roomId, userName});
            setIsScreenSharing(true);
            setScreenShareUser(userName);

            // Handle stream end
            stream.getVideoTracks()[0].addEventListener('ended', () => {
                stopScreenShare();
            });

        } catch (error) {
            console.error('Screen sharing error:', error);
            setErrorMessage(error.message || 'Failed to start screen sharing');
            setTimeout(() => setErrorMessage(''), 3000);

            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }
        }
    };
    const stopScreenShare = async () => {
        try {
            // Stop all tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }

            // Clear video element
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            // Clean up peer connections
            await Promise.all(Array.from(peerConnections.entries()).map(async ([participantId, connection]) => {
                const senders = connection.getSenders();
                await Promise.all(senders.map(sender => connection.removeTrack(sender)));
            }));

            // Notify server
            socket.emit('stop-screen-share', {roomId});
            setIsScreenSharing(false);
            setScreenShareUser(null);
        } catch (error) {
            console.error('Error stopping screen share:', error);
            setErrorMessage('Error stopping screen share: ' + error.message);
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };
    const addSystemMessage = (text) => {
        try {
            const message = {
                id: `system_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                text,
                timestamp: new Date(),
                type: 'system'
            };
            setMessages(prev => [...prev, message]);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error adding system message:', error);
        }
    };
    return (
        <div className="w-full max-w-6xl space-y-4">
            {!hostRoom ? (
                <Card>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Create or Join Room</h2>
                        <div className="space-y-4">
                            <Input
                                placeholder="Enter your name"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full"
                            />

                            <Button
                                onClick={createRoom}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Crown className="w-4 h-4"/>
                                Create New Room
                            </Button>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter Room ID"
                                    value={joinRoomId}
                                    onChange={(e) => setJoinRoomId(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={requestToJoin}
                                    className="flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4"/>
                                    Join Room
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Screen Sharing</h2>
                                    {!isScreenSharing ? (
                                        <Button
                                            onClick={startScreenShare}
                                            className="flex items-center gap-2"
                                        >
                                            <Monitor className="w-4 h-4"/>
                                            Share Screen
                                        </Button>
                                    ) : screenShareUser === userName && (
                                        <Button
                                            onClick={stopScreenShare}
                                            variant="destructive"
                                            className="flex items-center gap-2"
                                        >
                                            <StopCircle className="w-4 h-4"/>
                                            Stop Sharing
                                        </Button>
                                    )}
                                </div>
                                <div className="relative bg-gray-100 rounded-lg aspect-video">
                                    {isScreenSharing ? (
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full rounded-lg"
                                        />
                                    ) : (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center text-gray-500">
                                            No active screen share
                                        </div>
                                    )}
                                    {screenShareUser && (
                                        <div
                                            className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                            {screenShareUser} is sharing
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Video Conference</h2>
                                <div className="space-x-2">
                                    <Button
                                        onClick={toggleVideo}
                                        variant={mediaStatus.video ? "contained" : "outlined"}
                                        startIcon={mediaStatus.video ? <Videocam/> : <VideocamOff/>}
                                    >
                                        {mediaStatus.video ? "Video On" : "Video Off"}
                                    </Button>
                                    <Button
                                        onClick={toggleAudio}
                                        variant={mediaStatus.audio ? "contained" : "outlined"}
                                        startIcon={mediaStatus.audio ? <Mic/> : <MicOff/>}
                                    >
                                        {mediaStatus.audio ? "Audio On" : "Audio Off"}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Local video */}
                                <div className="relative bg-gray-100 rounded-lg aspect-video">
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full rounded-lg"
                                    />
                                    <div
                                        className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                        You
                                    </div>
                                </div>

                                {/* Remote videos */}
                                {Array.from(remoteVideosRef.current.entries()).map(([userId, video]) => (
                                    <div key={userId} className="relative bg-gray-100 rounded-lg aspect-video">
                                        {video}
                                        <div
                                            className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                            {participants.find(p => p.id === userId)?.userName}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <div className="p-4">
                                <h2 className="text-xl font-bold mb-4">Room Chat</h2>
                                <div className="h-[300px] overflow-y-auto mb-4 p-4 space-y-4">
                                    {messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`
                        p-2 rounded-lg 
                        ${message.type === 'system'
                                                ? 'bg-gray-100 text-center text-sm text-gray-600'
                                                : message.sender === userName
                                                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                                                    : 'bg-gray-100 max-w-[80%]'
                                            }
                      `}
                                        >
                                            {message.type === 'user' && (
                                                <div className="text-xs text-gray-600 mb-1">
                                                    {message.sender}
                                                </div>
                                            )}
                                            {message.text}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef}/>
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        className="flex-1"
                                    />
                                    <Button onClick={sendMessage}>
                                        <Send className="w-4 h-4"/>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <div className="p-4">
                                <h2 className="font-bold mb-2">Room Info</h2>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="font-semibold">Room ID: {roomId}</p>
                                    <p className="text-sm text-gray-600">Share this ID with others</p>
                                </div>
                            </div>
                        </Card>

                        {joinRequests.length > 0 && (
                            <Card>
                                <div className="p-4">
                                    <div className="font-bold mb-4 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4"/>
                                        Join Requests
                                    </div>
                                    <div className="space-y-2">
                                        {joinRequests.map(request => (
                                            <div key={request.id}
                                                 className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span>{request.userName}</span>
                                                <div className="space-x-2">
                                                    <Button
                                                        onClick={() => acceptRequest(request)}
                                                        variant="outline"
                                                        className="text-green-600"
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        onClick={() => declineRequest(request.id)}
                                                        variant="outline"
                                                        className="text-red-600"
                                                    >
                                                        Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card>
                            <div className="p-4">
                                <div className="font-bold mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4"/>
                                    Participants ({participants.length})
                                </div>
                                <div className="space-y-2">
                                    {participants.map(participant => (
                                        <div key={participant.id}
                                             className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span>{participant.userName}</span>
                                            {participant.isHost && (
                                                <Crown className="w-4 h-4 text-yellow-500"/>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {errorMessage && (
                <Alert severity="error" style={{marginTop: '1rem'}}>
                    {errorMessage}
                </Alert>
            )}
        </div>
    );
};
export default RoomManagement;