# AWS Infrastructure Documentation

This directory contains modularized Terraform configurations for provisioning full, production-ready AWS infrastructure stacks supporting **Development** and **Production** environments on **Canonical Ubuntu 24.04 LTS**, optimized for **AWS Free Tier**, with HTTPS SSL/TLS and keyless GitHub Actions CI/CD workflows.

---

## 🏗️ Architecture Overview

```
                         ┌──────────────────────┐
                         │      GitHub Actions   │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
            Frontend deploy                      Backend deploy
                  │                                   │
                  ▼                                   ▼
          ┌───────────────┐                    ┌───────────────┐
          │      S3       │                    │      ECR      │
          │ React build   │                    │ Docker image  │
          └───────┬───────┘                    └───────┬───────┘
                  │                                    │
                  ▼                                    │ docker pull
          ┌───────────────┐                            │
          │  CloudFront   │                            ▼
          │      CDN      │                    ┌───────────────┐
          └───────┬───────┘                    │  Ubuntu 24.04 │
                  │                            │ Express/Docker │
                  │                            └───────┬───────┘
                  │                                    │
                  │                            ┌───────┴───────┐
                  │                            │      ASG       │
                  │                            │  EC2 fleet     │
                  │                            └───────┬───────┘
                  │                                    │
                  │                            ┌───────▼───────┐
                  └────────────────────────────│      ALB       │
                                               │ Load Balancer │
                                               └───────────────┘
                                                        │
                                                        ▼
                                                   Express API
```

---

## 🧱 Modular Structure & Clean Interface Design

The infrastructure configuration is separated into 4 dedicated, decoupled modules in `infra/modules/`:

- **`vpc`** (`modules/vpc`): Provisions VPC, 2 Public Subnets across Availability Zones, Internet Gateway, and Route Tables.
- **`backend`** (`modules/backend`): Provisions Amazon ECR with lifecycle auto-purge, ALB (Security Group, Target Group, Listener), Launch Template (Ubuntu 24.04 LTS, 20GB gp3 EBS), Auto Scaling Group (ASG), and SSM IAM Roles.
- **`frontend`** (`modules/frontend`): Provisions private S3 Bucket for static React build assets, CloudFront Origin Access Control (OAC), CloudFront Distribution with API forwarding (`/api/*`, `/s/*`, `/healthz`), and ACM SSL Certificate.
- **`github_oidc`** (`modules/github_oidc`): Sets up OpenID Connect (OIDC) identity provider and IAM Role for keyless GitHub Actions CI/CD deployments.

> [!NOTE]
> **Single Master Control Panel**: All configuration values are set in **one single file**: `infra/terraform.tfvars` (or `dev.tfvars` / `prod.tfvars`). Sub-modules declare strict parameter types without hardcoded duplicate defaults.

---

## 🎁 AWS Free Tier Optimization Matrix

| Resource | Configuration | Free Tier Limit | Impact |
|---|---|---|---|
| **EC2 Server** | `t3.micro` (Ubuntu 24.04 LTS) | 750 hours / month | Free Tier Eligible |
| **Fleet Capacity** | `min=1`, `desired=1`, `max=2` | 750 hours / month (1 instance 24/7) | Free Tier Eligible |
| **Root EBS Volume** | 20 GB `gp3` SSD | 30 GB EBS / month | Free Tier Eligible |
| **ECR Registry** | Lifecycle policy (auto-purges images > 14 days, keeps last 3 builds) | 500 MB / month | Free Tier Eligible |
| **CloudFront CDN** | Always Free Tier | 1 TB Out & 10M requests / month | Included in Free Tier |
| **S3 Storage** | Static SPA Bucket | 5 GB & 20,000 GET requests / month | Free Tier Eligible |
| **SSM Parameter Store** | Standard Parameters (`SERVER_URL`, `CLIENT_URL`, etc.) | Unlimited standard parameters | No Additional Cost |
| **ACM SSL Certificates** | Public Certificates | Unlimited public certificates | No Additional Cost |

---

## 🌐 Namecheap Custom Domain Setup (`ideategudy.tech`) & SSL

Primary infrastructure (VPC, EC2, ASG, ALB, ECR, S3) is deployed in **`eu-north-1`** (Stockholm). AWS CloudFront globally mandates that custom domain **AWS Certificate Manager (ACM)** SSL certificates be requested in **`us-east-1`** (N. Virginia). Terraform handles this automatically via the aliased provider `aws.us_east_1`.

