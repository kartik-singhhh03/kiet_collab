import { io } from 'socket.io-client';

const API = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function createSocket(token) {
  const socket = io(API, {
    transports: ['websocket'],
    auth: { token }
  });
  return socket;
}
