
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    actor_id: string; // User ID or System
    action: string; // e.g., 'SHIPMENT_CREATED', 'STATUS_UPDATE', 'ANCHOR_CREATED'
    object_type: string; // 'Shipment', 'Document'
    object_id: string;
    metadata?: any;
    timestamp: Date;
    ip_address?: string;
}

const AuditLogSchema: Schema = new Schema({
    actor_id: { type: String, required: true },
    action: { type: String, required: true },
    object_type: { type: String, required: true },
    object_id: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    ip_address: { type: String }
}, { timestamps: true });

// Optimize queries by object_id (view history of shipment) and actor_id
AuditLogSchema.index({ object_id: 1, timestamp: -1 });
AuditLogSchema.index({ actor_id: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
