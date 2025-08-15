import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Bill = sequelize.define(
  "Bill",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bill_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
    },
    billing_period_start: {
      type: DataTypes.DATE,
    },
    billing_period_end: {
      type: DataTypes.DATE,
    },
    due_date: {
      type: DataTypes.DATE,
    },
    total_amount: {
      type: DataTypes.FLOAT,
    },
    payment_status: {
      type: DataTypes.STRING(20),
      defaultValue: "pending",
    },
    payment_date: {
      type: DataTypes.DATE,
    },
    data_used_gb: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    voice_used_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "bills",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Bill;
