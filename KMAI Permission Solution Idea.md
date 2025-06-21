# KMAI: Permission Solution Idea

Date: June 21, 2025 3:41 PM

```jsx
Permission

    System
    Document

Group

    [System]
        Group: Owner
        Group: Admin
            All *: Setting, user mng, Guard etc.
        Group: BD Team
            Report menu
        Group: Tech Team - Knot, Tee, Alex
            Guard menu
            User mng.
    [Document]
        Group: Ferrari Team
        Group: HR
        Group: Finance
        Group: Labubu Team

Document List

    Folder A -> Assign permission for HR, Finance
    Folder B -> Assign permission for HR, Labubu Team, Tech Team
```

### **Core Structure**

```
{scope}:{resource_type}:{resource_id}:{action}
```

### **Permission Components**

**1. Scope**

- `system` - System-wide permissions
- `document` - Document-specific permissions

**2. Resource Type**

- `*` - All resources (wildcard)
- `folder` - Folder resources
- `file` - File resources
- `user` - User management
- `guard` - Guard engine settings
- `setting` - System settings
- `report` - Report functionality

**3. Resource ID**

- `*` - All instances of the resource type
- `{specific_id}` - Specific resource identifier
- `{folder_path}` - For document paths like `/HR/Policies/`

**4. Actions**

- `read` - View/access
- `write` - Create/edit
- `delete` - Remove
- `approve` - Content approval
- `manage` - Full management (includes all actions)
- `use_for_ai_chat` - RAG usage permission

### **Permission String Examples**

**System Permissions:**

```jsx
system:*:*:manage           # Owner - Full system access
system:user:*:manage        # Admin - User management
system:guard:*:manage       # Tech Team - Guard management
system:setting:*:manage     # Admin - System settings
system:report:*:read        # BD Team - Report access
```

**Document Permissions:**

```jsx
document:folder:/HR/*:use_for_ai_chat        # HR group access to HR folder
document:folder:/Finance/*:use_for_ai_chat   # Finance group access to Finance folder
document:file:/HR/policy.pdf:read            # Specific file access
document:*:*:manage                          # Document admin (can manage all docs)
```

### **Endpoint**: `GET /api/user-permissions/ai-chat`

**Response Format:**

```json
{
  "user_id": "alice@company.com",
  "accessible_resources": [
    {
      "path": "/Projects/Marketing/",
      "type": "folder",
      "permission_source": "group:marketing_team"
    },
    {
      "path": "/Projects/Marketing/Campaign2024/logo.png",
      "type": "file",
      "permission_source": "direct:user"
    }
  ]
}
```

## **Core Concept**

Instead of storing complex permission strings, we store **relationships** in the database:

```
User → Groups → Permissions → Resources
```

## **Simple Data Schema**

### **3 Main Tables:**

**1. Groups**

```
groups
├── id
├── name ("HR", "Tech Team", "Finance")
└── type ("system" or "document")

```

**2. Group Members**

```
group_members
├── group_id → groups.id
└── user_id → users.id

```

**3. Document Permissions**

```
document_permissions
├── resource_path ("/HR/folder", "/file.pdf")
├── resource_type ("folder" or "file")
├── assigned_to_type ("user", "group", "all")
├── assigned_to_id (group.id or user.id)
└── permission ("use_for_ai_chat", "read", "write")

```

## **How It Saves - Example:**

**Scenario:** Give HR group access to "/HR/Policies/" folder

**Steps:**

1. Create group: `INSERT INTO groups (name, type) VALUES ('HR', 'document')`
2. Add users to group: `INSERT INTO group_members (group_id, user_id) VALUES (...)`
3. Grant permission: `INSERT INTO document_permissions (resource_path, resource_type, assigned_to_type, assigned_to_id, permission) VALUES ('/HR/Policies/', 'folder', 'group', hr_group_id, 'use_for_ai_chat')`

**Result in DB:**

```
document_permissions table:
resource_path    | resource_type | assigned_to_type | assigned_to_id | permission
/HR/Policies/    | folder        | group           | uuid-hr-group | use_for_ai_chat
/Finance/Reports/| folder        | group           | uuid-fin-group| use_for_ai_chat
/logo.png        | file          | all             | NULL          | use_for_ai_chat
```

