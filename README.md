# Prisma & Pgtyped client extension

<div style="display: flex; flex: 0 0 0; justify-content: center; gap: 22px; margin-bottom: 22px;">
  <img alt="prisma logo" src="https://raw.githubusercontent.com/prisma/presskit/main/Assets/Prisma-DarkLogo.svg" style="width: 120px; background: white; padding: 10px; border-radius: 5px;">
  <img alt="pgtyped logo" src="https://raw.githubusercontent.com/adelsz/pgtyped/master/header.png" style="width: 120px; background: white; padding: 10px; border-radius: 5px">
</div>

This package exposes a [Prisma Client extension](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions/shared-extensions)
to use [PgTyped](https://pgtyped.dev/)'s `PreparedQuery`.

## Installation

<details>
  <summary>npm</summary>

    $ npm install --save @pgtyped/runtime @prisma/client prisma prisma-pgtyped-prepared-query
    $ npm install --save-dev typescript @pgtyped/cli

</details>
<details>
  <summary>pnpm</summary>

    $ pnpm add --save @pgtyped/runtime @prisma/client prisma prisma-pgtyped-prepared-query
    $ pnpm add --save-dev typescript @pgtyped/cli

</details>
<details>
  <summary>yarn</summary>

    $ yarn add @pgtyped/runtime @prisma/client prisma prisma-pgtyped-prepared-query
    $ yarn add --dev typescript @pgtyped/cli

</details>

## Usage

> See the [packages/example](packages/example) folder

To use the extension, you need to call `$extends` on your Prisma client:

```ts
// prisma-client.ts
import { prismaPgtypedPreparedQuery } from "prisma-pgtyped-prepared-query";

const prisma = new PrismaClient();
const prismaClient = prisma.$extends(prismaPgtypedPreparedQuery());

export type PrismaClient = typeof prismaClient;
```

Once you have generated your `PreparedQuery` with `@pgtyped/cli`, you can directly
use it with the prisma client:

```ts
// post.repository.ts
import { PrismaClient } from './prisma-client';
import {
  findAllPostsRawQuery,
  IFindAllPostsRawQueryResult,
} from "./find-all-posts.sql";

class PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAllPosts(clientId: string): Promise<IFindAllPostsRawQueryResult[]> {
    return this.prisma.$protected(findAllPostsRawQuery).with({ clientId });
  }
}
```

## Customization

The extension use a set of classes to bridge PgTyped with Prisma. Those classes are intentionally exposed
from the package for customizations.

| Class name                  | Description                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PrismaDatabaseConnection`  | The database connection implementing the PgTyped `IDatabaseConnection` to run the query, this is the communication layer between pgtyped and prisma |
| `PrismaPreparedQueryRunner` | The runner adding a thin layer around the `PreparedQuery` to be more fluent                                                                         |

For example, let's imagine that you want to validate at runtime the query output result. You could use the following snippet:

```ts
// prisma-client.ts
import { PreparedQuery } from "@pgtyped/runtime";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import {
  PrismaDatabaseConnection,
  PrismaPreparedQueryRunner,
} from "prisma-pgtyped-prepared-query";

async function castAs<T extends object, V extends object>(
  dto: ClassConstructor<T>,
  rows: readonly V[]
): Promise<T[]> {
  const instances = plainToInstance(dto, [...rows]);
  if (instances.length > 0) await validateOrReject(instances[0]);

  return instances;
}

const prisma = new PrismaClient().$extends((prisma) => {
  prisma.$extends({
    name: "prisma-pgtyped-validated-prepared-query",
    client: {
      $prepared<TInput, TOutput>(query: PreparedQuery<TInput, TOutput>) {
        const runner = new PrismaPreparedQueryRunner(
          new PrismaDatabaseConnection(prisma),
          query
        );

        return {
          with(params: TInput) {
            return runner.with(params);
          },
          as<T>(dto: ClassConstructor<T>) {
            return {
              with: (params: TInput): Promise<T[]> => {
                const rows = await this.with(params);
                return castAs(dto, rows);
              },
            };
          },
        };
      },
    },
  });
});

export type PrismaClient = typeof prisma;

// ---
// post.repository.ts
import { PrismaClient } from "./prisma-client";
import { findAllPostsRawQuery } from "./find-all-posts.sql";

class Post {
  @IsUUID()
  id!: string;
}

class PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAllPosts(clientId: string): Promise<Post[]> {
    return this.prisma
      .$prepared(findAllPostsRawQuery)
      .as(Post)
      .with({ clientId });
  }
}
```
