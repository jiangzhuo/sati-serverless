import { CacheModule, DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { MindfulnessResolver } from './resolvers/mindfulness.resolver';
// import { NatureResolver } from './resolvers/nature.resolver';
// import { WanderResolver } from './resolvers/wander.resolver';
// import { HomeResolver } from './resolvers/home.resolver';
import { SceneResolver } from './resolvers/scene.resolver';
import { MindfulnessAlbumResolver } from './resolvers/mindfulnessAlbum.resolver';
// import { NatureAlbumResolver } from './resolvers/natureAlbum.resolver';
// import { WanderAlbumResolver } from './resolvers/wanderAlbum.resolver';
import { DiscountResolver } from './resolvers/discount.resolver';
import {
  AccountEntity,
  DiscountEntity,
  MindfulnessAlbumEntity,
  MindfulnessEntity,
  MindfulnessRecordEntity,
  NatureEntity,
  NatureRecordEntity,
  SceneEntity,
  UserEntity,
  NatureAlbumEntity,
  WanderEntity,
  WanderRecordEntity,
  WanderAlbumEntity,
  MindfulnessAlbumRecordEntity,
  NatureAlbumRecordEntity,
  WanderAlbumRecordEntity
} from "../../entities";
import { TypeOrmModule } from '@nestjs/typeorm';
import { MindfulnessService } from './services/mindfulness.service';
import { DiscountService } from './services/discount.service';
import { SceneService } from './services/scene.service';
import { MindfulnessAlbumService } from './services/mindfulnessAlbum.service';

// @Global()
@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, UserEntity,
    MindfulnessEntity, MindfulnessRecordEntity, MindfulnessAlbumEntity, MindfulnessAlbumRecordEntity,
    NatureEntity, NatureRecordEntity, NatureAlbumEntity, NatureAlbumRecordEntity,
    WanderEntity, WanderRecordEntity, WanderAlbumEntity, WanderAlbumRecordEntity,
    DiscountEntity, SceneEntity])],
  providers: [
    MindfulnessResolver,
    MindfulnessService,
    MindfulnessAlbumResolver,
    MindfulnessAlbumService,
    // NatureResolver,
    // NatureAlbumResolver,
    // WanderResolver,
    // WanderAlbumResolver,
    // HomeResolver,
    SceneResolver,
    SceneService,
    DiscountResolver,
    DiscountService,
  ],
})
export class ResourceModule implements OnModuleInit {
  constructor() {
  }

  static forRoot(): DynamicModule {
    return {
      module: ResourceModule,
    };
  }

  async onModuleInit() {
    // await this.authService.saveResourcesAndPermissions(this.scanResourcesAndPermissions());
  }
}
