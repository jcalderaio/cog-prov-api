output "api_gateway_id" {
  value = "${module.common.api_gateway_id}"
}

output "lambda_arn" {
  value = "${module.common.lambda_arn}"
}

output "lambda_version" {
  value = "${module.common.lambda_version}"
}

output "lambda_name" {
  value = "${module.common.lambda_name}"
}
