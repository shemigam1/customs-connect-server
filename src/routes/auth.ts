import { Router, Request, Response, NextFunction } from "express";
import { comparePassword } from "../utils/hash";
import { ResultFunction, signJwt } from "../utils/utils";
import { LoginData } from "../utils/types";
import User from "../models/user";

const authRouter = Router();

/**
 * @openapi
 * /auth/login:
 *  post:
 *     tags:
 *     - Auth
 *     summary: Login a user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              required:
 *                - email
 *                - password
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                  default: jane.doe@example.com
 *                password:
 *                  type: string
 *                  format: password
 *                  default: stringPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: login successful
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: invalid email or password
 *                 code:
 *                   type: integer
 *                   example: 400
 *       422:
 *         description: Unprocessable entity (Token generation failed)
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
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
    } else {
      const response = ResultFunction(
        false,
        "invalid email or password",
        400,
        null
      );
      return res.status(response.code).json(response);
    }
  } catch (error) {
    const response = ResultFunction(false, "something went wrong", 500, null);
    return res.status(response.code).json(response);
  }
});

/**
 * @openapi
 * /auth/signup:
 *  post:
 *     tags:
 *     - Auth
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *              type: object
 *              required:
 *                - name
 *                - email
 *                - password
 *                - phoneNumber
 *                - role
 *                - orgId
 *              properties:
 *                name:
 *                  type: string
 *                  default: Jane Doe
 *                email:
 *                  type: string
 *                  format: email
 *                  default: jane.doe@example.com
 *                password:
 *                  type: string
 *                  format: password
 *                  default: stringPassword123
 *                phoneNumber:
 *                  type: string
 *                  default: "+1234567890"
 *                role:
 *                  type: string
 *                  default: "admin"
 *                orgId:
 *                  type: string
 *                  default: "org-123"
 *     responses:
 *       201:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: signup successful
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   description: Created user object (excluding password)
 *       400:
 *         description: Missing required fields or user already exists
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
      const phoneNumber = req.body.phoneNumber;
      const role = req.body.role;
      const orgId = req.body.orgId;

      if (!name || !email || !password || !phoneNumber || !role || !orgId) {
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
          await User.create({ name, email, password, phoneNumber, role, orgId })
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
