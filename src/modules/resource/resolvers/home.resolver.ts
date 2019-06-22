import { Inject, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../../../common/decorators';
import { AuthGuard } from '../../user/auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { HomeService } from "../services/home.service";

@Resolver()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class HomeResolver {
    onModuleInit() {
    }

    constructor(
      @Inject(HomeService) private readonly homeService: HomeService,
    ) {
    }

    private logger = new Logger('home');

    @Query('sayHomeHello')
    async sayHomeHello(req, body: { name: string }) {
        const msg = await this.homeService.sayHello(body.name);
        return { code: 200, message: 'success', data: msg };
    }

    @Query('getHome')
    @Permission('anony')
    async getHome(req, body: { first: number, after?: number, before?: number, position?: number }) {
        const data = await this.homeService.getHome(body.first, body.after, body.before, body.position);
        return { code: 200, message: 'success', data };
    }

    @Query('getHomeByPageAndLimit')
    @Permission('editor')
    async getHomeByPageAndLimit(req, body) {
        const data = await this.homeService.getHome(body.first, body.after, body.before, body.position);
        return { code: 200, message: 'success', data };
    }

    @Query('countHome')
    @Permission('editor')
    async countHome(req, body) {
        const data = await this.homeService.countHome(body.position);
        return { code: 200, message: 'success', data };
    }

    @Query('getHomeById')
    @Permission('anony')
    async getHomeById(req, body: { id: string }) {
        const data = await this.homeService.getHomeById(body.id);
        return { code: 200, message: 'success', data };
    }

    @Mutation('createHome')
    @Permission('editor')
    async createHome(req, body, context, resolveInfo) {
        const data = await this.homeService.createHome(body.data);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('updateHome')
    @Permission('editor')
    async updateHome(req, body, context, resolveInfo) {
        const data = await this.homeService.updateHome(body.id, body.data);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('deleteHome')
    @Permission('editor')
    async deleteHome(req, body: { id: string }, context, resolveInfo) {
        const data = await this.homeService.deleteHome(body.id);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Query('getNew')
    @Permission('anony')
    async getNew(req, body: { first: number, after?: number, before?: number, status?: number }) {
        const data = await this.homeService.getNew(body.first, body.after, body.before, body.status);
        return { code: 200, message: 'success', data };
    }
}
