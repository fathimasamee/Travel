import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import prisma from "../config/prisma";

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Authentication required. No token provided." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ success: false, message: "Invalid or expired access token." });
      return;
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, isVerified: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User account no longer exists." });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal authentication error." });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    next();
  } catch (error) {
    next();
  }
};
