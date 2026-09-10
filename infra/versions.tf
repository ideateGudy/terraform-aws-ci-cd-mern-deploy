terraform {
  required_version = ">= 1.10.0"

  # ----------------------------------------------------------------------------
  # OPTIONAL: AWS S3 Remote Backend for State Storage & Locking
  # ----------------------------------------------------------------------------
  # By default, Terraform uses local state (infra/terraform.tfstate).
  # To enable remote state in S3 with DynamoDB locking:
  # 1. Create an S3 bucket (e.g., "little-list-tfstate-123456") & DynamoDB table ("little-list-tflocks")
  # 2. Uncomment the block below and run: terraform init -migrate-state
  # ----------------------------------------------------------------------------
  # backend "s3" {
  #   bucket         = "YOUR-UNIQUE-TFSTATE-BUCKET-NAME"
  #   key            = "terraform.tfstate"
  #   region         = "eu-north-1"
  #   dynamodb_table = "YOUR-TFLOCKS-DYNAMODB-TABLE"
  #   encrypt        = true
  # }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

# ------------------------------------------------------------------------------
# PRIMARY AWS PROVIDER (All infrastructure: VPC, EC2, ASG, ALB, ECR, S3)
# ------------------------------------------------------------------------------
provider "aws" {
  region = var.aws_region # Defaults to "eu-north-1"
  default_tags {
    tags = local.tags
  }
}

# ------------------------------------------------------------------------------
# SECONDARY AWS PROVIDER (Strictly for CloudFront ACM SSL Certificates)
# AWS CloudFront globally mandates that custom domain SSL certificates reside in us-east-1.
# ------------------------------------------------------------------------------
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = local.tags
  }
}
