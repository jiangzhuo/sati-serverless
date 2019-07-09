import { Connection, EntitySchema, EntityMetadata } from 'typeorm'

// this is a copypasta of the existing typeorm Connection method
// with one line changed
// @ts-ignore
Connection.prototype.findMetadata = function (target: Function | EntitySchema<any> | string): EntityMetadata | undefined {
  return this.entityMetadatas.find(metadata => {
    // @ts-ignore
    // console.log(metadata.target, target);
    if (metadata.target.name && metadata.target.name === target.name) { // in latest typeorm it is metadata.target === target
      // console.log(11111,true)
      return true;
    }
    if (target instanceof EntitySchema) {
      // console.log(22222,metadata.name === target.options.name)
      return metadata.name === target.options.name;
    }
    if (typeof target === "string") {
      if (target.indexOf(".") !== -1) {
        // console.log(3333333, metadata.tablePath === target);
        return metadata.tablePath === target;
      } else {
        // console.log(metadata.name === target , metadata.tableName === target)
        return metadata.name === target || metadata.tableName === target;
      }
    }

    return false;
  });
}
