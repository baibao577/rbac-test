import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('document_permissions')
export class DocumentPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  resourcePath: string;

  @Column()
  resourceType: 'folder' | 'file';

  @Column()
  assignedToType: 'user' | 'group' | 'all';

  @Column({ nullable: true })
  assignedToId: string;

  @Column()
  permission: 'use_for_ai_chat' | 'read' | 'write' | 'delete' | 'manage';
}