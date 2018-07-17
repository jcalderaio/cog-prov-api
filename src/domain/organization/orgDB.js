/*eslint-disable*/
const ORG_TABLE = 'esante.organizations';
const USER_TABLE = 'esante.users';

const ORG_MAPPING = {
  id: 'o.org_id',
  sk: 'o.org_sk',
  name: 'o.name',
  NPI: 'o.npi',
  address: 'o.address',
  phone: 'o.phone',
  email: 'o.email',
  directId: 'o.direct_id',
  directDomain: 'o.direct_domain',
  active: 'o.active',
  gisLat: 'o.gis_lat',
  gisLng: 'o.gis_lng',
  created: 'o.created_at'
};

module.exports = class DbOrg {
  constructor(db) {
    this._db = db;
  }

  //Queries
  _addFilter(query, criteria) {
    let q = query;
    const c = criteria || {};
    if (c.city) q = q.whereRaw(`address->>'city' = ?`, c.city);
    if (c.state) q = q.whereRaw(`address->>'state' = ?`, c.state);
    if (c.match) q = q.whereRaw(`name ilike '%${c.match}%' or address::text ilike '%${c.match}%'`);
    return q;
  }

  _addOrderBy(query, orderBy) {
    let q = query;
    const map = {
      name: 'name',
      id: 'id',
      totalUsers: 'COALESCE("u"."totalUsers",0)',
      address: `address->>'street1'`,
      active: 'active'
    };

    if (orderBy && orderBy.length > 0) {
      orderBy.forEach(o => {
        if (map[o.property]) {
          q = q.orderByRaw(`${map[o.property]} ${o.direction}`);
        }
      });
    } else {
      q = q.orderBy(map['name'], 'asc');
    }
    return q;
  }

  async get(criteria) {
    const { sk, id, npi } = criteria;
    const whereClause = {};

    if (sk) whereClause.org_sk = sk;
    if (id) whereClause.org_id = id;
    if (npi) whereClause.npi = npi;

    return this._db({ o: ORG_TABLE })
      .select(ORG_MAPPING)
      .where(whereClause);
  }

  async getMany(ids) {
    return this._db({ o: ORG_TABLE })
      .select(ORG_MAPPING)
      .whereIn('o.org_id', ids);
  }

  async search(criteria, skip, limit, orderBy) {
    let query = this._db({ o: ORG_TABLE })
      .select(ORG_MAPPING)
      .select([
        this._db.raw('COALESCE("u"."totalUsers",0) as "totalUsers"'),
        this._db.raw(`o.address->>'city' as city`),
        this._db.raw(`o.address->>'state' as state`)
      ])
      .leftJoin(
        this._db({ u: USER_TABLE })
          .select('org_sk')
          .count('user_sk as totalUsers')
          .groupBy('org_sk')
          .as('u'),
        'u.org_sk',
        'o.org_sk'
      );
    query = this._addFilter(query, criteria);
    query = this._addOrderBy(query, orderBy);
    if (skip && skip > 0) query = query.offset(skip);
    if (limit && limit > 0) query = query.limit(limit);
    return query;
  }

  async count(criteria) {
    let query = this._db({ o: ORG_TABLE }).countDistinct('org_sk');
    query = this._addFilter(query, criteria);
    const first = await query.first();
    return (first && first.count) || 0;
  }

  async cities(criteria) {
    let query = this._db({ o: ORG_TABLE })
      .distinct(this._db.raw(`o.address->>'city' as city`))
      .select()
      .whereNotNull(this._db.raw(`o.address->>'city'`));
    return this._addFilter(query, criteria).then(r => r.map(x => x.city));
  }

  // Mutations
  async save(org) {
    const existingOrg = await this.get({ id: org.id, sk: org.sk });
    let orgsk;
    if (existingOrg.length > 0) {
      orgsk = await this._db(ORG_TABLE)
        .where('org_sk', existingOrg[0].sk)
        .returning('org_sk')
        .update(this._toRecord(org));
    } else {
      orgsk = await this._db(ORG_TABLE)
        .returning('org_sk')
        .insert(this._toRecord({ ...org, active: false }));
    }
    const result = await this.get({ sk: orgsk[0] });
    return result[0];
  }

  async delete(criteria) {
    const { sk, id, npi } = criteria;
    if (sk || id || npi) {
      let q = this._db({ o: ORG_TABLE });
      if (sk) q = q.where('org_sk', sk);
      if (id) q = q.where('org_id', id);
      if (npi) q = q.where('npi', npi);

      await q.delete();
      return true;
    } else {
      return false;
    }
  }

  _toRecord(record) {
    return {
      org_id: record.id,
      name: record.name,
      npi: record.NPI,
      address: record.address ? JSON.stringify(record.address) : null,
      phone: record.phone,
      email: record.email,
      direct_id: record.directId,
      active: record.active,
      gis_lat: record.gisLat,
      gis_lng: record.gisLng,
      direct_domain: record.directDomain
    };
  }
};
