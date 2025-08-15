# TürkLogos Telecom AI Agent - Database Schema

## Overview

This document provides a comprehensive overview of the database schema for the TürkLogos Telecom AI Agent system, designed for TEKNOFEST 2025.

## Database Architecture

**Database Engine:** PostgreSQL 15  
**ORM:** SQLAlchemy 2.0.23  
**Migration Tool:** Alembic 1.12.1  
**Cache:** Redis 5.0.1

## Table Relationships Diagram

```
Users (1) ←→ (1) Packages
  ↓ (1:N)
  Bills
  ↓ (1:N)
  SupportTickets (1) ←→ (N) TechnicianVisits
  ↓ (1:N)
  PackageChanges
  ↓ (1:N)
  Conversations

AgentMetrics (standalone)
```

## Tables and Schema

### 1. Users Table

**Purpose:** Central customer information with enhanced Turkish authentication

```sql
CREATE TABLE users (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Basic Information
    customer_id VARCHAR(50) UNIQUE NOT NULL,        -- Business key (CUST001, CUST002, etc.)
    phone_number VARCHAR(20) UNIQUE NOT NULL,       -- +905551234567
    first_name VARCHAR(100) NOT NULL,               -- Ahmet
    last_name VARCHAR(100) NOT NULL,                -- Yılmaz
    email VARCHAR(100) NOT NULL,                    -- ahmet.yilmaz@email.com

    -- 🔐 Enhanced Authentication Fields (TEKNOFEST 2025)
    tc_kimlik VARCHAR(11) UNIQUE NOT NULL,          -- Turkish ID Number (11 digits)
    birth_date DATE NOT NULL,                       -- For identity verification

    -- Security & Account Management
    failed_auth_attempts INTEGER DEFAULT 0,         -- Track failed login attempts
    last_auth_attempt TIMESTAMP,                    -- Last authentication try
    account_locked_until TIMESTAMP,                 -- Account lock expiration
    account_status VARCHAR(20) DEFAULT 'active',    -- active, suspended, closed
    customer_type VARCHAR(20) DEFAULT 'individual', -- individual, corporate

    -- Package & Contract Information
    current_package_id VARCHAR(50) REFERENCES packages(package_id),
    contract_end_date TIMESTAMP,

    -- Financial Information
    payment_status VARCHAR(20) DEFAULT 'paid',      -- paid, pending, overdue
    balance FLOAT DEFAULT 0.0,                      -- Account balance in TL
    credit_limit FLOAT DEFAULT 1000.0,              -- Credit limit in TL

    -- Usage Statistics
    data_usage_gb FLOAT DEFAULT 0.0,                -- Current month data usage
    voice_usage_minutes INTEGER DEFAULT 0,          -- Current month voice usage

    -- Address Information
    address TEXT,                                    -- Full address
    city VARCHAR(50),                               -- İstanbul, Ankara, etc.
    region VARCHAR(50),                             -- Marmara, İç Anadolu, etc.
    postal_code VARCHAR(10),                        -- Postal code

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_users_customer_id ON users(customer_id);
CREATE INDEX idx_users_phone_number ON users(phone_number);
CREATE INDEX idx_users_tc_kimlik ON users(tc_kimlik);
```

### 2. Packages Table

**Purpose:** Telecom service packages with pricing and features

```sql
CREATE TABLE packages (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Package Identification
    package_id VARCHAR(50) UNIQUE NOT NULL,         -- PKG001, PKG002, etc.
    name VARCHAR(100) NOT NULL,                     -- "Basic Plan", "Premium Plan"
    description TEXT,                               -- Package description

    -- Pricing Information
    price FLOAT NOT NULL,                           -- Monthly price in TL
    currency VARCHAR(10) DEFAULT 'TL',              -- Currency (TL, EUR, USD)

    -- Package Specifications
    data_limit_gb INTEGER,                          -- GB limit (-1 for unlimited)
    voice_minutes INTEGER,                          -- Voice minutes (-1 for unlimited)
    sms_count INTEGER,                              -- SMS count (-1 for unlimited)
    internet_speed_mbps INTEGER,                    -- Internet speed in Mbps

    -- Package Features (JSON)
    features JSON,                                  -- {"roaming": true, "hotspot": true}

    -- Status & Availability
    is_active BOOLEAN DEFAULT TRUE,                 -- Package is active
    is_available_for_new BOOLEAN DEFAULT TRUE,      -- Available for new customers

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_packages_package_id ON packages(package_id);
```

