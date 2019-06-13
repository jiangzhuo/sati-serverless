import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
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
  @CreateDateColumn()
  createTime: number;
  @UpdateDateColumn()
  updateTime: number;
}
