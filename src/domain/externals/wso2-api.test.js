// jest src/domain/externals/ses-api.test.js --watch --collectCoverageFrom=src/domain/externals/ses-api.js
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const wso2Api = require('./wso2-api');
// const urljoin = require('url-join');

const WSO2API = new wso2Api(process.env);

describe('WSO2 API Create User', () => {
  it('returns confirmed creation when createUser is called', done => {
    const mock = new MockAdapter(axios);
    const data = {
      /* eslint-disable */
      data:
      '{"UserTypes":0,"UserName":"testProviderEsante","FirstName":"John","LastName":"Doe","ContactEmail":"john@doe.com","NPI":"1234567890","OrganizationID":1746,"Address":{"Street1":"3110 Fairview Park Dr","City":"Falls Church","State":"VA","ZIP":"22042","Phone":"703-206-6000","AddressType":1}}'
    };
    // ???? what should process.env.SES_BASE_URL be ??
    /* eslint-enable */
    // mock.onPost(urljoin(process.env.SES_BASE_URL, '/RA_v2/api/User/Register')).reply(200, data);
    // who cares.
    mock.onPost(/Users/).reply(200, data);

    WSO2API.createUser({
      lastName: 'Smith',
      firstName: 'John',
      id: 'john.smith',
      password: 'password',
      email: 'john.smith@email.com',
    }).then(response => {
      expect(response.data).toEqual(data);
      done();
    });
  });
});
