module "environment" {
  source = "git@github.com:Cognosante/cgs-serverless.git//environment"

  env                         = "${terraform.workspace}"
  api_gateway_id              = "${data.terraform_remote_state.common.api_gateway_id}"
  api_gateway_stage_variables = "${var.app_config[terraform.workspace]}"
  lambda_arn                  = "${data.terraform_remote_state.common.lambda_arn}"
  lambda_name                 = "${data.terraform_remote_state.common.lambda_name}"
  lambda_version              = "${var.lambda_version}"
}
