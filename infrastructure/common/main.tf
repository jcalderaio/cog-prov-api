module "common" {
  source = "git@github.com:Cognosante/cgs-serverless.git//common"

  //variables
  name                   = "esante-provisioning-api"
  description            = "eSante Provisioning API"
  lambda_bucket          = "${var.lambda_s3_bucket}"
  lambda_key             = "${var.lambda_s3_key}"
  lambda_subnets         = "${var.lambda_subnets}"
  lambda_security_groups = "${var.lambda_security_groups}"
}
