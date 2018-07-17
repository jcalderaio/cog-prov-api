const merge = require('deepmerge');

module.exports = {
  types: [require('./common-types'), require('./org-types'), require('./user-types')],
  resolvers: merge(require('./org-resolvers'), require('./user-resolvers'))
};
