const { parsed: config } = require('dotenv').config({ path: '.env' });

/** @type {import('@pgtyped/cli/lib/config').IConfig} */
const pgtypedConfig = {
  dbUrl: config.DATABASE_URL,
	srcDir: "example/src",
	transforms: [
		{
			mode: 'sql',
			include: '**/*.sql',
			emitTemplate: '{{dir}}/{{name}}.sql.ts'
		}
	]
}

module.exports = pgtypedConfig;
