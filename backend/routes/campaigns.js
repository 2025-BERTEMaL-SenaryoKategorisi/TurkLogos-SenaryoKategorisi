import express from "express";
import { Campaign, UserCampaign, User, Package } from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Campaign:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         campaign_id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         campaign_type:
 *           type: string
 *           enum: [promotion, discount, upgrade, loyalty, referral]
 *         target_audience:
 *           type: string
 *         discount_percentage:
 *           type: number
 *         discount_amount:
 *           type: number
 *         free_data_gb:
 *           type: integer
 *         free_voice_minutes:
 *           type: integer
 *         applicable_packages:
 *           type: array
 *           items:
 *             type: string
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         is_active:
 *           type: boolean
 *         max_uses:
 *           type: integer
 *         current_uses:
 *           type: integer
 *         terms_conditions:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active campaigns
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by campaign type
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 */
router.get("/", async (req, res) => {
  try {
    const { active, type } = req.query;
    const where = {};

    if (active !== undefined) {
      where.is_active = active === "true";
    }

    if (type) {
      where.campaign_type = type;
    }

    // Only show campaigns that are currently valid (within date range)
    const currentDate = new Date();
    where.start_date = { [Op.lte]: currentDate };
    where.end_date = { [Op.gte]: currentDate };

    const campaigns = await Campaign.findAll({
      where,
      include: [
        {
          model: UserCampaign,
          as: "userCampaigns",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "first_name", "last_name", "phone_number"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campaign not found
 */
router.get("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
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
                "phone_number",
                "current_package_id",
              ],
            },
          ],
        },
      ],
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns:
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaign_id
 *               - name
 *               - start_date
 *               - end_date
 *             properties:
 *               campaign_id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               campaign_type:
 *                 type: string
 *               target_audience:
 *                 type: string
 *               discount_percentage:
 *                 type: number
 *               discount_amount:
 *                 type: number
 *               free_data_gb:
 *                 type: integer
 *               free_voice_minutes:
 *                 type: integer
 *               applicable_packages:
 *                 type: array
 *                 items:
 *                   type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               max_uses:
 *                 type: integer
 *               terms_conditions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req, res) => {
  try {
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   put:
 *     summary: Update campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Campaign'
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       404:
 *         description: Campaign not found
 */
router.put("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await campaign.update(req.body);
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       404:
 *         description: Campaign not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    await campaign.destroy();
    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}/apply/{userId}:
 *   post:
 *     summary: Apply campaign to user
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Campaign ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Campaign applied successfully
 *       400:
 *         description: Campaign cannot be applied
 *       404:
 *         description: Campaign or user not found
 */
router.post("/:id/apply/:userId", async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    const user = await User.findByPk(req.params.userId, {
      include: [{ model: Package, as: "package" }],
    });

    if (!campaign || !user) {
      return res.status(404).json({ error: "Campaign or user not found" });
    }

    // Check if campaign is active and within date range
    const currentDate = new Date();
    if (
      !campaign.is_active ||
      currentDate < campaign.start_date ||
      currentDate > campaign.end_date
    ) {
      return res
        .status(400)
        .json({ error: "Campaign is not active or has expired" });
    }

    // Check if campaign has reached max uses
    if (campaign.max_uses && campaign.current_uses >= campaign.max_uses) {
      return res
        .status(400)
        .json({ error: "Campaign has reached maximum usage limit" });
    }

    // Check if user already has this campaign
    const existingUserCampaign = await UserCampaign.findOne({
      where: {
        user_id: req.params.userId,
        campaign_id: req.params.id,
        status: "active",
      },
    });

    if (existingUserCampaign) {
      return res
        .status(400)
        .json({ error: "User already has this campaign applied" });
    }

    // Check if user's package is eligible
    if (
      campaign.applicable_packages &&
      campaign.applicable_packages.length > 0
    ) {
      if (!campaign.applicable_packages.includes(user.current_package_id)) {
        return res.status(400).json({
          error: "User's current package is not eligible for this campaign",
        });
      }
    }

    // Apply campaign to user
    const userCampaign = await UserCampaign.create({
      user_id: req.params.userId,
      campaign_id: req.params.id,
      discount_applied:
        campaign.discount_amount ||
        (campaign.discount_percentage
          ? user.package.price * (campaign.discount_percentage / 100)
          : 0),
      data_bonus_gb: campaign.free_data_gb || 0,
      voice_bonus_minutes: campaign.free_voice_minutes || 0,
      expires_at: campaign.end_date,
      status: "active",
    });

    // Increment campaign usage counter
    await campaign.increment("current_uses");

    res.json({
      message: "Campaign applied successfully",
      userCampaign,
      benefits: {
        discount_applied: userCampaign.discount_applied,
        data_bonus_gb: userCampaign.data_bonus_gb,
        voice_bonus_minutes: userCampaign.voice_bonus_minutes,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/user/{userId}:
 *   get:
 *     summary: Get user's active campaigns
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_info:
 *                   type: object
 *                 active_campaigns:
 *                   type: array
 *                 total_benefits:
 *                   type: object
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: [
        "id",
        "customer_id",
        "first_name",
        "last_name",
        "phone_number",
        "current_package_id",
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
      return res.status(404).json({ error: "User not found" });
    }

    const userCampaigns = await UserCampaign.findAll({
      where: {
        user_id: req.params.userId,
        status: "active",
        expires_at: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: Campaign,
          as: "campaign",
          attributes: ["campaign_id", "name", "description", "campaign_type"],
        },
      ],
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

    res.json({
      user_info: user,
      active_campaigns: userCampaigns,
      total_benefits: totalBenefits,
      campaigns_count: userCampaigns.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/eligible/{userId}:
 *   get:
 *     summary: Get campaigns eligible for user
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eligible campaigns for user
 */
router.get("/eligible/:userId", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [{ model: Package, as: "package" }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentDate = new Date();

    // Get all active campaigns within date range
    const activeCampaigns = await Campaign.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    // Filter campaigns user is eligible for
    const eligibleCampaigns = [];

    for (const campaign of activeCampaigns) {
      // Check if user already has this campaign
      const existingUserCampaign = await UserCampaign.findOne({
        where: {
          user_id: req.params.userId,
          campaign_id: campaign.id,
          status: "active",
        },
      });

      if (existingUserCampaign) continue;

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

    res.json({
      user_info: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        current_package: user.package?.name,
      },
      eligible_campaigns: eligibleCampaigns,
      count: eligibleCampaigns.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
