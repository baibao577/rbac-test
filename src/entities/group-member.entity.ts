import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Group } from './group.entity';

@Entity('group_members')
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  groupId: string;

  @Column()
  userId: string;

  @ManyToOne(() => Group, group => group.members)
  @JoinColumn({ name: 'groupId' })
  group: Group;
}