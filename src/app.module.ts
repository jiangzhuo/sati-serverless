import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { CatsModule } from './cats/cats.module';
import { UploadModule } from "./upload/upload.module";
import { DownloadModule } from "./download/download.module";

@Module({
  imports: [
    UploadModule,
    DownloadModule,
    CatsModule,
    GraphQLModule.forRoot({
      typePaths: ['./**/*.types.graphqls']
    })
  ],
  providers: [],
  exports: []
})
export class AppModule { }
