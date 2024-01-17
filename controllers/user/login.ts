import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../utils/send";
import getConnection from "../../db/connection";
import { userSchema } from "../../db/schema";
import { verifyPassword } from "../../utils/bcrypt";
import jwt from 'jsonwebtoken';

export default async function login(req: Request, res: Response) {
  try {
    const db = (await getConnection()).model('users', userSchema);

    const user = await db.findOne({
      email: req.data['email']
    });
    if (!user) throw new Error();
    if (!await verifyPassword(req.data['password'], user.password!)) throw new Error();

    // Login success, create JWT for next 6 hours
    const token = jwt.sign({
      email: user.email!,
      role: user.role!
    },
      process.env.JWT_SECRET!,
      {
        expiresIn: "6h"
      }
    )

    sendSuccess(res, {
      'token': token
    })
  } catch (e: any) {
    sendError(res, 400, "Email or password invalid, please check your input.");
  }
}