### 3. Bills Table

**Purpose:** Customer billing information and payment tracking

```sql
CREATE TABLE bills (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Bill Identification
    bill_id VARCHAR(50) UNIQUE NOT NULL,            -- BILL001, BILL002, etc.
    user_id INTEGER REFERENCES users(id),           -- Foreign key to users

    -- Billing Period
    billing_period_start TIMESTAMP,                 -- Start of billing period
    billing_period_end TIMESTAMP,                   -- End of billing period
    due_date TIMESTAMP,                             -- Payment due date

    -- Amount Breakdown
    base_amount FLOAT,                              -- Package base fee
    usage_charges FLOAT,                            -- Extra usage charges
    taxes FLOAT,                                    -- Tax amount
    discounts FLOAT DEFAULT 0.0,                    -- Discount amount
    total_amount FLOAT,                             -- Total bill amount

    -- Payment Information
    payment_status VARCHAR(20) DEFAULT 'pending',   -- pending, paid, overdue, cancelled
    payment_date TIMESTAMP,                         -- When payment was made
    payment_method VARCHAR(50),                     -- credit_card, bank_transfer, etc.

    -- Usage Details
    data_used_gb FLOAT DEFAULT 0.0,                 -- Data used in billing period
    voice_used_minutes INTEGER DEFAULT 0,           -- Voice minutes used
    sms_used_count INTEGER DEFAULT 0,               -- SMS count used

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bills_bill_id ON bills(bill_id);
CREATE INDEX idx_bills_user_id ON bills(user_id);
```

### 4. Support Tickets Table

**Purpose:** Customer support requests and issue tracking

```sql
CREATE TABLE support_tickets (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Ticket Identification
    ticket_id VARCHAR(50) UNIQUE NOT NULL,          -- TKT001, TKT002, etc.
    user_id INTEGER REFERENCES users(id),           -- Foreign key to users

    -- Issue Classification
    issue_type VARCHAR(50),                         -- connection, billing, hardware, account
    priority VARCHAR(20) DEFAULT 'medium',          -- low, medium, high, urgent
    status VARCHAR(20) DEFAULT 'open',              -- open, in_progress, resolved, closed

    -- Ticket Content
    title VARCHAR(200),                             -- Ticket title
    description TEXT,                               -- Detailed description
    resolution TEXT,                                -- Resolution notes

    -- Assignment
    assigned_agent VARCHAR(100),                    -- Assigned support agent

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP                           -- When ticket was resolved
);

-- Indexes
CREATE INDEX idx_support_tickets_ticket_id ON support_tickets(ticket_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
```

### 5. Technician Visits Table

**Purpose:** Scheduled technician visits for installations and repairs

```sql
CREATE TABLE technician_visits (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Visit Identification
    visit_id VARCHAR(50) UNIQUE NOT NULL,           -- VIS001, VIS002, etc.
    ticket_id INTEGER REFERENCES support_tickets(id), -- Related support ticket
    user_id INTEGER REFERENCES users(id),           -- Customer

    -- Visit Scheduling
    scheduled_date TIMESTAMP,                       -- Scheduled visit date/time
    actual_date TIMESTAMP,                          -- Actual visit date/time

    -- Technician Information
    technician_name VARCHAR(100),                   -- Technician name
    technician_phone VARCHAR(20),                   -- Technician contact

    -- Visit Status & Details
    status VARCHAR(20) DEFAULT 'scheduled',         -- scheduled, completed, cancelled, rescheduled
    visit_notes TEXT,                              -- Visit notes and findings
    customer_rating INTEGER,                        -- Customer satisfaction (1-5)

    -- Resolution Status
    issue_resolved BOOLEAN DEFAULT FALSE,           -- Was issue resolved?
    follow_up_required BOOLEAN DEFAULT FALSE,       -- Is follow-up needed?

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_technician_visits_visit_id ON technician_visits(visit_id);
CREATE INDEX idx_technician_visits_user_id ON technician_visits(user_id);
```

### 6. Package Changes Table

**Purpose:** Track package change requests and history

