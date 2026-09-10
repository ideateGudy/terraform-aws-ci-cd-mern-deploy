variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. dev, production)"
}

variable "account_id" {
  type        = string
  description = "AWS Account ID"
}

variable "alb_dns_name" {
  type        = string
  description = "DNS name of ALB for API routing"
}

variable "domain_name" {
  type        = string
  description = "Optional public custom domain name (e.g. dev.ideategudy.tech)"
}

variable "create_route53_zone" {
  type        = bool
  description = "Whether to create a new Route 53 hosted zone automatically for domain_name"
  default     = true
}

variable "route53_zone_id" {
  type        = string
  description = "Existing Hosted zone ID when create_route53_zone is false"
  default     = ""
}
