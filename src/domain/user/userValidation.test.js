const UserValidation = require('./userValidation');

const userValidator = new UserValidation();

const baseUserObject = {
  id: 'user1',
  firstName: 'john',
  lastName: 'smith',
  password: 'password123',
  email: 'john.smith@email.com',
  orgSk: 3,
  NPI: '1234567890',
  address: {
    street1: 'Main st',
    city: 'Rockville',
    state: 'MD'
  }
};

describe('Test Validator', () => {
  test('should return with no errors', () => {
    return userValidator.validateUserObject(baseUserObject).then(err => {
      expect(err).toEqual({
        NPI: '1234567890',
        address: { city: 'Rockville', state: 'MD', street1: 'Main st' },
        email: 'john.smith@email.com',
        firstName: 'john',
        password: 'password123',
        id: 'user1',
        lastName: 'smith',
        orgSk: 3
      });
    });
  });

  test('should return with errors', () => {
    return userValidator.validateUserObject(Object.assign(baseUserObject, { NPI: '123' })).catch(err => {
      expect(err.message) //
        .toEqual('ValidationError: child "NPI" fails because ["NPI" length must be 10 characters long]');
    });
  });
});
