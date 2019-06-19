import { Inject, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../../../common/decorators';
import { AuthGuard } from '../../user/auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { MindfulnessAlbumService } from '../services/mindfulnessAlbum.service';
import { DiscountService } from "../services/discount.service";

@Resolver()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class MindfulnessAlbumResolver {
    onModuleInit() {
    }

    constructor(
      @Inject(MindfulnessAlbumService) private readonly mindfulnessAlbumService: MindfulnessAlbumService,
      @Inject(DiscountService) private readonly discountService: DiscountService
    ) {
    }

    private logger = new Logger('mindfulnessAlbum');

    @Query('getMindfulnessAlbum')
    @Permission('anony')
    async getMindfulnessAlbum(req, body: { first: number, after?: number, before?: number, status?: number }) {
        const data = await this.mindfulnessAlbumService.getMindfulnessAlbum(body.first, body.after, body.before, body.status);
        return { code: 200, message: 'success', data };
    }

    @Query('getMindfulnessAlbumById')
    @Permission('anony')
    async getMindfulnessAlbumById(req, body: { id: string }) {
        const data = await this.mindfulnessAlbumService.getMindfulnessAlbumById(body.id);
        return { code: 200, message: 'success', data };
    }

    @Query('getMindfulnessAlbumByIds')
    @Permission('anony')
    async getMindfulnessAlbumByIds(req, body: { ids: [string] }) {
        const data = await this.mindfulnessAlbumService.getMindfulnessAlbumByIds(body.ids);
        return { code: 200, message: 'success', data };
    }

    @Mutation('createMindfulnessAlbum')
    @Permission('editor')
    async createMindfulnessAlbum(req, body, context, resolveInfo) {
        const data = await this.mindfulnessAlbumService.createMindfulnessAlbum(body.data);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('updateMindfulnessAlbum')
    @Permission('editor')
    async updateMindfulnessAlbum(req, body, context, resolveInfo) {
        const data = await this.mindfulnessAlbumService.updateMindfulnessAlbum(body.id, body.data);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('deleteMindfulnessAlbum')
    @Permission('editor')
    async deleteMindfulnessAlbum(req, body: { id: string }, context, resolveInfo) {
        const data = await this.mindfulnessAlbumService.deleteMindfulnessAlbum(body.id);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('revertDeletedMindfulnessAlbum')
    @Permission('editor')
    async revertDeletedMindfulnessAlbum(req, body: { id: string }, context, resolveInfo) {
        const data = await this.mindfulnessAlbumService.revertDeletedMindfulnessAlbum(body.id);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('favoriteMindfulnessAlbum')
    @Permission('user')
    async favoriteMindfulnessAlbum(req, body: { id: string }, context) {
        const data = await this.mindfulnessAlbumService.favoriteMindfulnessAlbum(context.user.id, body.id);
        return { code: 200, message: 'success', data };
    }

    @Query('searchMindfulnessAlbum')
    @Permission('editor')
    async searchMindfulnessAlbum(req, body) {
        const { total, data } = await this.mindfulnessAlbumService.searchMindfulnessAlbum(body.keyword, (body.page - 1) * body.limit, body.limit);
        // this.resourceCache.updateResourceCache(data, 'mindfulnessAlbum');
        return { code: 200, message: 'success', data: { total, data } };
    }

    @Mutation('buyMindfulnessAlbum')
    @Permission('user')
    async buyMindfulnessAlbum(req, body: { id: string }, context) {
        const discount = await this.discountService.getDiscountByResourceId(body.id);
        const data = await this.mindfulnessAlbumService.buyMindfulnessAlbum(context.user.id, body.id, discount)
        return { code: 200, message: 'success', data };
    }

    @Mutation('startMindfulnessAlbum')
    @Permission('user')
    async startMindfulnessAlbum(req, body: { id: string }, context) {
        const data = await this.mindfulnessAlbumService.startMindfulnessAlbum(context.user.id, body.id);
        return { code: 200, message: 'success', data };
    }

    @Mutation('finishMindfulnessAlbum')
    @Permission('user')
    async finishMindfulnessAlbum(req, body: { id: string, duration: number }, context) {
        const data = await this.mindfulnessAlbumService.finishMindfulnessAlbum(context.user.id, body.id, body.duration);
        return { code: 200, message: 'success', data };
    }

    @Query('getMindfulnessAlbumRecordByMindfulnessAlbumId')
    @Permission('user')
    async getMindfulnessAlbumRecordByMindfulnessAlbumId(req, body: { mindfulnessAlbumId: string }, context) {
        const data = await this.mindfulnessAlbumService.getMindfulnessAlbumRecord(context.user.id, body.mindfulnessAlbumId);
        return { code: 200, message: 'success', data };
    }

    @Query('searchMindfulnessAlbumRecord')
    @Permission('editor')
    async searchMindfulnessAlbumRecord(req, body, context) {
        const data = await this.mindfulnessAlbumService.searchMindfulnessAlbumRecord(context.user.id, body.page, body.limit, body.sort, body.favorite, body.boughtTime);
        return { code: 200, message: 'success', data };
    }
}
