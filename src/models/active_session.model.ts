import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database"; // Asegúrate de que la ruta sea correcta
import User from "./user.model";

export class ActiveSession extends Model<
  InferAttributes<ActiveSession>,
  InferCreationAttributes<ActiveSession>
> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare session_token: string;
  declare created_at: CreationOptional<Date>;
  declare expires_at: Date;
}

ActiveSession.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Relaciona con la tabla users
        key: "id",
      },
      onDelete: "CASCADE",
    },
    session_token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE, // Usamos DATE en lugar de TIMESTAMP
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE, // Usamos DATE en lugar de TIMESTAMP
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ActiveSession",
    timestamps: false, // No necesitamos los timestamps automáticos (createdAt, updatedAt)
  }
);

// Relación con el modelo User
ActiveSession.belongsTo(User, { foreignKey: "user_id" });

export default ActiveSession;
