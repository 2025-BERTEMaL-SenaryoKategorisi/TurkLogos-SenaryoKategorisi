import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Package = sequelize.define(
  "Package",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    package_id: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    data_limit_gb: {
      type: DataTypes.INTEGER,
    },
    voice_minutes: {
      type: DataTypes.INTEGER,
    },
    sms_count: {
      type: DataTypes.INTEGER,
    },
    features: {
      type: DataTypes.JSON,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "packages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Package;
