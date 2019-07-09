import 'reflect-metadata';

import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';

import { PurchaseResolver } from './resolvers/purchase.resolver';

// @Global()
@Module({
  imports: [],
  providers: [
    PurchaseResolver,
  ],
})
export class PurchaseModule implements OnModuleInit {

  static forRoot(): DynamicModule {
    return {
      module: PurchaseModule,
    };
  }

  async onModuleInit() {
  }
}
