data "aws_caller_identity" "current" {}

locals {
  ssm_prefix = "/${var.project_name}/${var.environment}"
}

module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

module "backend" {
  source                = "./modules/backend"
  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  vpc_id                = module.vpc.vpc_id
  public_subnet_ids     = module.vpc.public_subnet_ids
  api_instance_type     = var.api_instance_type
  api_min_size          = var.api_min_size
  api_max_size          = var.api_max_size
  api_desired_capacity = var.api_desired_capacity
  ssh_key_name          = var.ssh_key_name
  ssm_prefix            = local.ssm_prefix
}

module "frontend" {
  source              = "./modules/frontend"
  project_name        = var.project_name
  environment         = var.environment
  account_id          = data.aws_caller_identity.current.account_id
  alb_dns_name        = module.backend.alb_dns_name
  domain_name         = var.domain_name
  create_route53_zone = var.create_route53_zone
  route53_zone_id     = var.route53_zone_id
  providers           = { aws.us_east_1 = aws.us_east_1 }
}

module "github_oidc" {
  source                     = "./modules/github_oidc"
  project_name               = var.project_name
  environment                = var.environment
  account_id                 = data.aws_caller_identity.current.account_id
  github_org                 = var.github_org
  github_repo                = var.github_repo
  ecr_repository_arn         = module.backend.ecr_repository_arn
  frontend_bucket_arn        = module.frontend.frontend_bucket_arn
  cloudfront_distribution_id = module.frontend.cloudfront_distribution_id
}
