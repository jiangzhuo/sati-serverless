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
  @CreateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000))
    }
  })
  createTime: number;
  @Column('text')
  extraInfo: string;
}
