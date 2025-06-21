# RBAC API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## 1. DOCUMENT PERMISSIONS

### 1.1 Set Document Permission to User

#### Give specific user read access to a file
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/documents/contracts/contract-2024.pdf",
    "resourceType": "file",
    "assignedToType": "user",
    "assignedToId": "alice@company.com",
    "permission": "read"
  }'
```

#### Give specific user write access to a folder
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/projects/alpha/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "bob@company.com",
    "permission": "write"
  }'
```

#### Give specific user manage access to entire department folder
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/HR/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "charlie@company.com",
    "permission": "manage"
  }'
```

#### Give specific user AI chat access to research folder
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/research/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "dave@company.com",
    "permission": "use_for_ai_chat"
  }'
```

#### Give specific user delete access to temp files
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/temp/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "eve@company.com",
    "permission": "delete"
  }'
```

### 1.2 Set Document Permission to Group

#### Give HR group access to HR folder
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/HR/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "hr-group-uuid-here",
    "permission": "use_for_ai_chat"
  }'
```

#### Give Finance group manage access to financial reports
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/Finance/reports/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "finance-group-uuid-here",
    "permission": "manage"
  }'
```

#### Give Tech Team read access to logs
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/logs/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "tech-group-uuid-here",
    "permission": "read"
  }'
```

#### Give Marketing group write access to campaigns
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/marketing/campaigns/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "marketing-group-uuid-here",
    "permission": "write"
  }'
```

### 1.3 Set Document Permission to All Users

#### Give everyone read access to public documents
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/public/*",
    "resourceType": "folder",
    "assignedToType": "all",
    "permission": "read"
  }'
```

#### Give everyone read access to company logo
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/public/logo.png",
    "resourceType": "file",
    "assignedToType": "all",
    "permission": "read"
  }'
```

#### Give everyone AI chat access to knowledge base
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/knowledge-base/*",
    "resourceType": "folder",
    "assignedToType": "all",
    "permission": "use_for_ai_chat"
  }'
```

## 2. SYSTEM PERMISSIONS

### 2.1 Set System Permission to User

#### Give owner full system access
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "*",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "owner@company.com",
    "permission": "manage"
  }'
```

#### Give admin user management permissions
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "user",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "admin@company.com",
    "permission": "manage"
  }'
```

#### Give user read access to specific reports
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "report",
    "resourceId": "monthly-sales",
    "assignedToType": "user",
    "assignedToId": "manager@company.com",
    "permission": "read"
  }'
```

#### Give user write access to system settings
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "setting",
    "resourceId": "email-config",
    "assignedToType": "user",
    "assignedToId": "sysadmin@company.com",
    "permission": "write"
  }'
```

#### Give user guard management permissions
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "guard",
    "resourceId": "security-rules",
    "assignedToType": "user",
    "assignedToId": "security@company.com",
    "permission": "manage"
  }'
```

### 2.2 Set System Permission to Group

#### Give Admin group user management access
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "user",
    "resourceId": "*",
    "assignedToType": "group",
    "assignedToId": "admin-group-uuid-here",
    "permission": "manage"
  }'
```

#### Give Tech Team guard management access
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "guard",
    "resourceId": "*",
    "assignedToType": "group",
    "assignedToId": "tech-group-uuid-here",
    "permission": "manage"
  }'
```

#### Give BD Team report reading access
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "report",
    "resourceId": "*",
    "assignedToType": "group",
    "assignedToId": "bd-group-uuid-here",
    "permission": "read"
  }'
```

#### Give DevOps group setting management access
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "setting",
    "resourceId": "*",
    "assignedToType": "group",
    "assignedToId": "devops-group-uuid-here",
    "permission": "manage"
  }'
```

### 2.3 Set System Permission to All Users

#### Give everyone read access to system reports
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "report",
    "resourceId": "public-metrics",
    "assignedToType": "all",
    "permission": "read"
  }'
```

#### Give everyone read access to basic settings
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "setting",
    "resourceId": "timezone",
    "assignedToType": "all",
    "permission": "read"
  }'
