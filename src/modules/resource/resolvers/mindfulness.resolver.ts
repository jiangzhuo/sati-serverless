import { Logger, UseGuards, UseInterceptors, Inject } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../../../common/decorators';
import { AuthGuard } from '../../user/auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { MindfulnessService } from "../services/mindfulness.service";
import { DiscountService } from "../services/discount.service";

@Resolver()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class MindfulnessResolver {
  onModuleInit() {
  }

  constructor(
    @Inject(MindfulnessService) private readonly mindfulnessService: MindfulnessService,
    @Inject(DiscountService) private readonly discountService: DiscountService,
  ) {
  }

  private logger = new Logger('mindfulness');

  @Query('sayMindfulnessHello')
  async sayMindfulnessHello(req, body: { name: string }) {
    const msg = await this.mindfulnessService.sayHello(body.name);
    return { code: 200, message: 'success', data: msg };
  }

  @Query('getMindfulness')
  @Permission('anony')
  async getMindfulness(req, body: { first: number, after?: number, before?: number, status?: number }) {
    const data = await this.mindfulnessService.getMindfulness(body.first, body.after, body.before, body.status);
    return { code: 200, message: 'success', data };
  }

  @Query('getMindfulnessById')
  @Permission('anony')
  async getMindfulnessById(req, body: { id: string }) {
    const data = await this.mindfulnessService.getMindfulnessById(body.id);
    return { code: 200, message: 'success', data };
  }

  @Query('getMindfulnessByIds')
  @Permission('anony')
  async getMindfulnessByIds(req, body: { ids: [string] }) {
    const data = await this.mindfulnessService.getMindfulnessByIds(body.ids);
    // this.resourceCache.updateResourceCache(data, 'mindfulness');
    return { code: 200, message: 'success', data };
  }

  @Query('getMindfulnessRecordByMindfulnessId')
  @Permission('user')
  async getMindfulnessRecordByMindfulnessId(req, body: { mindfulnessId: string }, context) {
    const data = await this.mindfulnessService.getMindfulnessRecord(context.user.id, body.mindfulnessId);
    return { code: 200, message: 'success', data };
  }

  @Query('searchMindfulnessRecord')
  @Permission('editor')
  async searchMindfulnessRecord(req, body, context) {
    const data = await this.mindfulnessService.searchMindfulnessRecord(context.user.id, body.page, body.limit, body.sort, body.favorite, body.boughtTime);
    return { code: 200, message: 'success', data };
  }

  @Mutation('favoriteMindfulness')
  @Permission('user')
  async favoriteMindfulness(req, body: { id: string }, context) {
    const data = await this.mindfulnessService.favoriteMindfulness(context.user.id, body.id);
    return { code: 200, message: 'success', data };
  }

  @Query('searchMindfulness')
  @Permission('editor')
  async searchMindfulness(req, body) {
    const { total, data } = await this.mindfulnessService.searchMindfulness(body.keyword, (body.page - 1) * body.limit, body.limit);
    return { code: 200, message: 'success', data: { total, data } };
  }

  @Mutation('buyMindfulness')
  @Permission('user')
  async buyMindfulness(req, body: { id: string }, context) {
    const mindfulnessId = body.id;
    const discount = await this.discountService.getDiscountByResourceId(mindfulnessId);
    const data = await this.mindfulnessService.buyMindfulness(context.user.id, mindfulnessId, discount);
    return { code: 200, message: 'success', data };
  }

  @Mutation('startMindfulness')
  @Permission('user')
  async startMindfulness(req, body: { id: string }, context) {
    const data = await this.mindfulnessService.startMindfulness(context.user.id, body.id);
    return { code: 200, message: 'success', data };
  }

  @Mutation('finishMindfulness')
  @Permission('user')
  async finishMindfulness(req, body: { id: string, duration: number }, context) {
    const data = await this.mindfulnessService.finishMindfulness(context.user.id, body.id, body.duration);
    return { code: 200, message: 'success', data };
  }

  @Mutation('createMindfulness')
  @Permission('editor')
  async createMindfulness(req, body, context, resolveInfo) {
    const data = await this.mindfulnessService.createMindfulness(body.data);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Mutation('updateMindfulness')
  @Permission('editor')
  async updateMindfulness(req, body, context, resolveInfo) {
    const data = await this.mindfulnessService.updateMindfulness(body.id, body.data);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Mutation('deleteMindfulness')
  @Permission('editor')
  async deleteMindfulness(req, body: { id: string }, context, resolveInfo) {
    const data = await this.mindfulnessService.deleteMindfulness(body.id);
    // const { data } = await this.resourceBroker.call('mindfulness.deleteMindfulness', body);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }

  @Mutation('revertDeletedMindfulness')
  @Permission('editor')
  async revertDeletedMindfulness(req, body: { id: string }, context, resolveInfo) {
    const data = await this.mindfulnessService.revertDeletedMindfulness(body.id);
    // const { data } = await this.resourceBroker.call('mindfulness.revertDeletedMindfulness', body);
    // tslint:disable-next-line:max-line-length
    this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
    return { code: 200, message: 'success', data };
  }
}
