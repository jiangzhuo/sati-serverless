import * as iap from 'in-app-purchase';
import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../../user/services/auth.service';
import { UserService } from '../../user/services/user.service';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { UserEntity, AccountEntity, ReceiptEntity, PurchaseEntity } from '../../../entities';

import { Repository, Connection, In, MoreThanOrEqual } from 'typeorm';
import { GraphQLError } from 'graphql';
import * as uuidValidate from 'uuid-validate';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { isEmpty } from 'lodash';

// import { __ as t } from 'i18n';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(ReceiptEntity) private readonly receiptRepository: Repository<ReceiptEntity>,
    @InjectRepository(PurchaseEntity) private readonly purchaseRepository: Repository<PurchaseEntity>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
  ) { }

  async searchPurchase(page: number, limit: number, type?: string) {
    let query = this.purchaseRepository.createQueryBuilder('purchase');
    // 构建条件搜索purchase
    if (!isEmpty(type)) {
      query = query.where(`type = :type`, { type });
    }
    const [data, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { total, data };
  }

  async createPurchase(data) {
    if (!['appleConsumable', 'appleNonConsumable', 'appleAutoRenewableSubscription', 'appleNonRenewingSubscription'].includes(data.type)) {
      throw new Error('wrong iap type');
    }
    const newPurchase = this.purchaseRepository.create(data);
    return await this.purchaseRepository.save(newPurchase);
  }

  async deletePurchase(id) {
    const toDelete = await this.purchaseRepository.findOne(id);
    await this.purchaseRepository.remove(toDelete);
    return toDelete;
  }

  async getPurchaseByProductId(productId) {
    return await this.purchaseRepository.findOne({ productId });
  }

  async searchReceipt(page: number, limit: number, keyword?: string, type?: string) {
    let query = this.receiptRepository.createQueryBuilder('receipt');
    if (!isEmpty(keyword)) {
      const { data: users } = await this.userService.searchUser(keyword, 0, 100);
      query = query.where(`userId in :...userIds`, { userIds: users.map(item => item.id) });
    }
    // 构建条件搜索purchase
    if (!isEmpty(type)) {
      if (!isEmpty(keyword)) {
        // andWhere
        query = query.andWhere(`type = :type`, { type });
      } else {
        query = query.where(`type = :type`, { type });
      }
    }
    const [data, total] = await query.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { total, data };
  }

  async appleSubscription(data) {
    const newReceipt = this.receiptRepository.create({
      type: 'appleSubscriptionReceived',
      receipt: JSON.stringify(data),
    });
    await this.receiptRepository.save(newReceipt);
    return newReceipt;
  }

  async apple(receipt: string, userId: string) {
    const user = await this.userService.getUserById(userId);
    const newReceipt = this.receiptRepository.create({ type: 'appleReceived', receipt, userEntity: user });
    await this.receiptRepository.save(newReceipt);
    const findResult = await this.receiptRepository.find({ receipt, type: 'apple' });

    let isProcessed = false;
    for (const res of findResult) {
      if (res.userId.toString() !== userId) {
        throw new Error('other user already had this receipt');
      }
      isProcessed = isProcessed || res.isProcessed;
    }
    iap.config({ applePassword: process.env.APPLE_SHARED_SECRECT || '' });
    await iap.setup();
    const validateData = await iap.validate(receipt);
    const isValidated = await iap.isValidated(validateData);
    const purchaseData = iap.getPurchaseData(validateData);
    const isCanceled = await Promise.all(purchaseData.map(data => iap.isCanceled(data)));
    const isExpired = await Promise.all(purchaseData.map(data => iap.isExpired(data)));

    const purchaseRecord = await this.receiptRepository.create({
      type: 'apple',
      userId,
      receipt,
      validateData: JSON.stringify(validateData),
      purchaseData: JSON.stringify(purchaseData),
      isProcessed,
    });
    await this.receiptRepository.save(purchaseRecord);
    return {
      isValidated,
      isCanceled,
      isExpired,
      purchaseRecord,
      isProcessed,
    };
  }
}
