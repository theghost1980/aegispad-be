import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PlanAttributes {
  id: number;
  name: string;
  description?: string;
  max_words_per_day?: number;
  max_posts_per_day?: number;
  duration_days: number;
  price_hbd?: number; // Puede usarse si se paga directamente con HBD
  is_active: boolean;
}

type PlanCreationAttributes = Optional<
  PlanAttributes,
  "id" | "description" | "max_words_per_day" | "max_posts_per_day" | "price_hbd"
>;

class Plan
  extends Model<PlanAttributes, PlanCreationAttributes>
  implements PlanAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public max_words_per_day?: number;
  public max_posts_per_day?: number;
  public duration_days!: number;
  public price_hbd?: number;
  public is_active!: boolean;
}

Plan.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    max_words_per_day: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_posts_per_day: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price_hbd: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Plan",
    tableName: "plans",
    timestamps: false,
  }
);

export default Plan;
