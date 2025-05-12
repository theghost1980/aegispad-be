import { Request, Response } from "express";
import User from "../models/user.model";

// Crear usuario
const createUser = async (req: Request, res: Response) => {
  try {
    const { hive_username, hive_wallet, jwt_token, is_active, role } = req.body;

    const user = await User.create({
      hive_username,
      hive_wallet,
      is_active,
      role,
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "Failed to create user", details: error.message });
  }
};

// Obtener todos los usuarios
const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch users", details: error.message });
  }
};

// Obtener usuario por ID
const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
};

// Actualizar usuario
const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update(req.body);

    res.json(user);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
};

// Eliminar usuario
const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();

    res.status(204).send(); // No Content
  } catch (error: any) {
    res
      .status(500)
      .json({ error: "Failed to delete user", details: error.message });
  }
};

export const UserController = {
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
};
