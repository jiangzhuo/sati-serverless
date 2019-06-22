import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('purchase')
export class PurchaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: number;
  @Column('text', { default: '' })
  productId: string;
  @Column('text', { default: '' })
  bundleId: string;
  @Column({ length: 20, default: '' })
  type: string;
  @Column({ default: 0 })
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
}
