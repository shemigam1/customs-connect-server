import Shipment from '../models/shipment';
import Notification from '../models/notification';
import { v4 as uuidv4 } from 'uuid';

export async function sendMessageNotifications(shipmentId: string, message: any) {
    // Get all participants except sender
    const shipment: any = await Shipment.findOne({ _id: shipmentId })
        .populate('participants.user_id');

    if (!shipment) return;

    const recipients = shipment.participants
        .filter((p: any) => p.user_id && p.user_id.id !== message.sender_id)
        .map((p: any) => p.user_id);

    for (const recipient of recipients) {
        // Check if user is online in shipment (Skipping accurate online check for now, assuming all "offline" for notification purposes or just always creating in-app)
        // Real implementation would check Redis/Socket presence.

        // Always create in-app notification
        await Notification.create({
            id: uuidv4(),
            user_id: recipient.id,
            shipment_id: shipmentId,
            message_id: message.id,
            type: message.priority === 'urgent' ? 'urgent' : 'new_message',
            sent_channels: ['in-app']
        });

        // SMS/Email Logic Stub
        if (message.priority === 'urgent') {
            // await sendSMS(...);
            console.log(`[Stub] Sending SMS to ${recipient.id}`);
        }
    }
}
