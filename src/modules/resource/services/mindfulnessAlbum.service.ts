import { HttpException, Inject, Injectable } from '@nestjs/common';
import * as moment from "moment";
import { isArray, isBoolean, isEmpty, isNumber } from 'lodash';
import * as nodejieba from "nodejieba";
import { Connection, Repository, MoreThanOrEqual } from "typeorm";
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import {
  UserEntity,
  AccountEntity,
  MindfulnessAlbumEntity,
  MindfulnessAlbumRecordEntity,
} from '../../../entities';
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";

@Injectable()
export class MindfulnessAlbumService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AccountEntity) private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(MindfulnessAlbumEntity) private readonly mindfulnessAlbumRepository: Repository<MindfulnessAlbumEntity>,
    @InjectRepository(MindfulnessAlbumRecordEntity) private readonly mindfulnessAlbumRecordRepository: Repository<MindfulnessAlbumRecordEntity>
  ) {
  }

  async sayHello(name: string) {
    return { msg: `Mindfulness Hello ${name}!` };
  }

  async getMindfulnessAlbum(first = 20, after?: number, before?: number, status = 1) {
    let query = this.mindfulnessAlbumRepository.createQueryBuilder("mindfulnessAlbum");
    let queryWhere = query.where.bind(query);
    if (after) {
      query = queryWhere("validTime >= :after", { after });
      queryWhere = query.andWhere.bind(query);
    }
    if (before) {
      query = queryWhere("validTime <= :before", { before });
      queryWhere = query.andWhere.bind(query);
    }
    if (status !== 0) {
      query = queryWhere(`(status::bit(${status.toString(2).length}) & :status)::integer = 0`, { status: status.toString(2) });
      query.andWhere.bind(query);
    }
    if (first < 0) {
      query = query.orderBy("mindfulnessAlbum.validTime", 'DESC');
    } else {
      query = query.orderBy("mindfulnessAlbum.validTime", 'ASC');
    }
    return await query.take(Math.abs(first)).getMany();
  }

  async getMindfulnessAlbumById(id) {
    return await this.mindfulnessAlbumRepository.findOne(id);
  }

  async getMindfulnessAlbumByIds(ids) {
    return await this.mindfulnessAlbumRepository.findByIds(ids);
  }

  async getMindfulnessAlbumRecord(userId: string, mindfulnessAlbumId: string);
  async getMindfulnessAlbumRecord(userId: string, mindfulnessAlbumId: string[]);
  async getMindfulnessAlbumRecord(userId, mindfulnessAlbumId) {
    if (isArray(mindfulnessAlbumId)) {
      return await this.mindfulnessAlbumRecordRepository.createQueryBuilder('mindfulnessAlbumRecord')
        .where("userId = :userId", { userId })
        .andWhere("mindfulnessAlbumId IN (:...mindfulnessAlbumId)", { mindfulnessAlbumId })
        .getMany();
    } else if (typeof mindfulnessAlbumId === 'string') {
      return await this.mindfulnessAlbumRecordRepository.createQueryBuilder("mindfulnessAlbumRecord")
        .where("userId = :userId", { userId })
        .andWhere("mindfulnessAlbumId = :mindfulnessAlbumId", { mindfulnessAlbumId })
        .getMany();
    }
  }

  async searchMindfulnessAlbumRecord(userId: string, page: number, limit: number, sort: string, favorite?: boolean, boughtTime?: number[]) {
    let query = this.mindfulnessAlbumRecordRepository.createQueryBuilder('mindfulnessAlbumRecord');
    let queryWhere = query.where;
    if (isBoolean(favorite)) {
      // 偶数是没有收藏 奇数是收藏，所以true搜索奇数，false搜索偶数
      if (favorite) {
        query = queryWhere(`status::bit(1) = B'1'`);
        queryWhere = query.andWhere.bind(query);
      } else {
        query = queryWhere(`status::bit(1) = B'0'`);
        queryWhere = query.andWhere.bind(query);
      }
    }
    if (isArray(boughtTime) && boughtTime.length === 2) {
      // 第一个元素是开始时间 第二个元素是结束时间
      query = queryWhere('boughtTime >= :boughtTimeStart AND boughtTime <= :boughtTimeEnd', {
        boughtTimeStart: boughtTime[0],
        boughtTimeEnd: boughtTime[1]
      });
    }
    // sort string in '+XXXXX' or '-XXXXX' format
    if (sort.startsWith('-')) {
      query = query.orderBy(`mindfulnessAlbumRecord.${sort.substring(1)}`, 'DESC');
    } else if (sort.startsWith('+')) {
      query = query.orderBy(`mindfulnessAlbumRecord.${sort.substring(1)}`, 'ASC');
    }
    return await query.take(limit).skip((page - 1) * limit).getMany();
  }

  async createMindfulnessAlbum(data) {
    // data.createTime = moment().unix();
    // data.updateTime = moment().unix();
    let newMindfulnessAlbum = await this.mindfulnessAlbumRepository.create(data);
    let result = await this.mindfulnessAlbumRepository.insert(newMindfulnessAlbum);
    await this.updateTag(result.identifiers[0].id);
    return result;
  }

  async updateTag(id) {
    const doc = await this.mindfulnessAlbumRepository.findOne(id);
    const nameCut = nodejieba.cut(doc.name);
    const descriptionCut = nodejieba.cut(doc.description);
    const copyCut = nodejieba.cut(doc.copy);
    doc.__tag = ['*'].concat(nameCut).concat(descriptionCut).concat(copyCut);
    await this.mindfulnessAlbumRepository.save(doc);
  }

  async updateMindfulnessAlbum(id, data) {
    let updateObject = { updateTime: moment().unix() };
    if (!isEmpty(data.scenes)) {
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
    if (!isEmpty(data.copy)) {
      updateObject['copy'] = data.copy;
    }
    if (isNumber(data.status)) {
      updateObject['status'] = data.status;
    }
    if (isNumber(data.validTime)) {
      updateObject['validTime'] = data.validTime;
    }
    await this.mindfulnessAlbumRepository.update(id, updateObject);
    await this.updateTag(id);
    return await this.mindfulnessAlbumRepository.findOne(id);
  }

  async deleteMindfulnessAlbum(id) {
    await this.mindfulnessAlbumRepository.createQueryBuilder('mindfulnessAlbum')
      .update().set({
        status: () => `"status" | B'00000000000000000000000000000001'`
      })
      .where(`id = :id`, { id })
      .execute();
    return await this.mindfulnessAlbumRepository.findOne(id);
  }

  async revertDeletedMindfulnessAlbum(id) {
    await this.mindfulnessAlbumRepository.createQueryBuilder('mindfulnessAlbum')
      .update().set({
        status: () => `"status" | B'01111111111111111111111111111110'`
      })
      .where(`id = :id`, { id })
      .execute();
    return await this.mindfulnessAlbumRepository.findOne(id);
  }

  async favoriteMindfulnessAlbum(userId, mindfulnessAlbumId) {
    let newRecord = this.mindfulnessAlbumRecordRepository.create({
      userId: userId,
      mindfulnessAlbumId: mindfulnessAlbumId
    });
    await this.mindfulnessAlbumRecordRepository.createQueryBuilder('mindfulnessAlbumRecord')
      .insert()
      .values(newRecord)
      .onConflict(`("userId","mindfulnessAlbumId") DO UPDATE SET "favorite" = "favorite" + 1`)
      .execute();

    return await this.mindfulnessAlbumRecordRepository.findOne({ userId, mindfulnessAlbumId });
  }

  async startMindfulnessAlbum(userId, mindfulnessAlbumId) {
    let newRecord = this.mindfulnessAlbumRecordRepository.create({
      userId: userId,
      mindfulnessAlbumId: mindfulnessAlbumId,
      lastStartTime: moment().unix(),
      startCount: 1,
    });
    await this.mindfulnessAlbumRecordRepository.createQueryBuilder('mindfulnessAlbumRecord')
      .insert()
      .values(newRecord)
      .onConflict(`("userId","mindfulnessAlbumId") DO UPDATE SET "startCount" = :startCount, "lastStartTime" = :lastStartTime`)
      .setParameters({startCount:()=>`"startCount" + 1`})
      .execute();
    return await this.mindfulnessAlbumRecordRepository.findOne({userId,mindfulnessAlbumId});
  }

  async finishMindfulnessAlbum(userId, mindfulnessAlbumId, duration) {
    let currentRecord = await this.mindfulnessAlbumRecordRepository.findOne({
      userId: userId,
      mindfulnessAlbumId: mindfulnessAlbumId
    });
    let updateObj = {
      finishCount: () => `"finishCount" + 1`,
      totalDuration: () => `"totalDuration" + ${duration}`,
      lastFinishTime: moment().unix()
    };
    if (duration > currentRecord.longestDuration) {
      updateObj["longestDuration"] = duration
    }
    await this.mindfulnessAlbumRecordRepository.createQueryBuilder('mindfulnessAlbumRecord')
      .update()
      .set(updateObj)
      .where(`userId = :userId AND mindfulnessAlbumId = :mindfulnessAlbumId`,{userId,mindfulnessAlbumId})
      .execute();
    return this.mindfulnessAlbumRecordRepository.findOne({ userId, mindfulnessAlbumId });
  }

  async buyMindfulnessAlbum(userId, mindfulnessAlbumId, discount) {
    let discountVal = 100;
    if (discount) {
      discountVal = discount.discount
    }
    // 检查有没有这个mindfulnessAlbum
    const mindfulnessAlbum = await this.getMindfulnessAlbumById(mindfulnessAlbumId);
    if (!mindfulnessAlbum) throw new HttpException('not have this mindfulnessAlbum', 404);
    // 检查是不是买过
    const oldMindfulnessAlbum = await this.mindfulnessAlbumRecordRepository.findOne({
      userId: userId,
      mindfulnessAlbumId: mindfulnessAlbumId
    });
    if (oldMindfulnessAlbum && oldMindfulnessAlbum.boughtTime !== 0)
      throw new HttpException('already bought', 400);
    let finalPrice = Math.floor(mindfulnessAlbum.price * discountVal / 100);

    let runner = this.connection.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      // 改个人的balance
      // 如果余额不足报错
      const user = await runner.manager.findOneOrFail(UserEntity, {
        id: userId,
        balance: MoreThanOrEqual(finalPrice)
      });
      user.balance -= finalPrice;
      await runner.manager.save(user);
      // 创建account
      await runner.manager.insert(AccountEntity, {
        userId: userId,
        value: -1 * finalPrice,
        afterBalance: user.balance,
        type: 'mindfulnessAlbum',
        extraInfo: JSON.stringify({ resource: mindfulnessAlbum, discount: discount }),
      });
      let newRecord = this.mindfulnessAlbumRecordRepository.create({
        userId: userId,
        mindfulnessAlbumId: mindfulnessAlbumId,
        boughtTime: moment().unix(),
      });

      await runner.manager.createQueryBuilder()
        .insert()
        .into(MindfulnessAlbumRecordEntity)
        .values(newRecord)
        .onConflict(`("userId","mindfulnessAlbumId") DO UPDATE SET "boughtTime" = ${moment().unix()}`)
        .execute();

      await runner.commitTransaction();
      return newRecord;
    } catch (err) {
      console.log('err', err)
      await runner.rollbackTransaction();
      if (err instanceof EntityNotFoundError) {
        throw new HttpException('not enough balance', 402);
      }
      throw new err;
    } finally {
      console.log('runner.release()')
      await runner.release();
    }
  }

  async searchMindfulnessAlbum(keyword, from, size) {
    const cutKeyword = nodejieba.cut(keyword);

    let query = this.mindfulnessAlbumRepository.createQueryBuilder('mindfulnessAlbum');
    if (cutKeyword.length !== 0) {
      query = query.where(`"__tag" && ARRAY[:...cutKeyword]::text[]`, { cutKeyword })
    }
    let [data, total] = await query.skip(from).take(size).getManyAndCount();
    return { total, data };
  }
}
