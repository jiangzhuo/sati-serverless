import {
  Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany, JoinTable,
  ManyToOne, JoinColumn, RelationId, AfterLoad,
} from 'typeorm';
import { SceneEntity } from './scene.entity';
import { UserEntity } from './user.entity';
import { MindfulnessAlbumEntity } from './mindfulnessAlbum.entity';
import { NatureEntity } from './nature.entity';

@Entity('mindfulness')
export class MindfulnessEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'text', array: true })
  background: string[];
  @Column({ type: 'text', default: '' })
  name: string;
  @Column({ type: 'text', default: '' })
  description: string;
  @ManyToMany(type => SceneEntity, scene => scene.mindfulness)
  @JoinTable({
    joinColumn: {
      name: 'mindfulnessId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'sceneId',
      referencedColumnName: 'id',
    },
  })
  sceneEntities: SceneEntity[];
  @RelationId((mindfulness: MindfulnessEntity) => mindfulness.sceneEntities)
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
  @ManyToOne(type => UserEntity, { nullable: false })
  @JoinColumn()
  authorEntity: UserEntity;
  @RelationId((mindfulness: MindfulnessEntity) => mindfulness.authorEntity, 'author')
  author: string;
  @Column({ type: 'text', default: '' })
  audio: string;
  @Column({ type: 'text', default: '' })
  copy: string;
  @ManyToMany(type => MindfulnessAlbumEntity)
  @JoinTable()
  mindfulnessAlbumEntities: MindfulnessAlbumEntity[];
  @RelationId((mindfulness: MindfulnessEntity) => mindfulness.mindfulnessAlbumEntities)
  mindfulnessAlbums: string[];
  @Column({ type: 'int', default: 0 })
  status: number;
  @Column({ type: 'int', default: 0 })
  validTime: number;
  @ManyToOne(type => NatureEntity, { nullable: true })
  @JoinColumn({ name: 'natureId' })
  natureEntity: NatureEntity;
  @RelationId((mindfulness: MindfulnessEntity) => mindfulness.natureEntity)
  natureId: string;
  @AfterLoad()
  async defaultEmptyNatureId() {
    if (!!!this.natureId) {
      this.natureId = '00000000-0000-0000-0000-000000000000';
    }
  }
  @Column({ type: 'text', array: true, default: '{}' })
    // tslint:disable-next-line:variable-name
  __tag: string[];
}
