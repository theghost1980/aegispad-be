import express from "express";
import { UserController } from "../controllers/user.controller";
import { isAdmin } from "../middlewares/isAdmin";

const router = express.Router();

router.post("/", isAdmin, UserController.createUser);
router.get("/", isAdmin, UserController.getAllUsers);
router.get("/:id", isAdmin, UserController.getUserById);
router.put("/:id", isAdmin, UserController.updateUser);
router.delete("/:id", isAdmin, UserController.deleteUser);

export default router;
