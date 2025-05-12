import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { secret } from "..";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, secret!);
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }
    next();
  } catch (error: any) {
    return res
      .status(401)
      .json({ error: "Invalid token", details: error.message });
  }
};
