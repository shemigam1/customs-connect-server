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

export interface IBooking {
  name: string;
  email: string;
  date?: string;
  month?: string;
  booking_type: string;
  booking_scope?: "daily" | "monthly";
  slots?: number;
  type_of_booking: string;
  // is_active: boolean;
}