```sql
CREATE TABLE package_changes (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Change Identification
    change_id VARCHAR(50) UNIQUE NOT NULL,          -- CHG001, CHG002, etc.
    user_id INTEGER REFERENCES users(id),           -- Customer

    -- Package Change Details
    old_package_id VARCHAR(50),                     -- Previous package
    new_package_id VARCHAR(50),                     -- New package
    change_reason VARCHAR(100),                     -- upgrade, downgrade, customer_request

    -- Pricing Information
    old_price FLOAT,                                -- Previous package price
    new_price FLOAT,                                -- New package price
    price_difference FLOAT,                         -- Price difference

    -- Change Status
    status VARCHAR(20) DEFAULT 'pending',           -- pending, approved, completed, cancelled
    effective_date TIMESTAMP,                       -- When change takes effect

    -- Processing Information
    processed_by VARCHAR(100),                      -- Who processed (agent name or "automated")
    session_id VARCHAR(100),                        -- AI agent session ID

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_package_changes_change_id ON package_changes(change_id);
CREATE INDEX idx_package_changes_user_id ON package_changes(user_id);
```

### 7. Conversations Table

**Purpose:** AI agent conversation history and analytics

```sql
CREATE TABLE conversations (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Session Information
    session_id VARCHAR(100),                        -- AI agent session ID
    user_id INTEGER REFERENCES users(id),           -- Customer (nullable for unauthenticated)

    -- Message Details
    message_type VARCHAR(20),                       -- user, agent, system
    message_content TEXT,                           -- Message content
    scenario_type VARCHAR(50),                      -- authentication, billing, support, etc.

    -- AI Processing
    authenticated BOOLEAN DEFAULT FALSE,            -- Was user authenticated for this message?
    tools_used JSON,                                -- AI tools used {"get_user_info": true}
    processing_time_ms INTEGER,                     -- Processing time in milliseconds
    iteration_count INTEGER,                        -- Number of AI iterations

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
```

### 8. Agent Metrics Table

**Purpose:** AI agent performance tracking and analytics

```sql
CREATE TABLE agent_metrics (
    -- Primary Key
    id SERIAL PRIMARY KEY,

    -- Session Information
    session_id VARCHAR(100),                        -- AI session ID

    -- Performance Metrics
    total_messages INTEGER,                         -- Total messages in session
    successful_authentications INTEGER,             -- Successful auth attempts
    failed_authentications INTEGER,                 -- Failed auth attempts
    tools_called JSON,                              -- Tools usage {"get_user_info": 2, "get_packages": 1}

    -- Quality Metrics
    customer_satisfaction FLOAT,                    -- Customer rating (1-5)
    resolution_status VARCHAR(20),                  -- resolved, escalated, incomplete

    -- Response Time Metrics
    avg_response_time_ms FLOAT,                     -- Average response time
    min_response_time_ms INTEGER,                   -- Minimum response time
    max_response_time_ms INTEGER,                   -- Maximum response time

    -- Session Duration
    session_duration_minutes FLOAT,                 -- Total session duration
    conversation_ended_at TIMESTAMP,                -- When session ended

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_metrics_session_id ON agent_metrics(session_id);
```

## Key Features

### 🔐 Enhanced Authentication System

- **Turkish TC Kimlik validation** (11-digit identity number)
- **Progressive authentication** (phone → TC → birth date)
- **Account locking** after failed attempts
- **Session management** with Redis

### 📊 Comprehensive Analytics

- **Real-time performance tracking**
- **Customer satisfaction metrics**
- **Response time monitoring**
- **Tool usage analytics**

### 🎯 Business Logic Integration

- **Personalized package recommendations**
- **Customer type-based filtering**
- **Payment status considerations**
- **Usage pattern analysis**

## Sample Data

The system includes comprehensive sample data:

- **3 Customer profiles** (individual, corporate, overdue payment)
- **3 Package options** (Basic, Premium, Family)
- **Billing history** with different payment statuses
- **Support tickets** for testing scenarios

## Indexes and Performance

All tables include appropriate indexes for:

- **Primary keys** (automatic)
- **Foreign keys** for join performance
- **Business keys** (customer_id, package_id, etc.)
- **Frequently queried fields** (phone_number, tc_kimlik)

## Security Considerations

- **TC Kimlik validation** with proper format checking
- **Phone number validation** for Turkish numbers
- **Account locking** mechanism for security
- **Session management** with Redis for scalability
- **Audit trail** for all changes and activities

---

**Last Updated:** August 13, 2025  
**Version:** 1.0.0  
**Environment:** TEKNOFEST 2025 Competition Ready
