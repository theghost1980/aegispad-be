import { Request, Response } from "express";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database";

const getStatus = async (req: Request, res: Response) => {
  try {
    const now = await sequelize.query("SELECT NOW()", {
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      serverTime: now[0],
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      env: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      db: "connected",
    });
  } catch (err) {
    console.error("Error in status check:", err);
    res.status(500).json({
      success: false,
      error: (err as Error).message,
    });
  }
};

export const StatusController = {
  getStatus,
};
