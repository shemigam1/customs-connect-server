import { Router } from "express";
import axios from "axios";
// import { config } from "..utils/config";
import { config } from "../utils/config";

const { PAYSTACK_SECRET_KEY, PAYSTACK_URL } = config;

export const paymentRouter = Router();

function calculateAmountInKobo(nairaAmount: number): number {
  if (nairaAmount <= 0) return 0;
  return Math.round(nairaAmount * 1000); // Convert naira to kobo
}

/**
 * @openapi
 * /payments/init:
 *  post:
 *     tags:
 *     - Payments
 *     summary: Initialize a payment
 *     description: Initializes a Paystack transaction.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              required:
 *                - email
 *                - amount
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  default: jane.doe@example.com
 *                amount:
 *                  type: number
 *                  default: 1000
 *                  description: Amount in Naira (will be validated to match fixed amount if required)
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authorization URL created
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                     access_code:
 *                       type: string
 *                     reference:
 *                       type: string
 *       400:
 *         description: Invalid amount or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid amount. Amount must be 1000 NGN.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
paymentRouter.post("/init", async (req, res) => {
  try {
    const { email, amount } = req.body;
    // console.log(req.body);

    const amountInKobo = calculateAmountInKobo(1000);
    if (calculateAmountInKobo(amount) != amountInKobo) {
      return res
        .status(400)
        .json({ error: "Invalid amount. Amount must be 1000 NGN." });
    }
    const options = {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: { email, amount },
      port: 443,
    };

    const url = `${PAYSTACK_URL}/transaction/initialize`;
    console.log(PAYSTACK_SECRET_KEY);

    const response = await axios.post(url, options.body, {
      headers: options.headers,
    });
    const data = response.data;
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error initializing transaction:", error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @openapi
 * /payments/verify:
 *  post:
 *     tags:
 *     - Payments
 *     summary: Verify a payment
 *     description: Verifies a Paystack transaction reference.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              required:
 *                - reference
 *              properties:
 *                reference:
 *                  type: string
 *                  default: "T1234567890"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: success
 *                     reference:
 *                       type: string
 *                     amount:
 *                       type: number
 *       400:
 *         description: Invalid transaction or missing reference
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid Transaction
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
paymentRouter.post("/verify", async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) {
      return res.status(400).json({ error: "Invalid Transaction" });
    }
    const options = {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      port: 443,
    };

    const url = `${PAYSTACK_URL}/transaction/verify/${reference}`;
    // console.log(PAYSTACK_SECRET_KEY);

    const response = await axios.get(url, {
      headers: options.headers,
    });
    const data = response.data;
    console.log(data);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error verifying transaction:", error);
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// export default paymentRouter;
