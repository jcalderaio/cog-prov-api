const { server } = require('@cognosante/cgs-graphql-server');
server(require('./src')).listen(8000);

console.log('Local API listening at http://localhost:8000');
