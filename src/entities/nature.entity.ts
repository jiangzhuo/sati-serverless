import {
  Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, JoinTable,
  ManyToOne, JoinColumn, RelationId,
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
  // @ManyToMany(type => SceneEntity, scene => scene.nature, )
  // @JoinTable()
  // scenes: SceneEntity[];

  @ManyToMany(type => SceneEntity, scene => scene.nature, )
  @JoinTable()
  sceneEntities: SceneEntity[];
  // @RelationId((nature: NatureEntity) => nature.sceneEntities)
  // scenes: string[];
  @Column('float', { default: 0 })
  price: number;
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
  @Column({ type: "int", default: 0 })
  status: number;
  @Column({ type: "int", default: 0 })
  validTime: number;
  @Column({ type: "text", array: true, default: '{}' })
  __tag: string[];
}
