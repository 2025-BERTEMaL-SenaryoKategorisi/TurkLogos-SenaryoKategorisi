# Telecom API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required for these endpoints.

## Response Format

All responses are in JSON format with proper HTTP status codes.

---

## 1. Users API

### 1.1 Get All Users

**Endpoint:** `GET /api/v1/users`

**Description:** Retrieve a paginated list of all users with their package information.

**Parameters:**

- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 10)

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "accept: application/json"
```

**Response Example:**

```json
{
  "users": [
    {
      "id": 1,
      "customer_id": "MSTR001",
      "phone_number": "+905551234567",
      "first_name": "Ahmet",
      "last_name": "Yılmaz",
      "email": "ahmet.yilmaz@email.com",
      "tc_kimlik": "12345678901",
      "birth_date": "1990-01-01T00:00:00.000Z",
      "current_package_id": "PKG001",
      "payment_status": "paid",
      "balance": 0,
      "data_usage_gb": 5.2,
      "voice_usage_minutes": 450,
      "address": "Fenerbahçe Mahallesi, Bağdat Caddesi No:123, Kadıköy",
      "city": "İstanbul",
      "created_at": "2025-08-14T11:51:30.314Z",
      "updated_at": "2025-08-14T11:51:30.314Z",
      "package": {
        "package_id": "PKG001",
        "name": "Temel Paket",
        "price": 99.99
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  }
}
```

### 1.2 Get User by ID

**Endpoint:** `GET /api/v1/users/{id}`

**Description:** Retrieve a specific user by their ID.

**Parameters:**

- `id` (path, required): User ID

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/users/1" \
  -H "accept: application/json"
```

**Response Example:**

```json
{
  "id": 1,
  "customer_id": "MSTR001",
  "phone_number": "+905551234567",
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "email": "ahmet.yilmaz@email.com",
  "tc_kimlik": "12345678901",
  "birth_date": "1990-01-01T00:00:00.000Z",
  "current_package_id": "PKG001",
  "payment_status": "paid",
  "balance": 0,
  "data_usage_gb": 5.2,
  "voice_usage_minutes": 450,
  "address": "Fenerbahçe Mahallesi, Bağdat Caddesi No:123, Kadıköy",
  "city": "İstanbul",
  "created_at": "2025-08-14T11:51:30.314Z",
  "updated_at": "2025-08-14T11:51:30.314Z"
}
```

### 1.3 Create New User

**Endpoint:** `POST /api/v1/users`

**Description:** Create a new user in the system.

**Request Body:**

```json
{
  "customer_id": "MSTR007",
  "phone_number": "+905557890123",
  "first_name": "Ali",
  "last_name": "Veli",
  "email": "ali.veli@email.com",
  "tc_kimlik": "78901234567",
  "birth_date": "1990-05-15",
  "current_package_id": "PKG001",
  "address": "Kadıköy Mahallesi, Moda Caddesi No:456",
  "city": "İstanbul"
}
```

**Request Example:**

```bash
curl -X POST "http://localhost:3000/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "MSTR007",
    "phone_number": "+905557890123",
    "first_name": "Ali",
    "last_name": "Veli",
    "email": "ali.veli@email.com",
    "tc_kimlik": "78901234567",
    "birth_date": "1990-05-15",
    "current_package_id": "PKG001",
    "address": "Kadıköy Mahallesi, Moda Caddesi No:456",
    "city": "İstanbul"
  }'
```

### 1.4 Update User

**Endpoint:** `PUT /api/v1/users/{id}`

**Description:** Update an existing user's information.

**Parameters:**

- `id` (path, required): User ID

**Request Body:** Same as Create User, but all fields are optional.

### 1.5 Delete User

**Endpoint:** `DELETE /api/v1/users/{id}`

**Description:** Delete a user from the system.

**Parameters:**

- `id` (path, required): User ID

---

## 2. Packages API

### 2.1 Get All Packages

**Endpoint:** `GET /api/v1/packages`

**Description:** Retrieve all available packages.

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/packages" \
  -H "accept: application/json"
```

**Response Example:**

```json
[
  {
    "id": 1,
    "package_id": "PKG001",
    "name": "Temel Paket",
    "price": 99.99,
    "data_limit_gb": 10,
    "voice_minutes": 1000,
    "sms_count": 100,
    "features": {
      "roaming": false,
      "hotspot": true
    },
    "is_active": true,
    "created_at": "2025-08-14T11:51:30.310Z",
    "updated_at": "2025-08-14T11:51:30.310Z"
  }
]
```

### 2.2 Get Package by ID

**Endpoint:** `GET /api/v1/packages/{id}`

### 2.3 Create Package

**Endpoint:** `POST /api/v1/packages`

### 2.4 Update Package

**Endpoint:** `PUT /api/v1/packages/{id}`

### 2.5 Delete Package

**Endpoint:** `DELETE /api/v1/packages/{id}`

---

## 3. Bills API

### 3.1 Get All Bills

**Endpoint:** `GET /api/v1/bills`

**Description:** Retrieve all bills with user information.

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/bills" \
  -H "accept: application/json"
```

**Response Example:**

```json
[
  {
    "id": 1,
    "bill_id": "FTRA001",
    "user_id": 1,
    "billing_period_start": "2024-07-01T00:00:00.000Z",
    "billing_period_end": "2024-07-31T00:00:00.000Z",
    "due_date": "2024-08-15T00:00:00.000Z",
    "total_amount": 99.99,
    "payment_status": "paid",
    "payment_date": "2024-08-10T00:00:00.000Z",
    "data_used_gb": 8.5,
    "voice_used_minutes": 890,
    "created_at": "2025-08-14T11:51:30.316Z",
    "updated_at": "2025-08-14T11:51:30.316Z",
    "user": {
      "first_name": "Ahmet",
      "last_name": "Yılmaz",
      "phone_number": "+905551234567"
    }
  }
]
```

### 3.2 Get Bill by ID

**Endpoint:** `GET /api/v1/bills/{id}`

### 3.3 Create Bill

**Endpoint:** `POST /api/v1/bills`

**Request Body Example:**

```json
{
  "bill_id": "FTRA006",
  "user_id": 1,
  "billing_period_start": "2024-08-01",
  "billing_period_end": "2024-08-31",
  "due_date": "2024-09-15",
  "total_amount": 99.99,
  "data_used_gb": 7.2,
  "voice_used_minutes": 650
}
```

---

## 4. Support Tickets API

### 4.1 Get All Tickets

**Endpoint:** `GET /api/v1/tickets`

**Description:** Retrieve all support tickets with user information.

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/tickets" \
  -H "accept: application/json"
```

**Response Example:**

```json
[
  {
    "id": 1,
    "ticket_id": "DLK001",
    "user_id": 1,
    "issue_type": "baglanti",
    "priority": "yuksek",
    "status": "acik",
    "title": "İnternet bağlantısı yavaş",
    "description": "Son 3 gündür internet bağlantım çok yavaş. Hız testi 50 Mbps yerine sadece 5 Mbps gösteriyor.",
    "resolution": null,
    "resolved_at": null,
    "created_at": "2025-08-14T11:51:30.318Z",
    "updated_at": "2025-08-14T11:51:30.318Z",
    "user": {
      "first_name": "Ahmet",
      "last_name": "Yılmaz",
      "phone_number": "+905551234567"
    }
  }
]
```

### 4.2 Create Support Ticket

**Endpoint:** `POST /api/v1/tickets`

**Request Body Example:**

```json
{
  "ticket_id": "DLK008",
  "user_id": 1,
  "issue_type": "teknik",
  "priority": "orta",
  "title": "Yeni sorun başlığı",
  "description": "Sorun açıklaması burada yer alır."
}
```

---

## 5. User Information API (Special Utility Functions)

These are the main utility functions you requested: `getUserPackageInfo`, `getUserBillInfo`, `getUserSupportTickets`.

### 5.1 Get User Package Information

**Endpoint:** `GET /api/v1/user-info/{id}/package`

**Description:** Get comprehensive package information and usage analytics for a user.

**Parameters:**

- `id` (path, required): User ID

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/user-info/1/package" \
  -H "accept: application/json"
```

**Response Example:**

```json
{
  "user_info": {
    "id": 1,
    "customer_id": "MSTR001",
    "name": "Ahmet Yılmaz",
    "phone_number": "+905551234567",
    "email": "ahmet.yilmaz@email.com",
    "payment_status": "paid",
    "balance": 0,
    "data_usage_gb": 5.2,
    "voice_usage_minutes": 450
  },
  "current_package": {
    "package_id": "PKG001",
    "name": "Temel Paket",
    "price": 99.99,
    "data_limit_gb": 10,
    "voice_minutes": 1000,
    "sms_count": 100,
    "features": {
      "roaming": false,
      "hotspot": true
    },
    "is_active": true,
    "usage_summary": {
      "data_used_percentage": "52.00",
      "voice_used_percentage": "45.00",
      "remaining_data_gb": 4.8,
      "remaining_voice_minutes": 550
    }
  }
}
```

### 5.2 Get User Bill Information

**Endpoint:** `GET /api/v1/user-info/{id}/bills`

**Description:** Get comprehensive billing information and payment history for a user.

**Parameters:**

- `id` (path, required): User ID

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/user-info/1/bills" \
  -H "accept: application/json"
```

**Response Example:**

```json
{
  "user_info": {
    "id": 1,
    "customer_id": "MSTR001",
    "name": "Ahmet Yılmaz",
    "phone_number": "+905551234567",
    "payment_status": "paid",
    "current_balance": 0
  },
  "billing_summary": {
    "total_bills": 1,
    "total_owed": 0,
    "overdue_bills_count": 0,
    "overdue_amount": 0
  },
  "recent_bills": [
    {
      "bill_id": "FTRA001",
      "billing_period": {
        "start": "2024-07-01T00:00:00.000Z",
        "end": "2024-07-31T00:00:00.000Z"
      },
      "due_date": "2024-08-15T00:00:00.000Z",
      "amount": 99.99,
      "payment_status": "paid",
      "payment_date": "2024-08-10T00:00:00.000Z",
      "usage": {
        "data_used_gb": 8.5,
        "voice_used_minutes": 890
      },
      "created_at": "2025-08-14T11:51:30.316Z",
      "is_overdue": false
    }
  ]
}
```

### 5.3 Get User Support Tickets

**Endpoint:** `GET /api/v1/user-info/{id}/tickets`

**Description:** Get comprehensive support ticket information and analytics for a user.

**Parameters:**

- `id` (path, required): User ID

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/user-info/1/tickets" \
  -H "accept: application/json"
```

**Response Example:**

```json
{
  "user_info": {
    "id": 1,
    "customer_id": "MSTR001",
    "name": "Ahmet Yılmaz",
    "phone_number": "+905551234567",
    "email": "ahmet.yilmaz@email.com"
  },
  "tickets_summary": {
    "total_tickets": 2,
    "open_tickets": 1,
    "resolved_tickets": 1,
    "avg_resolution_days": 2,
    "status_breakdown": {
      "acik": 1,
      "cozuldu": 1
    },
    "priority_breakdown": {
      "yuksek": 1,
      "dusuk": 1
    }
  },
  "tickets": [
    {
      "ticket_id": "DLK001",
      "issue_type": "baglanti",
      "priority": "yuksek",
      "status": "acik",
      "title": "İnternet bağlantısı yavaş",
      "description": "Son 3 gündür internet bağlantım çok yavaş.",
      "resolution": null,
      "created_at": "2025-08-14T11:51:30.318Z",
      "resolved_at": null,
      "days_open": 1,
      "is_overdue": false
    }
  ]
}
```

### 5.4 Get Complete User Information

**Endpoint:** `GET /api/v1/user-info/{id}/complete`

**Description:** Get all user information (package, billing, and support tickets) in one call.

**Parameters:**

- `id` (path, required): User ID

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/user-info/1/complete" \
  -H "accept: application/json"
```

**Response:** Combines the responses from package, bills, and tickets endpoints.

### 5.5 Get User Dashboard

**Endpoint:** `GET /api/v1/user-info/{id}/dashboard`

**Description:** Get user dashboard with alerts and comprehensive overview.

**Parameters:**

- `id` (path, required): User ID

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/v1/user-info/1/dashboard" \
  -H "accept: application/json"
```

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful operation
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Example:**

```json
{
  "error": "User not found",
  "message": "The user with ID 999 does not exist"
}
```

---

## Data Types and Enums

### Payment Status

- `paid`: Faturalar ödenmiş
- `overdue`: Vadesi geçmiş
- `pending`: Beklemede

### Issue Types

- `baglanti`: Bağlantı sorunları
- `faturalama`: Faturalama sorunları
- `hesap`: Hesap sorunları
- `teknik`: Teknik sorunlar
- `paket`: Paket değişiklikleri

### Priority Levels

- `dusuk`: Düşük öncelik
- `orta`: Orta öncelik
- `yuksek`: Yüksek öncelik

### Ticket Status

- `acik`: Açık
- `devam_ediyor`: Devam ediyor
- `cozuldu`: Çözüldü
- `kapali`: Kapalı

---

## Integration Examples

### Node.js/JavaScript Example

```javascript
const axios = require("axios");

const baseURL = "http://localhost:3000";

// Get user package info
async function getUserPackageInfo(userId) {
  try {
    const response = await axios.get(
      `${baseURL}/api/v1/user-info/${userId}/package`
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}

// Create new user
async function createUser(userData) {
  try {
    const response = await axios.post(`${baseURL}/api/v1/users`, userData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}
```

### Python Example

```python
import requests

BASE_URL = 'http://localhost:3000'

def get_user_package_info(user_id):
    response = requests.get(f"{BASE_URL}/api/v1/user-info/{user_id}/package")
    return response.json()

def create_user(user_data):
    response = requests.post(f"{BASE_URL}/api/v1/users", json=user_data)
    return response.json()
```

This documentation provides all the endpoints with clear examples that you can use to integrate with other services or provide to AI agents as tools.
