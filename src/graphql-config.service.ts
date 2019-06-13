import { Inject, Injectable } from '@nestjs/common';
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql';
import { AuthService } from './modules/user/services/auth.service';
// import * as GraphQLJSON from 'graphql-type-json';

@Injectable()
export class GraphQLConfigService implements GqlOptionsFactory {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService
    ) { }

    createGqlOptions(): GqlModuleOptions {
        return {
            typePaths: ['./**/*.types.graphqls'],
            // resolvers: { JSON: GraphQLJSON },
            context: async ({ req }) => {
                const user = await this.authService.validateUser(req);
                const udid = req.headers.udid;
                const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                const operationName = req.body.operationName;
                return { user, udid, operationName, clientIp };
            },
        };
    }
}

