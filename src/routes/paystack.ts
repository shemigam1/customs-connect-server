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
