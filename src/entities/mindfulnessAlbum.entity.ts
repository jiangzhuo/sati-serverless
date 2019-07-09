import {
  Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, JoinTable,
  ManyToOne, JoinColumn, RelationId,
} from 'typeorm';
import { SceneEntity } from "./scene.entity";
import { UserEntity } from "./user.entity";

@Entity('mindfulness_album')
export class MindfulnessAlbumEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "text", array: true })
  background: string[];
  @Column({ type: "text", default: "" })
  name: string;
  @Column({ type: "text", default: "" })
  description: string;
  @ManyToMany(type => SceneEntity, scene => scene.mindfulnessAlbum)
  @JoinTable()
  sceneEntities: SceneEntity[];
  @RelationId((mindfulnessAlbum: MindfulnessAlbumEntity) => mindfulnessAlbum.sceneEntities)
  scenes: string[];
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
  copy: string;
  @Column({ type: "int", default: 0 })
  status: number;
  @Column({ type: "int", default: 0 })
  validTime: number;
  @Column({ type: "text", array: true, default: '{}' })
    // tslint:disable-next-line:variable-name
  __tag: string[];
}