---

## **NestJS Permission Check Patterns**

### **Option 1: Database Query (Traditional)**

```tsx
@Injectable()
export class PermissionService {
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const permission = await this.permissionRepo.findOne({
      where: {
        user_id: userId,
        resource_path: Like(`${resource}%`),
        action: action
      }
    });
    return !!permission;
  }
}

// Usage in Guard
@UseGuards(PermissionGuard)
@RequirePermission('document:folder:/HR/*:use_for_ai_chat')
async getHRDocuments() {}

```

**❌ Problems:**

- Database hit on every request
- Slow (network + query time)
- Not scalable under load

### **Option 2: Cached Permissions (NestJS Best Practice)**

```tsx
@Injectable()
export class PermissionService {
  constructor(private cacheManager: Cache) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user:${userId}:permissions`;

    let permissions = await this.cacheManager.get<string[]>(cacheKey);
    if (!permissions) {
      // Load from DB once
      permissions = await this.loadUserPermissionsFromDB(userId);
      await this.cacheManager.set(cacheKey, permissions, 300); // 5 min TTL
    }
    return permissions;
  }

  async hasPermission(userId: string, required: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return this.matchPermission(userPermissions, required);
  }

  private matchPermission(userPermissions: string[], required: string): boolean {
    return userPermissions.some(permission =>
      this.isPermissionMatch(permission, required)
    );
  }
}

```

**✅ Benefits:**

- Cache hit = fast string matching
- Cache miss = single DB query loads all permissions
- Follows NestJS caching patterns

### **Option 3: JWT Claims (Zero DB Hits)**

```tsx
// Embed permissions in JWT
const payload = {
  sub: userId,
  permissions: [
    'document:folder:/HR/*:use_for_ai_chat',
    'system:user:*:manage'
  ]
};

// Guard checks JWT claims directly
@Injectable()
export class JwtPermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userPermissions = request.user.permissions; // From JWT
    const requiredPermission = this.getRequiredPermission(context);

    return this.matchPermission(userPermissions, requiredPermission);
  }
}

```

**✅ Benefits:**

- Zero database hits
- Ultra fast
- Stateless

**❌ Drawbacks:**

- JWT size grows with permissions
- Can't revoke permissions immediately
- Permission changes require re-login

## **Recommended NestJS Pattern**

### **Hybrid Approach: Cache + String Matching**

```tsx
@Injectable()
export class PermissionService {
  constructor(
    private cacheManager: Cache,
    private permissionRepo: Repository<Permission>
  ) {}

  async hasPermission(userId: string, required: string): Promise<boolean> {
    // 1. Try cache first (fast path)
    const permissions = await this.getCachedPermissions(userId);

    // 2. Fast string matching in memory
    return this.matchPermissionStrings(permissions, required);
  }

