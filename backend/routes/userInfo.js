import express from "express";
import {
  getUserPackageInfo,
  getUserBillInfo,
  getUserSupportTickets,
  getUserCompleteInfo,
} from "../services/userService.js";
import { getUserDashboard } from "../utils/userUtils.js";

const router = express.Router();

/**
 * @swagger
 * /user-info/{user_id}/package:
 *   get:
 *     summary: Get user package information
 *     tags: [User Info]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User package information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_info:
 *                   type: object
 *                 current_package:
 *                   type: object
 *       404:
 *         description: User not found
 */
router.get("/:user_id/package", async (req, res) => {
  try {
    const { user_id } = req.params;
    const packageInfo = await getUserPackageInfo(parseInt(user_id));
    res.json(packageInfo);
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /user-info/{user_id}/bills:
 *   get:
 *     summary: Get user billing information
 *     tags: [User Info]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of bills to return (default 10)
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: User billing information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_info:
 *                   type: object
 *                 billing_summary:
 *                   type: object
 *                 recent_bills:
 *                   type: array
 *       404:
 *         description: User not found
 */
router.get("/:user_id/bills", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit, payment_status } = req.query;
    const options = {};

    if (limit) options.limit = parseInt(limit);
    if (payment_status) options.payment_status = payment_status;

    const billInfo = await getUserBillInfo(parseInt(user_id), options);
    res.json(billInfo);
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /user-info/{user_id}/tickets:
 *   get:
 *     summary: Get user support tickets
 *     tags: [User Info]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of tickets to return (default 20)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: User support tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_info:
 *                   type: object
 *                 tickets_summary:
 *                   type: object
 *                 tickets:
 *                   type: array
 *       404:
 *         description: User not found
 */
router.get("/:user_id/tickets", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit, status, priority } = req.query;
    const options = {};

    if (limit) options.limit = parseInt(limit);
    if (status) options.status = status;
    if (priority) options.priority = priority;

    const ticketInfo = await getUserSupportTickets(parseInt(user_id), options);
    res.json(ticketInfo);
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /user-info/{user_id}/complete:
 *   get:
 *     summary: Get complete user information (package, bills, tickets)
 *     tags: [User Info]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Complete user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 package_info:
 *                   type: object
 *                 billing_info:
 *                   type: object
 *                 support_info:
 *                   type: object
 *                 summary:
 *                   type: object
 *       404:
 *         description: User not found
 */
router.get("/:user_id/complete", async (req, res) => {
  try {
    const { user_id } = req.params;
    const completeInfo = await getUserCompleteInfo(parseInt(user_id));
    res.json(completeInfo);
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /user-info/{user_id}/dashboard:
 *   get:
 *     summary: Get user dashboard with alerts and comprehensive information
 *     tags: [User Info]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User dashboard information with alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_info:
 *                   type: object
 *                 account_status:
 *                   type: string
 *                   enum: [good, payment_required, support_needed, attention_required]
 *                 dashboard_summary:
 *                   type: object
 *                 alerts:
 *                   type: array
 *                 package_info:
 *                   type: object
 *                 billing_info:
 *                   type: object
 *                 support_info:
 *                   type: object
 *       404:
 *         description: User not found
 */
router.get("/:user_id/dashboard", async (req, res) => {
  try {
    const { user_id } = req.params;
    const dashboard = await getUserDashboard(parseInt(user_id));
    res.json(dashboard);
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
