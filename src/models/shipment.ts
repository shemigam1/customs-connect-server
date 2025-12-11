import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipant {
    user_id: string;
    role: string;
    joined_at: Date;
}

export interface IShipment extends Document {
    // PRD & Messaging Core
    bl_number: string;
    trackingNumber?: string; // Alias or Legacy

    // Parties
    sender?: {
        name: string;
        address: string;
        phoneNumber: string;
    };
    recipient?: {
        name: string;
        address: string;
        phoneNumber: string;
    };
    created_by?: string;
    assigned_officer_id?: string;
    officersAssigned?: mongoose.Types.ObjectId[]; // Legacy/Alt
    orgId?: string;

    // Cargo Details
    weight?: number;
    description?: string;
    items?: mongoose.Types.ObjectId[];
    form_m_no?: string;
    containers?: string[]; // PRD

    // Route & Status
    status: string;
    currentLocation?: string;
    origin_country?: string;
    originCountry?: string; // Legacy/Alt
    destination_port?: string;
    destination_country?: string; // Legacy/Alt
    destinationCountry?: string; // Legacy/Alt
    estimatedDeliveryDate?: Date;

    // Financials
    shippingValue?: number;
    shippingToll?: number;

    // Messaging & Compliance
    compliance_score?: number;
    risk_channel_estimated?: string;
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
    // IDs
    bl_number: { type: String, unique: true, sparse: true }, // PRD Primary
    trackingNumber: { type: String, unique: true, sparse: true }, // Legacy Primary

    // Parties
    sender: {
        name: { type: String },
        address: { type: String },
        phoneNumber: { type: String },
    },
    recipient: {
        name: { type: String },
        address: { type: String },
        phoneNumber: { type: String },
    },
    created_by: { type: String, ref: 'User' },
    assigned_officer_id: { type: String, ref: 'User' },
    officersAssigned: [{ type: Schema.Types.ObjectId, ref: "User" }],
    orgId: { type: String },

    // Cargo
    weight: { type: Number },
    description: { type: String },
    items: [{ type: Schema.Types.ObjectId, ref: "ShipmentItem" }],
    form_m_no: { type: String },
    containers: [{ type: String }],

    // Route & Status
    status: { type: String, default: 'draft' },
    currentLocation: { type: String },
    origin_country: { type: String },
    originCountry: { type: String }, // Legacy compatibility
    destination_port: { type: String },
    destination_country: { type: String },
    destinationCountry: { type: String }, // Legacy compatibility
    estimatedDeliveryDate: { type: Date },

    // Financials
    shippingValue: { type: Number },
    shippingToll: { type: Number },

    // Messaging & Compliance
    compliance_score: { type: Number },
    risk_channel_estimated: { type: String },
    last_message_at: { type: Date },
    unread_count_by_user: {
        type: Map,
        of: Number,
        default: {}
    },
    participants: [ParticipantSchema]

}, { timestamps: true });

export default mongoose.model<IShipment>('Shipment', ShipmentSchema);
