import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TransactionAttributes {
  id: number;
  user_id: number;
  amount: number;
  currency: string; // Ej: HIVE, HBD, HIVEMARKDOWN
  tx_id: string;
  timestamp: Date;
  description?: string;
}

type TransactionCreationAttributes = Optional<
  TransactionAttributes,
  "id" | "description"
>;

class Transaction
  extends Model<TransactionAttributes, TransactionCreationAttributes>
  implements TransactionAttributes
{
  public id!: number;
  public user_id!: number;
  public amount!: number;
  public currency!: string;
  public tx_id!: string;
  public timestamp!: Date;
  public description?: string;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tx_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    timestamps: false,
  }
);

export default Transaction;
