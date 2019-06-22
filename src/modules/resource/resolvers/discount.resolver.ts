import { Inject, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../../../common/decorators';
import { AuthGuard } from '../../user/auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { DiscountService } from '../services/discount.service';
import { MindfulnessService } from "../services/mindfulness.service";

@Resolver()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class DiscountResolver {
  constructor(
    @Inject(DiscountService) private readonly discountService: DiscountService,
  ) {
  }

  private logger = new Logger('discount');

  @Query('sayDiscountHello')
  async sayDiscountHello(req, body: { name: string }) {
    // const { msg } = await this.resourceBroker.call('discount.sayHello', { name: body.name });
    const msg = this.discountService.sayHello(body.name);
    return { code: 200, message: 'success', data: msg };
  }

  @Query('getDiscount')
  @Permission('anony')
  async getDiscount(req, body) {
    let data;
    if (body.page) {
      data = await this.discountService.getDiscountByFromAndSize((body.page - 1) * body.limit, body.limit);
    } else {
      data = await this.discountService.getDiscount(body.first, body.after, body.before, body.discount);
    }
    return { code: 200, message: 'success', data };
  }

  @Query('getFree')
  @Permission('anony')
  async getFree(req, body) {
    body.discount = 0;
    let data;
    if (body.page) {
      data = await this.discountService.getDiscountByFromAndSize((body.page - 1) * body.limit, body.limit);
    } else {
      data = await this.discountService.getDiscount(body.first, body.after, body.before, body.discount);
    }
    return { code: 200, message: 'success', data };
  }

  @Query('getDiscountByPageAndLimit')
  @Permission('editor')
  async getDiscountByPageAndLimit(req, body) {
    let data;
    if (body.page) {
      data = await this.discountService.getDiscountByFromAndSize((body.page - 1) * body.limit, body.limit);
    } else {
      data = await this.discountService.getDiscount(body.first, body.after, body.before, body.discount);
    }
    return { code: 200, message: 'success', data };
  }

  @Query('countDiscount')
  @Permission('editor')
  async countDiscount(req, body) {
    const data = await this.discountService.countDiscount();
    return { code: 200, message: 'success', data };
  }

  @Query('getDiscountByIds')
  @Permission('anony')
  async getDiscountByIds(req, body: { ids: [string] }) {
    const data = await this.discountService.getDiscountByIds(body.ids);
    return { code: 200, message: 'success', data };
  }

  @Mutation('createDiscount')
  @Permission('editor')
  async createDiscount(req, body, context, resolveInfo) {
    const data = await await this.discountService.createDiscount(body);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Mutation('updateDiscount')
  @Permission('editor')
  async updateDiscount(req, body, context, resolveInfo) {
    const data = await this.discountService.updateDiscount(body.id, body.data);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Mutation('deleteDiscount')
  @Permission('editor')
  async deleteDiscount(req, body, context, resolveInfo) {
    const data = await this.discountService.deleteDiscount(body.id);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }
}
