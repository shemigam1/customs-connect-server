export const config = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL || "",
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || "",
  PAYSTACK_URL: process.env.PAYSTACK_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "your_jwt_secret_key",
};
