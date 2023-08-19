/* @name findAllPostsRawQuery */
SELECT "id", "title", "content", "createdAt", "updatedAt" FROM "post"
WHERE "userId" = :userId!::UUID
ORDER BY "updatedAt" DESC;