```

## 3. PERMISSION CHECKING

### 3.1 Get User Permissions

#### Get all permissions for a user (simple format)
```bash
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=alice@company.com"
```

#### Get all permissions for a user (structured format)
```bash
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=alice@company.com&format=structured"
```

#### Get all permissions for admin user
```bash
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=admin@company.com"
```

#### Get all permissions for admin user (structured)
```bash
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=admin@company.com&format=structured"
```

#### Get all permissions for owner
```bash
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=owner@company.com"
```

### 3.2 Check Specific Permissions

#### Check if user can read a specific document
```bash
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice@company.com",
    "permission": "document:file:/documents/contracts/contract-2024.pdf:read"
  }'
```

#### Check if user can manage HR folder
```bash
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "charlie@company.com",
    "permission": "document:folder:/HR/*:manage"
  }'
```

#### Check if user can manage system users
```bash
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "admin@company.com",
    "permission": "system:user:*:manage"
  }'
```

#### Check if user can read reports
```bash
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "manager@company.com",
    "permission": "system:report:monthly-sales:read"
  }'
```

#### Check if user can manage guards
```bash
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "security@company.com",
    "permission": "system:guard:security-rules:manage"
  }'
```

### 3.3 Get Accessible Resources

#### Get resources user can use for AI chat
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-resources?userId=alice@company.com&action=use_for_ai_chat"
```

#### Get resources user can read
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-resources?userId=bob@company.com&action=read"
```

#### Get resources user can write
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-resources?userId=charlie@company.com&action=write"
```

#### Get resources user can manage
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-resources?userId=admin@company.com&action=manage"
```

#### Get resources user can delete
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-resources?userId=eve@company.com&action=delete"
```

### 3.4 Helper Endpoints for Client-Friendly Permission Checking

#### Check if user can access specific file
```bash
curl -X GET "http://localhost:3000/api/permissions/can-access-file?userId=alice@company.com&filePath=/documents/contracts/contract-2024.pdf&action=read"
```

#### Check if user can access folder
```bash
curl -X GET "http://localhost:3000/api/permissions/can-access-folder?userId=bob@company.com&folderPath=/projects/alpha&action=write"
```

#### Check if user can manage system resource
```bash
curl -X GET "http://localhost:3000/api/permissions/can-manage-resource?userId=admin@company.com&resourceType=user&resourceId=*"
```

#### Check if user can manage specific system resource
```bash
curl -X GET "http://localhost:3000/api/permissions/can-manage-resource?userId=security@company.com&resourceType=guard&resourceId=security-rules"
```

#### Get accessible paths for user
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-paths?userId=alice@company.com&action=read"
```

#### Get accessible paths for AI chat
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-paths?userId=dave@company.com&action=use_for_ai_chat"
```

#### Get accessible paths for management
```bash
curl -X GET "http://localhost:3000/api/permissions/accessible-paths?userId=admin@company.com&action=manage"
```

## 4. COMPLEX SCENARIOS

### 4.1 Hierarchical Permissions Test

#### User with manage permission should have all other permissions
```bash
# Set manage permission
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/projects/beta/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "project-manager@company.com",
    "permission": "manage"
  }'

# Test if user can read (should be true due to manage permission)
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "project-manager@company.com",
    "permission": "document:folder:/projects/beta/*:read"
  }'

# Test if user can write (should be true due to manage permission)
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "project-manager@company.com",
    "permission": "document:folder:/projects/beta/*:write"
  }'
```

### 4.2 Wildcard Permissions Test

#### System-wide wildcard permissions
```bash
# Give user all system permissions
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "*",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "superadmin@company.com",
    "permission": "*"
  }'

# Test various system permissions (all should be true)
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "superadmin@company.com",
    "permission": "system:user:specific-user:delete"
  }'

curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "superadmin@company.com",
    "permission": "system:guard:any-guard:manage"
  }'
```

### 4.3 Group Inheritance Test

#### Test user permissions through group membership
```bash
# First, you need the actual group UUIDs from the database
# Get group info first, then use in subsequent requests

# Test user permissions inherited from HR group
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=alice@company.com"

# Should show permissions inherited from HR group membership
```

## 5. EDGE CASES

### 5.1 Permission Conflicts

#### User has direct permission + group permission
```bash
# Give user direct read permission
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/shared/document.pdf",
    "resourceType": "file",
    "assignedToType": "user",
    "assignedToId": "test@company.com",
    "permission": "read"
  }'

# Assume user is also in a group with write permission to same resource
# Check what permissions user actually has
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=test@company.com"
```

