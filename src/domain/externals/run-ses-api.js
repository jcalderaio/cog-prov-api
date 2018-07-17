// const SesApi = require('./ses-api');

// const sesApi = new SesApi(process.env);
// const log = require('../../logger')('ses-api');

// sesApi
//   .createOrg({
//     id: 'testOrgEsante1',
//     name: 'testingorgesante1',
//     kind: 11,
//     address: {
//       street1: '3110 Fairview Park Dr',
//       city: 'Falls Church',
//       state: 'VA',
//       zip: '22042',
//       phone: '703-206-6000'
//     }
//   })
//   .then(o => console.log(o))
//   .catch(err => console.log(err));

// sesApi
//   .createUser({
//     sk: 3,
//     id: 'TestUser12',
//     firstName: 'Testing',
//     lastName: 'User12',
//     NPI: '1234567890',
//     orgDirectId: 1746,
//     address: {
//       street1: 'Main St',
//       street2: 'Apt 202',
//       city: 'Roseville',
//       state: 'GA'
//     },
//     phone: '3023232',
//     email: 'lsdkjfsdl2@lskdjdd.com',
//     directEmail: 'lsdkjfsdl2@lskdjdd.com'
//   })
//   .then(o => console.log(o))
//   .catch(err => console.log(err));

// sesApi
//   .updateUser({
//     sesUserId: '17336',
//     address: {
//       Street1: '999 Riverside Dr',
//       Street2: null,
//       City: 'Falls Church',
//       State: 'VA',
//       ZIP: '22042',
//       Phone: '703-206-6000',
//       AddressType: 1
//     },
//     email: 'testing@email.com'
//   })
//   .then(o => console.log(o))
//   .catch(err => console.log(err));

// sesApi
//   .searchUser({
//     UserName: 'testProviderEsante',
//     SESUserID: '17445'
//   })
//   .then(o => console.log(o[0]))
//   .catch(err => console.log(err));

// sesApi
//   .deleteUser('17336')
//   .then(o => console.log(o.status))
//   .catch(err => console.log(err));

// sesApi
//   .searchOrg({ name: process.env.SES_PARENT_ORG_NAME })
//   .then(o => console.log(o))
//   .catch(err => console.log(err));
