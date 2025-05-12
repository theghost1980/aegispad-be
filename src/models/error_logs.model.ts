import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

export class ErrorLog extends Model<
  InferAttributes<ErrorLog>,
  InferCreationAttributes<ErrorLog>
> {
  declare id: CreationOptional<number>;
  declare error_time: CreationOptional<Date>;
  declare user_id: number | null;
  declare error_message: string;
  declare stack_trace: string | null;
  declare endpoint: string | null;
}

ErrorLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    error_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stack_trace: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ErrorLog",
    tableName: "error_logs",
    timestamps: false,
  }
);

// Relación con usuario (opcional)
ErrorLog.belongsTo(User, { foreignKey: "user_id" });

export default ErrorLog;
