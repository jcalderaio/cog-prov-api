const axios = require('axios');
const qs = require('qs');
const urljoin = require('url-join');
const log = require('../../logger')('ses-api');
const promiseRetry = require('promise-retry');

let parentOrgId;

const retryConfig = {
  retries: 3,
  maxTimeout: 3000
};
console.log(retryConfig);
module.exports = class SESApi {
  constructor(config) {
    this.config = config;
  }

  _getToken(token) {
    if (token) return Promise.resolve(token);
    const form = {
      grant_type: 'password',
      tenant: this.config.SES_TENANT,
      client_id: this.config.SES_CLIENT_ID,
      client_secret: this.config.SES_CLIENT_SECRET,
      username: this.config.SES_USER,
      password: this.config.SES_PASSWORD,
      scope: 'regApi',
      acr_values: `tenant:${this.config.SES_TENANT}`
    };
    return promiseRetry((retry, num) => {
      log.debug('attempting to get access token. Try #', num);
      return axios.post(urljoin(this.config.SES_BASE_URL || '', '/identity/connect/token'), qs.stringify(form));
    }, retryConfig).then(result => {
      log.debug('Got access token:', result.data);
      log.debug('returning', result.data.access_token);
      return result.data.access_token;
    });
  }

  searchOrg(criteria, tk) {
    log.debug('------->', criteria.name);
    return this._getToken(tk)
      .then(token =>
        axios.post(
          urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/Organization/Search'),
          { name: criteria.name },
          { headers: { Authorization: `Bearer ${token}` } }
        ))
      .then(result => result.data);
  }
  // criteria can be any of the following request parameters =>
  // (SESUserID, OrgID, FirstName, LastName, DirectEmail, ContactEmail, Specialty, Keyword, Address, ExternalID, NPI)
  searchUser(criteria, tk) {
    log.debug('------->', criteria);
    return this._getToken(tk)
      .then(token =>
        axios.post(urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/User/Search'), criteria, {
          headers: { Authorization: `Bearer ${token}` }
        }))
      .then(result => result.data);
  }

  _getParentOrgId(token) {
    if (parentOrgId) return Promise.resolve(parentOrgId);
    return this.searchOrg({ name: this.config.SES_PARENT_ORG_NAME }, token).then(o => {
      parentOrgId = o[0].OrgID;
      return parentOrgId;
    });
  }

  createOrg(org, tk) {
    log.debug('org Object ------->', org);
    return this._getToken(tk) //
      .then(token =>
        this._getParentOrgId(token) //
          .then(poid => {
            return axios.post(
              urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/Organization/Register'),
              {
                ParentOrganizationID: poid,
                Name: org.id,
                OrgKind: org.kind || 0,
                Description: org.name,
                OrgAddress: org.address
                  ? {
                    Street1: org.address.street1,
                    City: org.address.city,
                    State: org.address.state,
                    ZIP: org.address.zip,
                    Phone: org.address.phone,
                    AddressType: 1
                  }
                  : undefined
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          })
          .catch(err => {
            console.log(err);
          }));
  }

  createUser(user, tk) {
    log.debug('user Object ------->', user);
    return this._getToken(tk) //
      .then(token => {
        return axios.post(
          urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/User/Register'),
          {
            UserTypes: user.type || 0, // required
            UserName: user.id, // required
            FirstName: user.firstName, // required
            LastName: user.lastName, // required
            ContactEmail: user.email, // required
            NPI: user.npi,
            OrganizationID: user.orgDirectId, // required //1746 is the eSante Healthcare parent Org
            DirectEmail: user.directEmail,
            Address: user.address
              ? {
                Street1: user.address.street1,
                Street2: user.address.street2,
                City: user.address.city,
                State: user.address.state, // has to be a max length of 2
                ZIP: user.address.zip,
                Phone: user.phone,
                AddressType: user.address.type || 1 // required
              }
              : undefined
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .catch(err => {
        log.debug('SES create user error -------->', err);
        return err;
      });
  }

  updateOrg(sesOrgId, address, tk) {
    return this._getToken(tk) //
      .then(token => {
        return axios.post(
          urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/Organization/Update'),
          { SESOrgId: sesOrgId, OrgAddress: [address] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });
  }

  updateUser(user, tk) {
    return this._getToken(tk) //
      .then(token => {
        const params = {};
        if (user.sesUserId) params.SESUserId = user.sesUserId;
        if (user.address) params.Address = user.address;
        if (user.email) params.ContactEmail = user.email;
        return axios.post(urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/User/Update'), params, {
          headers: { Authorization: `Bearer ${token}` }
        });
      });
  }

  deleteOrg(sesOrgId, tk) {
    return sesOrgId
      ? this._getToken(tk) //
        .then(token => {
          return axios({
            method: 'DELETE',
            url: urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/Organization/Delete'),
            data: { SESOrgId: sesOrgId, Reason: 'eSante Inform deletion' },
            headers: { Authorization: `Bearer ${token}` }
          });
        })
      : Promise.resolve(false);
  }

  deleteUser(sesUserId, tk) {
    return sesUserId
      ? this._getToken(tk) //
        .then(token => {
          return axios({
            method: 'DELETE',
            url: urljoin(this.config.SES_BASE_URL || '', '/RA_v2/api/User/Delete'),
            data: { SESUserId: sesUserId, Reason: 'eSante Inform deletion' },
            headers: { Authorization: `Bearer ${token}` }
          });
        })
      : Promise.resolve(false);
  }
};
