# Development Environment Configuration
aws_region           = "eu-north-1"
project_name         = "mern-deploy"
environment          = "dev"

domain_name          = "dev.ideategudy.tech"
create_route53_zone  = true

github_org           = "ideategudy"
github_repo          = "terraform-aws-ci-cd-mern-deploy"

api_instance_type    = "t3.micro"
api_min_size         = 1
api_max_size         = 2
api_desired_capacity = 1
