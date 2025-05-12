import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PaymentAttributes {
  id: number;
  payer_hive_account: string;
  beneficiary_user_id: number | null;
  amount: number;
  token_type: string;
  tx_id: string;
  payment_time?: Date;
  confirmed: boolean;
}

type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  "id" | "payment_time" | "confirmed"
>;

class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  public id!: number;
  public payer_hive_account!: string;
  public beneficiary_user_id!: number | null;
  public amount!: number;
  public token_type!: string;
  public tx_id!: string;
  public payment_time?: Date;
  public confirmed!: boolean;
}

Payment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    payer_hive_account: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    beneficiary_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 5),
      allowNull: false,
    },
    token_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tx_id: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    payment_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: false,
  }
);

export default Payment;
