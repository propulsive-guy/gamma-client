'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (restaurantId?: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_APP_URL || '', {
            path: '/api/socket',
        });

        socketInstance.on('connect', () => {
            console.log('Connected to socket');
            socketInstance.emit('join-restaurant', restaurantId);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [restaurantId]);

    return socket;
};
