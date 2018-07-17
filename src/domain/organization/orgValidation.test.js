const OrgValidation = require('./orgValidation');

const orgValidator = new OrgValidation();

const baseOrgObject = {
  id: 'org1',
  name: 'testorg',
  email: 'testOrg@email.com',
  NPI: '1234567890',
  address: {
    street1: 'Main st',
    city: 'Rockville',
    state: 'MD'
  },
  kind: 1
};

describe('Test Validator', () => {
  test('should return with no errors', () => {
    return orgValidator.validateOrgObject(baseOrgObject).then(err => {
      expect(err).toEqual({
        NPI: '1234567890',
        address: { city: 'Rockville', state: 'MD', street1: 'Main st' },
        email: 'testOrg@email.com',
        id: 'org1',
        kind: 1,
        name: 'testorg'
      });
    });
  });

  test('should return with errors', () => {
    return (
      orgValidator
        /* eslint-disable */
        .validateOrgObject(
          Object.assign(baseOrgObject, { address: { city: 'Rockville', state: 'Maryland', street1: 'Main St' } })
        )
        .catch(err => {
          expect(err.message) //
            .toEqual(
              'ValidationError: child "address" fails because [child "state" fails because ["state" length must be 2 characters long]]'
            );
        })
      /* eslint-enable */
    );
  });
});
