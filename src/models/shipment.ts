import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
    user_id: string;
    role: string;
    joined_at: Date;
}

export interface IShipment extends Document {
    bl_number?: string;
    created_by?: string;
    assigned_officer_id?: string;

    // Messaging fields
    last_message_at?: Date;
    unread_count_by_user?: Map<string, number>;
    participants: IParticipant[];
}

const ParticipantSchema = new Schema({
    user_id: { type: String, required: true, ref: 'User' },
    role: { type: String, required: true },
    joined_at: { type: Date, default: Date.now }
});

const ShipmentSchema: Schema = new Schema({
    bl_number: { type: String },
    created_by: { type: String, ref: 'User' },
    assigned_officer_id: { type: String, ref: 'User' },

    last_message_at: { type: Date },
    unread_count_by_user: {
        type: Map,
        of: Number,
        default: {}
    },
    participants: [ParticipantSchema]
}, { timestamps: true });

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);
