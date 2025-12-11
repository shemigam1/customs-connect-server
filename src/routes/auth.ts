import { Router, Request, Response, NextFunction } from "express";
import { comparePassword } from "../utils/hash";
import { ResultFunction, signJwt } from "../utils/utils";
import { LoginData } from "../utils/types";
import User from "../models/user";

const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
      email: email,
    });
    if (user) {
      // console.log(user.password.length);

      const passwordMatch = await comparePassword(user.password, password);
      if (!passwordMatch) {
        const response = ResultFunction(
          false,
          "invalid email or password",
          400,
          null
        );
        return res.status(response.code).json(response);
      }
      const jwtToken = signJwt(user);
      if (!jwtToken) {
        const response = ResultFunction(
          false,
          "unprocessable entity",
          422,
          null
        );
        return res.status(response.code).json(response);
      }
      const data: LoginData = {
        token: jwtToken,
        user: {
          id: user.id,
          email,
          name: user.name,
        },
      };
      const response = ResultFunction(true, "login successful", 200, data);
      return res.status(response.code).json(response);
    }
  } catch (error) {
    const response = ResultFunction(false, "something went wrong", 500, null);
    return res.status(response.code).json(response);
  }
});

authRouter.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;

      if (!name || !email || !password) {
        const response = ResultFunction(
          false,
          "missing required fields",
          400,
          null
        );
        return res.status(response.code).json(response);
      }

      const user = await User.findOne({ email: email });
      if (user) {
        const response = ResultFunction(
          false,
          "user exists already",
          400,
          null
        );
        return res.status(response.code).json(response);
      }

      try {
        const newUser = (
          await User.create({ name, email, password })
        ).toObject();
        const { password: _pw, ...other } = newUser;
        const response = ResultFunction(true, "signup successful", 201, other);
        return res.status(response.code).json(response);
      } catch (error) {
        console.error(error);
        const response = ResultFunction(false, "signup failed", 400, null);
        return res.status(response.code).json(response);
      }
    } catch (error: any) {
      const response = ResultFunction(false, "something went wrong", 500, null);
      return res.status(response.code).json(response);
    }
  }
);

export default authRouter;
