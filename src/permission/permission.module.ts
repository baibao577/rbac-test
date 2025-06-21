import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { DocumentPermission } from '../entities/document-permission.entity';
import { SystemPermission } from '../entities/system-permission.entity';
import { GroupMember } from '../entities/group-member.entity';
import { Group } from '../entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentPermission, SystemPermission, GroupMember, Group])],
  controllers: [PermissionController],
  providers: [PermissionService],
  exports: [PermissionService],
})
export class PermissionModule {}