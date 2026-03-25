import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { API_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Initialize Socket outside component to prevent re-creation
// Ensure we use the base URL (stripe '/api' if present)
const SOCKET_URL = API_URL.replace('/api', '');

const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

export const SocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // Connect on mount
        if (!socket.connected) {
            socket.connect();
        }

        function onConnect() {
            console.log('✅ Socket Connected:', socket.id);
            setIsConnected(true);
        }

        function onDisconnect() {
            console.log('❌ Socket Disconnected');
            setIsConnected(false);
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            // socket.disconnect(); // Keep alive for now
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
