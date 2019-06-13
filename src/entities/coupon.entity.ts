import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from "./user.entity";

@Entity('coupon')
export class CouponEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;
  @Column('text', { default: '' })
  couponCode: string;
  @Column()
  value: number;
  @Column('bit', { default: '0' })
  status: number;
  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @CreateDateColumn()
  createTime: number;
  @UpdateDateColumn()
  updateTime: number;
  @Column({ type: "int", default: 0 })
  validTime: number;
  @Column({ type: "int", default: 0 })
  expireTime: number;
  @Column({ type: "int", default: 0 })
  usedTime: number;
  @Column('text')
  whoUse: string;
}
