const OrgService = require('../domain/organization');

module.exports = {
  Query: {
    organization: () => true
  },
  ProvisioningOrgQuery: {
    get: (_, args, context) => OrgService(context.db, context.vars).get(args),
    getMany: (_, args, context) => OrgService(context.db, context.vars).getMany(args.ids),
    search: (_, args) => args.criteria || {}
  },
  ProvisioningOrgQuerySearch: {
    list: (criteria, args, context) =>
      OrgService(context.db, context.vars).search(criteria, args.skip, args.limit, args.orderBy),
    count: (criteria, args, context) => OrgService(context.db, context.vars).count(criteria),
    cities: (criteria, args, context) => OrgService(context.db, context.vars).cities(criteria)
  },
  Mutation: {
    organization: () => true
  },
  ProvisioningOrgMutation: {
    save: (_, args, context) => OrgService(context.db, context.vars).save(args.org),
    delete: (_, args, context) => OrgService(context.db, context.vars).delete(args)
  }
};
