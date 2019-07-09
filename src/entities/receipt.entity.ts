import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('receipt')
export class ReceiptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;
  @Column({ length: 30 })
  type: string;
  @ManyToOne(type => UserEntity)
  userEntity: UserEntity;
  @RelationId((receipt: ReceiptEntity) => receipt.userEntity, 'userId')
  userId: string[];
  @Column('text')
  receipt: string;
  @Column()
  isProcessed: boolean;
  @Column('text')
  validateData: string;
  @Column('text')
  purchaseData: string;
    @CreateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000)),
    },
  })

  createTime: number;
    @UpdateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000)),
    },
  })
  updateTime: number;
}