### 5.2 Resource Path Matching

#### Test folder vs specific file permissions
```bash
# Give permission to folder
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/data/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "analyst@company.com",
    "permission": "read"
  }'

# Test if permission applies to specific file in folder
curl -X POST http://localhost:3000/api/permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "analyst@company.com",
    "permission": "document:file:/data/report.xlsx:read"
  }'
```

## 6. ERROR CASES

### 6.1 Invalid Permission Types
```bash
# Try invalid document permission
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/test/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "test@company.com",
    "permission": "invalid_permission"
  }'
```

### 6.2 Invalid Resource Types
```bash
# Try invalid system resource type
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "invalid_resource",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "test@company.com",
    "permission": "read"
  }'
```

## 7. PERFORMANCE TESTING

### 7.1 Cache Testing
```bash
# First request (should hit database)
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=alice@company.com"

# Second request immediately after (should hit cache)
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=alice@company.com"

# Wait 5+ minutes and request again (cache should expire)
```

---

## Notes for Testing

1. Replace `"hr-group-uuid-here"` and similar placeholders with actual UUIDs from your database
2. Run the seed script first: `npm run seed` or `ts-node src/seed.ts`
3. Start the application: `npm start`
4. All responses should return JSON with appropriate success/error messages
5. Monitor server logs to see cache hits/misses and database queries
6. Test edge cases to ensure proper error handling
7. Use different user emails to test various scenarios
8. Check database directly to verify permissions are stored correctly

## 8. PERMISSION MANAGEMENT (CRUD Operations)

### 8.1 List All Permissions

#### Get all document permissions
```bash
curl -X GET http://localhost:3000/api/permissions/document
```

#### Get all system permissions
```bash
curl -X GET http://localhost:3000/api/permissions/system
```

### 8.2 Get Specific Permission

#### Get specific document permission by ID
```bash
curl -X GET http://localhost:3000/api/permissions/document/permission-uuid-here
```

#### Get specific system permission by ID
```bash
curl -X GET http://localhost:3000/api/permissions/system/permission-uuid-here
```

### 8.3 Update/Edit Permissions

#### Update document permission
```bash
curl -X PUT http://localhost:3000/api/permissions/document/permission-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/HR/updated-folder/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "alice@company.com",
    "permission": "manage"
  }'
```

#### Update system permission
```bash
curl -X PUT http://localhost:3000/api/permissions/system/permission-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "user",
    "resourceId": "*",
    "assignedToType": "group",
    "assignedToId": "admin-group-uuid-here",
    "permission": "write"
  }'
```

#### Change permission level (read → write)
```bash
curl -X PUT http://localhost:3000/api/permissions/document/permission-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/documents/report.pdf",
    "resourceType": "file",
    "assignedToType": "user",
    "assignedToId": "bob@company.com",
    "permission": "write"
  }'
```

#### Change assignment from user to group
```bash
curl -X PUT http://localhost:3000/api/permissions/document/permission-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/marketing/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "marketing-group-uuid-here",
    "permission": "use_for_ai_chat"
  }'
```

#### Change resource scope (specific file → folder wildcard)
```bash
curl -X PUT http://localhost:3000/api/permissions/document/permission-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/projects/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "project-lead@company.com",
    "permission": "manage"
  }'
```

#### Upgrade system permission (read → manage)
```bash
curl -X PUT http://localhost:3000/api/permissions/system/permission-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "setting",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "admin@company.com",
    "permission": "manage"
  }'
```

### 8.4 Remove/Delete Permissions

#### Remove document permission
```bash
curl -X DELETE http://localhost:3000/api/permissions/document/permission-uuid-here
```

#### Remove system permission
```bash
curl -X DELETE http://localhost:3000/api/permissions/system/permission-uuid-here
```

#### Remove user's specific file access
```bash
# First find the permission ID, then delete
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.assignedToId=="alice@company.com" and .resourcePath=="/confidential/file.pdf")'
curl -X DELETE http://localhost:3000/api/permissions/document/found-permission-uuid
```

