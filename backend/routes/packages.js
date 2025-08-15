import express from "express";
import { Package } from "../models/index.js";

const router = express.Router();

/**
 * @swagger
 * /packages:
 *   get:
 *     summary: Get all packages
 *     tags: [Packages]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of packages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Package'
 */
router.get("/", async (req, res) => {
  try {
    const where = {};
    if (req.query.active !== undefined) {
      where.is_active = req.query.active === "true";
    }

    const packages = await Package.findAll({
      where,
      order: [["price", "ASC"]],
    });

    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /packages/{id}:
 *   get:
 *     summary: Get package by ID
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     responses:
 *       200:
 *         description: Package details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       404:
 *         description: Package not found
 */
router.get("/:id", async (req, res) => {
  try {
    const package_ = await Package.findByPk(req.params.id);

    if (!package_) {
      return res.status(404).json({ error: "Package not found" });
    }

    res.json(package_);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /packages:
 *   post:
 *     summary: Create a new package
 *     tags: [Packages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Package'
 *     responses:
 *       201:
 *         description: Package created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Package'
 *       400:
 *         description: Invalid input
 */
router.post("/", async (req, res) => {
  try {
    const package_ = await Package.create(req.body);
    res.status(201).json(package_);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /packages/{id}:
 *   put:
 *     summary: Update package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Package'
 *     responses:
 *       200:
 *         description: Package updated successfully
 *       404:
 *         description: Package not found
 */
router.put("/:id", async (req, res) => {
  try {
    const [updated] = await Package.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedPackage = await Package.findByPk(req.params.id);
      res.json(updatedPackage);
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /packages/{id}:
 *   delete:
 *     summary: Delete package
 *     tags: [Packages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Package ID
 *     responses:
 *       204:
 *         description: Package deleted successfully
 *       404:
 *         description: Package not found
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Package.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Package not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
