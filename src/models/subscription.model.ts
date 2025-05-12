import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface SubscriptionAttributes {
  id: number;
  user_id: number;
  plan_id: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  tx_id?: string; // transacción blockchain (opcional)
  paid_by?: string; // otro usuario pudo haber pagado
}

type SubscriptionCreationAttributes = Optional<
  SubscriptionAttributes,
  "id" | "tx_id" | "paid_by"
>;

class Subscription
  extends Model<SubscriptionAttributes, SubscriptionCreationAttributes>
  implements SubscriptionAttributes
{
  public id!: number;
  public user_id!: number;
  public plan_id!: number;
  public start_date!: Date;
  public end_date!: Date;
  public is_active!: boolean;
  public tx_id?: string;
  public paid_by?: string;
}

Subscription.init(
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
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    tx_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paid_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Subscription",
    tableName: "subscriptions",
    timestamps: false,
  }
);

export default Subscription;
