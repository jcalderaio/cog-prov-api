provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket = "cgs-terraform"
    key    = "esante/provisioning/api.tfstate"
    region = "us-east-1"
  }
}
