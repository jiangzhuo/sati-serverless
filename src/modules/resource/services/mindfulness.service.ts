import * as nodejieba from 'nodejieba';
import { HttpException, Injectable } from '@nestjs/common';

import * as moment from 'moment';
import { isArray, isBoolean, isEmpty, isNumber, isString } from 'lodash';
import { AccountEntity, MindfulnessAlbumEntity, MindfulnessEntity, MindfulnessRecordEntity, SceneEntity, UserEntity } from '../../../entities';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, DeepPartial, MoreThanOrEqual, Repository } from 'typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';

@Injectable()
export class MindfulnessService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(SceneEntity) private readonly sceneRepository: Repository<SceneEntity>,
    @InjectRepository(AccountEntity) private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(MindfulnessEntity) private readonly mindfulnessRepository: Repository<MindfulnessEntity>,
    @InjectRepository(MindfulnessAlbumEntity) private readonly mindfulnessAlbumRepository: Repository<MindfulnessAlbumEntity>,
    @InjectRepository(MindfulnessRecordEntity) private readonly mindfulnessRecordRepository: Repository<MindfulnessRecordEntity>,
  ) {
  }

  // private userServiceInterface;

  async sayHello(name: string) {
    return `Mindfulness Hello ${name}!`;
  }

  async getMindfulness(first = 20, after?: number, before?: number, status = 1) {
    let query = this.mindfulnessRepository.createQueryBuilder('mindfulness');
    let queryWhere = query.where.bind(query);
    // const condition = {};
    if (after) {
      query = queryWhere('validTime >= :after', { after });
      queryWhere = query.andWhere.bind(query);
      // condition['validTime'] = { $gt: after }
    }
    if (before) {
      query = queryWhere('validTime <= :before', { before });
      queryWhere = query.andWhere.bind(query);
      // if (condition['validTime']) {
      //     condition['validTime']['$lt'] = before
      // } else {
      //     condition['validTime'] = { $lt: before }
      // }
    }
    if (status !== 0) {
      query = queryWhere(`(status::bit(${status.toString(2).length}) & :status)::integer = 0`, { status: status.toString(2) });
      query.andWhere.bind(query);
      // condition['status'] = { $bitsAllClear: status }
    }
    if (first < 0) {
      query = query.orderBy('mindfulness.validTime', 'DESC');
    } else {
      query = query.orderBy('mindfulness.validTime', 'ASC');
    }
    return await query.take(Math.abs(first)).getMany();
    // return await this.mindfulnessRepository.find(
    //   condition,
    //   null,
    //   { sort: sort }
    // ).limit(Math.abs(first)).exec();
  }

  async getMindfulnessById(id) {
    return await this.mindfulnessRepository.findOne(id);
  }

  async getMindfulnessByIds(ids) {
    return await this.mindfulnessRepository.findByIds(ids);
  }

  async getMindfulnessRecord(userId: string, mindfulnessId: string | string[]);
  async getMindfulnessRecord(userId, mindfulnessId) {
    if (isArray(mindfulnessId)) {
      return await this.mindfulnessRecordRepository.createQueryBuilder('mindfulnessRecord')
        .where('userId = :userId', { userId })
        .andWhere('mindfulnessId IN (:...mindfulnessId)', { mindfulnessId })
        .getMany();
      // return await this.mindfulnessRecordRepository.find({
      //   userId: userId,
      //   mindfulnessId: { $in: mindfulnessId }
      // }).exec()
    } else if (typeof mindfulnessId === 'string') {
      return await this.mindfulnessRecordRepository.createQueryBuilder('mindfulnessRecord')
        .where('userId = :userId', { userId })
        .andWhere('mindfulnessId = :mindfulnessId', { mindfulnessId })
        .getMany();
      // return await this.mindfulnessRecordRepository.findOne({ userId: userId, mindfulnessId: mindfulnessId }).exec()
    }
  }

  async searchMindfulnessRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
    let query = this.mindfulnessRecordRepository.createQueryBuilder('mindfulnessRecord');
    let queryWhere = query.where;
    if (isBoolean(favorite)) {
      // 偶数是没有收藏 奇数是收藏，所以true搜索奇数，false搜索偶数
      if (favorite) {
        query = queryWhere(`status::bit(1) = B'1'`);
        queryWhere = query.andWhere.bind(query);
        // conditions['favorite'] = { $mod: [2, 1] }
      } else {
        query = queryWhere(`status::bit(1) = B'0'`);
        queryWhere = query.andWhere.bind(query);
        // conditions['favorite'] = { $mod: [2, 0] }
      }
    }
    if (isArray(boughtTime) && boughtTime.length === 2) {
      // 第一个元素是开始时间 第二个元素是结束时间
      query = queryWhere('boughtTime >= :boughtTimeStart AND boughtTime <= :boughtTimeEnd', {
        boughtTimeStart: boughtTime[0],
        boughtTimeEnd: boughtTime[1],
      });
      // conditions['boughtTime'] = { $gte: boughtTime[0], $lte: boughtTime[1] }
    }
    // sort string in '+XXXXX' or '-XXXXX' format
    if (sort.startsWith('-')) {
      query = query.orderBy(`mindfulnessRecord.${sort.substring(1)}`, 'DESC');
    } else if (sort.startsWith('+')) {
      query = query.orderBy(`mindfulnessRecord.${sort.substring(1)}`, 'ASC');
    }
    return await query.take(limit).skip((page - 1) * limit).getMany();
    // return await this.mindfulnessRecordRepository.find(
    //   conditions,
    //   null,
    //   { sort: sort, limit: limit, skip: (page - 1) * limit }).exec()
  }

  async createMindfulness(data) {
    // data.createTime = moment().unix();
    // data.updateTime = moment().unix();
    data.authorEntity = await this.userRepository.findOne(data.author);
    const scenes = await this.sceneRepository.findByIds(data.scenes);
    data.sceneEntities = scenes;
    // const mindfulnessAlbums = await this.mindfulnessAlbumRepository.findByIds(data.mindfulnessAlbums);
    // data.mindfulnessAlbumEntities = mindfulnessAlbums;
    data.mindfulnessAlbumEntities = [];
    const newMindfulness: MindfulnessEntity = this.mindfulnessRepository.create(data as DeepPartial<MindfulnessEntity>);
    const result = await this.mindfulnessRepository.save(newMindfulness);
    await this.updateTag(result.id);
    return result;
  }

  async updateTag(id) {
    const doc = await this.mindfulnessRepository.findOne(id);
    const nameCut = nodejieba.cut(doc.name);
    const descriptionCut = nodejieba.cut(doc.description);
    const copyCut = nodejieba.cut(doc.copy);
    doc.__tag = ['*'].concat(nameCut).concat(descriptionCut).concat(copyCut);
    await this.mindfulnessRepository.save(doc);
    // await this.mindfulnessRepository.updateOne({ _id: id }, { __tag: ['*'].concat(nameCut).concat(descriptionCut).concat(copyCut) }).exec();
  }

  async updateMindfulness(id, data) {
    const updateObject = { updateTime: moment().unix() };
    if (isArray(data.scenes)) {
      updateObject['scenes'] = data.scenes;
    }
    if (isArray(data.background)) {
      updateObject['background'] = data.background;
    }
    if (!isEmpty(data.name)) {
      updateObject['name'] = data.name;
    }
    if (!isEmpty(data.description)) {
      updateObject['description'] = data.description;
    }
    if (isNumber(data.price)) {
      updateObject['price'] = data.price;
    }
    if (!isEmpty(data.author)) {
      updateObject['author'] = data.author;
    }
    if (!isEmpty(data.audio)) {
      updateObject['audio'] = data.audio;
    }
    if (!isEmpty(data.copy)) {
      updateObject['copy'] = data.copy;
    }
    if (isNumber(data.status)) {
      updateObject['status'] = data.status;
    }
    if (isArray(data.mindfulnessAlbums)) {
      updateObject['mindfulnessAlbums'] = data.mindfulnessAlbums;
    }
    if (isNumber(data.validTime)) {
      updateObject['validTime'] = data.validTime;
    }
    if (!isEmpty(data.natureId)) {
      updateObject['natureId'] = data.natureId;
    }
    // console.log(updateObject)
    await this.mindfulnessRepository.update(id, updateObject);
    await this.updateTag(id);
    return await this.mindfulnessRepository.findOne(id);
    // return result
  }

  async deleteMindfulness(id) {
    // await this.mindfulnessRepository.update(id, { $bit: { status: { or: 0b000000000000000000000000000000001 } } });
    await this.mindfulnessRepository.createQueryBuilder('mindfulness')
      .update().set({
        status: () => `"status" | B'00000000000000000000000000000001'`,
      })
      .where(`id = :id`, { id })
      .execute();
    return await this.mindfulnessRepository.findOne(id);
  }

  async revertDeletedMindfulness(id) {
    await this.mindfulnessRepository.createQueryBuilder('mindfulness')
      .update().set({
        status: () => `"status" | B'01111111111111111111111111111110'`,
      })
      .where(`id = :id`, { id })
      .execute();
    return await this.mindfulnessRepository.findOne(id);
  }

  async favoriteMindfulness(userId, mindfulnessId) {
    const newRecord = new MindfulnessRecordEntity();
    newRecord.userId = userId;
    newRecord.mindfulnessId = mindfulnessId;
    await this.mindfulnessRecordRepository.createQueryBuilder('mindfulnessRecord')
      .insert()
      .values(newRecord)
      .onConflict(`("userId","mindfulnessId") DO UPDATE SET "favorite" = "favorite" + 1`)
      .execute();

    return await this.mindfulnessRecordRepository.findOne({ userId, mindfulnessId });
  }

  async startMindfulness(userId, mindfulnessId) {
    // let result = await this.mindfulnessRecordRepository.findOneAndUpdate({
    //     userId: userId,
    //     mindfulnessId: mindfulnessId
    //   },
    //   { $inc: { startCount: 1 }, $set: { lastStartTime: moment().unix() } },
    //   { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    // return result
    // await this.mindfulnessRecordRepository.update({userId,mindfulnessId},{
    //   lastStartTime:moment().unix(),
    //   startCount: ()=>`'statisCount' + 1`
    // })

    const newRecord = new MindfulnessRecordEntity();
    newRecord.userId = userId;
    newRecord.mindfulnessId = mindfulnessId;
    newRecord.lastStartTime = moment().unix();
    newRecord.startCount = 1;

    await this.mindfulnessRecordRepository.createQueryBuilder('mindfulnessRecord')
      .insert()
      .values(newRecord)
      .onConflict(`("userId","mindfulnessId") DO UPDATE SET "startCount" = :startCount, "lastStartTime" = :lastStartTime`)
      .setParameters({ startCount: () => `"startCount" + 1` })
      .execute();
    return await this.mindfulnessRecordRepository.findOne({ userId, mindfulnessId });

  }

  async finishMindfulness(userId, mindfulnessId, duration) {
    const currentRecord = await this.mindfulnessRecordRepository.findOne({
      userId,
      mindfulnessId,
    });
    const updateObj = {
      finishCount: () => `"finishCount" + 1`,
      totalDuration: () => `"totalDuration" + ${duration}`,
      lastFinishTime: moment().unix(),
    };
    if (duration > currentRecord.longestDuration) {
      updateObj['longestDuration'] = duration;
    }

    // let updateObj = { $inc: { finishCount: 1, totalDuration: duration }, $set: { lastFinishTime: moment().unix() } };
    // if (duration > currentRecord.longestDuration) {
    //   updateObj.$set['longestDuration'] = duration
    // }

    await this.mindfulnessRecordRepository.createQueryBuilder('mindfulnessRecord')
      .update()
      .set(updateObj)
      .where(`userId = :userId AND mindfulnessId = :mindfulnessId`, { userId, mindfulnessId })
      .execute();
    return this.mindfulnessRecordRepository.findOne({ userId, mindfulnessId });
    //
    // let result = await this.mindfulnessRecordRepository.findOneAndUpdate({
    //     userId: userId,
    //     mindfulnessId: mindfulnessId
    //   },
    //   updateObj,
    //   { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
    // return result
  }

  async buyMindfulness(userId, mindfulnessId, discount) {

    let discountVal = 100;
    if (discount) {
      discountVal = discount.discount;
    }
    // 检查有没有这个mindfulness
    const mindfulness = await this.getMindfulnessById(mindfulnessId);
    if (!mindfulness) {
      throw new HttpException('not have this mindfulness', 404);
    }
    // 检查是不是买过

    const oldMindfulness = await this.mindfulnessRecordRepository.findOne({
      userId,
      mindfulnessId,
    });
    if (oldMindfulness && oldMindfulness.boughtTime !== 0) {
      throw new HttpException('already bought', 400);
    }
    const finalPrice = Math.floor(mindfulness.price * discountVal / 100);

    const runner = this.connection.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      // 改个人的balance
      // 如果余额不足报错
      const user = await runner.manager.findOneOrFail(UserEntity, {
        id: userId,
        balance: MoreThanOrEqual(finalPrice),
      });
      user.balance -= finalPrice;
      await runner.manager.save(user);
      // 创建account
      await runner.manager.insert(AccountEntity, {
        userId,
        value: -1 * finalPrice,
        afterBalance: user.balance,
        type: 'mindfulness',
        extraInfo: JSON.stringify({ resource: mindfulness, discount }),
      });

      const newRecord = new MindfulnessRecordEntity();
      newRecord.userId = userId;
      newRecord.mindfulnessId = mindfulnessId;
      newRecord.boughtTime = moment().unix();
      await runner.manager.createQueryBuilder()
        .insert()
        .into(MindfulnessRecordEntity)
        .values(newRecord)
        .onConflict(`("userId","mindfulnessId") DO UPDATE SET "boughtTime" = ${moment().unix()}`)
        .execute();

      await runner.commitTransaction();
      // console.log(newRecord)
      return newRecord;
    } catch (err) {
      console.log('err', err);
      await runner.rollbackTransaction();
      if (err instanceof EntityNotFoundError) {
        throw new HttpException('not enough balance', 402);
      }
      throw new err;
    } finally {
      console.log('runner.release()');
      await runner.release();
    }
  }

  async searchMindfulness(keyword, from, size) {
    const cutKeyword = nodejieba.cut(keyword);
    let query = this.mindfulnessRepository.createQueryBuilder('mindfulness');

    // query.select().innerJoin('mindfulness.author', 'author')
    //   .innerJoin('mindfulness.scenes', 'scenes')
    //   .innerJoin('mindfulness.mindfulnessAlbums', 'mindfulnessAlbums')
    //   .innerJoin('mindfulness.natureId', 'natureId');
    // query.leftJoinAndSelect("mindfulness.author","author")
    //   .leftJoinAndSelect("mindfulness.scenes","scenes")
    // .leftJoinAndSelect("mindfulness.mindfulnessAlbums","mindfulnessAlbums")
    // .leftJoinAndSelect("mindfulness.natureId","natureId");
    if (cutKeyword.length !== 0) {
      query = query.where(`"__tag" && ARRAY[:...cutKeyword]::text[]`, { cutKeyword });
    }
    // let query = {};
    // if (cutKeyword.length !== 0) {
    //   query = { __tag: { $in: cutKeyword } };
    // }
    // // ARRAY[:...queryCategories]::varchar[]
    // let total = await this.mindfulnessRepository.findAndCount(query);
    // let data = await this.mindfulnessRepository.find(query).skip(from).limit(size).exec();
    const [data, total] = await query.skip(from).take(size).getManyAndCount();
    return { total, data };
  }

  // async getMindfulnessByMindfulnessAlbumId(id) {
  //   return await this.mindfulnessRepository.find({ mindfulnessAlbums: id });
  // }
}
