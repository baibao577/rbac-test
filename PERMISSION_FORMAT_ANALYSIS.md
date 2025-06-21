# Permission Format Analysis & Client Usage Guide

## Current Format Analysis

### Current String-Based Format
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

### ✅ Advantages
1. **Compact**: Minimal data transfer
2. **Simple Storage**: Easy to cache and store
3. **Fast Comparison**: String matching for permission checks
4. **Flexible**: Supports wildcards naturally

### ❌ Disadvantages  
1. **Poor Client UX**: Requires string parsing on client-side
2. **Error-Prone**: Easy to make mistakes in string manipulation
3. **Not Discoverable**: Hard to understand what permissions exist
4. **No Metadata**: Missing context like permission source, expiry, etc.
5. **Hard to Debug**: Difficult to trace permission origins

## Client Usage Problems

### Current Client Code (Problematic)
```javascript
// ❌ Client has to parse strings manually
function canUserAccessFile(permissions, filePath, action) {
    return permissions.some(perm => {
        const [scope, type, resource, permAction] = perm.split(':');
        if (scope !== 'document') return false;
        if (permAction !== action && permAction !== 'manage') return false;
        
        // Client has to implement wildcard matching logic
        if (resource.endsWith('/*')) {
            const prefix = resource.slice(0, -2);
            return filePath.startsWith(prefix);
        }
        return resource === filePath;
    });
}

// Usage
const userPermissions = [
    "document:folder:/HR/*:use_for_ai_chat",
    "document:file:/public/logo.png:read"
];

const canAccess = canUserAccessFile(userPermissions, "/HR/employee-data.pdf", "use_for_ai_chat");
```

## Improved Client-Friendly Format

### Option 1: Structured Object Format
```json
{
    "user_id": "alice@company.com",
    "permissions": {
        "document": {
            "files": [
                {
                    "path": "/public/logo.png",
                    "actions": ["read"],
                    "source": "direct_assignment",
                    "granted_by": "admin@company.com",
                    "granted_at": "2024-01-15T10:30:00Z"
                }
            ],
            "folders": [
                {
                    "path": "/HR/*",
                    "actions": ["use_for_ai_chat"],
                    "source": "group_membership",
                    "group_name": "HR Team",
                    "granted_at": "2024-01-10T09:00:00Z"
                }
            ]
        },
        "system": {
            "user_management": {
                "actions": ["read", "write", "manage"],
                "scope": "*",
                "source": "group_membership",
                "group_name": "Admins"
            },
            "reports": {
                "actions": ["read"],
                "scope": "monthly-sales",
                "source": "direct_assignment"
            }
        }
    },
    "summary": {
        "total_permissions": 4,
        "has_admin_access": true,
        "can_manage_users": true,
        "accessible_folders": ["/HR/*", "/public/*"],
        "last_updated": "2024-01-15T10:30:00Z"
    }
}
```

### Option 2: Hybrid Format (Recommended)
```json
{
    "user_id": "alice@company.com",
    "permissions": {
        "raw": [
            "document:folder:/HR/*:use_for_ai_chat",
            "document:file:/public/logo.png:read",
            "system:user:*:manage"
        ],
        "parsed": {
            "document": [
                {
                    "type": "folder",
                    "path": "/HR/*",
                    "actions": ["use_for_ai_chat"],
                    "metadata": {
                        "source": "group",
                        "group_id": "hr-group-uuid",
                        "inherited": true
                    }
                },
                {
                    "type": "file", 
                    "path": "/public/logo.png",
                    "actions": ["read"],
                    "metadata": {
                        "source": "all_users",
                        "inherited": false
                    }
                }
            ],
            "system": [
                {
                    "resource_type": "user",
                    "resource_id": "*",
                    "actions": ["manage"],
                    "metadata": {
                        "source": "direct",
                        "assigned_by": "owner@company.com"
                    }
                }
            ]
        },
        "helpers": {
            "can_access_file": "/api/permissions/can-access-file",
            "can_perform_action": "/api/permissions/can-perform-action"
        }
    }
}
```

## Better Client Usage

