import { Socket, Server } from 'socket.io';
import Message from '../../models/message';
import Shipment from '../../models/shipment';
import User from '../../models/user';
import { v4 as uuidv4 } from 'uuid';
import sanitizeHtml from 'sanitize-html';

export const handleSendMessage = async (io: Server, socket: Socket, data: any) => {
    try {
        const {
            shipment_id,
            body,
            attachments = [],
            thread_id = null,
            parent_message_id = null,
            priority = 'normal'
        } = data;

        const userId = (socket as any).userId;

        // Verify access by checking if user participates in the shipment
        const shipment: any = await Shipment.findOne({
            _id: shipment_id,
            $or: [
                { created_by: userId },
                { assigned_officer_id: userId },
                { 'participants.user_id': userId }
            ]
        });

        if (!shipment) {
            return socket.emit('error', {
                message: 'Access denied to this shipment'
            });
        }

        const user = await User.findById(userId);
        if (!user) return;

        // Create message
        const message = await Message.create({
            id: uuidv4(),
            shipment_id,
            sender_id: userId,
            sender_name: (user as any).name || 'User',
            sender_role: (user as any).role,
            body: sanitizeHtml(body),
            attachments,
            thread_id,
            parent_message_id,
            priority,
            message_type: 'user',
            seen_by: [{
                user_id: userId,
                seen_at: new Date()
            }],
            sent_at: new Date()
        });

        // Update shipment unread counts
        const update: any = {
            last_message_at: new Date()
        };

        // Logic: Retrieve current map or obj, increment checks
        // Using $inc for atomicity is better if possible, but map keys are dynamic.
        // We can construct $inc object
        const incUpdates: any = {};

        if (shipment.participants) {
            shipment.participants.forEach((p: any) => {
                const pId = p.user_id.toString();
                if (pId !== userId) {
                    incUpdates[`unread_count_by_user.${pId}`] = 1;
                }
            });
        }

        // Determine update operation
        const updateOp: any = { $set: update };
        if (Object.keys(incUpdates).length > 0) {
            updateOp.$inc = incUpdates;
        }

        await Shipment.updateOne({ _id: shipment_id }, updateOp);

        // Broadcast
        io.to(`shipment:${shipment_id}`).emit('message:received', {
            message: message.toJSON()
        });

        // Acknowledge
        socket.emit('message:sent', {
            message_id: message.id,
            sent_at: message.sent_at
        });

    } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', {
            message: 'Failed to send message',
            code: 'MESSAGE_SEND_FAILED'
        });
    }
};
