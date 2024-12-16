import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8686/ws';
let stompClient = null;

const subscribeToTopic = (topic, token, onMessageReceived) => {
    if (!stompClient) {
        console.error('You need to connect first');
        return;
    }

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    stompClient.subscribe(topic, onMessageReceived, headers);
};

const subscribeToUserQueue = (token, username, onUserMessageReceived) => {
    const socket = new SockJS(SOCKET_URL);
    stompClient = Stomp.over(socket);

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    stompClient.connect(
        headers,
        () => {
            subscribeToTopic(
                `/user/${username}/private`,
                token,
                onUserMessageReceived
            );
        },
        (error) => {
            console.error('Error connecting to WebSocket:', error);
        }
    );
};

const disconnect = () => {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    console.log('Disconnected from WebSocket');
};

export const editMessage = (accessToken, messageId, newContent) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    const editMessageRequest = {
        id: messageId,
        content: newContent,
    };

    stompClient.send(
        '/topic/edit/message',
        headers,
        JSON.stringify(editMessageRequest)
    );

    return editMessageRequest;
};

export const sendMessage = (accessToken, content) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    const messageRequest = {
        path: '/user/api/profile',
        method: 'GET',
        payload: null,
    };

    stompClient.send('/topic/route', headers, JSON.stringify(messageRequest));
    return messageRequest;
};

export const deleteMessage = (accessToken, messageId) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    console.log(messageId);

    stompClient.send(
        '/topic/delete/message',
        headers,
        JSON.stringify(messageId)
    );
};

export {subscribeToUserQueue, disconnect};
