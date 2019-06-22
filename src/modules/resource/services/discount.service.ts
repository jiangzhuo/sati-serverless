import { Injectable } from '@nestjs/common';
import { isArray, isEmpty, isNumber } from 'lodash';
import * as moment from 'moment';
import { DiscountEntity } from '../../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountEntity) private readonly discountRepository: Repository<DiscountEntity>,
  ) {
  }

  async sayHello(name: string) {
    return { msg: `Discount Hello ${name}!` };
  }

  async getDiscount(first = 20, after?: number, before?: number, discount?: number) {
    let query = await this.discountRepository.createQueryBuilder('discount');
    let queryWhere = query.where.bind(query);
    if (isNumber(after)) {
      query = queryWhere(`beginTime >= :after`, { after });
      queryWhere = query.andWhere.bind(query);
    }
    if (isNumber(before)) {
      query = queryWhere(`endTime >= :before`, { before });
      queryWhere = query.andWhere.bind(query);
    }
    if (isNumber(discount)) {
      query = queryWhere(`discount <= :discount`, { discount });
    }
    if (first > 0) {
      query = query.orderBy('discount.beginTime', 'ASC');
    } else {
      query = query.orderBy('discount.beginTime', 'DESC');
    }
    return await query.take(Math.abs(first)).getMany();
  }

  async getDiscountByFromAndSize(from?: number, size?: number) {
    return await this.discountRepository.createQueryBuilder('discount').orderBy('discount.beginTime', 'DESC').skip(from).take(size).getMany();
  }

  async countDiscount() {
    return await this.discountRepository.count();
  }

  async getDiscountById(id) {
    return await this.discountRepository.findOne(id);
  }

  async getDiscountByIds(ids) {
    return await this.discountRepository.findByIds(ids);
  }

  async getDiscountByResourceId(resourceId, time = moment().unix()) {
    return await this.discountRepository.createQueryBuilder('discount')
      .where(`resourceId = :resourceId AND beginTime <= :time AND endTime >= :time`, { resourceId, time })
      .getOne();
  }

  async getDiscountByResourceIds(ids) {
    return await this.discountRepository.createQueryBuilder('discount').where(`resourceId IN (:...ids)`, { ids }).getMany();
  }

  async createDiscount(data) {
    const newDiscount = this.discountRepository.create(data);
    await this.discountRepository.insert(newDiscount);
    return newDiscount;
  }

  async updateDiscount(id, data) {
    const updateObject = { updateTime: moment().unix() };
    if (!isEmpty(data.type)) {
      updateObject['type'] = data.type;
    }
    if (!isEmpty(data.resourceId)) {
      updateObject['resourceId'] = data.resourceId;
    }
    if (isArray(data.background)) {
      updateObject['background'] = data.background;
    }
    if (!isEmpty(data.name)) {
      updateObject['name'] = data.name;
    }
    if (isNumber(data.discount)) {
      updateObject['discount'] = data.discount;
    }
    if (isNumber(data.beginTime)) {
      updateObject['beginTime'] = data.beginTime;
    }
    if (isNumber(data.endTime)) {
      updateObject['endTime'] = data.endTime;
    }

    const query = this.discountRepository.createQueryBuilder('discount');
    await query.update()
      .set(updateObject)
      .where(`id = :id`, { id }).execute();
    return await this.discountRepository.findOne(id);
  }

  async deleteDiscount(id) {
    return await this.discountRepository.delete(id);
  }
}
