import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

//Note role = 'premium' may be useful for testings or promoting the free use for a period of time

interface UserAttributes {
  id: number;
  hive_username: string;
  hive_wallet: string;
  is_active: boolean;
  last_login: Date | null;
  role: "user" | "admin" | "moderator" | "premium";
  refresh_token: string | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "last_login" | "role" | "refresh_token"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public hive_username!: string;
  public hive_wallet!: string;
  public is_active!: boolean;
  public last_login!: Date | null;
  public role!: "user" | "admin" | "moderator" | "premium";
  public refresh_token!: string | null;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hive_username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hive_wallet: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin", "moderator", "premium"),
      allowNull: false,
      defaultValue: "user",
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

export default User;
