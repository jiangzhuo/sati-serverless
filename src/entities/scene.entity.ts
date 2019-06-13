import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('scene')
export class SceneEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "text", unique: true })
  name: string;
}
