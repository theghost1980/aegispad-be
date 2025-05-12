import express from "express";
import { TranslateController } from "../controllers/translate.controller";
import { requireUserToken } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/languages", requireUserToken, TranslateController.languages);

router.post("/", requireUserToken, TranslateController.translate);

router.post("/translate-test", TranslateController.translateTest);

export default router;
