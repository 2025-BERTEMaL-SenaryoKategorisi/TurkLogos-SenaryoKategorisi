import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    tc_kimlik: {
      type: DataTypes.STRING(11),
      unique: true,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    current_package_id: {
      type: DataTypes.STRING(50),
    },
    payment_status: {
      type: DataTypes.STRING(20),
      defaultValue: "paid",
    },
    balance: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    data_usage_gb: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    voice_usage_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING(50),
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;
