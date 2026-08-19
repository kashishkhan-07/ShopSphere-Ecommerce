import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

const socket = io(socketUrl, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

export default socket;