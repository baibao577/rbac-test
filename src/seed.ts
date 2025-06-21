import { DataSource } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { DocumentPermission } from './entities/document-permission.entity';
import { SystemPermission } from './entities/system-permission.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'rbac.db',
    entities: [Group, GroupMember, DocumentPermission, SystemPermission],
    synchronize: false,
  });

  await dataSource.initialize();

  // Create groups
  const hrGroup = await dataSource.getRepository(Group).save({
    name: 'HR',
    type: 'document',
  });

  const financeGroup = await dataSource.getRepository(Group).save({
    name: 'Finance',
    type: 'document',
  });

  const techGroup = await dataSource.getRepository(Group).save({
    name: 'Tech Team',
    type: 'system',
  });

  const adminGroup = await dataSource.getRepository(Group).save({
    name: 'Admins',
    type: 'system',
  });

  const bdGroup = await dataSource.getRepository(Group).save({
    name: 'BD Team',
    type: 'system',
  });

  // Add users to groups
  await dataSource.getRepository(GroupMember).save([
    { groupId: hrGroup.id, userId: 'alice@company.com' },
    { groupId: hrGroup.id, userId: 'bob@company.com' },
    { groupId: financeGroup.id, userId: 'charlie@company.com' },
    { groupId: techGroup.id, userId: 'dave@company.com' },
    { groupId: adminGroup.id, userId: 'admin@company.com' },
    { groupId: bdGroup.id, userId: 'bd@company.com' },
  ]);

  // Set permissions
  await dataSource.getRepository(DocumentPermission).save([
    {
      resourcePath: '/HR/*',
      resourceType: 'folder',
      assignedToType: 'group',
      assignedToId: hrGroup.id,
      permission: 'use_for_ai_chat',
    },
    {
      resourcePath: '/Finance/*',
      resourceType: 'folder',
      assignedToType: 'group',
      assignedToId: financeGroup.id,
      permission: 'use_for_ai_chat',
    },
    {
      resourcePath: '/public/logo.png',
      resourceType: 'file',
      assignedToType: 'all',
      assignedToId: null,
      permission: 'read',
    },
  ]);

  // Set system permissions
  await dataSource.getRepository(SystemPermission).save([
    {
      resourceType: '*',
      resourceId: '*',
      assignedToType: 'user',
      assignedToId: 'owner@company.com',
      permission: 'manage',
    },
    {
      resourceType: 'user',
      resourceId: '*',
      assignedToType: 'group',
      assignedToId: adminGroup.id,
      permission: 'manage',
    },
    {
      resourceType: 'guard',
      resourceId: '*',
      assignedToType: 'group',
      assignedToId: techGroup.id,
      permission: 'manage',
    },
    {
      resourceType: 'setting',
      resourceId: '*',
      assignedToType: 'group',
      assignedToId: adminGroup.id,
      permission: 'manage',
    },
    {
      resourceType: 'report',
      resourceId: '*',
      assignedToType: 'group',
      assignedToId: bdGroup.id,
      permission: 'read',
    },
  ]);

  console.log('Seed data created successfully!');
  await dataSource.destroy();
}

seed().catch(console.error);