import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { PermissionService } from './permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('user-permissions')
  async getUserPermissions(
    @Query('userId') userId: string,
    @Query('format') format: string = 'simple'
  ) {
    const permissions = await this.permissionService.getUserPermissions(userId);
    
    if (format === 'structured') {
      const structured = await this.permissionService.getStructuredPermissions(userId);
      return {
        user_id: userId,
        permissions: {
          raw: permissions,
          parsed: structured,
          helpers: {
            can_access_file: '/api/permissions/can-access-file',
            can_manage_resource: '/api/permissions/can-manage-resource',
            accessible_paths: '/api/permissions/accessible-paths'
          }
        }
      };
    }
    
    return { user_id: userId, permissions };
  }

  @Get('accessible-resources')
  async getAccessibleResources(
    @Query('userId') userId: string,
    @Query('action') action: string = 'use_for_ai_chat'
  ) {
    const resources = await this.permissionService.getAccessibleResources(userId, action);
    return {
      user_id: userId,
      accessible_resources: resources
    };
  }

  @Post('check')
  async checkPermission(@Body() body: { userId: string; permission: string }) {
    const hasPermission = await this.permissionService.hasPermission(
      body.userId,
      body.permission
    );
    return { has_permission: hasPermission };
  }

  @Post('set')
  async setPermission(@Body() body: {
    resourcePath: string;
    resourceType: 'folder' | 'file';
    assignedToType: 'user' | 'group' | 'all';
    assignedToId?: string;
    permission: string;
  }) {
    await this.permissionService.setPermission(
      body.resourcePath,
      body.resourceType,
      body.assignedToType,
      body.assignedToId || null,
      body.permission
    );
    return { success: true };
  }

  @Post('set-system')
  async setSystemPermission(@Body() body: {
    resourceType: 'user' | 'guard' | 'setting' | 'report' | '*';
    resourceId: string;
    assignedToType: 'user' | 'group' | 'all';
    assignedToId?: string;
    permission: 'read' | 'write' | 'delete' | 'manage' | '*';
  }) {
    await this.permissionService.setSystemPermission(
      body.resourceType,
      body.resourceId,
      body.assignedToType,
      body.assignedToId || null,
      body.permission
    );
    return { success: true };
  }

  @Get('document')
  async getDocumentPermissions() {
    const permissions = await this.permissionService.getDocumentPermissions();
    return { permissions };
  }

  @Get('document/:id')
  async getDocumentPermissionById(@Param('id') id: string) {
    const permission = await this.permissionService.getDocumentPermissionById(id);
    if (!permission) {
      return { error: 'Permission not found' };
    }
    return { permission };
  }

  @Get('system')
  async getSystemPermissions() {
    const permissions = await this.permissionService.getSystemPermissions();
    return { permissions };
  }

  @Get('system/:id')
  async getSystemPermissionById(@Param('id') id: string) {
    const permission = await this.permissionService.getSystemPermissionById(id);
    if (!permission) {
      return { error: 'Permission not found' };
    }
    return { permission };
  }

  @Put('document/:id')
  async updateDocumentPermission(@Param('id') id: string, @Body() body: {
    resourcePath: string;
    resourceType: 'folder' | 'file';
    assignedToType: 'user' | 'group' | 'all';
    assignedToId?: string;
    permission: string;
  }) {
    try {
      await this.permissionService.updatePermission(
        id,
        body.resourcePath,
        body.resourceType,
        body.assignedToType,
        body.assignedToId || null,
        body.permission
      );
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Put('system/:id')
  async updateSystemPermission(@Param('id') id: string, @Body() body: {
    resourceType: 'user' | 'guard' | 'setting' | 'report' | '*';
    resourceId: string;
    assignedToType: 'user' | 'group' | 'all';
    assignedToId?: string;
    permission: 'read' | 'write' | 'delete' | 'manage' | '*';
  }) {
    try {
      await this.permissionService.updateSystemPermission(
        id,
        body.resourceType,
        body.resourceId,
        body.assignedToType,
        body.assignedToId || null,
        body.permission
      );
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete('document/:id')
  async removeDocumentPermission(@Param('id') id: string) {
    try {
      await this.permissionService.removePermission(id);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete('system/:id')
  async removeSystemPermission(@Param('id') id: string) {
    try {
      await this.permissionService.removeSystemPermission(id);
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

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

  @Get('can-access-folder')
  async canAccessFolder(
    @Query('userId') userId: string,
    @Query('folderPath') folderPath: string,
    @Query('action') action: string = 'read'
  ) {
    const normalizedPath = folderPath.endsWith('/*') ? folderPath : `${folderPath}/*`;
    const canAccess = await this.permissionService.hasPermission(
      userId, 
      `document:folder:${normalizedPath}:${action}`
    );
    return { can_access: canAccess, folder_path: folderPath, action };
  }

  @Get('can-manage-resource')
  async canManageResource(
    @Query('userId') userId: string,
    @Query('resourceType') resourceType: string,
    @Query('resourceId') resourceId: string = '*'
  ) {
    const canManage = await this.permissionService.hasPermission(
      userId, 
      `system:${resourceType}:${resourceId}:manage`
    );
    return { can_manage: canManage, resource_type: resourceType, resource_id: resourceId };
  }

  @Get('accessible-paths')
  async getAccessiblePaths(
    @Query('userId') userId: string,
    @Query('action') action: string = 'read'
  ) {
    const resources = await this.permissionService.getAccessibleResources(userId, action);
    const documentPaths = resources
      .filter(r => r.permission_source === 'calculated')
      .map(r => r.path);
    const systemResources = resources
      .filter(r => r.permission_source === 'system')
      .map(r => ({ type: r.resourceType, id: r.resourceId }));
    
    return { 
      accessible_paths: documentPaths, 
      accessible_system_resources: systemResources,
      action,
      user_id: userId
    };
  }
}