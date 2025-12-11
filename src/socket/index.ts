import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Server as HttpServer } from 'http';
import { socketAuth } from './middleware/socketAuth';
import { connectionHandler } from './handlers/connectionHandler';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    // Redis Adapter for scaling
    if (process.env.REDIS_URL) {
        try {
            const pubClient = new Redis(process.env.REDIS_URL);
            const subClient = pubClient.duplicate();

            pubClient.on('error', (err) => console.error('Redis Pub Error', err));
            subClient.on('error', (err) => console.error('Redis Sub Error', err));

            io.adapter(createAdapter(pubClient, subClient));
            console.log('Socket.IO Redis adapter configured');
        } catch (err) {
            console.error('Failed to configure Redis adapter', err);
        }
    } else {
        console.log('Socket.IO running with default memory adapter');
    }

    // Auth Middleware
    io.use(socketAuth);

    // Connection Handler
    io.on('connection', (socket) => connectionHandler(io, socket));

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
