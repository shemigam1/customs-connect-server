import mongoose, { Schema } from "mongoose";
import { IShipmentDocument } from "../utils/types";

const ShipmentDocumentSchema: Schema = new Schema<IShipmentDocument>({
  shipmentId: { type: Schema.Types.ObjectId, ref: "Shipment", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  documentType: {
    type: String,
    enum: [
      "proforma_invoice",
      "ccvo",
      "commercial_invoice",
      "bill_of_lading",
      "airway_bill",
      "packing_list",
      "form_m",
      "sgd",
      "insurance_certificate",
      "import_duty_payment_evidence",
      "soncap_certificate",
      "paar",
      "nafdac_certificate",
      "product_certificate_of_conformity",
      "quota_allocation_certificate",
      "radiation_certificate",
    ],
    required: true,
  },
  documentUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: true,
  },
});

const ShipmentDocument = mongoose.model<IShipmentDocument>(
  "ShipmentDocument",
  ShipmentDocumentSchema
);
export default ShipmentDocument;
