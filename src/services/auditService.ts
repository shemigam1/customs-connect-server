
import AuditLog from "../models/auditLog";
import { v4 as uuidv4 } from 'uuid';

export class AuditService {

    /**
     * Record an action in the immutable audit log
     */
    async logAction(
        actorId: string,
        action: string,
        objectType: string,
        objectId: string,
        metadata: any = {},
        ipAddress?: string
    ) {
        try {
            await AuditLog.create({
                actor_id: actorId,
                action: action,
                object_type: objectType,
                object_id: objectId,
                metadata: metadata,
                ip_address: ipAddress,
                timestamp: new Date()
            });
            console.log(`AUDIT: [${action}] by ${actorId} on ${objectType}:${objectId}`);
        } catch (error) {
            console.error("Failed to write audit log:", error);
            // In a real system, we might fail hard or queue this for retry
        }
    }

    /**
     * Retrieve audit history for an object
     */
    async getHistory(objectType: string, objectId: string) {
        return await AuditLog.find({ object_type: objectType, object_id: objectId })
            .sort({ timestamp: -1 })
            .limit(100);
    }
}

export default new AuditService();
