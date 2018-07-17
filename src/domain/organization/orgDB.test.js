// jest src/domain/organization/orgDB.test.js --watch --collectCoverageFrom=src/domain/organization/orgDB.js
const Knex = require('knex');
const mockKnex = require('mock-knex');

const tracker = mockKnex.getTracker();

const OrgStore = require('./orgDB');

const connectionProperties = {
  client: 'pg',
  connection: {
    host: 'any',
    port: 1,
    database: 'any',
    org: 'any',
    password: 'any',
    application_name: 'test'
  },
  pool: { min: 0, max: 3 },
  debug: false
};

const testConn = mockKnex.mock(Knex(connectionProperties));

const testContext = {
  db: testConn
};

const orgDataStore = new OrgStore(testContext.db);

const modelTemplate = {
  id: ''
};

describe('Test OrgDB', () => {
  beforeEach(() => {
    tracker.install();
  });

  afterEach(() => {
    tracker.uninstall();
  });

  describe('search()', () => {
    test('should return a query to retrieve a list of organizations', () => {
      let trackerQuery;
      tracker.on('query', query => {
        query.response([modelTemplate]);
        trackerQuery = query;
      });
      const retrieveQuery = orgDataStore.search().then(() => {
        expect(trackerQuery.sql).toEqual(expect.stringContaining('totalUsers'));
      });
      return retrieveQuery;
    });

    test('should return a query to retrieve a limited list of organizations', () => {
      let trackerQuery;
      tracker.on('query', query => {
        query.response([modelTemplate]);
        trackerQuery = query;
      });
      const retrieveQuery = orgDataStore.search({}, 0, 10).then(() => {
        expect(trackerQuery.sql).toEqual(expect.stringContaining('limit $1'));
      });
      return retrieveQuery;
    });

    test('should order by passed argument', () => {
      let trackerQuery;
      tracker.on('query', query => {
        query.response([modelTemplate]);
        trackerQuery = query;
      });
      const retrieveQuery = orgDataStore.search({}, 10, 0, [{ property: 'id', direction: 'asc' }]).then(() => {
        expect(trackerQuery.sql).toEqual(expect.stringContaining('order by id asc'));
      });
      return retrieveQuery;
    });

    test('should search name and address if search term is passed', () => {
      let trackerQuery;
      tracker.on('query', query => {
        query.response([modelTemplate]);
        trackerQuery = query;
      });
      const retrieveQuery = orgDataStore.search({ match: 'main' }, 10, 0, []).then(() => {
        expect(trackerQuery.sql).toEqual(expect.stringContaining("name ilike '%main%' or address::text ilike"));
      });
      return retrieveQuery;
    });
  });

  test('should generate valid query for getting org record', () => {
    let trackerQuery;
    tracker.on('query', query => {
      query.response([modelTemplate]);
      trackerQuery = query;
    });
    return orgDataStore.get({ id: 'org1' }).then(() => {
      expect(trackerQuery.sql).toEqual(expect.stringContaining('"org_id" = $1'));
    });
  });

  test('should generate valid query for getting a list of org records', () => {
    let trackerQuery;
    tracker.on('query', query => {
      query.response([modelTemplate]);
      trackerQuery = query;
    });
    return orgDataStore.getMany(['org1', 'org2']).then(() => {
      expect(trackerQuery.sql).toEqual(expect.stringContaining('in ($1, $2)'));
    });
  });

  test('should generate valid query for getting a count org records', () => {
    let trackerQuery;
    tracker.on('query', query => {
      query.response([modelTemplate]);
      trackerQuery = query;
    });
    return orgDataStore.count({}).then(() => {
      expect(trackerQuery.sql).toEqual(expect.stringContaining('select count(distinct "org_sk")'));
    });
  });

  test('should generate valid query for getting a list of cities', () => {
    let trackerQuery;
    tracker.on('query', query => {
      query.response([modelTemplate]);
      trackerQuery = query;
    });
    return orgDataStore.cities({}).then(() => {
      expect(trackerQuery.sql).toEqual(expect.stringContaining("select distinct o.address->>'city'"));
    });
  });

  // test('should generate valid query to save org record', () => {
  //   let trackerQuery;
  //   tracker.on('query', query => {
  //     query.response([modelTemplate]);
  //     trackerQuery = query;
  //   });
  //   const retrieveQuery = orgDataStore
  //     .save({
  //       id: 'org1',
  //       firstName: 'John',
  //       lastName: 'Smith',
  //       address: { street1: 'Main St', street2: 'Apt 202' }
  //     })
  //     .then(result => {
  //       expect(result).toBeDefined();
  //       console.log(trackerQuery.sql);
  //     });
  //   /* eslint-enable */
  //   return retrieveQuery;
  // });
  // test('should generate valid query to delete org record', () => {
  //   let trackerQuery;
  //   tracker.on('query', query => {
  //     query.response([modelTemplate]);
  //     trackerQuery = query;
  //   });
  //   const retrieveQuery = orgDataStore
  //     .delete({
  //       id: 'org1'
  //     })
  //     .then(result => {
  //       expect(result).toBeDefined();
  //       expect(trackerQuery.sql).toEqual('delete from "esante"."organizations" where "org_id" = $1');
  //     });
  //   return retrieveQuery;
  // });
});
