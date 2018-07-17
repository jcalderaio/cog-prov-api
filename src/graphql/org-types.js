module.exports = `
extend type Query {
  organization: ProvisioningOrgQuery
}

type ProvisioningOrgQuery {
  get(sk: ID, id: String, npi: String): [ProvisioningOrg]
  getMany(ids: [String]!): [ProvisioningOrg]!
  search(criteria: ProvisioningOrgQueryCriteria): ProvisioningOrgQuerySearch
}

input ProvisioningOrgQueryCriteria {
  city: String
  state: String
  match: String
}

type ProvisioningOrgQuerySearch {
  list(skip: Int, limit: Int, orderBy: [OrderListBy]): [ProvisioningOrg]
  count: Int
  cities: [String]!
}

enum OrderListDirection {
  asc
  desc
}

input OrderListBy {
  property: String!
  direction: OrderListDirection!=asc
}

extend type Mutation {
  organization: ProvisioningOrgMutation
}

type ProvisioningOrgMutation {
  delete(sk: ID, id: String ,npi: String): Boolean
  save(org: OrgInput): ProvisioningOrg
}

input OrgInput {
  id: String!
  name: String!
  NPI: String
  address: AddressInput
  phone: String
  email: String
  directId: String
  directDomain: String
  kind: Int
  gisLat: Float
  gisLng: Float
}

type ProvisioningOrg {
  id: String!
  sk: Int!
  name: String!
  NPI: String
  address: ProvisioningAddress
  city: String
  state: String
  phone: String
  email: String
  directId: String
  directDomain: String
  active: Boolean
  gisLat: Float
  gisLng: Float
  created: String
  totalUsers: Int
}

`;
