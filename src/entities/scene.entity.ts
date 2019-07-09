import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToMany, PrimaryColumn } from 'typeorm';
import { MindfulnessAlbumEntity, MindfulnessEntity, NatureAlbumEntity, NatureEntity, WanderAlbumEntity, WanderEntity } from '.';

@Entity('scene')
export class SceneEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text', unique: true })
  name: string;
  @ManyToMany(type => MindfulnessEntity, mindfulness => mindfulness.sceneEntities)
  mindfulness: MindfulnessEntity[];
  @ManyToMany(type => NatureEntity, nature => nature.sceneEntities)
  nature: NatureEntity[];
  @ManyToMany(type => WanderEntity, wander => wander.sceneEntities)
  wander: WanderEntity[];
  @ManyToMany(type => MindfulnessAlbumEntity, mindfulnessAlbum => mindfulnessAlbum.sceneEntities)
  mindfulnessAlbum: MindfulnessAlbumEntity[];
  @ManyToMany(type => NatureAlbumEntity, natureAlbum => natureAlbum.sceneEntities)
  natureAlbum: NatureAlbumEntity[];
  @ManyToMany(type => WanderAlbumEntity, wanderAlbum => wanderAlbum.sceneEntities)
  wanderAlbum: WanderAlbumEntity[];
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
