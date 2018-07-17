variable api_gateway_id {}
variable lambda_arn {}

variable lambda_version {}

variable app_config {
  type = "map"

  default = {
    dev = {
      LAMBDA_ALIAS    = "dev"
      "DB_HOST"       = "esante-dev.cvjgxrxnvk8i.us-east-1.rds.amazonaws.com"
      "DB_PORT"       = 5432
      "DB_DATABASE"   = "provisioning"
      "DB_USER"       = "master"
      "DB_PASSWORD"   = "esante1xlm0"
      "WSO2_BASE_URL" = "https://idp.cognosante.cc/scim2"
      "WSO2_USER"     = "admin"
      "WSO2_PASSWORD" = "C0gn0sant3"
    }

    qa = {
      LAMBDA_ALIAS    = "qa"
      "DB_HOST"       = "esante-qa.cvjgxrxnvk8i.us-east-1.rds.amazonaws.com"
      "DB_PORT"       = 5432
      "DB_DATABASE"   = "provisioning"
      "DB_USER"       = "master"
      "DB_PASSWORD"   = "esante1xlm0"
      "WSO2_BASE_URL" = "https://idp.cognosante.cc/scim2"
      "WSO2_USER"     = "admin"
      "WSO2_PASSWORD" = "C0gn0sant3"
    }

    stage = {
      LAMBDA_ALIAS    = "stage"
      "DB_HOST"       = "esante-stage.cvjgxrxnvk8i.us-east-1.rds.amazonaws.com"
      "DB_PORT"       = 5432
      "DB_DATABASE"   = "provisioning"
      "DB_USER"       = "master"
      "DB_PASSWORD"   = "esante1xlm0"
      "WSO2_BASE_URL" = "https://idp.cognosante.cc/scim2"
      "WSO2_USER"     = "admin"
      "WSO2_PASSWORD" = "C0gn0sant3"
    }
  }
}
