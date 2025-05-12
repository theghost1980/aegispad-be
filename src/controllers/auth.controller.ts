import { Signature } from "@hiveio/dhive";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { secret } from "..";
import { getAccountByUsername } from "../api/DHive.api";
import { admins } from "../constants/admins";
import SessionLog from "../models/session_logs.model";
import User from "../models/user.model";
import { AuthUtils } from "../utils/auth.utils";
import { AppLogger } from "../utils/logger.util";

const pendingChallenges: Record<string, string> = {};

const issueChallenge = (req: Request, res: Response) => {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(403).json({ error: "Username required!" });
  }

  getAccountByUsername(username)
    .then((result) => {
      if (!result) return res.json({ error: "Not valid Hive Account!" });
    })
    .catch((e) => {
      return res.json({ error: "Internal Server Error" });
    });

  const challenge = AuthUtils.generateChallenge(username);
  pendingChallenges[username] = challenge;

  return res.json({ challenge });
};

const verifySignature = async (req: Request, res: Response) => {
  const { username, signature } = req.body;

  const challenge = pendingChallenges[username];

  if (!challenge) {
    return res.status(400).json({ error: "No challenge found for this user." });
  }

  try {
    // Convertir firma en buffer y verificar formato
    let signatureBuffer: Buffer;
    try {
      signatureBuffer = Buffer.from(signature, "hex");
      if (signatureBuffer.length !== 65) {
        throw new Error("Signature buffer has incorrect length.");
      }
    } catch (bufferError: any) {
      return res.status(400).json({ error: "Invalid signature format." });
    }
    const dhiveSig = Signature.fromBuffer(signatureBuffer);

    // Crear hash del challenge
    const challengeHash = crypto
      .createHash("sha256")
      .update(challenge)
      .digest();

    // Recuperar clave pública desde firma
    const recoveredPubKey = dhiveSig.recover(challengeHash);

    // Obtener cuenta de Hive
    const account = await getAccountByUsername(username);
    if (!account) {
      return res
        .status(404)
        .json({ error: "User account not found on the blockchain." });
    }

    const userPostingKeys = account.posting?.key_auths?.map(([keyOrPubKey]) =>
      keyOrPubKey.toString()
    );

    const recoveredPubKeyString = recoveredPubKey.toString();

    if (!userPostingKeys || !userPostingKeys.includes(recoveredPubKeyString)) {
      return res.status(401).json({
        error:
          "Authentication failed: Signature does not match user's posting authority.",
      });
    }

    // ✅ Autenticación exitosa
    delete pendingChallenges[username];

    let user = await User.findOne({ where: { hive_wallet: username } });
    const role: "admin" | "user" = admins.includes(username) ? "admin" : "user";

    if (!user) {
      user = await User.create({
        hive_username: username,
        hive_wallet: username,
        role,
        is_active: true,
      });
    }

    // Generar token incluyendo el rol real desde la BD
    const accessToken = jwt.sign({ username, role: user.role }, secret!, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ username, role: user.role }, secret!, {
      expiresIn: "7d",
    });

    // Actualizar usuario con refreshToken y last_login
    user.refresh_token = refreshToken;
    user.last_login = new Date();
    await user.save();

    // Crear log de sesión
    await SessionLog.create({
      user_id: user.id,
      login_time: new Date(),
      ip_address: req.ip || "not_registered",
      user_agent: req.headers["user-agent"] || "not_registered",
      session_token: accessToken,
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      role: user.role,
    });
  } catch (err: any) {
    console.error("Error during authentication verification process:", err);
    return res.status(500).json({
      error: "Server error during verification process.",
      details: err.message,
    });
  }
};

const validateToken = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    AppLogger.warn(
      "Token validation failed: Authorization header missing or malformed."
    );
    return res
      .status(401)
      .json({ success: false, message: "Authorization token required" });
  }

  if (!secret) {
    AppLogger.error(
      "JWT Secret is not configured on the backend! Critical error."
    );
    return res
      .status(500)
      .json({ success: false, message: "Server configuration error" });
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      AppLogger.error("Token validation failed:", {
        message: err.message,
        name: err.name,
      });
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const username = decoded.username;

    if (!username || typeof username !== "string") {
      AppLogger.error(
        "Token validated, but payload is missing or has invalid username format.",
        decoded
      );
      return res
        .status(500)
        .json({ success: false, message: "Token payload invalid" });
    }

    AppLogger.info(`Token validated successfully for user: "${username}".`);
    res.status(200).json({ success: true, username: username });
  });
};

const refreshTokenHandler = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Missing refresh token." });

  try {
    const decoded: any = jwt.verify(refreshToken, secret!);
    const user = await User.findOne({
      where: { hive_wallet: decoded.username },
    });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    const newAccessToken = jwt.sign(
      { username: user.hive_wallet, role: user.role },
      secret!,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: "Token expired or invalid." });
  }
};

const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required." });
  }

  try {
    const decoded: any = jwt.verify(refreshToken, secret!);
    const username = decoded.username;

    // Buscar al usuario y eliminar el refreshToken
    const user = await User.findOne({ where: { hive_wallet: username } });

    if (!user || user.refresh_token !== refreshToken) {
      return res
        .status(403)
        .json({ error: "Invalid token or user not found." });
    }

    user.refresh_token = null;
    await user.save();

    return res.json({
      success: true,
      message: "User logged out successfully.",
    });
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

export const AuthController = {
  issueChallenge,
  verifySignature,
  validateToken,
  refreshTokenHandler,
  logout,
};
