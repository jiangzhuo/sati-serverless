import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';
import { UserEntity } from "./user.entity";

@Entity('home')
export class HomeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "int", unique: true })
  position: number;
  @Column({ type: "text", array: true })
  type: string;
  @Column({ type: "uuid" })
  resourceId: string;
  @Column({ type: "text", array: true })
  background: string[];
  @Column({ type: "text", default: "" })
  name: string;
  @Column({ type: "text", default: "" })
  description: string;
  @ManyToOne(type => UserEntity)
  @JoinColumn({ name: 'author' })
  author: UserEntity;
  @CreateDateColumn()
  createTime: number;
  @UpdateDateColumn()
  updateTime: number;
  @Column({ type: "int", default: 0 })
  validTime: number;
}

