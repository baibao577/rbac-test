import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { DocumentPermission } from './entities/document-permission.entity';
import { SystemPermission } from './entities/system-permission.entity';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'rbac.db',
      entities: [Group, GroupMember, DocumentPermission, SystemPermission],
      synchronize: true,
    }),
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 100, // max items in cache
      isGlobal: true,
    }),
    PermissionModule,
  ],
})
export class AppModule {}