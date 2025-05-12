import express from "express";
import { AuthController } from "../controllers/auth.controller";

const router = express.Router();

router.post("/challenge", AuthController.issueChallenge);
router.post("/verify", AuthController.verifySignature);
router.post("/validate-token", AuthController.validateToken);
router.post("/refresh-token", AuthController.refreshTokenHandler);
router.post("/logout", AuthController.logout);

export default router;
