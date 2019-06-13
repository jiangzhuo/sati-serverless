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
  @Column({ type: "bit", length: 32, default: "00000000000000000000000000000000" })
  status: number;
  @CreateDateColumn()
  createTime: number;
  @UpdateDateColumn()
  updateTime: number;
  @Column('integer', { default: 0 })
  balance: number;
  @Column({ type: "bit", length: 32, default: "00000000000000000000000000000000" })
  role: number;
}
