import express from "express";
import { Bill, User } from "../models/index.js";

const router = express.Router();

/**
 * @swagger
 * /bills:
 *   get:
 *     summary: Get all bills
 *     tags: [Bills]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: payment_status
 *         schema:
 *           type: string
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: List of bills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bill'
 */
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.user_id) {
      where.user_id = req.query.user_id;
    }
    if (req.query.payment_status) {
      where.payment_status = req.query.payment_status;
    }

    const bills = await Bill.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["first_name", "last_name", "phone_number"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       404:
 *         description: Bill not found
 */
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
        },
      ],
    });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bill'
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req, res) => {
  try {
    const bill = await Bill.create(req.body);
    res.status(201).json(bill);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /bills/{id}:
 *   put:
 *     summary: Update bill
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bill'
 *     responses:
 *       200:
 *         description: Bill updated successfully
 *       404:
 *         description: Bill not found
 */
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Bill.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedBill = await Bill.findByPk(req.params.id);
      res.json(updatedBill);
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /bills/{id}/pay:
 *   post:
 *     summary: Mark bill as paid
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill marked as paid
 *       404:
 *         description: Bill not found
 */
router.post("/:id/pay", async (req, res) => {
  try {
    const [updated] = await Bill.update(
      {
        payment_status: "paid",
        payment_date: new Date(),
      },
      {
        where: { id: req.params.id },
      }
    );

    if (updated) {
      const updatedBill = await Bill.findByPk(req.params.id);
      res.json(updatedBill);
    } else {
      res.status(404).json({ error: "Bill not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
