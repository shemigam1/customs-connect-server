import Message from '../models/message';
import { v4 as uuidv4 } from 'uuid';
import { getIO } from '../socket';

export async function sendAIFlagMessage(shipmentId: string, aiFlag: any) {
    const systemMessage = await Message.create({
        id: uuidv4(),
        shipment_id: shipmentId,
        sender_id: 'system',
        sender_name: 'AI Compliance Checker',
        sender_role: 'system',
        body: formatAIFlagMessage(aiFlag),
        priority: aiFlag.type === 'error' ? 'urgent' : 'normal',
        message_type: 'ai_flag',
        seen_by: [],
        sent_at: new Date(),
        metadata: {
            flag_id: aiFlag.id,
            flag_type: aiFlag.type,
            confidence: aiFlag.confidence
        }
    });

    try {
        getIO().to(`shipment:${shipmentId}`).emit('message:received', {
            message: systemMessage.toJSON()
        });
    } catch (e) {
        console.warn('Socket not initialized or failed to emit', e);
    }

    return systemMessage;
}

function formatAIFlagMessage(aiFlag: any) {
    const templates: any = {
        hs_mismatch: `⚠️ Potential HS Code Issue: ${aiFlag.details}`,
        valuation_issue: `💰 Valuation Alert: ${aiFlag.details}`,
        missing_permit: `📋 Missing Permit: ${aiFlag.details}`,
        document_incomplete: `📄 Document Issue: ${aiFlag.details}`
    };

    return templates[aiFlag.type] || `⚠️ ${aiFlag.details}`;
}
