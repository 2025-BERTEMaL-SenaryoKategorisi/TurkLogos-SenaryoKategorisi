import { Campaign, UserCampaign, User, Package } from "../models/index.js";
import { Op } from "sequelize";

class CampaignService {
  // Get all active campaigns for a specific target audience
  static async getCampaignsForAudience(targetAudience) {
    try {
      const currentDate = new Date();

      return await Campaign.findAll({
        where: {
          is_active: true,
          start_date: { [Op.lte]: currentDate },
          end_date: { [Op.gte]: currentDate },
          [Op.or]: [
            { target_audience: targetAudience },
            { target_audience: "all" },
            { target_audience: null },
          ],
        },
        order: [["created_at", "DESC"]],
      });
    } catch (error) {
      throw new Error(
        `Error fetching campaigns for audience: ${error.message}`
      );
    }
  }

  // Get campaigns applicable to a user based on their profile
  static async getEligibleCampaignsForUser(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Package, as: "package" }],
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Determine user category for targeting
      let userCategory = "all";
      if (user.payment_status === "overdue") {
        userCategory = "overdue_users";
      } else if (user.package?.price >= 200) {
        userCategory = "premium_users";
      } else if (
        user.created_at > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ) {
        userCategory = "new_users";
      }

      const currentDate = new Date();

      const campaigns = await Campaign.findAll({
        where: {
          is_active: true,
          start_date: { [Op.lte]: currentDate },
          end_date: { [Op.gte]: currentDate },
          [Op.or]: [
            { target_audience: userCategory },
            { target_audience: "all" },
            { target_audience: null },
          ],
        },
      });

      // Filter campaigns based on package eligibility and existing applications
      const eligibleCampaigns = [];

      for (const campaign of campaigns) {
        // Check if user already has this campaign
        const existingApplication = await UserCampaign.findOne({
          where: {
            user_id: userId,
            campaign_id: campaign.id,
            status: "active",
          },
        });

        if (existingApplication) continue;

        // Check package eligibility
        if (
          campaign.applicable_packages &&
          campaign.applicable_packages.length > 0
        ) {
          if (!campaign.applicable_packages.includes(user.current_package_id)) {
            continue;
          }
        }

        // Check max uses
        if (campaign.max_uses && campaign.current_uses >= campaign.max_uses) {
          continue;
        }

        eligibleCampaigns.push(campaign);
      }

      return eligibleCampaigns;
    } catch (error) {
      throw new Error(`Error getting eligible campaigns: ${error.message}`);
    }
  }

  // Apply campaign to user
  static async applyCampaignToUser(campaignId, userId) {
    try {
      const campaign = await Campaign.findByPk(campaignId);
      const user = await User.findByPk(userId, {
        include: [{ model: Package, as: "package" }],
      });

      if (!campaign || !user) {
        throw new Error("Campaign or user not found");
      }

      // Validation checks
      const currentDate = new Date();
      if (
        !campaign.is_active ||
        currentDate < campaign.start_date ||
        currentDate > campaign.end_date
      ) {
        throw new Error("Campaign is not active or has expired");
      }

      if (campaign.max_uses && campaign.current_uses >= campaign.max_uses) {
        throw new Error("Campaign has reached maximum usage limit");
      }

      // Check existing application
      const existingApplication = await UserCampaign.findOne({
        where: {
          user_id: userId,
          campaign_id: campaignId,
          status: "active",
        },
      });

      if (existingApplication) {
        throw new Error("User already has this campaign applied");
      }

      // Calculate benefits
      const discountApplied =
        campaign.discount_amount ||
        (campaign.discount_percentage
          ? user.package.price * (campaign.discount_percentage / 100)
          : 0);

      // Create user campaign
      const userCampaign = await UserCampaign.create({
        user_id: userId,
        campaign_id: campaignId,
        discount_applied: discountApplied,
        data_bonus_gb: campaign.free_data_gb || 0,
        voice_bonus_minutes: campaign.free_voice_minutes || 0,
        expires_at: campaign.end_date,
        status: "active",
      });

      // Increment campaign usage
      await campaign.increment("current_uses");

      return {
        success: true,
        userCampaign,
        benefits: {
          discount_applied: discountApplied,
          data_bonus_gb: campaign.free_data_gb || 0,
          voice_bonus_minutes: campaign.free_voice_minutes || 0,
        },
      };
    } catch (error) {
      throw new Error(`Error applying campaign: ${error.message}`);
    }
  }

  // Get user's active campaigns with total benefits
  static async getUserActiveCampaigns(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: [
          "id",
          "customer_id",
          "first_name",
          "last_name",
          "phone_number",
        ],
        include: [
          {
            model: Package,
            as: "package",
            attributes: ["package_id", "name", "price"],
          },
        ],
      });

      if (!user) {
        throw new Error("User not found");
      }

      const userCampaigns = await UserCampaign.findAll({
        where: {
          user_id: userId,
          status: "active",
          expires_at: { [Op.gte]: new Date() },
        },
        include: [
          {
            model: Campaign,
            as: "campaign",
            attributes: [
              "campaign_id",
              "name",
              "description",
              "campaign_type",
              "end_date",
            ],
          },
        ],
        order: [["applied_date", "DESC"]],
      });

      // Calculate total benefits
      const totalBenefits = userCampaigns.reduce(
        (acc, uc) => {
          acc.total_discount += uc.discount_applied || 0;
          acc.total_data_bonus += uc.data_bonus_gb || 0;
          acc.total_voice_bonus += uc.voice_bonus_minutes || 0;
          return acc;
        },
        { total_discount: 0, total_data_bonus: 0, total_voice_bonus: 0 }
      );

      return {
        user_info: user,
        active_campaigns: userCampaigns,
        total_benefits: totalBenefits,
        campaigns_count: userCampaigns.length,
      };
    } catch (error) {
      throw new Error(`Error getting user campaigns: ${error.message}`);
    }
  }

  // Campaign analytics
  static async getCampaignAnalytics(campaignId) {
    try {
      const campaign = await Campaign.findByPk(campaignId, {
        include: [
          {
            model: UserCampaign,
            as: "userCampaigns",
            include: [
              {
                model: User,
                as: "user",
                attributes: [
                  "id",
                  "first_name",
                  "last_name",
                  "current_package_id",
                ],
              },
            ],
          },
        ],
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      const analytics = {
        campaign_info: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.campaign_type,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
        },
        usage_stats: {
          total_applications: campaign.userCampaigns.length,
          max_uses: campaign.max_uses,
          remaining_uses: campaign.max_uses
            ? campaign.max_uses - campaign.current_uses
            : null,
          usage_percentage: campaign.max_uses
            ? ((campaign.current_uses / campaign.max_uses) * 100).toFixed(2)
            : null,
        },
        financial_impact: {
          total_discount_given: campaign.userCampaigns.reduce(
            (sum, uc) => sum + (uc.discount_applied || 0),
            0
          ),
          average_discount_per_user:
            campaign.userCampaigns.length > 0
              ? (
                  campaign.userCampaigns.reduce(
                    (sum, uc) => sum + (uc.discount_applied || 0),
                    0
                  ) / campaign.userCampaigns.length
                ).toFixed(2)
              : 0,
        },
        data_impact: {
          total_data_bonus_given: campaign.userCampaigns.reduce(
            (sum, uc) => sum + (uc.data_bonus_gb || 0),
            0
          ),
          total_voice_bonus_given: campaign.userCampaigns.reduce(
            (sum, uc) => sum + (uc.voice_bonus_minutes || 0),
            0
          ),
        },
        user_segments: this._analyzeCampaignUserSegments(
          campaign.userCampaigns
        ),
      };

      return analytics;
    } catch (error) {
      throw new Error(`Error getting campaign analytics: ${error.message}`);
    }
  }

  // Helper method to analyze user segments
  static _analyzeCampaignUserSegments(userCampaigns) {
    const segments = {};

    userCampaigns.forEach((uc) => {
      const packageId = uc.user?.current_package_id || "unknown";
      if (!segments[packageId]) {
        segments[packageId] = {
          count: 0,
          total_discount: 0,
          total_data_bonus: 0,
          total_voice_bonus: 0,
        };
      }

      segments[packageId].count++;
      segments[packageId].total_discount += uc.discount_applied || 0;
      segments[packageId].total_data_bonus += uc.data_bonus_gb || 0;
      segments[packageId].total_voice_bonus += uc.voice_bonus_minutes || 0;
    });

    return segments;
  }

  // Expire old campaigns
  static async expireOldCampaigns() {
    try {
      const currentDate = new Date();

      const expiredUserCampaigns = await UserCampaign.update(
        { status: "expired" },
        {
          where: {
            status: "active",
            expires_at: { [Op.lt]: currentDate },
          },
        }
      );

      return {
        expired_user_campaigns: expiredUserCampaigns[0],
      };
    } catch (error) {
      throw new Error(`Error expiring campaigns: ${error.message}`);
    }
  }
}

export default CampaignService;
