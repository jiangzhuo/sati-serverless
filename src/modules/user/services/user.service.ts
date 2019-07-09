import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
// import { CreateUserInput, UpdateUserInput } from '../interfaces/user.interface';
// import { Account } from '../interfaces/account.interface';
import { CryptoUtil } from '../utils/crypto.util';
// import * as moment from 'moment';
// import { Receipt } from '../interfaces/receipt.interface';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { UserEntity } from '../../../entities/user.entity';

import { Repository, Connection, In, MoreThanOrEqual } from 'typeorm';
import { AccountEntity } from '../../../entities/account.entity';
import { GraphQLError } from 'graphql';
import * as uuidValidate from 'uuid-validate';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { ReceiptEntity } from '../../../entities/receipt.entity';

// import { __ as t } from 'i18n';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AccountEntity) private readonly accountRepository: Repository<AccountEntity>,
    @InjectConnection() private readonly connection: Connection,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
    @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
  ) { }

  async updateUser(id: string, updateUserInput: any): Promise<UserEntity> {
    console.trace(id)
    let user = await this.userRepository.findOne(id);
    // if (!user) throw new RpcException({ code: 404, message: t('User does not exist') });
    if (!user) {
      throw new HttpException('User does not exist', 404);
    }
    if (updateUserInput.nickname) {
      await this.userRepository.update(id, { nickname: updateUserInput.nickname });
    }
    if (updateUserInput.avatar) {
      await this.userRepository.update(id, { avatar: updateUserInput.avatar });
    }
    if (updateUserInput.password) {
      const newPassword = await this.cryptoUtil.encryptPassword(updateUserInput.password);
      await this.userRepository.update(id, { password: newPassword });
    }
    if (updateUserInput.status) {
      await this.userRepository.update(id, { status: updateUserInput.status });
    }
    user = await this.userRepository.findOne(id);
    return user;
  }

  async loginByMobile(mobile: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ mobile });
    return user;
  }

  async loginByMobileAndPassword(mobile: string, password: string) {
    const user = await this.userRepository.findOne({ mobile });
    if (!user) {
      throw new HttpException('User does not exist', 404);
    }
    console.log(mobile, password, user.password);
    if (!await this.cryptoUtil.checkPassword(password, user.password)) {
      // throw new RpcException({ code: 406, message: t('invalid password') });
      throw new HttpException('invalid password', 406);
    }
    return user;
  }

  async registerBySMSCode(createUserInput: any): Promise<UserEntity> {
    createUserInput.status = 1;
    // await this.checkUsernameExist(createUserInput.username);
    // createUserInput.username = createUserInput.username || createUserInput.mobile;
    // createUserInput.password = await this.cryptoUtil.encryptPassword(createUserInput.password);
    const entity = await this.userRepository.create({
      mobile: createUserInput.mobile,
      username: createUserInput.mobile,
      password: await this.cryptoUtil.encryptPassword(createUserInput.password),
      nickname: createUserInput.nickname,
      avatar: createUserInput.avatar,
      status: createUserInput.status,
      balance: 0,
      role: 0,
    });
    return await this.userRepository.save(entity);
  }

  async getUserById(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne(id);
  }

  async getUserByIds(ids: string[]): Promise<UserEntity[]> {
    return await this.userRepository.find({ id: In(ids) });
  }

  async getUserByMobile(id: string): Promise<UserEntity> {
    return await this.userRepository.findOne({ mobile: id });
  }

  async getUser(first = 20, after?: string): Promise<UserEntity[]> {
    if (after) {
      // todo after
      // return await this.userModel.find({ _id: { $gte: after } }).limit(first).exec();

      // let afterWhichEntity = await this.userRepository.createQueryBuilder('user')
      //   .select("user.createTime")
      //   .where(`id = :after`, { after });
      // console.log(afterWhichEntity.getSql());
      // return await this.userRepository.createQueryBuilder('user')
      //   .where(`user.creatTime >= :createTime`, { createTime: afterWhichEntity.getSql() }).take(first).getMany();

      return await this.userRepository.createQueryBuilder('user')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('user.createTime')
            .from(UserEntity, 'user')
            .where('user.id = :after')
            .getQuery();
          return 'user.createTime >= ' + subQuery;
        })
        .take(first)
        .setParameter('after', after)
        .getMany();
    } else {
      return await this.userRepository.find({ take: first });
    }
  }

  async searchUserAccount(userId = '', page, limit, type = ''): Promise<AccountEntity[]> {
    let query = this.accountRepository.createQueryBuilder('account');
    let queryWhere = query.where;
    if (userId !== '' && uuidValidate(userId)) {
      query = queryWhere.call(query, 'account.userId = :userId', { userId });
      queryWhere = query.andWhere;
      // conditions['userId'] = userId
    }
    if (type !== '') {
      query = queryWhere.call(query, 'account.type = :type', { type });
      // conditions['type'] = type
    }
    query = query.skip((page - 1) * limit).limit(limit);
    return await query.getMany();
  }

  async countUserAccount(userId = '', type = ''): Promise<number> {
    let query = this.accountRepository.createQueryBuilder('account');
    let queryWhere = query.where;
    // let conditions = {};
    if (userId !== '' && uuidValidate(userId)) {
      query = queryWhere.call(query, 'account.userId = :userId', { userId });
      queryWhere = query.andWhere;
      // conditions['userId'] = userId
    }
    if (type !== '') {
      // conditions['type'] = type
      query = queryWhere.call(query, 'account.type = :type', { type });
    }
    // let userAccountTotal = await this.accountModel.countDocuments(conditions).exec();
    // return userAccountTotal
    return await query.getCount();
  }

  async changeBalance(id: string, changeValue: number, type: string, extraInfo: string): Promise<UserEntity> {
    // let result = await this.connection.transaction(transactionEntityManager => {
    //
    // });

    const runner = this.connection.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      // todo do something
      // 改个人的balance
      // 如果余额不足报错
      const user = await runner.manager.findOneOrFail(UserEntity, {
        id,
        balance: MoreThanOrEqual(-1 * changeValue),
      });
      user.balance += changeValue;
      await runner.manager.save(user);
      // 创建account
      await runner.manager.insert(AccountEntity, {
        userId: id,
        value: changeValue,
        afterBalance: user.balance,
        type,
        extraInfo,
      });
      // changeByIAP类型的修改receiptModel
      if (type === 'changeByIAP') {
        const extraInfoJSON = JSON.parse(extraInfo);
        const receiptId = extraInfoJSON.validateData.purchaseRecord.id;
        const receipt = await runner.manager.findOneOrFail(ReceiptEntity, { id: receiptId });
        const res = await runner.manager.update(ReceiptEntity, { receipt: receipt.receipt }, {
          isProcessed: true,
        });
      }

      await runner.commitTransaction();
      return user;
    } catch (err) {
      console.log('err', err);
      await runner.rollbackTransaction();
      if (err instanceof EntityNotFoundError) {
        throw new HttpException('not enough balance', 402);
      }
      throw new GraphQLError('12');
    } finally {
      console.log('runner.release()');
      await runner.release();
    }

    // const user = await this.userRepository.update({
    //   id: id,
    //   balance: { $gte: -1 * changeValue }
    // }, { $inc: { balance: changeValue } }).exec();
    // if (!user) throw new HttpException('not enough balance', 402);
    // await this.accountModel.create({
    //   userId: id,
    //   value: changeValue,
    //   afterBalance: user.balance,
    //   type: type,
    //   createTime: moment().unix(),
    //   extraInfo: extraInfo,
    // });
    // if (type === 'changeByIAP') {
    //   let extraInfoJSON = JSON.parse(extraInfo);
    //   let receiptId = extraInfoJSON.validateData.purchaseRecord.id;
    //   let receipt = await this.receiptModel.findOneAndUpdate({ _id: receiptId }, {
    //     isProcessed: true,
    //     updateTime: moment().unix()
    //   }).exec();
    //   let res = await this.receiptModel.updateMany({ receipt: receipt.receipt }, {
    //     isProcessed: true,
    //     updateTime: moment().unix()
    //   }).exec();
    // }
    // return user
  }

  // getConditions(keyword: string){
  //     const mobileReg = /^1[3|4|5|7|8][0-9]{9}$/; //验证规则
  //     let conditions = {};
  //     if (ObjectId.isValid(keyword)) {
  //         // 按照id查询
  //         conditions = { _id: keyword };
  //     } else if (mobileReg.test(keyword)) {
  //         // 按照手机号查询
  //         conditions = { mobile: keyword };
  //     } else {
  //         // 按照名字查询
  //         conditions = { nickname: new RegExp(keyword, 'i') }
  //     }
  //     return conditions
  // }

  async searchUser(keyword: string, from: number, size: number): Promise<{ total: number, data: UserEntity[] }> {
    const query = this.userRepository.createQueryBuilder();
    if (uuidValidate(keyword)) {
      query.where('id = :id', { id: keyword });
    } else {
      query.where('mobile = :mobile', { mobile: keyword })
        .orWhere('nickname like :nickname', { nickname: `%${keyword}%` });
    }
    const [user, total] = await query
      .offset(from)
      .limit(size)
      .getManyAndCount();
    // let user = await this.userRepository.find(
    //   conditions,
    //   null,
    //   { limit: size, skip: from }).exec();
    // let total = await this.userRepository.count(conditions).exec();
    // let total = await query.where('id = :keyword', { keyword })
    //   .where('mobile = :keyword',{keyword})
    //   .where('nickname like :keyword',{keyword:`%${keyword}%`})
    //   .getCount();

    return { total, data: user };
  }

  async countUser(keyword: string): Promise<number> {
    const query = this.userRepository.createQueryBuilder();
    if (uuidValidate(keyword)) {
      query.where('id = :id', { id: keyword });
    } else {
      query.where('mobile = :mobile', { mobile: keyword })
        .orWhere('nickname like :nickname', { nickname: `%${keyword}%` });
    }
    const total = await query.getCount();
    return total;
  }
}
