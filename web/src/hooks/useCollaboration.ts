import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

export interface UserCursor {
    id: string;
    name: string;
    color: string;
    x: number;
    y: number;
}

export const useCollaboration = (username: string | null) => {
    const socketRef = useRef<Socket | null>(null);
    const [cursors, setCursors] = useState<UserCursor[]>([]);
    const [activeUsers, setActiveUsers] = useState<UserCursor[]>([]);

    useEffect(() => {
        if (!username) return;

        // Initialize Socket
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnectionAttempts: 5
        });
        socketRef.current = socket;

        // Connect & Join
        socket.on('connect', () => {
            console.log('Connected to collaboration server');
            socket.emit('join', {
                username,
                color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
            });
        });

        // Event Listeners
        socket.on('sync_users', (users: UserCursor[]) => {
            setActiveUsers(users);
        });

        socket.on('user_joined', (user: UserCursor) => {
            setActiveUsers(prev => [...prev, user]);
        });

        socket.on('user_left', ({ sid }: { sid: string }) => {
            setActiveUsers(prev => prev.filter(u => u.id !== sid));
            setCursors(prev => prev.filter(u => u.id !== sid));
        });

        socket.on('cursor_update', (data: UserCursor) => {
            setCursors(prev => {
                const existing = prev.find(c => c.id === data.id);
                if (existing) {
                    return prev.map(c => c.id === data.id ? data : c);
                }
                return [...prev, data];
            });
        });

        // Cleanup
        return () => {
            socket.disconnect();
        };
    }, [username]);

    // Helper to broadcast own movement
    const sendCursorMove = (x: number, y: number) => {
        if (socketRef.current) {
            // Rate limit/throttle could go here
            socketRef.current.emit('cursor_move', { x, y });
        }
    };

    return { cursors, activeUsers, sendCursorMove };
};
