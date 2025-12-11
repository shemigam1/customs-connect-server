import Message from '../models/message';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../socket';

export async function sendStatusUpdateMessage(shipmentId: string, oldStatus: string, newStatus: string, userId: string) {
    const statusDescriptions: any = {
        DRAFT: 'Draft',
        SGD_SUBMITTED: 'SGD Submitted to NICIS',
        PAAR_APPROVED: 'PAAR Approved',
        PAYMENT_RECEIVED: 'Duty Payment Received',
        RISK_GREEN: 'Risk Assessment: Green Channel',
        RISK_YELLOW: 'Risk Assessment: Yellow Channel',
        RISK_RED: 'Risk Assessment: Red Channel',
        INSPECTION_SCHEDULED: 'Inspection Scheduled',
        EXIT_NOTE_ISSUED: 'Exit Note Issued - Ready for Release'
    };

    const message = await Message.create({
        id: uuidv4(),
        shipment_id: shipmentId,
        sender_id: 'system',
        sender_name: 'System',
        sender_role: 'system',
        body: `Status updated: ${statusDescriptions[oldStatus] || oldStatus} → ${statusDescriptions[newStatus] || newStatus}`,
        priority: 'normal',
        message_type: 'status_update',
        seen_by: [],
        sent_at: new Date(),
        metadata: {
            old_status: oldStatus,
            new_status: newStatus,
            updated_by: userId
        }
    });

    try {
        getIO().to(`shipment:${shipmentId}`).emit('message:received', {
            message: message.toJSON()
        });
    } catch (e) {
        console.warn('Socket emit failed', e);
    }
}
