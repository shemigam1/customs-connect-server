import { Schema } from "mongoose";

export interface ILogin {
  email: string;
  password: string;
}

export type LoginData = {
  user: {
    id: Schema.Types.ObjectId | string;
    email: string;
    name: string;
  };
  token: string;
};

export interface ISignup {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  orgId: string;
  password: string;
}

// export type SignupData = {
//   user: {
//     name: string;
//     email: string;
//     password: string;
//   };
//   // name: string;
// };

export interface IShipment {
  trackingNumber: string;
  sender: {
    name: string;
    address: string;
    phoneNumber: string;
  };
  recipient: {
    name: string;
    address: string;
    phoneNumber: string;
  };
  carrier: string;
  weight: number;
  description: string;
  status: string;
  currentLocation: string;
  originCountry: string;
  destinationCountry: string;
  createdDate: Date;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  shippingCost: number;
  orgId: string;
  items: Schema.Types.ObjectId[];
  shippingValue?: number;
  shippingToll?: number;
  officersAssigned?: Schema.Types.ObjectId[];
}

export interface IShipmentItem {
  shipmentId: Schema.Types.ObjectId;
  name: string;
  quantity: number;
  weight: number;
  description: string;
  sku?: string;
}

export interface IShipmentDocument {
  shipmentId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  documentType: string;
  documentUrl: string;
  uploadedAt: Date;
  status: string;
}
