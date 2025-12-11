import { Socket, Server } from 'socket.io';
import Message from '../../models/message';
import Shipment from '../../models/shipment';

export const handleMessageRead = async (io: Server, socket: Socket, data: any) => {
    try {
        const { message_ids, shipment_id } = data;
        const userId = (socket as any).userId;

        if (!Array.isArray(message_ids) || !shipment_id) return;

        // Update seen_by
        const updateResult = await Message.updateMany(
            {
                id: { $in: message_ids },
                shipment_id,
                'seen_by.user_id': { $ne: userId }
            },
            {
                $push: {
                    seen_by: {
                        user_id: userId,
                        seen_at: new Date()
                    }
                }
            }
        );

        // Reset unread count for this user
        // We assume reading batch of messages implies user opened the chat
        const updateKey = `unread_count_by_user.${userId}`;
        await Shipment.updateOne(
            { _id: shipment_id },
            {
                $set: { [updateKey]: 0 }
            }
        );

        // Broadcast read receipt
        if (updateResult.modifiedCount > 0) {
            socket.to(`shipment:${shipment_id}`).emit('message:read_receipt', {
                message_ids,
                user_id: userId,
                read_at: new Date()
            });
        }

    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};
