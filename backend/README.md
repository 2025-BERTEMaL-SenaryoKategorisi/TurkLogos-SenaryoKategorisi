# Telecom API with Sequelize ORM

A comprehensive telecom customer management API built with Express.js, Sequelize ORM, PostgreSQL, and complete Swagger documentation.

## Features

- 🚀 **Express.js** REST API
- 🗄️ **Sequelize ORM** with PostgreSQL
- 📚 **Swagger Documentation** (OpenAPI 3.0)
- 🔄 **CRUD Operations** for all entities
- 🏗️ **Database Seeding** with sample data
- 🔍 **Advanced Filtering** and pagination
- ✅ **Error Handling** and validation

## Quick Start

### 1. Prerequisites

- Node.js (v14+)
- PostgreSQL database
- npm or yarn

### 2. Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

```bash
# Create PostgreSQL database named 'telecom_db'
createdb telecom_db

# Seed the database with sample data
npm run seed
```

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm run prod
```

The API will be available at: `http://localhost:3000`

## API Documentation

Interactive Swagger documentation is available at:
**http://localhost:3000/api-docs**

## API Endpoints

### Users

- `GET /api/v1/users` - Get all users (with pagination)
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/phone/:phoneNumber` - Get user by phone number
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Packages

- `GET /api/v1/packages` - Get all packages
- `GET /api/v1/packages/:id` - Get package by ID
- `POST /api/v1/packages` - Create new package
- `PUT /api/v1/packages/:id` - Update package
- `DELETE /api/v1/packages/:id` - Delete package

### Bills

- `GET /api/v1/bills` - Get all bills (with filters)
- `GET /api/v1/bills/:id` - Get bill by ID
- `POST /api/v1/bills` - Create new bill
- `PUT /api/v1/bills/:id` - Update bill
- `POST /api/v1/bills/:id/pay` - Mark bill as paid

### Support Tickets

- `GET /api/v1/tickets` - Get all tickets (with filters)
- `GET /api/v1/tickets/:id` - Get ticket by ID
- `POST /api/v1/tickets` - Create new ticket
- `PUT /api/v1/tickets/:id` - Update ticket
- `POST /api/v1/tickets/:id/resolve` - Resolve ticket

## Database Models

### User

- Customer information and authentication
- Package assignments
- Usage tracking
- Payment status

### Package

- Service plans and pricing
- Feature definitions
- Active status

### Bill

- Billing periods and amounts
- Payment tracking
- Usage details

### Support Ticket

- Issue tracking
- Priority and status management
- Resolution tracking

## Environment Variables

```env
BASE_API_URL=http://localhost:3000/api/v1
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telecom_db
DB_USER=postgres
DB_PASSWORD=password
DB_DIALECT=postgres
```

## Sample Data

The seeder creates:

- 3 sample packages (Basic, Premium, Family)
- 3 sample users with different statuses
- Sample bills and support tickets
- Realistic relationships between entities

## Scripts

```bash
npm run dev      # Start development server with nodemon
npm run prod     # Start production server
npm run seed     # Seed database with sample data
```

## API Examples

### Create a User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "CUST004",
    "phone_number": "+905554567890",
    "first_name": "Ali",
    "last_name": "Veli",
    "email": "ali.veli@email.com",
    "tc_kimlik": "45678901234",
    "birth_date": "1988-03-20",
    "current_package_id": "PKG001"
  }'
```

### Get User Bills

```bash
curl "http://localhost:3000/api/v1/bills?user_id=1"
```

### Create Support Ticket

```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "TKT004",
    "user_id": 1,
    "issue_type": "technical",
    "priority": "high",
    "title": "Cannot access email",
    "description": "Unable to configure email on my phone"
  }'
```

## Project Structure

```
├── config/
│   ├── database.js       # Database configuration
│   └── swagger.js        # Swagger setup
├── models/
│   ├── User.js          # User model
│   ├── Package.js       # Package model
│   ├── Bill.js          # Bill model
│   ├── SupportTicket.js # Support ticket model
│   └── index.js         # Model associations
├── routes/
│   ├── users.js         # User routes
│   ├── packages.js      # Package routes
│   ├── bills.js         # Bill routes
│   └── tickets.js       # Ticket routes
├── seeders/
│   └── seed.js          # Database seeder
├── secrets/
│   └── secrets.js       # Environment configuration
├── server.js            # Main application file
└── seed.js              # Seeder runner
```

## License

MIT License - feel free to use this project for learning and development!
