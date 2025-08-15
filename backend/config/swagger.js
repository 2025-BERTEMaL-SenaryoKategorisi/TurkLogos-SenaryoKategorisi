import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Telecom API",
      version: "1.0.0",
      description:
        "A comprehensive telecom customer management API with Sequelize ORM",
      contact: {
        name: "API Support",
        email: "support@telecom.com",
      },
    },
    servers: [
      {
        url: process.env.BASE_API_URL || "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          required: [
            "customer_id",
            "phone_number",
            "first_name",
            "last_name",
            "email",
            "tc_kimlik",
            "birth_date",
          ],
          properties: {
            id: {
              type: "integer",
              description: "Auto-generated user ID",
            },
            customer_id: {
              type: "string",
              description: "Unique customer identifier",
            },
            phone_number: {
              type: "string",
              description: "Customer phone number",
            },
            first_name: {
              type: "string",
              description: "Customer first name",
            },
            last_name: {
              type: "string",
              description: "Customer last name",
            },
            email: {
              type: "string",
              description: "Customer email address",
            },
            tc_kimlik: {
              type: "string",
              description: "Turkish ID number (11 digits)",
            },
            birth_date: {
              type: "string",
              format: "date",
              description: "Customer birth date",
            },
            current_package_id: {
              type: "string",
              description: "Current package ID",
            },
            payment_status: {
              type: "string",
              enum: ["paid", "pending", "overdue"],
              description: "Payment status",
            },
            balance: {
              type: "number",
              description: "Account balance",
            },
            data_usage_gb: {
              type: "number",
              description: "Data usage in GB",
            },
            voice_usage_minutes: {
              type: "integer",
              description: "Voice usage in minutes",
            },
            address: {
              type: "string",
              description: "Customer address",
            },
            city: {
              type: "string",
              description: "Customer city",
            },
          },
        },
        Package: {
          type: "object",
          required: ["package_id", "name", "price"],
          properties: {
            id: {
              type: "integer",
              description: "Auto-generated package ID",
            },
            package_id: {
              type: "string",
              description: "Unique package identifier",
            },
            name: {
              type: "string",
              description: "Package name",
            },
            price: {
              type: "number",
              description: "Package price",
            },
            data_limit_gb: {
              type: "integer",
              description: "Data limit in GB",
            },
            voice_minutes: {
              type: "integer",
              description: "Voice minutes included",
            },
            sms_count: {
              type: "integer",
              description: "SMS count included",
            },
            features: {
              type: "object",
              description: "Package features in JSON format",
            },
            is_active: {
              type: "boolean",
              description: "Package active status",
            },
          },
        },
        Bill: {
          type: "object",
          required: ["bill_id", "user_id"],
          properties: {
            id: {
              type: "integer",
              description: "Auto-generated bill ID",
            },
            bill_id: {
              type: "string",
              description: "Unique bill identifier",
            },
            user_id: {
              type: "integer",
              description: "User ID reference",
            },
            billing_period_start: {
              type: "string",
              format: "date",
              description: "Billing period start date",
            },
            billing_period_end: {
              type: "string",
              format: "date",
              description: "Billing period end date",
            },
            due_date: {
              type: "string",
              format: "date",
              description: "Payment due date",
            },
            total_amount: {
              type: "number",
              description: "Total bill amount",
            },
            payment_status: {
              type: "string",
              enum: ["pending", "paid", "overdue"],
              description: "Payment status",
            },
            payment_date: {
              type: "string",
              format: "date",
              description: "Payment date",
            },
            data_used_gb: {
              type: "number",
              description: "Data used in GB",
            },
            voice_used_minutes: {
              type: "integer",
              description: "Voice minutes used",
            },
          },
        },
        SupportTicket: {
          type: "object",
          required: ["ticket_id", "user_id", "title"],
          properties: {
            id: {
              type: "integer",
              description: "Auto-generated ticket ID",
            },
            ticket_id: {
              type: "string",
              description: "Unique ticket identifier",
            },
            user_id: {
              type: "integer",
              description: "User ID reference",
            },
            issue_type: {
              type: "string",
              description: "Type of issue",
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              description: "Ticket priority",
            },
            status: {
              type: "string",
              enum: ["open", "in_progress", "resolved", "closed"],
              description: "Ticket status",
            },
            title: {
              type: "string",
              description: "Ticket title",
            },
            description: {
              type: "string",
              description: "Ticket description",
            },
            resolution: {
              type: "string",
              description: "Ticket resolution",
            },
            resolved_at: {
              type: "string",
              format: "date-time",
              description: "Resolution date",
            },
          },
        },
      },
    },
  },
  apis: [
    "./routes/users.js",
    "./routes/packages.js",
    "./routes/bills.js",
    "./routes/tickets.js",
    "./routes/userInfo.js",
  ], // Path to the API files
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
