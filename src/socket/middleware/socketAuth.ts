import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../../models/user'; // Assuming default export

interface JwtPayload {
    userId: string;
    id?: string;
    // add other fields if known
}

export const socketAuth = async (socket: Socket, next: (err?: Error) => void) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            return next(new Error('Authentication token missing'));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not defined');
            return next(new Error('Server configuration error'));
        }

        const decoded = jwt.verify(token as string, secret) as JwtPayload;

        // Normalize userId check (some systems use sub, id, or userId)
        const userId = decoded.userId || decoded.id;

        if (!userId) {
            return next(new Error('Invalid token payload'));
        }

        // Fetch user details
        const user = await User.findById(userId);
        if (!user) { // || user.status !== 'active' // Add status check if User model supports it
            return next(new Error('User not found or inactive'));
        }

        // Attach user to socket
        (socket as any).userId = user.id;
        (socket as any).userRole = (user as any).role; // Cast to any if role isn't on type yet
        (socket as any).organizationId = (user as any).organization_id;

        next();
    } catch (error) {
        console.error('Socket Auth Error:', error);
        next(new Error('Authentication failed'));
    }
};
