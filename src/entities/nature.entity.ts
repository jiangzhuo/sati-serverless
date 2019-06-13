import {
  Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, JoinTable,
  ManyToOne, JoinColumn
} from 'typeorm';
import { SceneEntity } from "./scene.entity";
import { UserEntity } from "./user.entity";
import { NatureAlbumEntity } from "./natureAlbum.entity";


@Entity('nature')
export class NatureEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "text", array: true })
  background: string[];
  @Column({ type: "text", default: "" })
  name: string;
  @Column({ type: "text", default: "" })
  description: string;
  @ManyToMany(type => SceneEntity)
  @JoinTable()
  scenes: SceneEntity[];
  @Column('float', { default: 0 })
  price: number;
  @CreateDateColumn()
  createTime: number;
  @UpdateDateColumn()
  updateTime: number;
  @ManyToOne(type => UserEntity)
  @JoinColumn({ name: 'author' })
  author: UserEntity;
  @Column({ type: "text", default: "" })
  audio: string;
  @Column({ type: "text", default: "" })
  copy: string;
  @ManyToMany(type => NatureAlbumEntity)
  @JoinTable()
  natureAlbums: NatureAlbumEntity[];
  @Column({ type: "bit", length: 32, default: "00000000000000000000000000000000" })
  status: number;
  @Column({ type: "int", default: 0 })
  validTime: number;
  @Column({ type: "text", array: true, default: [] })
  __tag: string[];
}
