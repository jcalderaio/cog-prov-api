const { difference, intersection } = require('lodash');

const USER_TABLE = 'esante.users';
const ORG_TABLE = 'esante.organizations';
const DELEGATIONS_TABLE = 'esante.delegations';

const COLUMNS = {
  created: 'u.created_at',
  sk: 'u.user_sk',
  id: 'u.user_id',
  orgSk: 'u.org_sk',
  firstName: 'u.first_name',
  lastName: 'u.last_name',
  middleName: 'u.middle_name',
  NPI: 'u.npi',
  Address: 'u.address',
  phone: 'u.phone',
  email: 'u.email',
  directId: 'u.direct_id',
  directEmail: 'u.direct_email',
  providerId: 'u.provider_id',
  groups: 'u.groups',
  active: 'u.active',
  wso2Id: 'u.wso2_id',
  healthshareId: 'u.healthshare_id'
};

module.exports = class DbUser {
  constructor(db) {
    this._db = db;
  }

  _addFilter(query, criteria) {
    let q = query;
    const c = criteria || {};
    if (c.orgId) q = q.where('o.org_id', c.orgId);
    if (c.userSk) q = q.where('u.user_sk', c.userSk);
    if (c.userId) q = q.where('u.user_id', c.userId);
    if (c.NPI) q = q.where('u.npi', c.NPI);
    if (c.match) {
      q = q
        .where('u.last_name', 'ilike', `%${c.match}%`)
        .orWhere('u.first_name', 'ilike', `%${c.match}%`)
        .orWhere('u.middle_name', 'ilike', `%${c.match}%`)
        .orWhere('u.email', 'ilike', `%${c.match}%`)
        .orWhere('u.direct_email', 'ilike', `%${c.match}%`);
    }

    if (c.city) q = q.whereRaw("u.address->>'city' = ?", c.city).orWhere('u.city', c.city);
    if (c.state) q = q.where("u.address->>'state' = ? ", c.state).orWhere('u.state', c.state);
    const userType = c.userType || '';
    switch (userType.toLowerCase()) {
      case 'healthshare':
        q = q.whereNotNull('u.healthshare_id');
        break;
      case 'direct':
        q = q.whereNotNull('u.direct_email').whereNotNull('u.direct_id');
        break;
      default:
    }
    return q;
  }

  _registeredUsersFilter(query, criteria) {
    let q = query;
    const c = criteria || {};
    const userType = c.userType || '';
    if (c.city) q.whereRaw("u.address->>'city' = ?", c.city);
    if (c.startDate) q.whereRaw("TO_CHAR(u.created_at, 'YYYY/MM/DD') >= ?", c.startDate);
    if (c.endDate) q.whereRaw("TO_CHAR(u.created_at, 'YYYY/MM/DD') <= ?", c.endDate);
    if (c.orgSk) q.whereRaw('u.org_sk = ?', c.orgSk);
    switch (userType.toLowerCase()) {
      case 'healthshare':
        q = q.whereNotNull('u.healthshare_id');
        break;
      case 'direct':
        q = q.whereNotNull('u.direct_email').whereNotNull('u.direct_id');
        break;
      case 'esante':
        q = q.whereNull('u.direct_email').whereNull('u.direct_id');
        break;
      default:
    }
    return q;
  }

  _createQuery(joinWithOrg) {
    let query = this._db({ u: USER_TABLE });
    if (joinWithOrg) query = query.join({ o: ORG_TABLE }, 'o.org_sk', 'u.org_sk');
    return query;
  }

  async get(userIDorSK) {
    let query = this._createQuery(userIDorSK).select(COLUMNS);
    query = this._addFilter(query, userIDorSK);
    return query.first();
  }

  async getMany(ids) {
    return this._createQuery()
      .select(COLUMNS)
      .whereIn('u.user_id', ids);
  }

  search(criteria, skip, limit) {
    let query = this._createQuery(!!criteria.orgId).select(COLUMNS);
    query = this._addFilter(query, criteria);
    if (skip && skip > 0) query = query.offset(skip);
    if (limit && limit > 0) query = query.limit(limit);
    return query;
  }

  async count(criteria) {
    let query = this._createQuery(!!criteria.orgId).countDistinct('u.user_sk');
    query = this._addFilter(query, criteria);
    const first = await query.first();
    return (first && first.count) || 0;
  }

  async cities(criteria) {
    const query = this._createQuery(!!criteria.orgId)
      .distinct(this._db.raw("u.address->>'city' as city"))
      .select()
      .whereNotNull(this._db.raw("u.address->>'city'"));
    const result = this._addFilter(query, criteria);
    return result.map(x => x.city);
  }

  /**
   * history will return a count of users by a reporting period (default is monthly)
   * for a given date range.
   *
   * @param  {Object} criteria Includes optional `startDate`, `endDate`, `period`
   *                           as well as normal `criteria` (ProvisioningUserQueryCriteria)
   * @return {Promise}         Knex query promise
   */
  history(criteria) {
    // We can adjust the reporting period, by default it's monthly.
    // date_trunc() is a powerful thing. It lets us truncate a date by day, month, year,
    // quarter, week, decade, century...yea...and more.
    const period = (criteria && criteria.period) || 'month';
    let reportingPeriod;

    // Try not to get too crazy now.
    switch (period) {
      case 'month':
      default:
        reportingPeriod = this._db.raw("DATE_TRUNC('month', created_at) AS reporting_period");
        break;
      case 'day':
        reportingPeriod = this._db.raw("DATE_TRUNC('day', created_at) AS reporting_period");
        break;
      case 'week':
        reportingPeriod = this._db.raw("DATE_TRUNC('week', created_at) AS reporting_period");
        break;
      case 'year':
        reportingPeriod = this._db.raw("DATE_TRUNC('year', created_at) AS reporting_period");
        break;
    }

    // CTE
    const cte = this._db
      .select(reportingPeriod, this._db.raw('COUNT(1)'))
      .from(USER_TABLE)
      .groupBy(1);

    // Limit by date range
    if (criteria && criteria.startDate) {
      cte.whereRaw('created_at >= ?', criteria.startDate);
    }
    if (criteria && criteria.endDate) {
      cte.whereRaw('created_at <= ?', criteria.endDate);
    }

    // Other WHERE conditions
    if (criteria && criteria.orgSk) {
      // 0 is all, -1 will be NULL now and any other integer is whatever org.
      // GraphQL does have a union type...but it's not gaining us anything, NULL is not a string.
      if (criteria.orgSk === -1) {
        cte.whereRaw('org_sk IS NULL');
      } else {
        cte.whereRaw('org_sk = ?', criteria.orgSk);
      }
    }
    if (criteria && criteria.city) {
      cte.whereRaw("address->>'city' = ?", criteria.city);
    }
    if (criteria && criteria.state) {
      cte.whereRaw("address->>'state' = ?", criteria.state);
    }

    // Query from the CTE we'll call 'user_count'
    const query = this._db
      .with('user_count', cte)
      .select(
        this._db.raw('reporting_period AS "reportingPeriod"'),
        this._db.raw('DATE_PART(\'month\', reporting_period) AS "month"'),
        this._db.raw('DATE_PART(\'year\', reporting_period) AS "year"'),
        this._db.raw('count AS "total"'),
        this._db.raw(`SUM(count) OVER 
          (ORDER BY reporting_period ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) 
          AS "cumulative"`)
      )
      .from('user_count')
      .orderBy('reporting_period');
    // console.log(query.toString());

    return query;
  }

  async delete(criteria) {
    const query = this._createQuery(criteria);
    await query.delete();
    return true;
  }

  usersPerMonth(criteria) {
    let query = this._createQuery(!!criteria.orgId);
    query = this._registeredUsersFilter(query, criteria);
    query
      .select(
        this._db.raw('COUNT(\'month\') as "count"'),
        this._db.raw('DATE_PART(\'month\', u.created_at) AS "month"'),
        this._db.raw('DATE_PART(\'year\', u.created_at) AS "year"')
      )
      .groupByRaw("DATE_PART('month', u.created_at), DATE_PART('year', u.created_at)")
      .orderByRaw("DATE_PART('month', u.created_at), DATE_PART('year', u.created_at)");
    return query;
  }

  async usersPerOrgPerMonth(criteria) {
    const query = await this.usersPerMonth({ ...criteria, orgId: true }) // Object.assign({}, criteria, { orgId: true })
      .select('o.name')
      .groupByRaw('o.name');
    return query;
  }

  async usersPerOrg(criteria) {
    let query = this._createQuery(true);
    query = this._registeredUsersFilter(query, criteria)
      .select(
        this._db.raw('COUNT(\'o.name\') as "count"'),
        this._db.raw('o.name'),
        this._db.raw('o.gis_lat AS "gisLat"'),
        this._db.raw('o.gis_lng AS "gisLng"')
      )
      .groupByRaw('o.name, o.gis_lat, o.gis_lng');
    return query;
  }

  async getDelegatedUsers(skOrId) {
    const { userSk, userId } = skOrId;
    let query = this._createQuery()
      .join({ d: DELEGATIONS_TABLE }, 'd.original_user_sk', 'u.user_sk')
      .join({ t: USER_TABLE }, 'd.acting_user_sk', 't.user_sk')
      .select(COLUMNS);
    if (userSk) query = query.where('t.user_sk', userSk);
    else if (userId) query = query.where('t.user_id', userId);
    else throw new Error('Missing username or surrogate key identifier');
    const result = await query;
    return result;
  }

  async addDelegate(userId, delegatedUserIds) {
    // Get the user's current delegations
    const currentDelegations = await this._db
      .select(['u1.user_sk as originalUserSk', 'u1.user_id as originalUserId'])
      .from(`${DELEGATIONS_TABLE} as d`)
      .innerJoin(`${USER_TABLE} as u1`, 'd.original_user_sk', 'u1.user_sk')
      .innerJoin(`${USER_TABLE} as u2`, 'd.acting_user_sk', 'u2.user_sk')
      .where('u2.user_id', userId);

    // Determine which of the passed in delegations are new
    const newDelegations = difference(delegatedUserIds, currentDelegations.map(i => i.originalUserId));

    // Get userIds and userSks for delegations AND the user
    const userSks = await this._db(USER_TABLE)
      .select(['user_sk', 'user_id'])
      .whereIn('user_id', [...newDelegations, userId]);

    const userSkBeingImpersonated = userSks.find(u => u.user_id === userId);
    if (!userSkBeingImpersonated) return false;

    const result = await this._db(DELEGATIONS_TABLE).insert(userSks.filter(u => u.user_id !== userId).map(i => {
      return {
        original_user_sk: i.user_sk,
        acting_user_sk: userSkBeingImpersonated.user_sk
      };
    }));

    return !!result;
  }

  async removeDelegate(userId, delegatedUserIds) {
    // Get the user's current delegations
    const currentDelegations = await this._db
      .select(['u1.user_sk as originalUserSk', 'u1.user_id as originalUserId'])
      .from(`${DELEGATIONS_TABLE} as d`)
      .innerJoin(`${USER_TABLE} as u1`, 'd.original_user_sk', 'u1.user_sk')
      .innerJoin(`${USER_TABLE} as u2`, 'd.acting_user_sk', 'u2.user_sk')
      .where('u2.user_id', userId);

    // Determine which of the passed in delegations exist
    const delegationsToDelete = intersection(
      delegatedUserIds,
      currentDelegations.map(i => {
        return i.originalUserId;
      })
    );

    // Get userIds and userSks for delegations AND the user
    const userSks = await this._db(USER_TABLE)
      .select(['user_sk', 'user_id'])
      .whereIn('user_id', [...delegationsToDelete, userId]);

    const userSkBeingImpersonated = userSks.find(u => u.user_id === userId);
    if (!userSkBeingImpersonated) return false;

    const mappingsToDelete = userSks.filter(u => u.user_id !== userId).map(i => {
      return [i.user_sk, userSkBeingImpersonated.user_sk];
    });

    const result = await this._db(DELEGATIONS_TABLE)
      .whereIn(['original_user_sk', 'acting_user_sk'], mappingsToDelete)
      .del();

    return !!result;
  }

  async save(user) {
    const existing = await this.get({ userId: user.id, userSk: user.sk });
    let userSk;
    if (!existing) {
      userSk = await this._db({ u: USER_TABLE })
        .returning('user_sk')
        .insert(this._toRecord({ ...user, active: false }));
    } else {
      userSk = await this._db({ u: USER_TABLE })
        .returning('user_sk')
        .update(this._toRecord(user));
    }
    return this.get({ userSk });
  }

  _toRecord(record) {
    return {
      user_id: record.id,
      org_sk: record.orgSk,
      first_name: record.firstName,
      last_name: record.lastName,
      npi: record.NPI,
      address: record.address ? JSON.stringify(record.address) : null,
      phone: record.phone,
      email: record.email,
      direct_id: record.directId,
      healthshare_id: record.healthshare_id,
      direct_email: record.directEmail,
      provider_id: record.providerId,
      groups: JSON.stringify(record.groups),
      wso2_id: record.wso2Id,
      active: record.active
    };
  }
};
