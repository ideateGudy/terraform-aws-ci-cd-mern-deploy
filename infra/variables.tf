variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "little-list"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "domain_name" {
  description = "Optional public hostname, for example app.example.com."
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Hosted zone ID used when domain_name is set."
  type        = string
  default     = ""
}

variable "github_org" {
  type    = string
  default = ""
}

variable "github_repo" {
  type    = string
  default = ""
}

variable "api_instance_type" {
  type    = string
  default = "t3.micro"
}

variable "api_min_size" {
  type    = number
  default = 2
}

variable "api_max_size" {
  type    = number
  default = 4
}

variable "api_desired_capacity" {
  type    = number
  default = 2
}

variable "ssh_key_name" {
  description = "Optional EC2 key pair name for emergency access."
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
