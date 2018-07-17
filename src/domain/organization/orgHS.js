module.exports = class HealthshareOrg {
  constructor(hsBaseUrl) {
    this._hsBaseUrl = hsBaseUrl;
  }

  save(org) {
    // TODO: invoke healthshare soap api to create a facility
    return Promise.resolve(org);
  }
};
