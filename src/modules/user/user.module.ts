import { DynamicModule, Inject, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './services/auth.service';

import { UserEntity } from '../../entities/user.entity';
import { UserService } from './services/user.service';

// import { AccountEntity } from './entities/account.entity';

import { CryptoUtil } from './utils/crypto.util';

import { UserResolver } from "./resolvers/user.resolver";
import { AccountEntity } from '../../entities/account.entity';
// import { CouponController } from './controllers/coupon.controller';
// import { ReceiptEntity } from "./entities/receipt.entity";
// import { PurchaseEntity } from "./entities/purchase.entity";
// import { PurchaseController } from "./controllers/purchase.controller";
// import { CouponEntity } from './entities/coupon.entity';
// import { CouponService } from "./services/coupon.service";
// import * as jaeger from 'moleculer-jaeger';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AccountEntity])],
  providers: [UserService, AuthService, UserResolver, CryptoUtil],
  exports: [AuthService]
})
export class UserModule {
}
