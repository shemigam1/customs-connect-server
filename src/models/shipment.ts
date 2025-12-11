import mongoose, { Schema } from "mongoose";
import { IShipment } from "../utils/types";

const ShipmentSchema: Schema = new Schema<IShipment>(
  {
    trackingNumber: { type: String, required: true, unique: true },
    sender: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    recipient: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    carrier: { type: String, required: true },
    weight: { type: Number, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    currentLocation: { type: String, required: true },
    originCountry: { type: String, required: true },
    destinationCountry: { type: String, required: true },
    estimatedDeliveryDate: { type: Date, required: true },
    orgId: { type: String, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "ShipmentItem" }],
    shippingValue: { type: Number },
    shippingToll: { type: Number },
    officersAssigned: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Shipment = mongoose.model<IShipment>("Shipment", ShipmentSchema);
export default Shipment;
