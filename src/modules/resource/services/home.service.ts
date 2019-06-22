import { Injectable } from '@nestjs/common';
import { isArray, isEmpty, isNumber } from 'lodash';
import * as moment from "moment";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  HomeEntity,
  MindfulnessEntity,
  MindfulnessAlbumEntity,
  NatureEntity,
  WanderEntity,
  NatureAlbumEntity,
  WanderAlbumEntity,
} from "../../../entities";

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(HomeEntity) private readonly homeRepository: Repository<HomeEntity>,
    @InjectRepository(MindfulnessEntity) private readonly mindfulnessRepository: Repository<MindfulnessEntity>,
    @InjectRepository(MindfulnessAlbumEntity) private readonly mindfulnessAlbumRepository: Repository<MindfulnessAlbumEntity>,
    @InjectRepository(NatureEntity) private readonly natureRepository: Repository<NatureEntity>,
    @InjectRepository(NatureAlbumEntity) private readonly natureAlbumRepository: Repository<NatureAlbumEntity>,
    @InjectRepository(WanderEntity) private readonly wanderRepository: Repository<WanderEntity>,
    @InjectRepository(WanderAlbumEntity) private readonly wanderAlbumRepository: Repository<WanderAlbumEntity>,
  ) {
  }

  async sayHello(name: string) {
    return { msg: `Home Hello ${name}!` };
  }

  async getNew(first = 20, after?: number, before?: number, status = 1) {
    const mindfulnessQuery = this.mindfulnessRepository.createQueryBuilder('mindfulness');
    const mindfulnessAlbumQuery = this.mindfulnessAlbumRepository.createQueryBuilder('mindfulnessAlbum');
    const natureQuery = this.natureRepository.createQueryBuilder('nature');
    const natureAlbumQuery = this.natureAlbumRepository.createQueryBuilder('natureAlbum');
    const wanderQuery = this.wanderRepository.createQueryBuilder('wander');
    const wanderAlbumQuery = this.wanderAlbumRepository.createQueryBuilder('wanderAlbum');

    let allQuery = [mindfulnessQuery, mindfulnessAlbumQuery, natureQuery, natureAlbumQuery, wanderQuery, wanderAlbumQuery];
    let allQueryWhere = allQuery.map(query => query.where.bind(query));
    if (after) {
      allQuery = allQueryWhere.map(queryWhere => queryWhere('validTime >= :after', { after }));
      allQueryWhere = allQuery.map(query => query.andWhere.bind(query));
    }
    if (before) {
      allQuery = allQueryWhere.map(queryWhere => queryWhere('validTime <= :before', { before }));
      allQueryWhere = allQuery.map(query => query.andWhere.bind(query));
    }
    if (status !== 0) {
      allQuery = allQueryWhere.map(queryWhere => queryWhere(`(status::bit(${status.toString(2).length}) & :status)::integer = 0`, { status: status.toString(2) }));
      // allQueryWhere = allQuery.map(query => query.andWhere.bind(query));
    }
    if (first > 0) {
      allQuery = allQuery.map(query => query.orderBy("user.validTime", "DESC"));
    } else {
      allQuery = allQuery.map(query => query.orderBy("user.validTime", "ASC"));
    }
    const result = [];

    const queryPromise  = [];
    allQuery.forEach(query => queryPromise.push(query.take(Math.abs(first)).getMany()));

    const [mindfulnessResult, mindfulnessAlbumResult, natureResult, natureAlbumResult, wanderResult, wanderAlbumResult] = await Promise.all(queryPromise) ;
    // const mindfulnessResult = await this.mindfulnessRepository.find(query).sort(sortArg).limit(Math.abs(first)).exec();
    // const mindfulnessAlbumResult = await this.mindfulnessAlbumRepository.find(query).sort(sortArg).limit(Math.abs(first)).exec();
    // const natureResult = await this.natureRepository.find(query).sort(sortArg).limit(Math.abs(first)).exec();
    // const natureAlbumResult = await this.natureAlbumRepository.find(query).sort(sortArg).limit(Math.abs(first)).exec();
    // const wanderResult = await this.wanderRepository.find(query).sort(sortArg).limit(Math.abs(first)).exec();
    // const wanderAlbumResult = await this.wanderAlbumRepository.find(query).sort(sortArg).limit(Math.abs(first)).exec();
    mindfulnessResult.forEach((mindfulness) => {
      result.push({
        type: 'mindfulness',
        resourceId: mindfulness.id,
        background: mindfulness.background,
        name: mindfulness.name,
        description: mindfulness.description,
        price: mindfulness.price,
        author: mindfulness.author,
        createTime: mindfulness.createTime,
        updateTime: mindfulness.updateTime,
        validTime: mindfulness.validTime,
        status: mindfulness.status,
      });
    });
    mindfulnessAlbumResult.forEach((mindfulnessAlbum) => {
      result.push({
        type: 'mindfulnessAlbum',
        resourceId: mindfulnessAlbum.id,
        background: mindfulnessAlbum.background,
        name: mindfulnessAlbum.name,
        description: mindfulnessAlbum.description,
        price: mindfulnessAlbum.price,
        author: mindfulnessAlbum.author,
        createTime: mindfulnessAlbum.createTime,
        updateTime: mindfulnessAlbum.updateTime,
        validTime: mindfulnessAlbum.validTime,
        status: mindfulnessAlbum.status,
      });
    });
    natureResult.forEach((nature) => {
      result.push({
        type: 'nature',
        resourceId: nature.id,
        background: nature.background,
        name: nature.name,
        description: nature.description,
        price: nature.price,
        author: nature.author,
        createTime: nature.createTime,
        updateTime: nature.updateTime,
        validTime: nature.validTime,
        status: nature.status,
      });
    });
    natureAlbumResult.forEach((natureAlbum) => {
      result.push({
        type: 'natureAlbum',
        resourceId: natureAlbum.id,
        background: natureAlbum.background,
        name: natureAlbum.name,
        description: natureAlbum.description,
        price: natureAlbum.price,
        author: natureAlbum.author,
        createTime: natureAlbum.createTime,
        updateTime: natureAlbum.updateTime,
        validTime: natureAlbum.validTime,
        status: natureAlbum.status,
      });
    });
    wanderResult.forEach((wander) => {
      result.push({
        type: 'wander',
        resourceId: wander.id,
        background: wander.background,
        name: wander.name,
        description: wander.description,
        price: wander.price,
        author: wander.author,
        createTime: wander.createTime,
        updateTime: wander.updateTime,
        validTime: wander.validTime,
        status: wander.status,
      });
    });
    wanderAlbumResult.forEach((wanderAlbum) => {
      result.push({
        type: 'wanderAlbum',
        resourceId: wanderAlbum.id,
        background: wanderAlbum.background,
        name: wanderAlbum.name,
        description: wanderAlbum.description,
        price: wanderAlbum.price,
        author: wanderAlbum.author,
        createTime: wanderAlbum.createTime,
        updateTime: wanderAlbum.updateTime,
        validTime: wanderAlbum.validTime,
        status: wanderAlbum.status,
      });
    });
    if (first > 0) {
      result.sort((a, b) => {
        return a.validTime - b.validTime;
      });
    } else {
      result.sort((a, b) => {
        return b.validTime - a.validTime;
      });
    }
    return result.slice(0, Math.abs(first));
  }

  async getHome(first = 20, after?: number, before?: number, position?: number) {
    let query = this.homeRepository.createQueryBuilder('home');
    let queryWhere = query.where.bind(query);
    const validTimeQuery = {};
    if (isNumber(after)) {
      query = queryWhere(`validTime >= :after`, { after });
      queryWhere = query.andWhere.bind(query);
    }
    if (isNumber(before)) {
      query = queryWhere(`validTime <= :before`, { before });
      queryWhere = query.andWhere.bind(query);
    }
    if (isNumber(position)) {
      query = queryWhere(`position <= :position`, { position });
      // queryWhere = query.andWhere.bind(query)
    }
    if (first > 0) {
      query.orderBy("home.validTime", 'ASC');
    } else {
      query.orderBy("home.validTime", 'DESC');
    }
    return await query.take(Math.abs(first)).getMany();
  }

  async getHomeByFromAndSize(from?: number, size?: number, position?: number) {
    const query = this.homeRepository.createQueryBuilder('home');
    if (isNumber(position)) {
      query.where('position = :position', { position });
    }
    return await query.orderBy("home.validTime", 'DESC').skip(from).take(size).getMany();
  }

  async countHome(position?: number) {
    const query = this.homeRepository.createQueryBuilder('home');
    if (isNumber(position)) {
      query.where('position = :position', { position });
    }
    return await query.getCount();
  }

  async getHomeById(id) {
    return await this.homeRepository.findOne(id);
  }

  async createHome(data) {
    // data.createTime = moment().unix();
    // data.updateTime = moment().unix();
    return await this.homeRepository.create(data);
  }

  async updateHome(id, data) {
    const updateObject = { updateTime: moment().unix() };
    if (!isEmpty(data.position)) {
      updateObject['position'] = data.position;
    }
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
    if (!isEmpty(data.description)) {
      updateObject['description'] = data.description;
    }
    if (!isEmpty(data.author)) {
      updateObject['author'] = data.author;
    }
    if (isNumber(data.position)) {
      updateObject['position'] = data.position;
    }
    if (isNumber(data.validTime)) {
      updateObject['validTime'] = data.validTime;
    }
    return await this.homeRepository.update(id, updateObject);
  }

  async deleteHome(id) {
    return await this.homeRepository.delete(id);
  }
}
