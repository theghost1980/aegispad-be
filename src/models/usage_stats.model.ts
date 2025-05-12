import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database"; // Asegúrate de que la ruta sea correcta
import User from "./user.model";

export class UsageStats extends Model<
  InferAttributes<UsageStats>,
  InferCreationAttributes<UsageStats>
> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare date: Date;
  declare translation_requests: number;
  declare word_limit_per_request: number; // Número de palabras permitidas por solicitud
  declare max_translation_requests: number; // Número máximo de traducciones permitidas por día
}

UsageStats.init(
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
    date: {
      type: DataTypes.DATEONLY, // Usamos DATEONLY para manejar solo la fecha
      allowNull: false,
    },
    translation_requests: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    word_limit_per_request: {
      type: DataTypes.INTEGER,
      defaultValue: 2000, // Asigna el límite de palabras por solicitud (ajústalo según sea necesario)
    },
    max_translation_requests: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // Establece el límite de solicitudes de traducción por día
    },
  },
  {
    sequelize,
    modelName: "UsageStats",
    timestamps: false, // No necesitamos los timestamps automáticos (createdAt, updatedAt)
    indexes: [
      {
        unique: true,
        fields: ["user_id", "date"], // Clave única sobre user_id y date
      },
    ],
  }
);

// Relación con el modelo User
UsageStats.belongsTo(User, { foreignKey: "user_id" });

export default UsageStats;
