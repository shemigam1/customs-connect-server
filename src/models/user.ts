import mongoose, { Schema } from "mongoose";
import { ISignup } from "../utils/types";
import { comparePassword, hashPassword } from "../utils/hash";

const UserSchema: Schema = new Schema<ISignup>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  role: { type: String, required: true },
  orgId: { type: String, required: true },
  password: { type: String, required: true },
});

UserSchema.pre("save", async function (next) {
  const hash = await hashPassword(this.password);
  this.password = hash;

  next();
});

UserSchema.methods.isValidPassword = async function (password: string) {
  const user = this;
  return comparePassword(password, user.password);
};

const User = mongoose.model<ISignup>("User", UserSchema);
export default User;
