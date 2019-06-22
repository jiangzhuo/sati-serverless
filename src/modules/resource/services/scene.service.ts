import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SceneEntity,
  MindfulnessEntity,
  MindfulnessAlbumEntity,
  NatureEntity,
  NatureAlbumEntity,
  WanderEntity,
  WanderAlbumEntity,
} from '../../../entities';

@Injectable()
export class SceneService {
  constructor(
    @InjectRepository(SceneEntity) private readonly sceneRepository: Repository<SceneEntity>,
    @InjectRepository(MindfulnessEntity) private readonly mindfulnessRepository: Repository<MindfulnessEntity>,
    @InjectRepository(MindfulnessAlbumEntity) private readonly mindfulnessAlbumRepository: Repository<MindfulnessAlbumEntity>,
    @InjectRepository(NatureEntity) private readonly natureRepository: Repository<NatureEntity>,
    @InjectRepository(NatureAlbumEntity) private readonly natureAlbumRepository: Repository<NatureAlbumEntity>,
    @InjectRepository(WanderEntity) private readonly wanderRepository: Repository<WanderEntity>,
    @InjectRepository(WanderAlbumEntity) private readonly wanderAlbumRepository: Repository<WanderAlbumEntity>,
  ) { }

  async sayHello(name: string) {
    return { msg: `Scene Hello ${name}!` };
  }

  async createScene(name) {
    const newScene = this.sceneRepository.create({ name });
    await this.sceneRepository.insert(newScene);
    return newScene;
  }

  async updateScene(id, name) {
    await this.sceneRepository.update(id, { name });
    return this.sceneRepository.findOne(id);
  }

  async deleteScene(id) {
    // await this.mindfulnessRepository.updateMany({}, { $pull: { scenes: id } }).exec();
    // await this.mindfulnessAlbumRepository.updateMany({}, { $pull: { scenes: id } }).exec();
    // await this.natureRepository.updateMany({}, { $pull: { scenes: id } }).exec();
    // await this.natureAlbumRepository.updateMany({}, { $pull: { scenes: id } }).exec();
    // await this.wanderRepository.updateMany({}, { $pull: { scenes: id } }).exec();
    // await this.wanderAlbumRepository.updateMany({}, { $pull: { scenes: id } }).exec();
    return await this.sceneRepository.remove(id);
  }

  async getScene(first = 20, after?: string) {
    if (after) {
      const scene = await this.sceneRepository.findOne(after);
      return await this.sceneRepository.createQueryBuilder('scene')
        .where(`createTime >= :createTime`, { createTime: scene.createTime }).limit(first).getMany();
      // return await this.sceneRepository.find({ createTime: { $gte: after } }).limit(first).exec();
    } else {
      return await this.sceneRepository.createQueryBuilder().limit(first).getMany();
    }
  }

  async getSceneById(id) {
    return await this.sceneRepository.findOne(id);
  }

  async getSceneByIds(ids) {
    return await this.sceneRepository.findByIds(ids);
  }
}