### Route 53 Delegation Setup (Recommended & Automated):

1. Set `domain_name = "ideategudy.tech"` and `create_route53_zone = true` in `terraform.tfvars`.
2. Run `terraform apply`.
3. Copy the 4 output nameservers:
   ```hcl
   route53_nameservers = [
     "ns-123.awsdns-15.com",
     "ns-456.awsdns-57.net",
     "ns-789.awsdns-34.org",
     "ns-012.awsdns-01.co.uk"
   ]
   ```
4. Log into **Namecheap** -> **Domain List** -> **Manage `ideategudy.tech`** -> **Nameservers** -> Select **Custom DNS**.
5. Paste the 4 Route 53 Nameservers and Save.
6. Within 5-15 minutes, `https://ideategudy.tech` and `https://www.ideategudy.tech` will serve secure HTTPS traffic!

---

## 🔄 Multi-Environment Setup (`dev` vs `prod`)

All AWS resources are dynamically named using `${var.project_name}-${var.environment}` so `dev` and `production` environments run completely isolated.

```bash
# Deploy Development Stack
terraform apply -var-file="dev.tfvars"

# Deploy Production Stack
terraform apply -var-file="prod.tfvars"
```

---

## 💾 Terraform State Management

By default, Terraform uses **Local State** (`infra/terraform.tfstate`). This requires zero initial setup and avoids additional AWS backend costs.

### Optional: AWS S3 Remote State & DynamoDB Locking
To enable remote state storage in S3 with DynamoDB locking:
1. Create S3 state bucket & DynamoDB lock table:
   ```bash
   aws s3api create-bucket --bucket little-list-tfstate-123456 --region eu-north-1 --create-bucket-configuration LocationConstraint=eu-north-1
   aws dynamodb create-table --table-name little-list-tflocks --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region eu-north-1
   ```
2. Uncomment `backend "s3"` in `infra/versions.tf` and run `terraform init -migrate-state`.

---

## 📋 Variable Reference (`terraform.tfvars`)

| Variable Name | Description | Required? | Example Value |
|---|---|---|---|
| `aws_region` | Primary AWS region | **Yes** | `"eu-north-1"` |
| `project_name` | Resource name slug | **Yes** | `"little-list"` |
| `environment` | Stage identifier | **Yes** | `"production"` or `"dev"` |
| `domain_name` | Custom domain name | Optional | `"ideategudy.tech"` |
| `create_route53_zone` | Create Route 53 DNS Zone | Optional | `true` |
| `github_org` | GitHub Username/Org | Required for CI/CD | `"ideategudy"` |
| `github_repo` | GitHub Repository Name | Required for CI/CD | `"little-list"` |
| `api_instance_type` | EC2 server hardware size | **Yes** | `"t3.micro"` (Free Tier) |
| `api_min_size` / `desired_capacity` | EC2 ASG fleet capacity | **Yes** | `1` (750h/mo Free Tier) |
| `api_max_size` | Maximum EC2 fleet capacity | **Yes** | `2` |

---

## 🚀 Step-by-Step Execution Order

### Step 1: Provision AWS Infrastructure
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Fill in your values in terraform.tfvars
terraform init
terraform plan
terraform apply
```

### Step 2: Configure GitHub Repository Secrets & Variables
Go to **GitHub Repo -> Settings -> Secrets and variables -> Actions**:

#### Secrets:
- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

#### Variables:
- `AWS_ROLE_ARN` (from `github_actions_role_arn` output)
- `AWS_REGION` (`eu-north-1`)
- `ECR_REPOSITORY` (from `ecr_repository_name` output)
- `FRONTEND_BUCKET` (from `frontend_bucket` output)
- `CLOUDFRONT_DISTRIBUTION_ID` (from `cloudfront_distribution_id` output)
- `API_ASG_NAME` (from `api_asg_name` output)
- `SSM_PREFIX` (from `ssm_prefix` output)
- `CLIENT_URL` (`https://ideategudy.tech`)
- `SERVER_URL` (`https://ideategudy.tech`)

### Step 3: Trigger Deployment
Push changes to `main` branch to trigger parallel frontend and backend deployments via GitHub Actions.
