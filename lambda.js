const { lambda } = require('@cognosante/cgs-graphql-server');
exports.handler = lambda(require('./src'));
