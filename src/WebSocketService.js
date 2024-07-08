import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = 'http://localhost:8383/ws';
let stompClient = null;

const connect = (token, onMessageReceived) => {
  const socket = new SockJS(SOCKET_URL);
  stompClient = Stomp.over(socket);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  stompClient.connect(headers, () => {
    console.log('Connected to WebSocket');
    stompClient.subscribe('/topic/public', onMessageReceived);
  }, error => {
    console.error('Error connecting to WebSocket:', error);
  });
};

const subscribeToUserQueue = (token, username, onUserMessageReceived) => {
  const socket = new SockJS(SOCKET_URL);
  stompClient = Stomp.over(socket);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  stompClient.connect(headers, () => {
    console.log('Connected to WebSocket');
    stompClient.subscribe(`/user/${username}/private`, onUserMessageReceived);
  }, error => {
    console.error('Error connecting to WebSocket:', error);
  });
};

const disconnect = () => {
  if (stompClient !== null) {
    stompClient.disconnect();
  }
  console.log('Disconnected from WebSocket');
};


// WebSocketService.js
export const editMessage = (accessToken, messageId, newContent) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    const editMessageRequest = {
        id: messageId,
        content: newContent,
    };

    stompClient.send('/topic/edit/message', headers, JSON.stringify(editMessageRequest));

    return editMessageRequest;
};


export const sendMessage = (accessToken, content) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    const messageRequest = {
        content: content,
        conversationId: 'f2a2b3c4-d5e6-7f8a-9b0c-2d2e3f4a5b6c',
        parentMessageId: null
    };

    stompClient.send('/topic/send/message', headers, JSON.stringify(messageRequest));
    return messageRequest;
};

export const deleteMessage = (accessToken, messageId) => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    console.log(messageId);

    stompClient.send('/topic/delete/message', headers, JSON.stringify(messageId));
};



export { connect, subscribeToUserQueue, disconnect };
