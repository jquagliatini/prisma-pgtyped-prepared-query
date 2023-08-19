const { randomUUID } = require("node:crypto");
const { PrismaClient } = require("@prisma/client");
const { fakerEN: faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  /** @type {{ table_name: string }[]} */
  const tableNames = await prisma.$queryRaw`
		SELECT table_name
		FROM information_schema.tables
		WHERE (
			table_schema='public'
			AND table_name <> '_prisma_migrations'
		);
	`;
  await prisma.$transaction(
    tableNames.map(({ table_name }) =>
      prisma.$executeRawUnsafe(`TRUNCATE TABLE public."${table_name}" CASCADE`)
    )
  );

  const users = Array.from({ length: 10 }).map(() => {
    const [firstName, lastName] = [
      faker.person.firstName(),
      faker.person.lastName(),
    ];
    return {
      id: randomUUID(),
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
    };
  });

  await prisma.user.createMany({ data: users });
  await prisma.post.createMany({
    data: users.flatMap(({ id: userId }) =>
      Array.from({ length: faker.number.int(1_000) }).map(() => {
        return {
          userId,
          id: randomUUID(),
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(),
        };
      })
    ),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
