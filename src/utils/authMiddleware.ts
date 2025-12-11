import { NextFunction, Request, Response } from "express";
import { ResultFunction, verifyJwt } from "./utils";
import User from "../models/user";
import { JsonWebTokenError, JwtPayload } from "jsonwebtoken";

const authMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // extract auth header
  const authorization = req.headers.authorization;
  const response = ResultFunction(false, "invalid or missing token", 401, null);

  if (!authorization) {
    return res.status(response.code).json(response);
  }

  // check if token is bearer token

  if (authorization.startsWith("Bearer ") === false) {
    return res.status(response.code).json(response);
  }

  const token = authorization.split(" ")[1];
  // extract jwt token
  if (!token) {
    return res.status(response.code).json(response);
  }
  // console.log('token got here');

  // verify jwt token
  const payload = verifyJwt(token);
  if (payload instanceof JsonWebTokenError) {
    // if it's an instance of JsonWebTokenError then something was wrong with the token
    // check how JsonWebTokenError is handled in error handler
    return next(payload);
  }
  // console.log('token got verified');

  const id = (payload as JwtPayload)._id;
  // console.log(id);

  // find user and add to res object
  const user = await User.findOne({ _id: id });
  if (user) {
    const currentUser = {
      id: id,
      email: user.email,
      name: user.name,
    };
    res.locals.user = currentUser;
  }
  // console.log('token got into res.locals');

  next();
};

export default authMiddleWare;
