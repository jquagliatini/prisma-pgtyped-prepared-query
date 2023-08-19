import { PreparedQuery } from "@pgtyped/runtime";
import { IDatabaseConnection } from "@pgtyped/runtime/lib/tag";
import { Prisma, PrismaClient } from "@prisma/client/extension";

export function prismaPgTypedPreparedQuery() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      name: "prisma-pgtyped-prepared-query",
      client: {
        $prepared<TPreparedInput, TPreparedOutput>(
          query: PreparedQuery<TPreparedInput, TPreparedOutput>
        ) {
          return new PrismaPreparedQueryRunner(
            new PrismaDatabaseConnection(prisma),
            query
          );
        },
      },
    })
  );
}

export class PrismaDatabaseConnection implements IDatabaseConnection {
  constructor(private readonly prisma: PrismaClient) {}

  async query(query: string, bindings: any[]): Promise<{ rows: any[] }> {
    const rows = await this.prisma.$queryRawUnsafe(query, ...bindings);
    return { rows };
  }
}

export class PrismaPreparedQueryRunner<TInput, TOutput> {
  constructor(
    private readonly connection: PrismaDatabaseConnection,
    private readonly query: PreparedQuery<TInput, TOutput>
  ) {}

  with(params: TInput): Promise<TOutput[]> {
    return this.query.run(params, this.connection);
  }
}
