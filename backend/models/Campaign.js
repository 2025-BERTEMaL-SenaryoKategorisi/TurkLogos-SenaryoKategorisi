import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Campaign = sequelize.define("Campaign", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  campaign_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  campaign_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: "promotion",
    // Types: promotion, discount, upgrade, loyalty, referral
  },
  target_audience: {
    type: DataTypes.STRING(100),
    allowNull: true,
    // Examples: "all", "premium_users", "new_users", "overdue_users"
  },
  discount_percentage: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  discount_amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  free_data_gb: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  free_voice_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  applicable_packages: {
    type: DataTypes.JSON,
    allowNull: true,
    // Array of package IDs: ["PKG001", "PKG002"]
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
  max_uses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // Maximum number of times campaign can be used
  },
  current_uses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  terms_conditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default Campaign;
