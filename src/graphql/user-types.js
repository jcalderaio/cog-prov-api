module.exports = `
extend type Query {
  user: ProvisioningUserQuery
}

type ProvisioningUserQuery {
  get(userSk: ID, userId: String): ProvisioningUser
  getMany(ids: [String]!): [ProvisioningUser]!
  search(criteria: ProvisioningUserQueryCriteria): ProvisioningUserQuerySearch
  history(startDate: String!,
    endDate: String!,
    period: String,
    criteria: ProvisioningUserQueryCriteria
  ): [ProvisioningUserCount]
  stats(criteria: RegisteredUsersQueryCriteria): RegisteredUsersQuerySearch
  userTypes: [String]
}

input ProvisioningUserQueryCriteria {
  orgId: String
  userId: String
  userSk: Int
  NPI: String
  city: String
  state: String
  match: String
  userType: ProvisioningUserUserType
}

input RegisteredUsersQueryCriteria {
  startDate: String
  endDate: String
  orgSk: Int
  city: String
  userType: ProvisioningUserUserType
}

enum ProvisioningUserUserType {
  esante
  healthshare
  direct
}

type ProvisioningUserQuerySearch {
    list(skip: Int, limit: Int): [ProvisioningUser]
    count: Int
    cities: [String]!
}

type RegisteredUsersQuerySearch {
  usersPerMonth: [RegisteredUser]
  usersPerOrgPerMonth: [RegisteredUser] 
  usersPerOrg: [RegisteredUser]
}

extend type Mutation {
  user(sk: ID, id: String ,npi: String): ProvisioningUserMutation
}

type ProvisioningUserMutation {
  delete: Boolean
  save(user: UserInput): ProvisioningUser
  addDelegate(delegatedUserIds: [String]!): Boolean
  removeDelegate(delegatedUserIds: [String]!): Boolean
}

input UserInput {
  id: String!
  password: String!
  orgSk: Int!
  firstName: String!
  lastName: String!
  NPI: String
  address: AddressInput
  phone: String
  email: String
  directId: String
  directEmail: String
  providerId: String
  groups: [String]
}

type ProvisioningUser {
  orgSk: Int
  productAccess: String
  id: String!
  sk: Int!
  firstName: String
  lastName: String
  NPI: String
  address: ProvisioningAddress
  city: String
  state: String
  phone: String
  email: String
  directId: String
  healthshareId: String
  directEmail: String
  active: Boolean
  providerId: String
  orgDirectId: String
  wso2Id: String
  groups: [String]
  created: String,
  delegatedUsers: [ProvisioningUser]
  gisLat: Float
  gisLng: Float
  orgName: String
}

type ProvisioningUserCount {
  reportingPeriod: String
  month: Int
  year: Int
  total: Int
  cumulative: Int
}

type RegisteredUser {
  month: Int
  year: Int
  count: Int
  name: String
  gisLat: Float
  gisLng: Float
}
`;
