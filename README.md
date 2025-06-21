# RBAC API - Role-Based Access Control System

A comprehensive Role-Based Access Control (RBAC) system built with NestJS, TypeORM, and SQLite. This system supports both document-level and system-wide permissions with flexible user and group management.

## Features

### 🔐 Permission Types
- **Document Permissions**: File and folder-level access control
- **System Permissions**: Application-wide resource management
- **Hierarchical Permissions**: Manage permission implies all other permissions
- **Wildcard Support**: Flexible resource matching with `/*` patterns

### 👥 Assignment Types
- **User Permissions**: Direct user assignments
- **Group Permissions**: Role-based group assignments
- **Public Permissions**: Universal access for all users

### 🚀 Permission Actions
- **Document Actions**: `read`, `write`, `delete`, `manage`, `use_for_ai_chat`
- **System Actions**: `read`, `write`, `delete`, `manage`, `*` (all)

### 📊 API Features
- **RESTful API**: Complete CRUD operations for permissions
- **Client-Friendly**: Structured responses and helper endpoints
- **Caching**: 5-minute TTL for optimal performance
- **Comprehensive Testing**: 120+ test cases with Postman collection

## Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rbac-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run seed
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000/api`

## API Documentation

### Core Endpoints

#### Permission Management
```bash
# Set document permission
POST /api/permissions/set

# Set system permission
POST /api/permissions/set-system

# Get user permissions (simple format)
GET /api/permissions/user-permissions?userId=alice@company.com

# Get user permissions (structured format)
GET /api/permissions/user-permissions?userId=alice@company.com&format=structured

# Check specific permission
POST /api/permissions/check

# Get accessible resources
GET /api/permissions/accessible-resources?userId=alice@company.com&action=read
```

#### Helper Endpoints (Client-Friendly)
```bash
# Check file access
GET /api/permissions/can-access-file?userId=alice&filePath=/HR/file.pdf&action=read

# Check folder access
GET /api/permissions/can-access-folder?userId=bob&folderPath=/projects&action=write

# Check system resource management
GET /api/permissions/can-manage-resource?userId=admin&resourceType=user

# Get accessible paths
GET /api/permissions/accessible-paths?userId=alice&action=read
```

#### CRUD Operations
```bash
# List permissions
GET /api/permissions/document
GET /api/permissions/system

# Get specific permission
GET /api/permissions/document/:id
GET /api/permissions/system/:id

# Update permission
PUT /api/permissions/document/:id
PUT /api/permissions/system/:id

# Delete permission
DELETE /api/permissions/document/:id
DELETE /api/permissions/system/:id
```

## Permission Format

### Simple Format (Backward Compatible)
```json
{
  "user_id": "alice@company.com",
  "permissions": [
    "document:folder:/HR/*:use_for_ai_chat",
    "document:file:/public/logo.png:read",
    "system:user:*:manage"
  ]
}
```

### Structured Format (Client-Friendly)
```json
{
  "user_id": "alice@company.com",
  "permissions": {
    "raw": ["document:folder:/HR/*:use_for_ai_chat"],
    "parsed": {
      "document": [
        {
          "type": "folder",
          "path": "/HR/*",
          "actions": ["use_for_ai_chat"],
          "metadata": {
            "source": "calculated",
            "inherited": false
          }
        }
      ],
      "system": []
    },
    "helpers": {
      "can_access_file": "/api/permissions/can-access-file",
      "can_manage_resource": "/api/permissions/can-manage-resource"
    }
  }
}
```

## Testing

### API Testing
Import the provided Postman collection for comprehensive API testing:
- **File**: `RBAC_API_Postman_Collection.json`
- **Test Cases**: 120+ scenarios covering all endpoints
- **Categories**: CRUD operations, permission checking, error handling, complex scenarios

### cURL Examples
See `API_TEST_EXAMPLES.md` for detailed cURL examples and usage patterns.

## Database Schema

### Tables
- **`groups`**: User groups with system/document types
- **`group_members`**: User-to-group relationships
- **`document_permissions`**: File/folder-level permissions
- **`system_permissions`**: Application-wide permissions

### Sample Data
The seed script creates test data with:
- HR, Finance, Tech Team, Admin, and BD groups
- Sample users with various permission levels
- Document permissions for folders like `/HR/*`, `/Finance/*`
- System permissions for user management, guard settings, reports

## Architecture

### Technology Stack
- **Backend**: NestJS with TypeScript
- **Database**: SQLite with TypeORM
- **Caching**: In-memory cache with 5-minute TTL
- **API**: RESTful with client-friendly helpers

### Key Components
- **Entities**: TypeORM entities for all database tables
- **Services**: Business logic for permission management
- **Controllers**: RESTful API endpoints
- **Caching**: Automatic cache invalidation on permission changes

## Examples

### Setting Permissions

#### Document Permission
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/HR/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "hr-group-uuid",
    "permission": "use_for_ai_chat"
  }'
```

#### System Permission
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "user",
    "resourceId": "*",
    "assignedToType": "group",
    "assignedToId": "admin-group-uuid",
    "permission": "manage"
  }'
```

### Client Integration

#### React Hook Example
```javascript
import { useState, useEffect } from 'react';

export function usePermissions(userId) {
  const [permissions, setPermissions] = useState(null);
  
  useEffect(() => {
    async function fetchPermissions() {
      const response = await fetch(
        `/api/permissions/user-permissions?userId=${userId}&format=structured`
      );
      const data = await response.json();
      setPermissions(data.permissions);
    }
    fetchPermissions();
  }, [userId]);

  const canAccessFile = (filePath, action) => {
    return permissions?.parsed.document.some(perm => 
      perm.path === filePath && perm.actions.includes(action)
    );
  };

  return { permissions, canAccessFile };
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Review the `API_TEST_EXAMPLES.md` for detailed usage examples
- Check the `PERMISSION_FORMAT_ANALYSIS.md` for client integration guidance
- Import the Postman collection for interactive API testing

## Roadmap

- [ ] Redis caching for production scalability
- [ ] Permission inheritance from parent folders
- [ ] Audit trail for permission changes
- [ ] GraphQL API support
- [ ] Admin dashboard for permission management