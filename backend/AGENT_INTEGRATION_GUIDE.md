# External Agent Integration Guide

## How to Change User Packages from Another Project

Your external agent can easily interact with the Telecom API to change user packages and perform other operations. Here are the complete examples:

### Base Configuration

```javascript
const TELECOM_API_BASE = "http://localhost:3000";

// For production, you might use:
// const TELECOM_API_BASE = 'https://your-api-domain.com';
```

### 1. Get Available Packages

```javascript
async function getAvailablePackages() {
  try {
    const response = await fetch(`${TELECOM_API_BASE}/api/v1/packages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const packages = await response.json();
    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    throw error;
  }
}

// Example response:
// [
//   {"id": 1, "package_id": "PKG001", "name": "Temel Paket", "price": 99.99, ...},
//   {"id": 2, "package_id": "PKG002", "name": "Premium Paket", "price": 199.99, ...},
//   {"id": 3, "package_id": "PKG003", "name": "Aile Paketi", "price": 299.99, ...}
// ]
```

### 2. Get User's Current Package

```javascript
async function getUserCurrentPackage(userId) {
  try {
    const response = await fetch(
      `${TELECOM_API_BASE}/api/v1/user-info/${userId}/package`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const userPackageInfo = await response.json();
    return userPackageInfo;
  } catch (error) {
    console.error("Error fetching user package:", error);
    throw error;
  }
}

// Example response:
// {
//   "user_info": {...},
//   "current_package": {
//     "package_id": "PKG001",
//     "name": "Temel Paket",
//     "price": 99.99,
//     "usage_summary": {...}
//   }
// }
```

### 3. Change User's Package

```javascript
async function changeUserPackage(userId, newPackageId) {
  try {
    const response = await fetch(`${TELECOM_API_BASE}/api/v1/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_package_id: newPackageId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error("Error changing user package:", error);
    throw error;
  }
}

// Usage example:
// await changeUserPackage(1, "PKG002"); // Change user 1 to Premium Paket
```

### 4. Complete Package Change Workflow

```javascript
async function upgradeUserPackage(userId, targetPackageId) {
  try {
    // 1. Get current package info
    console.log("Getting current user package...");
    const currentInfo = await getUserCurrentPackage(userId);
    console.log(`Current package: ${currentInfo.current_package.name}`);

    // 2. Check if upgrade is needed
    if (currentInfo.current_package.package_id === targetPackageId) {
      console.log("User already has the target package");
      return { success: false, message: "Already on target package" };
    }

    // 3. Change the package
    console.log(`Changing package to ${targetPackageId}...`);
    const updatedUser = await changeUserPackage(userId, targetPackageId);

    // 4. Verify the change
    const newInfo = await getUserCurrentPackage(userId);
    console.log(`New package: ${newInfo.current_package.name}`);

    return {
      success: true,
      message: "Package changed successfully",
      oldPackage: currentInfo.current_package,
      newPackage: newInfo.current_package,
    };
  } catch (error) {
    console.error("Package upgrade failed:", error);
    return { success: false, error: error.message };
  }
}
```

### 5. Agent Tool Functions

Here are ready-to-use tool functions for your agent:

```javascript
// Tool 1: Get user package information
async function tool_getUserPackageInfo(userId) {
  const response = await fetch(
    `${TELECOM_API_BASE}/api/v1/user-info/${userId}/package`
  );
  return await response.json();
}

// Tool 2: Change user package
async function tool_changeUserPackage(userId, packageId) {
  const response = await fetch(`${TELECOM_API_BASE}/api/v1/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_package_id: packageId }),
  });
  return await response.json();
}

// Tool 3: Get all available packages
async function tool_getPackages() {
  const response = await fetch(`${TELECOM_API_BASE}/api/v1/packages`);
  return await response.json();
}

// Tool 4: Get user billing info
async function tool_getUserBillingInfo(userId) {
  const response = await fetch(
    `${TELECOM_API_BASE}/api/v1/user-info/${userId}/bills`
  );
  return await response.json();
}

// Tool 5: Create support ticket
async function tool_createSupportTicket(ticketData) {
  const response = await fetch(`${TELECOM_API_BASE}/api/v1/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticketData),
  });
  return await response.json();
}
```

### 6. Python Examples

```python
import requests
import json

TELECOM_API_BASE = 'http://localhost:3000'

def get_user_package_info(user_id):
    """Get user's current package information"""
    response = requests.get(f"{TELECOM_API_BASE}/api/v1/user-info/{user_id}/package")
    return response.json()

def change_user_package(user_id, package_id):
    """Change user's package"""
    data = {"current_package_id": package_id}
    response = requests.put(
        f"{TELECOM_API_BASE}/api/v1/users/{user_id}",
        headers={"Content-Type": "application/json"},
        json=data
    )
    return response.json()

def get_available_packages():
    """Get all available packages"""
    response = requests.get(f"{TELECOM_API_BASE}/api/v1/packages")
    return response.json()

# Example usage:
# packages = get_available_packages()
# current_info = get_user_package_info(1)
# updated_user = change_user_package(1, "PKG002")
```

### 7. Real Example - Tested and Working

```bash
# 1. Check current package
curl -X GET "http://localhost:3000/api/v1/users/1"
# Response: current_package_id: "PKG001" (Temel Paket)

# 2. Change to Premium Package
curl -X PUT "http://localhost:3000/api/v1/users/1" \
  -H "Content-Type: application/json" \
  -d '{"current_package_id": "PKG002"}'
# Response: current_package_id: "PKG002" (Premium Paket)

# 3. Verify with detailed package info
curl -X GET "http://localhost:3000/api/v1/user-info/1/package"
# Response: Shows "Premium Paket" with updated usage calculations
```

### 8. Available Package IDs

- **PKG001**: Temel Paket (99.99 TL) - 10GB data, 1000 minutes
- **PKG002**: Premium Paket (199.99 TL) - 50GB data, unlimited minutes
- **PKG003**: Aile Paketi (299.99 TL) - 100GB data, unlimited minutes

### 9. Integration Checklist

✅ **CORS Enabled** - Your agent can make requests from any origin
✅ **No Authentication Required** - Direct API access
✅ **JSON Responses** - Easy to parse
✅ **Error Handling** - Proper HTTP status codes
✅ **Real-time Updates** - Changes are immediate
✅ **Validation** - Package IDs are validated

### 10. Agent Integration Template

```javascript
class TelecomAgent {
  constructor(apiBase = "http://localhost:3000") {
    this.apiBase = apiBase;
  }

  async changePackage(userId, packageId) {
    // Implementation using the functions above
    return await tool_changeUserPackage(userId, packageId);
  }

  async getPackageInfo(userId) {
    return await tool_getUserPackageInfo(userId);
  }

  async listPackages() {
    return await tool_getPackages();
  }
}

// Usage in your agent:
const telecomAgent = new TelecomAgent();
await telecomAgent.changePackage(1, "PKG002");
```

Your agent is now ready to interact with the Telecom API and change user packages! 🚀
