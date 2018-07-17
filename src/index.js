const { version, name, commit } = require('../package');
const Knex = require('knex');

const knexCache = {};

function lazy(cacheKey, create) {
  if (!knexCache[cacheKey]) {
    console.log(`------>\t Creating new lazy object [${cacheKey}]`);
    knexCache[cacheKey] = create();
  } else {
    console.log(`------>\t Reusing existing lazy object [${cacheKey}]`);
  }
  return knexCache[cacheKey];
}

module.exports = {
  appInfo: { version, name, commit },
  schemas: () => [require('./graphql')],
  context: config => {
    return {
      db: lazy(`${config.DB_HOST} -> ${config.DB_DATABASE}`, () =>
        Knex({
          client: 'pg',
          debug: (config.DEBUG || '').toLowerCase() === 'true',
          connection: {
            host: config.DB_HOST,
            port: config.DB_PORT,
            database: config.DB_DATABASE,
            user: config.DB_USER,
            password: config.DB_PASSWORD,
            application_name: name
          }
        })),
      vars: {
        WSO2_PASSWORD: config.WSO2_PASSWORD,
        DB_PORT: config.DB_PORT,
        DB_USER: config.DB_USER,
        LAMBDA_ALIAS: config.LAMBDA_ALIAS,
        WSO2_BASE_URL: config.WSO2_BASE_URL,
        DB_HOST: config.DB_HOST,
        DB_DATABASE: config.DB_DATABASE,
        DB_PASSWORD: config.DB_PASSWORD,
        WSO2_USER: config.WSO2_USER
      }
    };
  }
};
