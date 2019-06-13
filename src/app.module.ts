import { Module, Global } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
// import { CatsModule } from './cats/cats.module';
// import { UploadModule } from "./upload/upload.module";
// import { DownloadModule } from "./download/download.module";

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from "./entities/user.entity";
import { UserModule } from "./modules/user/user.module";
import { AccountEntity } from './entities/account.entity';
import { GraphQLConfigService } from './graphql-config.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorsInterceptor } from "./common/interceptors";

@Global()
@Module({
  imports: [
    // UploadModule,
    // DownloadModule,
    // CatsModule,
    GraphQLModule.forRootAsync({
      useClass: GraphQLConfigService
    }),
    UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1  ',
      port: 5432,
      username: 'postgres',
      password: 'wangzhe88',
      database: 'sati_test',
      entities: ["entity/*.ts"],
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
export class AppModule { }
