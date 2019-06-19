import { Module, Global } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
// import { CatsModule } from './cats/cats.module';
import { UploadModule } from "./modules/upload/upload.module";
import { DownloadModule } from "./modules/download/download.module";

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from "./modules/user/user.module";
import { GraphQLConfigService } from './graphql-config.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorsInterceptor } from "./common/interceptors";
import {
  UserEntity,
  AccountEntity,
  MindfulnessEntity,
  MindfulnessRecordEntity,
  DiscountEntity,
  SceneEntity, MindfulnessAlbumEntity
} from './entities';
import { ResourceModule } from "./modules/resource/resource.module";

@Global()
@Module({
  imports: [
    UploadModule,
    DownloadModule,
    // CatsModule,
    GraphQLModule.forRootAsync({
      useClass: GraphQLConfigService
    }),
    UserModule,
    ResourceModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1  ',
      port: 5432,
      username: 'postgres',
      password: 'wangzhe88',
      database: 'sati_test_home',
      entities: [__dirname + '/entities/*.entity{.ts,.js}', __dirname + '/entities/*.view{.ts,.js}'],
      // entities: [AccountEntity, UserEntity, MindfulnessEntity,MindfulnessAlbumEntity, MindfulnessRecordEntity, DiscountEntity, SceneEntity],
      synchronize: true,
      keepConnectionAlive: true,
    })
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor
    }],
  exports: []
})
export class AppModule {
}
