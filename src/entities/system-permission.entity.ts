import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('system_permissions')
export class SystemPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resourceType: 'user' | 'guard' | 'setting' | 'report' | '*';

  @Column()
  resourceId: string;

  @Column()
  assignedToType: 'user' | 'group' | 'all';

  @Column({ nullable: true })
  assignedToId: string;

  @Column()
  permission: 'read' | 'write' | 'delete' | 'manage' | '*';
}