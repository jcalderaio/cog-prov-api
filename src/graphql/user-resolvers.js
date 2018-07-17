const UserService = require('../domain/user');

module.exports = {
  Query: {
    user: () => true
  },
  ProvisioningUserQuery: {
    get: (_, args, context) => UserService(context.db, context.vars).get({ userId: args.userId, userSk: args.sk }),
    getMany: (_, args, context) => UserService(context.db, context.vars).getMany(args.ids),
    userTypes: (_, args, context) => UserService(context.db, context.vars).userTypes(args),
    history: (_, args, context) => UserService(context.db, context.vars).history(args),
    search: (_, args) => args.criteria || {},
    stats: (_, args) => args.criteria || {}
  },
  ProvisioningUserQuerySearch: {
    list: (criteria, args, context) => {
      return UserService(context.db, context.vars).search(criteria, args.skip, args.limit);
    },
    count: (criteria, args, context) => UserService(context.db, context.vars).count(criteria),
    cities: (criteria, args, context) => UserService(context.db, context.vars).cities(criteria)
  },
  RegisteredUsersQuerySearch: {
    usersPerMonth: (criteria, args, context) => UserService(context.db, context.vars).usersPerMonth(criteria),
    usersPerOrgPerMonth: (criteria, args, context) =>
      UserService(context.db, context.vars).usersPerOrgPerMonth(criteria),
    usersPerOrg: (criteria, args, context) => UserService(context.db, context.vars).usersPerOrg(criteria)
  },
  ProvisioningUser: {
    delegatedUsers: (parent, args, context) => UserService(context.db, context.vars).getDelegatedUsers(parent.sk)
  },
  Mutation: {
    user: (_, args) => args.user
  },
  ProvisioningUserMutation: {
    save: (_, args, context) => UserService(context.db, context.vars).save(args.user),
    delete: (_, args, context) => UserService(context.db, context.vars).delete(args),
    addDelegate: (_, args, context) =>
      UserService(context.db, context.vars).addDelegate(args.userId, args.delegatedUserIds),
    removeDelegate: (_, args, context) =>
      UserService(context.db, context.vars).removeDelegate(args.userId, args.delegatedUserIds)
  }
};
