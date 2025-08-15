import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SupportTicket = sequelize.define(
  "SupportTicket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ticket_id: {
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
    issue_type: {
      type: DataTypes.STRING(50),
    },
    priority: {
      type: DataTypes.STRING(20),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "open",
    },
    title: {
      type: DataTypes.STRING(200),
    },
    description: {
      type: DataTypes.TEXT,
    },
    resolution: {
      type: DataTypes.TEXT,
    },
    resolved_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "support_tickets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default SupportTicket;
