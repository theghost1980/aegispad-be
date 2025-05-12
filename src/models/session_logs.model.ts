import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

export class SessionLog extends Model<
  InferAttributes<SessionLog>,
  InferCreationAttributes<SessionLog>
> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare login_time: Date;
  declare logout_time: CreationOptional<Date>;
  declare session_token: string;
  declare ip_address: string;
  declare user_agent: string;
}

SessionLog.init(
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
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    login_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    logout_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    session_token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIP: true,
      },
      comment: "Dirección IP desde donde se inició la sesión",
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Cadena del agente de usuario (navegador/dispositivo)",
    },
  },
  {
    sequelize,
    modelName: "SessionLog",
    timestamps: false,
  }
);

// Relación con User
SessionLog.belongsTo(User, { foreignKey: "user_id" });

export default SessionLog;
