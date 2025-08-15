import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserCampaign = sequelize.define("UserCampaign", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  campaign_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "campaigns",
      key: "id",
    },
  },
  applied_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: "active",
    // Status: active, expired, used, cancelled
  },
  discount_applied: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  data_bonus_gb: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  voice_bonus_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
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

export default UserCampaign;
