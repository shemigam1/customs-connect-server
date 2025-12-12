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
            await sendSMSStub(recipient.phoneNumber, `Urgent message in shipment ${shipment.bl_number}`);
            await sendEmailStub(recipient.email, `New urgent message for shipment ${shipment.bl_number}`, message.body);
        }
    }
}

export async function sendDeadlineAlert(shipmentId: string, deadlineType: string, daysRemaining: number) {
    const shipment: any = await Shipment.findOne({ _id: shipmentId }).populate('participants.user_id');
    if (!shipment) return;

    const message = `Alert: ${deadlineType} is due in ${daysRemaining} days for Shipment ${shipment.bl_number}`;

    // Notify all participants
    for (const p of shipment.participants) {
        if (p.user_id) {
            await Notification.create({
                id: uuidv4(),
                user_id: p.user_id.id,
                shipment_id: shipmentId,
                type: 'deadline',
                sent_channels: ['in-app', 'email']
            });
            await sendEmailStub(p.user_id.email, `Deadline Alert: ${deadlineType}`, message);
        }
    }
}

async function sendSMSStub(phone: string, text: string) {
    console.log(`[SMS Stub] To: ${phone} | Body: ${text}`);
    // Integration point for Twilio
}

async function sendEmailStub(email: string, subject: string, body: string) {
    console.log(`[Email Stub] To: ${email} | Subject: ${subject} | Body: ${body}`);
    // Integration point for SendGrid/SMTP
}
