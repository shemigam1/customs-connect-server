import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    id: string;
    user_id: string;
    shipment_id: string;
    message_id: string;
    type: string;
    read: boolean;
    sent_channels: string[];
    created_at: Date;
}

const NotificationSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, index: true },
    shipment_id: { type: String, required: true },
    message_id: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, default: false },
    sent_channels: [{ type: String }],
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
