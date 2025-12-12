import mongoose, { Schema } from "mongoose";
import { IShipmentItem } from "../utils/types";

const ShipmentItemSchema: Schema = new Schema<IShipmentItem>({
  shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment" },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  weight: { type: Number, required: true },
  description: { type: String, required: true },
  sku: { type: String },
  hs_code: { type: String },
  value: { type: Number },
  currency: { type: String, default: 'NGN' }
});

const ShipmentItem = mongoose.model<IShipmentItem>(
  "ShipmentItem",
  ShipmentItemSchema
);
export default ShipmentItem;
