/** Types generated for queries found in "example/src/find-all-posts.sql" */
import { PreparedQuery } from '@pgtyped/runtime';

/** 'FindAllPostsRawQuery' parameters type */
export interface IFindAllPostsRawQueryParams {
  userId: string;
}

/** 'FindAllPostsRawQuery' return type */
export interface IFindAllPostsRawQueryResult {
  content: string;
  createdAt: Date;
  id: string;
  title: string;
  updatedAt: Date;
}

/** 'FindAllPostsRawQuery' query type */
export interface IFindAllPostsRawQueryQuery {
  params: IFindAllPostsRawQueryParams;
  result: IFindAllPostsRawQueryResult;
}

const findAllPostsRawQueryIR: any = {"usedParamSet":{"userId":true},"params":[{"name":"userId","required":true,"transform":{"type":"scalar"},"locs":[{"a":87,"b":94}]}],"statement":"SELECT \"id\", \"title\", \"content\", \"createdAt\", \"updatedAt\" FROM \"post\"\nWHERE \"userId\" = :userId!::UUID\nORDER BY \"updatedAt\" DESC"};

/**
 * Query generated from SQL:
 * ```
 * SELECT "id", "title", "content", "createdAt", "updatedAt" FROM "post"
 * WHERE "userId" = :userId!::UUID
 * ORDER BY "updatedAt" DESC
 * ```
 */
export const findAllPostsRawQuery = new PreparedQuery<IFindAllPostsRawQueryParams,IFindAllPostsRawQueryResult>(findAllPostsRawQueryIR);


