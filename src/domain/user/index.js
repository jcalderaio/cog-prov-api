const dbUser = require('./userDB');
const SesApi = require('../externals/ses-api');
const Validator = require('./userValidation');
const WSO2Api = require('../externals/wso2-api');

module.exports = (db, vars) => new UserRepository(db, vars);

class UserRepository {
  constructor(db, vars) {
    this.dbUser = new dbUser(db);
    this.sesApi = new SesApi(vars);
    this.wso2Api = new WSO2Api(vars);
    this.validator = new Validator();
  }

  async save(user) {
    const u = await this.validator.validateUserObject(user);
    let usr = await this.dbUser.save(Object.assign(u, { groups: u.groups || ['provider'] }));
    if (usr) {
      const wso2User = await this.wso2Api.createUser(user);
      usr = await this.dbUser.save({ sk: usr.sk, wso2Id: wso2User.data.id, active: usr.active });
      if (usr.directEmail && usr.orgDirectId && !usr.directId) {
        const sesUser = await this.sesApi.createUser(user);
        usr = this.dbUser.save({ sk: usr.sk, directId: sesUser.data.SESUserID, active: usr.active });
      }
    }
    return usr;
  }

  get(criteria) {
    return this.dbUser.get(criteria);
  }

  getMany(ids) {
    return this.dbUser.getMany(ids);
  }

  count(criteria) {
    return this.dbUser.count(criteria);
  }

  search(criteria, skip, limit) {
    return this.dbUser.search(criteria, skip, limit);
  }

  cities(criteria) {
    return this.dbUser.cities(criteria);
  }

  history(criteria) {
    return this.dbUser.history(criteria);
  }

  delete(criteria) {
    return this.dbUser.delete(criteria);
  }

  userTypes() {
    return ['esante', 'healthshare', 'direct'];
  }

  addDelegate(userId, delegatedUserIds) {
    return this.dbUser.addDelegate(userId, delegatedUserIds);
  }

  removeDelegate(userId, delegatedUserIds) {
    return this.dbUser.removeDelegate(userId, delegatedUserIds);
  }

  getDelegatedUsers(userSk) {
    return this.dbUser.getDelegatedUsers({ userSk });
  }

  usersPerMonth(criteria) {
    return this.dbUser.usersPerMonth(criteria);
  }

  usersPerOrgPerMonth(criteria) {
    return this.dbUser.usersPerOrgPerMonth(criteria);
  }

  usersPerOrg(criteria) {
    return this.dbUser.usersPerOrg(criteria);
  }
}
