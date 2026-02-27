import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    const socket = io(API_URL, { autoConnect: true, withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const emit = (event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  };

  const on = (event: string, handler: (payload: unknown) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event);
  };

  return { connected, emit, on };
}
