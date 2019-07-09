import { Inject, Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '../../../common/decorators';
import { AuthGuard } from '../../user/auth/auth.guard';
import { LoggingInterceptor } from '../../../common/interceptors';
import { SceneService } from "../services/scene.service";

@Resolver()
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
export class SceneResolver {
    onModuleInit() {
    }

    constructor(
      @Inject(SceneService) private readonly sceneService: SceneService,
    ) {
    }

    private logger = new Logger('scene');

    @Query('saySceneHello')
    async saySceneHello(req, body: { name: string }) {
        const msg = await this.sceneService.sayHello(body.name);
        return { code: 200, message: 'success', data: msg };
    }

    @Query('getScene')
    @Permission('anony')
    async getScene(req, body: { first: number, after?: string }) {
        const data = await this.sceneService.getScene(body.first, body.after);
        return { code: 200, message: 'success', data };
    }

    @Query('getSceneById')
    @Permission('anony')
    async getSceneById(req, body: { id: string }) {
        const data  = await this.sceneService.getSceneById(body.id);
        return { code: 200, message: 'success', data };
    }

    @Query('getSceneByIds')
    @Permission('anony')
    async getSceneByIds(req, body: { ids: [string] }) {
        const data = await this.sceneService.getSceneByIds(body.ids);
        return { code: 200, message: 'success', data };
    }

    @Mutation('createScene')
    @Permission('editor')
    async createScene(req, body: { name: string }, context, resolveInfo) {
      const data = await this.sceneService.createScene(body.name);
        // tslint:disable-next-line:max-line-length
      this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
      return { code: 200, message: 'success', data };
    }

    @Mutation('updateScene')
    @Permission('editor')
    async updateScene(req, body: { id: string, name: string }, context, resolveInfo) {
        const data = await this.sceneService.updateScene(body.id, body.name);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }

    @Mutation('deleteScene')
    @Permission('editor')
    async deleteScene(req, body: { id: string }, context, resolveInfo) {
        const data = await this.sceneService.deleteScene(body.id);
        // tslint:disable-next-line:max-line-length
        this.logger.log(`${context.user && context.user.id}\t${context.udid}\t${context.clientIp}\t${context.operationName}\t${resolveInfo.fieldName}\t${JSON.stringify(data)}`);
        return { code: 200, message: 'success', data };
    }
}
