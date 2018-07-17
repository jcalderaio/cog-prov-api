const { makeExecutableSchema } = require('graphql-tools');
const merge = require('deepmerge');
const mods = [require('./schema')];

const rootSchema = `
    type Query
    type Mutation
`;

const rootResolver = { Query: {} };
const schema = makeExecutableSchema({
  typeDefs: [rootSchema, ...mods[0].types],
  resolvers: merge.all(mods.map(x => x.resolvers).concat(rootResolver)),
  logger: { log: e => console.log(e) }
});

module.exports = schema;
