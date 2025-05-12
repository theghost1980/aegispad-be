import express from "express";
import { TranslationTestsController } from "../controllers/translation.tests.controller";

const router = express.Router();

//TODO below add isAdmin,
router.get("/limits", TranslationTestsController.testLimits);

export default router;
