import React, {useState, useEffect} from 'react';
import {
    subscribeToUserQueue,
    disconnect,
    editMessage,
    sendMessage,
    deleteMessage,
} from './WebSocketService';

const WebSocketComponent = () => {
    const [messages, setMessages] = useState([]);
    const [connectedUser, setConnectedUser] = useState('');
    const [inputUser, setInputUser] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [userOptions, setUserOptions] = useState([]);
    const [newMessageContent, setNewMessageContent] = useState('');

    useEffect(() => {
        setUserOptions([
            {
                value: 'f9a291b0-fc7b-4824-ba76-faed4a167987',
                label: 'john@example.com',
            },
            {
                value: '8a5c1b3f-0e78-43b6-951d-f5a4e8d5c0b3',
                label: 'alice@example.com',
            },
        ]);
    }, []);

    useEffect(() => {
        const onMessageReceived = (message) => {
            const body = JSON.parse(message.body);
            if (body.content) {
                setMessages((prevMessages) => {
                    const existingMessageIndex = prevMessages.findIndex(
                        (msg) => msg.id === body.id
                    );
                    if (existingMessageIndex > -1) {
                        const updatedMessages = [...prevMessages];
                        updatedMessages[existingMessageIndex] = body;
                        return updatedMessages;
                    } else {
                        return [...prevMessages, body];
                    }
                });
            } else if (body.messageId) {
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.id !== body.messageId)
                );
            }
        };

        return () => {
            disconnect();
        };
    }, [accessToken]);

    const handleConnectToUserQueue = () => {
        if (accessToken && inputUser) {
            subscribeToUserQueue(accessToken, inputUser, onUserMessageReceived);
            setConnectedUser(inputUser);
            setInputUser('');
        } else {
            console.error('Access token and username are required.');
        }
    };

    const onUserMessageReceived = (message) => {
        const body = JSON.parse(message.body);
        if (body.content) {
            setMessages((prevMessages) => {
                const existingMessageIndex = prevMessages.findIndex(
                    (msg) => msg.id === body.id
                );
                if (existingMessageIndex > -1) {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[existingMessageIndex] = body;
                    return updatedMessages;
                } else {
                    return [...prevMessages, body];
                }
            });
        } else if (body.messageId) {
            setMessages((prevMessages) =>
                prevMessages.filter((msg) => msg.id !== body.messageId)
            );
        }
    };

    const handleUserSelectChange = (e) => {
        setInputUser(e.target.value);
    };

    const handleNewMessageChange = (e) => {
        setNewMessageContent(e.target.value);
    };

    const handleSendMessage = () => {
        if (accessToken) {
            sendMessage(accessToken, newMessageContent);
            setNewMessageContent('');
        } else {
            console.error('Access token and message content are required.');
        }
    };

    const handleEditMessage = (messageId, newContent) => {
        if (accessToken && messageId && newContent) {
            editMessage(accessToken, messageId, newContent);
        } else {
            console.error(
                'Access token, message ID, and new content are required.'
            );
        }
    };

    const handleDeleteMessage = (messageId) => {
        if (accessToken && messageId) {
            deleteMessage(accessToken, messageId);
        } else {
            console.error('Access token and message ID are required.');
        }
    };

    return (
        <div>
            <h1>WebSocket Messages</h1>
            <ul>
                {messages.map((msg) => (
                    <li key={msg.id}>
                        {msg.content}
                        <button
                            onClick={() =>
                                handleEditMessage(msg.id, 'Updated content')
                            }
                        >
                            Edit
                        </button>
                        <button onClick={() => handleDeleteMessage(msg.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            <div>
                <select value={inputUser} onChange={handleUserSelectChange}>
                    <option value="">Select User</option>
                    {userOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Enter access token"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                />
                <button onClick={handleConnectToUserQueue}>
                    Connect to User Queue
                </button>
                {connectedUser && <p>Connected to {connectedUser}'s queue</p>}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter new message"
                    value={newMessageContent}
                    onChange={handleNewMessageChange}
                />
                <button onClick={handleSendMessage}>Send Message</button>
            </div>
        </div>
    );
};

export default WebSocketComponent;