#### Remove group's folder access
```bash
# Find and remove group permission
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.assignedToId=="hr-group-uuid" and .resourcePath=="/HR/*")'
curl -X DELETE http://localhost:3000/api/permissions/document/found-permission-uuid
```

## 9. PERMISSION WORKFLOW EXAMPLES

### 9.1 Complete Permission Lifecycle

#### 1. Create initial permission
```bash
curl -X POST http://localhost:3000/api/permissions/set \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/temp-project/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "contractor@company.com",
    "permission": "read"
  }'
```

#### 2. List permissions to find the ID
```bash
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.assignedToId=="contractor@company.com")'
```

#### 3. Upgrade permission level
```bash
curl -X PUT http://localhost:3000/api/permissions/document/PERMISSION_ID_FROM_STEP_2 \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/temp-project/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "contractor@company.com",
    "permission": "write"
  }'
```

#### 4. Transfer to group
```bash
curl -X PUT http://localhost:3000/api/permissions/document/PERMISSION_ID_FROM_STEP_2 \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/temp-project/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "contractors-group-uuid",
    "permission": "write"
  }'
```

#### 5. Remove when project ends
```bash
curl -X DELETE http://localhost:3000/api/permissions/document/PERMISSION_ID_FROM_STEP_2
```

### 9.2 System Permission Management Workflow

#### 1. Grant initial system access
```bash
curl -X POST http://localhost:3000/api/permissions/set-system \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "report",
    "resourceId": "quarterly-reports",
    "assignedToType": "user",
    "assignedToId": "analyst@company.com",
    "permission": "read"
  }'
```

#### 2. Find and upgrade to full report access
```bash
curl -X GET http://localhost:3000/api/permissions/system | jq '.permissions[] | select(.assignedToId=="analyst@company.com")'
curl -X PUT http://localhost:3000/api/permissions/system/SYSTEM_PERMISSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "report",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "analyst@company.com",
    "permission": "read"
  }'
```

#### 3. Promote to report management
```bash
curl -X PUT http://localhost:3000/api/permissions/system/SYSTEM_PERMISSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "report",
    "resourceId": "*",
    "assignedToType": "user",
    "assignedToId": "analyst@company.com",
    "permission": "manage"
  }'
```

### 9.3 Permission Cleanup Operations

#### Remove all permissions for departing user
```bash
# Get all document permissions for user
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.assignedToId=="departing@company.com") | .id'

# Get all system permissions for user  
curl -X GET http://localhost:3000/api/permissions/system | jq '.permissions[] | select(.assignedToId=="departing@company.com") | .id'

# Delete each permission (replace with actual IDs)
curl -X DELETE http://localhost:3000/api/permissions/document/permission-id-1
curl -X DELETE http://localhost:3000/api/permissions/document/permission-id-2
curl -X DELETE http://localhost:3000/api/permissions/system/permission-id-3
```

#### Transfer user permissions to replacement
```bash
# Find user's permissions
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.assignedToId=="leaving@company.com")'

# Update each permission to new user
curl -X PUT http://localhost:3000/api/permissions/document/permission-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/original-resource-path",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "replacement@company.com",
    "permission": "manage"
  }'
```

## 10. BULK OPERATIONS AND ADVANCED SCENARIOS

### 10.1 Batch Permission Changes

#### Find and modify multiple permissions
```bash
# Get all HR folder permissions
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.resourcePath | contains("/HR/"))'

# Update permission level for all HR resources
# (You'll need to update each one individually with their specific IDs)
```

### 10.2 Permission Auditing

#### Audit user's current permissions
```bash
# Get comprehensive view
curl -X GET "http://localhost:3000/api/permissions/user-permissions?userId=admin@company.com"

# Get document permissions where user is assigned
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.assignedToId=="admin@company.com")'

# Get system permissions where user is assigned
curl -X GET http://localhost:3000/api/permissions/system | jq '.permissions[] | select(.assignedToId=="admin@company.com")'
```

#### Find all permissions for a resource
```bash
# Find all permissions for specific folder
curl -X GET http://localhost:3000/api/permissions/document | jq '.permissions[] | select(.resourcePath=="/HR/*")'

# Find all permissions for system resource type
curl -X GET http://localhost:3000/api/permissions/system | jq '.permissions[] | select(.resourceType=="user")'
```

