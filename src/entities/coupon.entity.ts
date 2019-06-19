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
  @Column({ type: 'text', default: '' })
  couponCode: string;
  @Column()
  value: number;
  @Column({ type: 'int', default: 0 })
  status: number;
  @OneToOne(type => UserEntity)
  @JoinColumn()
  user: UserEntity;
  @CreateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000))
    }
  })
  createTime: number;
  @UpdateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000))
    }
  })
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
