variable "lambda_name" {
  default = "esante-provisioning-api"
}

variable "lambda_s3_bucket" {
  default = "cgs-artifacts"
}

variable "lambda_s3_key" {
  default = "esante/provisioning/esante-provisioning-api/esante-provisioning-api.zip"
}

# TODO: load this from remote vpc state
variable "lambda_subnets" {
  type    = "list"
  default = ["subnet-97139bab", "subnet-b9f8ebf0"]
}

variable "lambda_security_groups" {
  type    = "list"
  default = ["sg-39c4c045"]
}
