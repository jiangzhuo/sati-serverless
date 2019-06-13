import {ViewEntity, ViewColumn, Connection} from "typeorm";

@ViewEntity({
  expression: `
        SELECT "mindfulness"."id" AS "resourceId", "mindfulness"."type", "mindfulness"."background", "mindfulness"."name", "mindfulness"."description", "mindfulness"."price", "mindfulness"."author", "mindfulness"."createTime", "mindfulness"."updateTime", "mindfulness"."validTime", "mindfulness"."status" 
        FROM "mindfulness"
        UNION
        SELECT "mindfulnessAlbum"."id" AS "resourceId", "mindfulnessAlbum"."type", "mindfulnessAlbum"."background", "mindfulnessAlbum"."name", "mindfulnessAlbum"."description", "mindfulnessAlbum"."price", "mindfulnessAlbum"."author", "mindfulnessAlbum"."createTime", "mindfulnessAlbum"."updateTime", "mindfulnessAlbum"."validTime", "mindfulnessAlbum"."status" 
        FROM "mindfulnessAlbum"
        UNION
        SELECT "nature"."id" AS "resourceId", "nature"."type", "nature"."background", "nature"."name", "nature"."description", "nature"."price", "nature"."author", "nature"."createTime", "nature"."updateTime", "nature"."validTime", "nature"."status" 
        FROM "nature"
        UNION
        SELECT "natureAlbum"."id" AS "resourceId", "natureAlbum"."type", "natureAlbum"."background", "natureAlbum"."name", "natureAlbum"."description", "natureAlbum"."price", "natureAlbum"."author", "natureAlbum"."createTime", "natureAlbum"."updateTime", "natureAlbum"."validTime", "natureAlbum"."status" 
        FROM "natureAlbum"
        UNION
        SELECT "wander"."id" AS "resourceId", "wander"."type", "wander"."background", "wander"."name", "wander"."description", "wander"."price", "wander"."author", "wander"."createTime", "wander"."updateTime", "wander"."validTime", "wander"."status" 
        FROM "wander"
        UNION
        SELECT "wanderAlbum"."id" AS "resourceId", "wanderAlbum"."type", "wanderAlbum"."background", "wanderAlbum"."name", "wanderAlbum"."description", "wanderAlbum"."price", "wanderAlbum"."author", "wanderAlbum"."createTime", "wanderAlbum"."updateTime", "wanderAlbum"."validTime", "wanderAlbum"."status" 
        FROM "wanderAlbum"
        UNION
  `})
export class PostCategory {
  @ViewColumn()
  resourceId: string;
  @ViewColumn()
  type: string;
  @ViewColumn()
  background: string;
  @ViewColumn()
  name: string;
  @ViewColumn()
  description: string;
  @ViewColumn()
  price: number;
  @ViewColumn()
  author: string;
  @ViewColumn()
  createTime: number;
  @ViewColumn()
  updateTime: number;
  @ViewColumn()
  validTime: number;
  @ViewColumn()
  status: number;
}
