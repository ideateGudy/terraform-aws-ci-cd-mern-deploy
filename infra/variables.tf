variable "aws_region" {
  description = "AWS region for primary resources (VPC, EC2, ASG, ALB, ECR, S3)"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Name slug of the project used in resource naming"
  type        = string
  default     = "little-list"
}

variable "environment" {
  description = "Deployment environment stage (e.g. dev, production)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "domain_name" {
  description = "Optional custom domain name (e.g. dev.ideategudy.tech)"
  type        = string
  default     = "dev.ideategudy.tech"
}

variable "create_route53_zone" {
  description = "Whether to create a Route 53 hosted zone for domain_name automatically"
  type        = bool
  default     = true
}

variable "route53_zone_id" {
  description = "Existing Route 53 Hosted zone ID (used if create_route53_zone is false)"
  type        = string
  default     = ""
}

variable "github_org" {
  description = "GitHub Organization or account username for OIDC keyless authentication"
  type        = string
  default     = "ideategudy"
}

variable "github_repo" {
  description = "GitHub Repository name for OIDC keyless authentication"
  type        = string
  default     = "little-list"
}

variable "api_instance_type" {
  description = "EC2 instance type for Express API backend fleet (t3.micro for Free Tier)"
  type        = string
  default     = "t3.micro"
}

variable "api_min_size" {
  description = "Minimum number of instances in the API ASG fleet (1 for Free Tier)"
  type        = number
  default     = 1
}

variable "api_max_size" {
  description = "Maximum number of instances in the API ASG fleet"
  type        = number
  default     = 2
}

variable "api_desired_capacity" {
  description = "Desired number of instances in the API ASG fleet (1 for Free Tier)"
  type        = number
  default     = 1
}

variable "ssh_key_name" {
  description = "Optional EC2 key pair name for emergency SSH access"
  type        = string
  default     = null
}

locals {
  name = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
