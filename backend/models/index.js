import User from "./User.js";
import Package from "./Package.js";
import Bill from "./Bill.js";
import SupportTicket from "./SupportTicket.js";
import Campaign from "./Campaign.js";
import UserCampaign from "./UserCampaign.js";

// Define associations
User.hasMany(Bill, { foreignKey: "user_id", as: "bills" });
Bill.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasMany(SupportTicket, { foreignKey: "user_id", as: "tickets" });
SupportTicket.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.belongsTo(Package, {
  foreignKey: "current_package_id",
  targetKey: "package_id",
  as: "package",
});
Package.hasMany(User, {
  foreignKey: "current_package_id",
  sourceKey: "package_id",
  as: "users",
});

// Campaign associations
User.belongsToMany(Campaign, {
  through: UserCampaign,
  foreignKey: "user_id",
  otherKey: "campaign_id",
  as: "campaigns",
});
Campaign.belongsToMany(User, {
  through: UserCampaign,
  foreignKey: "campaign_id",
  otherKey: "user_id",
  as: "users",
});

UserCampaign.belongsTo(User, { foreignKey: "user_id", as: "user" });
UserCampaign.belongsTo(Campaign, { foreignKey: "campaign_id", as: "campaign" });

User.hasMany(UserCampaign, { foreignKey: "user_id", as: "userCampaigns" });
Campaign.hasMany(UserCampaign, {
  foreignKey: "campaign_id",
  as: "userCampaigns",
});

export { User, Package, Bill, SupportTicket, Campaign, UserCampaign };