  private async getCachedPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user:${userId}:permissions`;

    let permissions = await this.cacheManager.get<string[]>(cacheKey);
    if (!permissions) {
      permissions = await this.loadPermissionsFromDB(userId);
      await this.cacheManager.set(cacheKey, permissions, 300);
    }
    return permissions;
  }

  private matchPermissionStrings(userPerms: string[], required: string): boolean {
    const [reqScope, reqType, reqResource, reqAction] = required.split(':');

    return userPerms.some(perm => {
      const [scope, type, resource, action] = perm.split(':');

      return (scope === reqScope || scope === '*') &&
             (type === reqType || type === '*') &&
             this.matchResource(resource, reqResource) &&
             (action === reqAction || action === '*');
    });
  }

  private matchResource(pattern: string, resource: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      const prefix = pattern.slice(0, -2);
      return resource.startsWith(prefix);
    }
    return pattern === resource;
  }
}

```

### **Usage with Guards**

```tsx
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private permissionService: PermissionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler()
    );

    return this.permissionService.hasPermission(userId, requiredPermission);
  }
}

// Decorator
export const RequirePermission = (permission: string) =>
  SetMetadata('permission', permission);

// Controller usage
@Controller('documents')
export class DocumentController {
  @Get('hr/*')
  @UseGuards(PermissionGuard)
  @RequirePermission('document:folder:/HR/*:use_for_ai_chat')
  getHRDocuments() {
    return this.documentService.getHRDocuments();
  }
}

```

## **Performance Comparison**

| Approach | First Request | Subsequent Requests | Memory Usage | Complexity |
| --- | --- | --- | --- | --- |
| **DB Query** | 50-100ms | 50-100ms | Low | Low |
| **Cache + String** | 50-100ms | 1-5ms | Medium | Medium |
| **JWT Claims** | 1ms | 1ms | Low | Low |

## **Recommendation**

**Use Cache + String Matching** because:

✅ **NestJS Standard** - Follows caching best practices

✅ **Fast** - Sub-5ms for cached permissions

✅ **Flexible** - Easy to add complex permission logic

✅ **Scalable** - Handles permission changes without re-login

✅ **Debuggable** - String permissions are readable

The string parsing overhead (1-2ms) is negligible compared to the cache benefits, and it keeps your permission logic simple and maintainable in NestJS.

---

## **Your Table Structure is Perfect ✅**

```sql
document_permissions (
  resource_path,     -- '/HR/Policies/', '/Finance/Reports/', '/logo.png'
  resource_type,     -- 'folder', 'file'
  assigned_to_type,  -- 'group', 'user', 'all'
  assigned_to_id,    -- uuid-hr-group, NULL for 'all'
  permission         -- 'use_for_ai_chat'
)

```

## **Why This Design Works Perfectly**

### **1. Simple Permission Generation**

```tsx
// Convert DB row to permission string - ONE line!
const permissionString = `document:${row.resource_type}:${row.resource_path}:${row.permission}`;

// Examples:
'document:folder:/HR/Policies/:use_for_ai_chat'
'document:folder:/Finance/Reports/:use_for_ai_chat'
'document:file:/logo.png:use_for_ai_chat'

```

### **2. Easy Management Queries**

```sql
-- Who can access HR folder?
SELECT u.email FROM users u
JOIN group_members gm ON u.id = gm.user_id
JOIN document_permissions dp ON gm.group_id = dp.assigned_to_id
WHERE dp.resource_path LIKE '/HR/%';

-- What can Alice access?
SELECT dp.resource_path FROM document_permissions dp
JOIN group_members gm ON dp.assigned_to_id = gm.group_id
JOIN users u ON gm.user_id = u.id
WHERE u.email = 'alice@company.com';

```

### **3. Perfect for Your Use Cases**

```tsx
// Your EPIC requirements fit perfectly:

// ✅ Folder permissions: '/HR/Policies/' → folder → group
// ✅ File permissions: '/logo.png' → file → all
// ✅ User permissions: any resource → user → specific user
// ✅ Group permissions: any resource → group → group uuid
// ✅ Public access: any resource → all → NULL
```

### **4. Scales Well**

- **Indexes**: `(assigned_to_id, resource_path)`, `(resource_path)`
- **Partitioning**: Can partition by resource_path prefix if needed
- **Caching**: Easy to cache user's permission strings

## **Don't Overthink It!**

Your design already handles:
✅ **Inheritance** - folder permissions apply to files inside

✅ **Groups** - via assigned_to_type = 'group'

✅ **Direct user** - via assigned_to_type = 'user'

✅ **Public access** - via assigned_to_type = 'all'

✅ **Multiple permissions** - just add more rows

✅ **Easy UI** - perfect for your Share modal from the EPIC

## **Implementation is Clean**

```tsx
@Injectable()
export class PermissionService {
  async getUserPermissionStrings(userId: string): Promise<string[]> {
    const permissions = await this.db.query(`
      SELECT resource_path, resource_type, permission
      FROM document_permissions dp
      LEFT JOIN group_members gm ON dp.assigned_to_id = gm.group_id
      WHERE (gm.user_id = ? AND dp.assigned_to_type = 'group')
         OR (dp.assigned_to_id = ? AND dp.assigned_to_type = 'user')
         OR (dp.assigned_to_type = 'all')
    `, [userId, userId]);

    return permissions.map(p =>
      `document:${p.resource_type}:${p.resource_path}:${p.permission}`
    );
  }
}
```