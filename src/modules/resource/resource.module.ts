import { CacheModule, DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { MindfulnessResolver } from './resolvers/mindfulness.resolver';
import { NatureResolver } from './resolvers/nature.resolver';
import { WanderResolver } from './resolvers/wander.resolver';
import { HomeResolver } from './resolvers/home.resolver';
import { SceneResolver } from './resolvers/scene.resolver';
import { MindfulnessAlbumResolver } from './resolvers/mindfulnessAlbum.resolver';
import { NatureAlbumResolver } from './resolvers/natureAlbum.resolver';
import { WanderAlbumResolver } from './resolvers/wanderAlbum.resolver';
import { DiscountResolver } from './resolvers/discount.resolver';

// @Global()
@Module({
    imports: [],
    providers: [
        MindfulnessResolver,
        MindfulnessAlbumResolver,
        NatureResolver,
        NatureAlbumResolver,
        WanderResolver,
        WanderAlbumResolver,
        HomeResolver,
        SceneResolver,
        DiscountResolver,
    ],
})
export class ResourceModule implements OnModuleInit {
    constructor(
    ) {
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
