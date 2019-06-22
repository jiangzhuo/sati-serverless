import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ length: 100, unique: true })
  mobile: string;
  @Column({ length: 100 })
  username: string;
  @Column({ length: 120 })
  password: string;
  @Column({ length: 20 })
  nickname: string;
  @Column({ length: 100 })
  avatar: string;
  @Column({ type: "int", default: 0 })
  status: number;
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
  @Column('integer', { default: 0 })
  balance: number;
  @Column({ type: "int", default: 0 })
  role: number;
}
