import express, { Request, Response, NextFunction } from "express";
import { config } from "./utils/config";
import swaggerDocs from "./utils/swagger";

import conn from "./utils/conn";

import cors from "cors";
import authRouter from "./routes/auth";
import { paymentRouter } from "./routes/paystack";
import messagesRouter from "./routes/messages";
import { initSocket } from "./socket";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * @openapi
 * /health:
 *  get:
 *     tags:
 *     - Health
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// app.use("/", bookingRouter);

app.use("/payments", paymentRouter);
app.use("/auth", authRouter);
app.use("/", messagesRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Start server
const server = app.listen(config.PORT, async () => {
  await conn;
  console.log(`http://localhost:${config.PORT}`);
  swaggerDocs(app, Number(config.PORT));
});

initSocket(server);
