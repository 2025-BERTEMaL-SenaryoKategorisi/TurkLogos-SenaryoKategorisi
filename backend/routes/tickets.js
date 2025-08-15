import express from "express";
import { SupportTicket, User } from "../models/index.js";

const router = express.Router();

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all support tickets
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of support tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SupportTicket'
 */
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.user_id) {
      where.user_id = req.query.user_id;
    }
    if (req.query.status) {
      where.status = req.query.status;
    }
    if (req.query.priority) {
      where.priority = req.query.priority;
    }

    const tickets = await SupportTicket.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "phone_number"],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *       404:
 *         description: Ticket not found
 */
router.get("/:id", async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new support ticket
 *     tags: [Support Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicket'
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupportTicket'
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req, res) => {
  try {
    const ticket = await SupportTicket.create(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupportTicket'
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       404:
 *         description: Ticket not found
 */
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await SupportTicket.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedTicket = await SupportTicket.findByPk(req.params.id);
      res.json(updatedTicket);
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /tickets/{id}/resolve:
 *   post:
 *     summary: Resolve a ticket
 *     tags: [Support Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolution:
 *                 type: string
 *                 description: Resolution description
 *     responses:
 *       200:
 *         description: Ticket resolved successfully
 *       404:
 *         description: Ticket not found
 */
router.post("/:id/resolve", async (req, res) => {
  try {
    const { resolution } = req.body;
    const [updated] = await SupportTicket.update(
      {
        status: "resolved",
        resolution,
        resolved_at: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    );

    if (updated) {
      const updatedTicket = await SupportTicket.findByPk(req.params.id);
      res.json(updatedTicket);
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
