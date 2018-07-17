const axios = require('axios');

module.exports = class SesOrg {
  // constructor(sesBaseUrl, parentOrgName) {}

  save(org) {
    if (!org.hispId) return this._createOrg(org);
    return this._updateOrg(org);
  }

  find(name) {
    return axios.post({ name }).then(list => list[0]);
  }

  _createOrg() {
    return this.find({ id: this.parentOrgName }).then(parentOrg =>
      this._axios.post({
        Name: 'foo',
        Description: 'This is dummy org',
        OrgKind: 11,
        OrgAddress: {
          Street1: '3110 Fairview Park Dr',
          City: 'Falls Church',
          State: 'VA',
          ZIP: '22042',
          Phone: '703-206-6000',
          AddressType: 1
        },
        ParentOrganizationID: parentOrg.OrgID
      }));
  }

  _updateOrg() {
    return this._axios.post({
      Name: 'foo',
      Description: 'This is dummy org',
      OrgKind: 11,
      OrgAddress: {
        Street1: '3110 Fairview Park Dr',
        City: 'Falls Church',
        State: 'VA',
        ZIP: '22042',
        Phone: '703-206-6000',
        AddressType: 1
      },
      ParentOrganizationID: 1746
    });
  }
};
