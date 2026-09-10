variable "github_org" {
  type        = string
  description = "GitHub Organization or username (e.g. ideategudy)"
}

variable "github_repo" {
  type        = string
  description = "GitHub Repository name (e.g. little-list)"
}

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

variable "ecr_repository_arn" {
  type        = string
  description = "ARN of the ECR repository"
}

variable "frontend_bucket_arn" {
  type        = string
  description = "ARN of the S3 bucket storing frontend build"
}

variable "cloudfront_distribution_id" {
  type        = string
  description = "ID of the CloudFront distribution"
}
