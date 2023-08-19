import "reflect-metadata";

import { PrismaClient } from "@prisma/client";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { IsUUID, validateOrReject } from "class-validator";
import * as assert from "node:assert/strict";
import { prismaPgTypedPreparedQuery } from "prisma-pgtyped-prepared-query";

import { findAllPostsRawQuery } from "./find-all-posts.sql";

const prisma = new PrismaClient();

class Post {
  @IsUUID()
  id!: string;
}

async function castAs<T extends object, V extends object>(
  dto: ClassConstructor<T>,
  rows: readonly V[]
): Promise<T[]> {
  const instances = plainToInstance(dto, [...rows]);
  if (instances.length > 0) await validateOrReject(instances[0]);

  return instances;
}

async function main() {
  const p = prisma.$extends(prismaPgTypedPreparedQuery());
  const posts = await castAs(
    Post,
    await p.$prepared(findAllPostsRawQuery).with({
      userId: "2afe32e6-0e4d-4f96-a526-8a710b0ac4fb",
    })
  );

  assert.ok(posts.length > 0);
  assert.ok(posts[0] instanceof Post);
  assert.equal(typeof posts[0].id, "string");
}

main().finally(() => prisma.$disconnect());
