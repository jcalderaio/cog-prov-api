const axios = require('axios');
const urljoin = require('url-join');
const log = require('../../logger')('wso2-api');

module.exports = class WSO2Api {
  constructor(config) {
    this.config = config;
  }

  createUser(user) {
    return axios({
      method: 'post',
      url: urljoin(this.config.WSO2_BASE_URL || '', '/Users'),
      data: {
        schemas: [],
        name: {
          familyName: user.lastName,
          givenName: user.firstName
        },
        userName: user.id,
        password: user.password,
        emails: [
          {
            primary: true,
            value: user.email,
            type: 'home'
          }
        ]
      },
      auth: {
        username: this.config.WSO2_USER,
        password: this.config.WSO2_PASSWORD
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/scim+json'
      }
    })
      .then(u => {
        if (u) {
          return Promise.resolve(u);
        }
        return Promise.resolve(user);
      })
      .catch(err => {
        log.debug('WSO2 create user error -------->', err);
        // in case someone is using the provisioning api to create users on multiple environments
        return Promise.resolve(user);
      });
  }
};
