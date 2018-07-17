const dbOrg = require('./orgDB');
const Validator = require('./orgValidation');
const SesApi = require('../externals/ses-api');

module.exports = (db, vars) => new OrgRepository(db, vars);

class OrgRepository {
  constructor(db, vars) {
    this.dbOrg = new dbOrg(db);
    this.sesApi = new SesApi(vars);
    this.validator = new Validator();
  }

  get(criteria) {
    return this.dbOrg.get(criteria);
  }

  getMany(ids) {
    return this.dbOrg.getMany(ids);
  }

  search(criteria, skip, limit, orderBy) {
    return this.dbOrg.search(criteria, skip, limit, orderBy);
  }

  count(criteria) {
    return this.dbOrg.count(criteria);
  }

  cities(criteria) {
    return this.dbOrg.cities(criteria);
  }

  save(org) {
    return this.validator
      .validateOrgObject(org) //
      .then(o => {
        return this.dbOrg
          .save(o) //
          .then(d => {
            if (!d.directId) {
              return this.sesApi.createOrg(d).then(res => {
                return this.dbOrg.save({
                  id: d.id,
                  sk: d.sk,
                  directId: res.data.SESOrgID,
                  active: true
                });
              });
            }
            return d;
          });
      });
  }

  delete(criteria) {
    return this.dbOrg.delete(criteria);
  }
}
