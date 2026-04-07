import { useEffect, useRef, useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Conditionally creates a WebSocket connection.
 * Only connects when type is 'pvp' — PVE battles create no socket.
 */
export function useWebSocket(type: 'pve' | 'pvp' = 'pve') {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (type !== 'pvp') return;

    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(API_URL, { autoConnect: true, withCredentials: true });
      socketRef.current = socket;
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [type]);

  const emit = useCallback((event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const on = useCallback((event: string, handler: (payload: unknown) => void) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event);
  }, []);

  return { connected, emit, on };
}