### 10.3 Error Handling Tests

#### Try to update non-existent permission
```bash
curl -X PUT http://localhost:3000/api/permissions/document/non-existent-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/test/*",
    "resourceType": "folder",
    "assignedToType": "user",
    "assignedToId": "test@company.com",
    "permission": "read"
  }'
```

#### Try to delete non-existent permission
```bash
curl -X DELETE http://localhost:3000/api/permissions/document/non-existent-uuid
```

#### Invalid permission update data
```bash
curl -X PUT http://localhost:3000/api/permissions/document/valid-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "resourcePath": "/test/*",
    "resourceType": "invalid_type",
    "assignedToType": "user",
    "assignedToId": "test@company.com",
    "permission": "read"
  }'
```

## Expected Response Formats

### Success Response for Set Operations:
```json
{
  "success": true
}
```

### Error Response:
```json
{
  "error": "Permission not found"
}
```

### Get All Permissions Response:
```json
{
  "permissions": [
    {
      "id": "uuid-1",
      "resourcePath": "/HR/*",
      "resourceType": "folder",
      "assignedToType": "group",
      "assignedToId": "hr-group-uuid",
      "permission": "use_for_ai_chat"
    }
  ]
}
```

### Get Single Permission Response:
```json
{
  "permission": {
    "id": "uuid-1",
    "resourcePath": "/HR/*",
    "resourceType": "folder",
    "assignedToType": "group",
    "assignedToId": "hr-group-uuid",
    "permission": "use_for_ai_chat"
  }
}
```

### System Permissions Response:
```json
{
  "permissions": [
    {
      "id": "uuid-1",
      "resourceType": "user",
      "resourceId": "*",
      "assignedToType": "group",
      "assignedToId": "admin-group-uuid",
      "permission": "manage"
    }
  ]
}
```

### Helper Endpoint Responses:

#### Can Access File Response:
```json
{
  "can_access": true,
  "file_path": "/documents/contracts/contract-2024.pdf",
  "action": "read"
}
```

#### Can Access Folder Response:
```json
{
  "can_access": true,
  "folder_path": "/projects/alpha",
  "action": "write"
}
```

#### Can Manage Resource Response:
```json
{
  "can_manage": true,
  "resource_type": "user",
  "resource_id": "*"
}
```

#### Accessible Paths Response:
```json
{
  "accessible_paths": [
    "/HR/*",
    "/public/logo.png",
    "/projects/alpha/*"
  ],
  "accessible_system_resources": [
    {
      "type": "user",
      "id": "*"
    },
    {
      "type": "report",
      "id": "*"
    }
  ],
  "action": "read",
  "user_id": "alice@company.com"
}
```

### User Permissions Response (Simple Format):
```json
{
  "user_id": "alice@company.com",
  "permissions": [
    "document:folder:/HR/*:use_for_ai_chat",
    "document:file:/public/logo.png:read",
    "system:report:*:read"
  ]
}
```

### User Permissions Response (Structured Format):
```json
{
  "user_id": "alice@company.com",
  "permissions": {
    "raw": [
      "document:folder:/HR/*:use_for_ai_chat",
      "document:file:/public/logo.png:read",
      "system:report:*:read"
    ],
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
        },
        {
          "type": "file",
          "path": "/public/logo.png",
          "actions": ["read"],
          "metadata": {
            "source": "calculated",
            "inherited": false
          }
        }
      ],
      "system": [
        {
          "resource_type": "report",
          "resource_id": "*",
          "actions": ["read"],
          "metadata": {
            "source": "calculated",
            "inherited": false
          }
        }
      ]
    },
    "helpers": {
      "can_access_file": "/api/permissions/can-access-file",
      "can_manage_resource": "/api/permissions/can-manage-resource",
      "accessible_paths": "/api/permissions/accessible-paths"
    }
  }
}
```

### Permission Check Response:
```json
{
  "has_permission": true
}
```

### Accessible Resources Response:
```json
{
  "user_id": "alice@company.com",
  "accessible_resources": [
    {
      "path": "/HR/*",
      "type": "folder",
      "permission_source": "calculated"
    },
    {
      "resourceType": "report",
      "resourceId": "*",
      "permission_source": "system"
    }
  ]
}
```