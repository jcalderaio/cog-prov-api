// jest src/domain/externals/ses-api.test.js --watch --collectCoverageFrom=src/domain/externals/ses-api.js
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const sesApi = require('./ses-api');
// const urljoin = require('url-join');

const SESAPI = new sesApi(process.env);

describe('SES API Create User', () => {
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
    mock.onPost(/RA_v2\/api\/User\/Register/).reply(200, data);

    SESAPI.createUser(
      {
        type: 0,
        username: 'testProviderEsante',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@doe.com',
        npi: '1234567890',
        orgId: 1746,
        address: {
          street1: '3110 Fairview Park Dr',
          city: 'Falls Church',
          state: 'VA',
          zip: '22042',
          phone: '703-206-6000',
          type: 1
        }
      },
      'mocktoken'
    ).then(response => {
      expect(response.data).toEqual(data);
      done();
    });
  });

  // TODO
  // it('returns error when createUser is called without token', done => {
  //   const mock = new MockAdapter(axios);
  //   const result = 401;
  //   // mock.onPost(urljoin(process.env.SES_BASE_URL, '/RA_v2/api/User/Register')).reply(404, result);
  //   mock.onPost(/RA_v2\/api\/User\/Register/).reply(401, result);

  //   // mock.onPost(/identity\/conntect\/token/).reply(200, { token: 'foo' });

  //   SESAPI.createUser({
  //     type: 0,
  //     username: 'testProviderEsante',
  //     firstname: 'John',
  //     lastname: 'Doe'
  //   }).catch(response => {
  //     console.log('RES', response);
  //     expect(response.response.status).toEqual(result);
  //     done();
  //   });
  // });

  it('returns SESUserId response when update user is called', done => {
    const mock = new MockAdapter(axios);
    const data = {
      Message: 'User Update Success...'
    };
    // mock.onPost(urljoin(process.env.SES_BASE_URL, '/RA_v2/api/User/Update')).reply(200, data);
    mock.onPost(/RA_v2\/api\/User\/Update/).reply(200, data);

    SESAPI.updateUser(
      {
        email: 'john@doe.com'
      },
      'mocktoken'
    ).then(response => {
      expect(response.data.Message).toEqual(data.Message);
      done();
    });
  });

  it('returns SESUserId response when search user is called', done => {
    const mock = new MockAdapter(axios);
    const data = {
      SESUserId: '12345'
    };
    // mock.onPost(urljoin(process.env.SES_BASE_URL, '/RA_v2/api/User/Search')).reply(200, data);
    mock.onPost(/RA_v2\/api\/User\/Search/).reply(200, data);

    SESAPI.searchUser(
      {
        type: 0,
        username: 'testProviderEsante',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@doe.com',
        npi: '1234567890',
        orgId: 1746,
        address: {
          street1: '3110 Fairview Park Dr',
          city: 'Falls Church',
          state: 'VA',
          zip: '22042',
          phone: '703-206-6000',
          type: 1
        }
      },
      'mocktoken'
    ).then(response => {
      expect(response).toEqual(data);
      done();
    });
  });

  it('returns 200 status response when delete user is called', done => {
    const mock = new MockAdapter(axios);
    const data = 200;
    // mock.onDelete(urljoin(process.env.SES_BASE_URL, '/RA_v2/api/User/Delete')).reply(200);
    mock.onDelete(/RA_v2\/api\/User\/Delete/).reply(200);

    SESAPI.deleteUser(12345, 'mocktoken').then(response => {
      expect(response.status).toEqual(data);
      done();
    });
  });
});
