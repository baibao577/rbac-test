import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DocumentPermission } from '../entities/document-permission.entity';
import { SystemPermission } from '../entities/system-permission.entity';
import { GroupMember } from '../entities/group-member.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(DocumentPermission)
    private permissionRepo: Repository<DocumentPermission>,
    @InjectRepository(SystemPermission)
    private systemPermissionRepo: Repository<SystemPermission>,
    @InjectRepository(GroupMember)
    private groupMemberRepo: Repository<GroupMember>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `user:${userId}:permissions`;
    
    let permissions = await this.cacheManager.get<string[]>(cacheKey);
    if (!permissions) {
      permissions = await this.loadUserPermissionsFromDB(userId);
      await this.cacheManager.set(cacheKey, permissions, 300000); // 5 minutes
    }
    return permissions;
  }

  async hasPermission(userId: string, required: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return this.matchPermission(userPermissions, required);
  }

  async getAccessibleResources(userId: string, action: string = 'use_for_ai_chat'): Promise<any[]> {
    const permissions = await this.loadUserPermissionsFromDB(userId);
    
    const resources = [];
    for (const perm of permissions) {
      const [scope, type, resource, permAction] = perm.split(':');
      if (scope === 'document' && (permAction === action || permAction === 'manage')) {
        resources.push({
          path: resource,
          type: type,
          permission_source: 'calculated'
        });
      } else if (scope === 'system' && (permAction === action || permAction === 'manage' || permAction === '*')) {
        resources.push({
          resourceType: type,
          resourceId: resource,
          permission_source: 'system'
        });
      }
    }
    return resources;
  }

  async setPermission(
    resourcePath: string,
    resourceType: 'folder' | 'file',
    assignedToType: 'user' | 'group' | 'all',
    assignedToId: string | null,
    permission: string
  ): Promise<void> {
    const docPermission = this.permissionRepo.create({
      resourcePath,
      resourceType,
      assignedToType,
      assignedToId,
      permission: permission as any,
    });

    await this.permissionRepo.save(docPermission);
    
    // Clear cache for affected users
    if (assignedToType === 'user' && assignedToId) {
      await this.cacheManager.del(`user:${assignedToId}:permissions`);
    } else if (assignedToType === 'group' && assignedToId) {
      const members = await this.groupMemberRepo.find({ where: { groupId: assignedToId } });
      for (const member of members) {
        await this.cacheManager.del(`user:${member.userId}:permissions`);
      }
    }
  }

  async setSystemPermission(
    resourceType: 'user' | 'guard' | 'setting' | 'report' | '*',
    resourceId: string,
    assignedToType: 'user' | 'group' | 'all',
    assignedToId: string | null,
    permission: 'read' | 'write' | 'delete' | 'manage' | '*'
  ): Promise<void> {
    const sysPermission = this.systemPermissionRepo.create({
      resourceType,
      resourceId,
      assignedToType,
      assignedToId,
      permission,
    });

    await this.systemPermissionRepo.save(sysPermission);
    
    // Clear cache for affected users
    if (assignedToType === 'user' && assignedToId) {
      await this.cacheManager.del(`user:${assignedToId}:permissions`);
    } else if (assignedToType === 'group' && assignedToId) {
      const members = await this.groupMemberRepo.find({ where: { groupId: assignedToId } });
      for (const member of members) {
        await this.cacheManager.del(`user:${member.userId}:permissions`);
      }
    }
  }

  private async loadUserPermissionsFromDB(userId: string): Promise<string[]> {
    const docQuery = `
      SELECT DISTINCT dp.resourcePath, dp.resourceType, dp.permission
      FROM document_permissions dp
      LEFT JOIN group_members gm ON dp.assignedToId = gm.groupId
      WHERE (gm.userId = ? AND dp.assignedToType = 'group')
         OR (dp.assignedToId = ? AND dp.assignedToType = 'user')
         OR (dp.assignedToType = 'all')
    `;

    const sysQuery = `
      SELECT DISTINCT sp.resourceType, sp.resourceId, sp.permission
      FROM system_permissions sp
      LEFT JOIN group_members gm ON sp.assignedToId = gm.groupId
      WHERE (gm.userId = ? AND sp.assignedToType = 'group')
         OR (sp.assignedToId = ? AND sp.assignedToType = 'user')
         OR (sp.assignedToType = 'all')
    `;

    const [docResults, sysResults] = await Promise.all([
      this.permissionRepo.query(docQuery, [userId, userId]),
      this.systemPermissionRepo.query(sysQuery, [userId, userId])
    ]);
    
    const docPermissions = docResults.map((row: any) => 
      `document:${row.resourceType}:${row.resourcePath}:${row.permission}`
    );
    
    const sysPermissions = sysResults.map((row: any) => 
      `system:${row.resourceType}:${row.resourceId}:${row.permission}`
    );
    
    return [...docPermissions, ...sysPermissions];
  }

  private matchPermission(userPermissions: string[], required: string): boolean {
    const [reqScope, reqType, reqResource, reqAction] = required.split(':');

    return userPermissions.some(perm => {
      const [scope, type, resource, action] = perm.split(':');

      return (scope === reqScope || scope === '*') &&
             (type === reqType || type === '*') &&
             this.matchResource(resource, reqResource) &&
             (action === reqAction || action === 'manage' || action === '*');
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

  async updatePermission(
    permissionId: string,
    resourcePath: string,
    resourceType: 'folder' | 'file',
    assignedToType: 'user' | 'group' | 'all',
    assignedToId: string | null,
    permission: string
  ): Promise<void> {
    const existingPermission = await this.permissionRepo.findOne({ where: { id: permissionId } });
    if (!existingPermission) {
      throw new Error('Permission not found');
    }

    existingPermission.resourcePath = resourcePath;
    existingPermission.resourceType = resourceType;
    existingPermission.assignedToType = assignedToType;
    existingPermission.assignedToId = assignedToId;
    existingPermission.permission = permission as any;

    await this.permissionRepo.save(existingPermission);
    await this.clearCacheForPermission(assignedToType, assignedToId);
  }

  async removePermission(permissionId: string): Promise<void> {
    const permission = await this.permissionRepo.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new Error('Permission not found');
    }

    await this.permissionRepo.remove(permission);
    await this.clearCacheForPermission(permission.assignedToType, permission.assignedToId);
  }

  async getDocumentPermissions(): Promise<DocumentPermission[]> {
    return await this.permissionRepo.find();
  }

  async getDocumentPermissionById(id: string): Promise<DocumentPermission | null> {
    return await this.permissionRepo.findOne({ where: { id } });
  }

  async updateSystemPermission(
    permissionId: string,
    resourceType: 'user' | 'guard' | 'setting' | 'report' | '*',
    resourceId: string,
    assignedToType: 'user' | 'group' | 'all',
    assignedToId: string | null,
    permission: 'read' | 'write' | 'delete' | 'manage' | '*'
  ): Promise<void> {
    const existingPermission = await this.systemPermissionRepo.findOne({ where: { id: permissionId } });
    if (!existingPermission) {
      throw new Error('System permission not found');
    }

    existingPermission.resourceType = resourceType;
    existingPermission.resourceId = resourceId;
    existingPermission.assignedToType = assignedToType;
    existingPermission.assignedToId = assignedToId;
    existingPermission.permission = permission;

    await this.systemPermissionRepo.save(existingPermission);
    await this.clearCacheForPermission(assignedToType, assignedToId);
  }

  async removeSystemPermission(permissionId: string): Promise<void> {
    const permission = await this.systemPermissionRepo.findOne({ where: { id: permissionId } });
    if (!permission) {
      throw new Error('System permission not found');
    }

    await this.systemPermissionRepo.remove(permission);
    await this.clearCacheForPermission(permission.assignedToType, permission.assignedToId);
  }

  async getSystemPermissions(): Promise<SystemPermission[]> {
    return await this.systemPermissionRepo.find();
  }

  async getSystemPermissionById(id: string): Promise<SystemPermission | null> {
    return await this.systemPermissionRepo.findOne({ where: { id } });
  }

  private async clearCacheForPermission(assignedToType: string, assignedToId: string | null): Promise<void> {
    if (assignedToType === 'user' && assignedToId) {
      await this.cacheManager.del(`user:${assignedToId}:permissions`);
    } else if (assignedToType === 'group' && assignedToId) {
      const members = await this.groupMemberRepo.find({ where: { groupId: assignedToId } });
      for (const member of members) {
        await this.cacheManager.del(`user:${member.userId}:permissions`);
      }
    } else if (assignedToType === 'all') {
      // Clear all user caches when 'all' permissions are modified
      // Note: cache-manager doesn't have reset(), so we'll clear individual user caches
      // This is a limitation - in production you might want to use a different cache clearing strategy
      console.log('Warning: Cannot clear all caches at once. Consider clearing specific user caches manually.');
    }
  }

  async getStructuredPermissions(userId: string): Promise<any> {
    const permissions = await this.loadUserPermissionsFromDB(userId);
    
    const structured = {
      document: [],
      system: []
    };

    permissions.forEach(perm => {
      const [scope, type, resource, action] = perm.split(':');
      
      if (scope === 'document') {
        structured.document.push({
          type: type, // 'file' or 'folder'
          path: resource,
          actions: [action],
          metadata: {
            source: 'calculated',
            inherited: false // You could enhance this with group membership info
          }
        });
      } else if (scope === 'system') {
        structured.system.push({
          resource_type: type,
          resource_id: resource,
          actions: [action],
          metadata: {
            source: 'calculated',
            inherited: false
          }
        });
      }
    });

    // Merge duplicate resources with multiple actions
    structured.document = this.mergeDuplicateResources(structured.document, 'path');
    structured.system = this.mergeDuplicateResources(structured.system, 'resource_type');

    return structured;
  }

  private mergeDuplicateResources(resources: any[], keyField: string): any[] {
    const merged = new Map();
    
    resources.forEach(resource => {
      const key = keyField === 'path' ? resource.path : `${resource.resource_type}:${resource.resource_id}`;
      
      if (merged.has(key)) {
        const existing = merged.get(key);
        existing.actions = [...new Set([...existing.actions, ...resource.actions])];
      } else {
        merged.set(key, { ...resource });
      }
    });
    
    return Array.from(merged.values());
  }
}