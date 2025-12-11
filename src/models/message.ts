import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
    file_id: string;
    filename: string;
    file_type: string;
    size: number;
    s3_key: string;
    uploaded_at: Date;
}

export interface ISeenBy {
    user_id: string;
    seen_at: Date;
}

export interface IMessage extends Document {
    id: string;
    shipment_id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    body: string;
    attachments: IAttachment[];
    thread_id?: string;
    parent_message_id?: string;
    priority: 'urgent' | 'normal' | 'low';
    message_type: 'user' | 'system' | 'ai_flag' | 'status_update';
    seen_by: ISeenBy[];
    sent_at: Date;
    edited_at?: Date;
    deleted_at?: Date;
    metadata?: any;
}

const AttachmentSchema = new Schema({
    file_id: { type: String, required: true },
    filename: { type: String, required: true },
    file_type: { type: String, required: true },
    size: { type: Number, required: true },
    s3_key: { type: String, required: true },
    uploaded_at: { type: Date, default: Date.now }
});

const SeenBySchema = new Schema({
    user_id: { type: String, required: true },
    seen_at: { type: Date, default: Date.now }
});

const MessageSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    shipment_id: { type: String, required: true, index: true },
    sender_id: { type: String, required: true },
    sender_name: { type: String, required: true },
    sender_role: { type: String, required: true },
    body: { type: String, required: true },
    attachments: [AttachmentSchema],
    thread_id: { type: String, index: true },
    parent_message_id: { type: String },
    priority: {
        type: String,
        enum: ['urgent', 'normal', 'low'],
        default: 'normal'
    },
    message_type: {
        type: String,
        enum: ['user', 'system', 'ai_flag', 'status_update'],
        default: 'user'
    },
    seen_by: [SeenBySchema],
    sent_at: { type: Date, default: Date.now, index: true },
    edited_at: { type: Date },
    deleted_at: { type: Date },
    metadata: { type: Schema.Types.Mixed }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