### With Improved Format
```javascript
// ✅ Much cleaner client code
class PermissionManager {
    constructor(permissionData) {
        this.permissions = permissionData.permissions;
        this.helpers = permissionData.permissions.helpers;
    }

    // Simple object-based checking
    canAccessFile(filePath, action) {
        const docPerms = this.permissions.parsed.document;
        
        return docPerms.some(perm => {
            if (!perm.actions.includes(action) && !perm.actions.includes('manage')) {
                return false;
            }
            
            if (perm.type === 'file') {
                return perm.path === filePath;
            }
            
            if (perm.type === 'folder' && perm.path.endsWith('/*')) {
                const folderPath = perm.path.slice(0, -2);
                return filePath.startsWith(folderPath);
            }
            
            return false;
        });
    }

    canManageUsers() {
        return this.permissions.parsed.system.some(perm => 
            perm.resource_type === 'user' && 
            perm.actions.includes('manage')
        );
    }

    // Or use server-side helpers for complex logic
    async canAccessFileRemote(filePath, action) {
        const response = await fetch(`${this.helpers.can_access_file}?file=${filePath}&action=${action}`);
        return response.json();
    }
}

// Usage
const permManager = new PermissionManager(userPermissionResponse);
const canEdit = permManager.canAccessFile('/HR/employee.pdf', 'write');
const canManage = permManager.canManageUsers();
```

## Server-Side Helper Endpoints

### Add Convenience Methods to Controller
```javascript
// Add to PermissionController
@Get('can-access-file')
async canAccessFile(
    @Query('userId') userId: string,
    @Query('filePath') filePath: string,
    @Query('action') action: string = 'read'
) {
    const canAccess = await this.permissionService.hasPermission(
        userId, 
        `document:file:${filePath}:${action}`
    );
    return { can_access: canAccess, file_path: filePath, action };
}

@Get('can-manage-resource')
async canManageResource(
    @Query('userId') userId: string,
    @Query('resourceType') resourceType: string,
    @Query('resourceId') resourceId: string
) {
    const canManage = await this.permissionService.hasPermission(
        userId, 
        `system:${resourceType}:${resourceId}:manage`
    );
    return { can_manage: canManage, resource_type: resourceType };
}

@Get('accessible-paths')
async getAccessiblePaths(
    @Query('userId') userId: string,
    @Query('action') action: string = 'read'
) {
    const resources = await this.permissionService.getAccessibleResources(userId, action);
    const paths = resources.filter(r => r.permission_source === 'calculated').map(r => r.path);
    return { accessible_paths: paths, action };
}
```

## Client Implementation Examples

### React Hook Example
```javascript
// usePermissions.js
import { useState, useEffect } from 'react';

export function usePermissions(userId) {
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPermissions() {
            const response = await fetch(`/api/permissions/user-permissions?userId=${userId}&format=structured`);
            const data = await response.json();
            setPermissions(new PermissionManager(data));
            setLoading(false);
        }
        fetchPermissions();
    }, [userId]);

    return { permissions, loading };
}

// Component usage
function FileManager({ userId }) {
    const { permissions, loading } = usePermissions(userId);

    const handleFileClick = (filePath) => {
        if (permissions?.canAccessFile(filePath, 'read')) {
            openFile(filePath);
        } else {
            showAccessDenied();
        }
    };

    if (loading) return <Loading />;

    return (
        <div>
            {files.map(file => (
                <FileItem 
                    key={file.path}
                    file={file}
                    canView={permissions.canAccessFile(file.path, 'read')}
                    canEdit={permissions.canAccessFile(file.path, 'write')}
                    onClick={() => handleFileClick(file.path)}
                />
            ))}
        </div>
    );
}
```

### Vue.js Example
```javascript
// permissionMixin.js
export const permissionMixin = {
    computed: {
        userPermissions() {
            return this.$store.getters.userPermissions;
        }
    },
    methods: {
        canAccess(resource, action) {
            return this.userPermissions?.canAccessFile(resource, action) || false;
        },
        canManage(resourceType) {
            return this.userPermissions?.canManageResource(resourceType) || false;
        }
    }
};

// Component
export default {
    mixins: [permissionMixin],
    template: `
        <div>
            <button v-if="canAccess('/reports/sales.pdf', 'read')" @click="viewReport">
                View Sales Report
            </button>
            <button v-if="canManage('user')" @click="manageUsers">
                Manage Users
            </button>
        </div>
    `
};
```

## Recommendation

**Use Hybrid Format (Option 2)** because it provides:

1. **Raw strings** for server-side processing and caching
2. **Parsed objects** for easy client consumption  
3. **Helper endpoints** for complex permission logic
4. **Metadata** for debugging and audit trails
5. **Backward compatibility** with existing string-based logic

This approach gives you the best of both worlds - performance on the server and usability on the client.