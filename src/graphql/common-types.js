module.exports = `
type ProvisioningAddress {
  type: String
  street1: String
  street2: String
  city: String
  state: String
  zip: String
  county: String
}

input AddressInput {
  type: String
  street1: String
  street2: String
  city: String
  state: String
  zip: String
  county: String
}

type ProvisioningCity {
  city: String
  state: String
}

`;
