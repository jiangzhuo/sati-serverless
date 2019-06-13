import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, ManyToOne, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from "./user.entity";

@Entity('account')
export class AccountEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;
  @ManyToOne(type => UserEntity)
  @JoinColumn({ name: 'userId' })
  userId: string;
  @Column()
  value: number;
  @Column()
  afterBalance: number;
  @Column()
  type: string;
  @CreateDateColumn()
  createTime: number;
  @Column('text')
  extraInfo: string;
}
