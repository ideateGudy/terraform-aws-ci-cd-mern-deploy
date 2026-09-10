variable "vpc_id" {
  type        = string
  description = "VPC ID where backend resources (ALB, ASG, SG) reside"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "List of public subnet IDs for ALB and ASG fleet deployment"
}

variable "project_name" {
  type        = string
  description = "Name of the project"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. dev, production)"
}

variable "aws_region" {
  type        = string
  description = "AWS region for backend resources"
}

variable "api_instance_type" {
  type        = string
  description = "EC2 instance type for Express API backend fleet"
}

variable "api_min_size" {
  type        = number
  description = "Minimum size of ASG fleet"
}

variable "api_max_size" {
  type        = number
  description = "Maximum size of ASG fleet"
}

variable "api_desired_capacity" {
  type        = number
  description = "Desired capacity of ASG fleet"
}

variable "ssh_key_name" {
  type        = string
  description = "Optional EC2 SSH key pair name for emergency SSH access"
}

variable "ssm_prefix" {
  type        = string
  description = "SSM Parameter Store prefix for runtime secrets"
}
