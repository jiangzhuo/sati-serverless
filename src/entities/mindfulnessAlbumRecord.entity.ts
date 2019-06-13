import {
  Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { UserEntity } from "./user.entity";
import { MindfulnessEntity } from './mindfulness.entity';

@Entity('mindfulness_album_record')
@Index(['userId', 'mindfulnessAlbumId'], { unique: true })
export class MindfulnessAlbumRecordEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @ManyToOne(type => UserEntity)
  @JoinColumn({ name: 'userId' })
  userId: UserEntity;
  @ManyToOne(type => MindfulnessEntity)
  @JoinColumn({ name: 'mindfulnessAlbumId' })
  mindfulnessAlbumId: MindfulnessEntity;
  @Column({ type: "int" })
  favorite: number;// 是否收藏 偶数代表已经收藏 奇数代表没有收藏
  @Column({ type: "float" })
  totalDuration: number;// 累计时长
  @Column({ type: "float" })
  longestDuration: number;// 累计时长
  @Column({ type: "int" })
  startCount: number;// 总共开始次数
  @Column({ type: "int" })
  finishCount: number;// 总完成次数
  @Column({ type: "int", default: 0 })
  lastStartTime: number;// 上次开始时间
  @Column({ type: "int", default: 0 })
  lastFinishTime: number;// 上次结束时间
  @Column({ type: "int", default: 0 })
  boughtTime: number;// 购买时间，没有购买的话为0
}

