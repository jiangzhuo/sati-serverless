import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('receipt')
export class ReceiptEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;
  @Column({ length: 20 })
  type: string;
  @ManyToOne(type => UserEntity)
  @JoinColumn({ name: 'userId' })
  userId: UserEntity;
  @Column('text')
  receipt: string;
  @Column()
  isProcessed: boolean;
  @Column('text')
  validateData: string;
  @Column('text')
  purchaseData: string;
  @CreateDateColumn()
  createTime: number;
  @UpdateDateColumn()
  updateTime: number;
}
