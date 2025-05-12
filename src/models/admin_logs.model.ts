import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

//TODO use notes below?
// 📝 Detalles del modelo:
// Campo	Descripción
// admin_user_id	Usuario que ejecutó la acción. Se pone en null si se elimina el usuario.
// action	Descripción breve de la acción realizada.
// action_time	Fecha y hora de la acción. Por defecto, CURRENT_TIMESTAMP.
// details	Información adicional (puede ser un JSON.stringify de un objeto, si lo deseas).

export class AdminLog extends Model<
  InferAttributes<AdminLog>,
  InferCreationAttributes<AdminLog>
> {
  declare id: CreationOptional<number>;
  declare admin_user_id: number | null;
  declare action: string;
  declare action_time: CreationOptional<Date>;
  declare details: string | null;
}

AdminLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admin_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    action_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "AdminLog",
    tableName: "admin_logs",
    timestamps: false,
  }
);

// Relación con el usuario (admin)
AdminLog.belongsTo(User, { foreignKey: "admin_user_id" });

export default AdminLog;
