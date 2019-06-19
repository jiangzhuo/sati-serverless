import {
  Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';

@Entity('discount')
export class DiscountEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column({ type: "text", array: true })
  type: string;
  @Column({ type: "uuid", unique: true })
  resourceId: string;
  @Column({ type: "text", array: true })
  background: string[];
  @Column({ type: "text", default: "" })
  name: string;
  @Column('float', { default: 0 })
  discount: number;
  @CreateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000))
    }
  })
  createTime: number;
  @UpdateDateColumn({
    transformer: {
      to: (value?: number) => (!value ? value : new Date(value * 1000)),
      from: (value?: Date) => (!value ? value : Math.round(value.getTime() / 1000))
    }
  })
  updateTime: number;
  @Column({ type: "int", default: 0 })
  beginTime: number;
  @Column({ type: "int", default: 0 })
  endTime: number;
}

