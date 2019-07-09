import * as iap from 'in-app-purchase';
import { Inject, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Query, Resolver, Mutation } from '@nestjs/graphql';

import { AuthGuard } from '../../user/auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { Permission } from '../../../common/decorators';
import moment = require('moment');
import { UserService } from '../../user/services/user.service';

@Resolver()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class PurchaseResolver {

  constructor(
    @Inject(UserService) private readonly userService: UserService,
    // @InjectBroker() private readonly userBroker: ServiceBroker,
    // @Inject(NotaddGrpcClientFactory) private readonly notaddGrpcClientFactory: NotaddGrpcClientFactory,
  ) {
  }

  private logger = new Logger('purchase');

  @Query('sayPurchaseHello')
  async sayPurchaseHello(req, body) {
    return { code: 200, message: 'success', data: `hello ${body.name}` };
  }

  @Query('appleValidate')
  async appleValidate(req, body, context, resolveInfo) {
    const isReValidate = !!body.userId;

    let receipt = body.receipt;
    let userId = body.userId || context.user.id;
    await this.receiptModel.insertMany({
      createTime: moment().unix(),
      updateTime: moment().unix(),
      type: 'appleReceived',
      receipt: receipt,
      userId: userId,
    });
    let findResult = await this.receiptModel.find({ receipt: receipt, type: 'apple' }).exec();
    // if (findResult && findResult.length > 0) {
    //     if (findResult.userId.toString() !== userId) {
    //         throw new Error('other user already had this receipt');
    //     }
    //     // else if (findResult.validateData) {
    //     //     throw new Error('you already commit this receipt and already validate')
    //     // }
    // }
    let isProcessed = false;
    for (const res of findResult) {
      if (res.userId.toString() !== userId) {
        throw new Error('other user already had this receipt');
      }
      isProcessed = isProcessed || res.isProcessed;
    }
    iap.config({ applePassword: process.env.APPLE_SHARED_SECRECT || '' });
    await iap.setup();
    let validateData = await iap.validate(receipt);
    let isValidated = await iap.isValidated(validateData);
    let purchaseData = iap.getPurchaseData(validateData);
    let isCanceled = await Promise.all(purchaseData.map(data => iap.isCanceled(data)));
    let isExpired = await Promise.all(purchaseData.map(data => iap.isExpired(data)));
    let purchaseRecord = await this.receiptModel.insertMany({
      createTime: moment().unix(),
      updateTime: moment().unix(),
      type: 'apple',
      userId: userId,
      receipt: receipt,
      validateData: JSON.stringify(validateData),
      purchaseData: JSON.stringify(purchaseData),
      isProcessed: isProcessed,
    });
    let appleValidateRes = {
      isValidated: isValidated,
      isCanceled: isCanceled,
      isExpired: isExpired,
      purchaseRecord: purchaseRecord[0],
      isProcessed: isProcessed,
    };

    // 判断appleValidateRes然后做点什么
    if (appleValidateRes.isValidated) {
      // 验证过了的话，要不要给加上对应的钱
      const validateData = JSON.parse(appleValidateRes.purchaseRecord.validateData);
      const purchaseData = await this.purchaseModel.findOne({ productId: validateData.receipt.product_id });
      if (purchaseData && purchaseData.bundleId === validateData.receipt.bid && purchaseData.productId === validateData.receipt.product_id) {
        if (!appleValidateRes.isProcessed) {
          await this.userService.changeBalance(body.userId || context.user.id, purchaseData.price * 100, 'changeByIAP', JSON.stringify({
            operatorId: context.user.id,
            operatorExtraInfo: body.extraInfo,
            validateData: appleValidateRes,
            purchaseData,
          }));
        }
      } else {
        throw new Error('no purchase');
      }
    }
    if (isReValidate) {
      // tslint:disable-next-line:max-line-length
      this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(appleValidateRes)}`);
    }
    return { code: 200, message: 'success', data: appleValidateRes };
  }

  @Query('searchReceipt')
  @Permission('admin')
  async searchReceipt(req, body, context) {
    const appleValidateRes = await this.userBroker.call('purchase.searchReceipt', {
      type: body.type,
      page: body.page,
      limit: body.limit,
      keyword: body.keyword,
    }, {
      meta: {
        udid: context.udid,
        operationName: context.operationName,
        clientIp: context.clientIp,
      },
    });
    return { code: 200, message: 'success', data: appleValidateRes };
  }

  @Mutation('createPurchase')
  @Permission('editor')
  async createPurchase(req, body, context, resolveInfo) {
    const data = await this.userBroker.call('purchase.createPurchase', body.data);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Mutation('deletePurchase')
  @Permission('editor')
  async deletePurchase(req, body: { id: string }, context, resolveInfo) {
    const data = await this.userBroker.call('purchase.deletePurchase', body);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Query('searchPurchase')
  @Permission('editor')
  async searchPurchase(req, body, context, resolveInfo) {
    const data = await this.userBroker.call('purchase.searchPurchase', {
      type: body.type,
      page: body.page,
      limit: body.limit,
    });
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }
}
