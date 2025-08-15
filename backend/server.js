import express from "express";
import cors from "cors";
import secrets from "./secrets/secrets.js";
import morgan from "morgan";
import sequelize from "./config/database.js";
import { swaggerUi, specs } from "./config/swagger.js";

// Import routes
import usersRouter from "./routes/users.js";
import packagesRouter from "./routes/packages.js";
import billsRouter from "./routes/bills.js";
import ticketsRouter from "./routes/tickets.js";
import userInfoRouter from "./routes/userInfo.js";
import campaignsRouter from "./routes/campaigns.js";

// Import models to initialize associations
import "./models/index.js";

const app = express();

const PORT = secrets.PORT;
const BASE_API_URL = secrets.BASE_API_URL;

// CORS configuration for local development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Telecom API!",
    documentation: "/api-docs",
    endpoints: {
      users: "/api/v1/users",
      packages: "/api/v1/packages",
      bills: "/api/v1/bills",
      tickets: "/api/v1/tickets",
      userInfo: "/api/v1/user-info",
      campaigns: "/api/v1/campaigns",
    },
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/packages", packagesRouter);
app.use("/api/v1/bills", billsRouter);
app.use("/api/v1/tickets", ticketsRouter);
app.use("/api/v1/user-info", userInfoRouter);
app.use("/api/v1/campaigns", campaignsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log("✅ Database synchronized successfully.");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(
        `📚 API Documentation available at http://localhost:${PORT}/api-docs`
      );
      console.log(
        `🏥 Health check available at http://localhost:${PORT}/health`
      );
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

startServer();
