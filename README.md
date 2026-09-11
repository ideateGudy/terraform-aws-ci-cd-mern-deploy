# Little List - AWS Deployment & CI/CD Pipeline

A modern, full-stack application architecture built with React, Node.js/Express, Docker, and provisioned on AWS using modular Terraform infrastructure and keyless GitHub Actions CI/CD workflows.

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
          └───────┬───────┘                    │      EC2       │
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

## 📂 Project Directory Structure

```
.
├── client/                     # Vite + React SPA Frontend
├── server/                     # Node.js + Express API Backend (Dockerized)
├── infra/                      # Modular Terraform Infrastructure
│   ├── main.tf                 # Root Terraform Module
│   ├── variables.tf            # Root Variables & Configuration Defaults
│   ├── outputs.tf              # Root Terraform Outputs
│   ├── versions.tf             # AWS & Provider Requirements
│   ├── terraform.tfvars.example# Fully Documented Variables Template
│   ├── dev.tfvars.example      # Development Environment Settings
│   ├── prod.tfvars.example     # Production Environment Settings
│   ├── README.md               # Infrastructure Detailed Documentation
│   └── modules/
│       ├── vpc/                # VPC, Public Subnets (2 AZs), IGW, Route Tables
│       ├── backend/            # ECR, ALB, ASG, Launch Template, EC2 IAM Role
│       ├── frontend/           # S3 Bucket, CloudFront OAC, CDN Distribution, Route53/ACM
│       └── github_oidc/        # GitHub OIDC Identity Provider & IAM Role
└── .github/
    └── workflows/
        └── deploy.yml          # Parallel CI/CD Workflow (Frontend & Backend)
```

---

## 🧱 Terraform Infrastructure Modules

The infrastructure is broken down into 4 dedicated, decoupled modules in `infra/modules/`:

1. **`vpc`** (`modules/vpc`):
   - Provisions VPC, 2 Public Subnets across Availability Zones, Internet Gateway, and Route Tables.
2. **`backend`** (`modules/backend`):
   - Provisions Amazon ECR repository with lifecycle auto-purge policy, Application Load Balancer (ALB), Target Group, Listener, Security Groups, EC2 Launch Template (**Canonical Ubuntu 24.04 LTS**, 20GB gp3 EBS), Auto Scaling Group (ASG), and SSM IAM Roles.
3. **`frontend`** (`modules/frontend`):
   - Provisions private S3 bucket for static React build assets, CloudFront Origin Access Control (OAC), CloudFront CDN Distribution with API forwarding (`/api/*`, `/s/*`, `/healthz`), and ACM SSL certificate for `ideategudy.tech`.
4. **`github_oidc`** (`modules/github_oidc`):
   - Configures OpenID Connect (OIDC) identity provider and scoped IAM role so GitHub Actions can keylessly authenticate to AWS without stored secret keys.

---

## 🌐 Custom Domain (`ideategudy.tech`) & SSL / HTTPS

Primary infrastructure (VPC, EC2, ASG, ALB, ECR, S3) is deployed in **`eu-north-1`** (Stockholm). HTTPS is terminated at the CloudFront CDN level using **AWS Certificate Manager (ACM)** in `us-east-1` (required by CloudFront for global edge distributions). ACM provides **free, auto-renewing SSL/TLS certificates** with zero server maintenance.

### Connecting Namecheap Domain to AWS Infrastructure:

1. In `infra/terraform.tfvars`, set:
   ```hcl
   domain_name         = "ideategudy.tech"
   create_route53_zone = true
   ```
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
6. DNS propagates in minutes, and `https://ideategudy.tech` (and `https://www.ideategudy.tech`) will serve secure HTTPS traffic!

---

### 🔍 How Client & Server Requests are Differentiated on the Same Domain (`https://ideategudy.tech`)

When both the **Client (React SPA)** and **Server (Express API)** share the exact same domain (`https://ideategudy.tech`), AWS CloudFront uses **Path-Based Routing** to instantly differentiate incoming requests:

| Request Path Pattern | CloudFront Origin Target | Handled By | Description & Action |
|---|---|---|---|
| `/` | `s3-frontend` | S3 Bucket | Serves React SPA `index.html` |
| `/login`, `/dashboard`, `/shortener` | `s3-frontend` | S3 Bucket | Serves SPA bundle (Client-side Router handles view) |
| `/assets/*` | `s3-frontend` | S3 Bucket | Serves static JS, CSS, and images |
| `/api`, `/api/*` | `alb-api` | EC2 Express Backend | Forwards requests to Express API (`/api`, `/api/auth/*`, `/api/diary/*`, `/api/shortener/*`) |
| `/s/*` | `alb-api` | EC2 Express Backend | Forwards to ALB -> Express `redirectShortUrl` (e.g. `https://dev.ideategudy.tech/s/abc1234`) |
| `/healthz` | `alb-api` | EC2 Express Backend | ALB & CloudFront health check endpoint |

> ℹ️ **Note on GET `/api` or `/api/`**: Plain `GET` requests to bare `/api` return `404` or fallback to the React SPA router (`That page wandered off`) because Express routes are defined on specific subpaths (like `/api/auth/login`, `/api/diary`, `/api/shortener`). To hit the API, send requests to specific endpoints like `/api/auth/profile` or `/healthz`.

---

### 🔑 Environment Variable Definitions (`CLIENT_URL` vs `SERVER_URL`)

Because **CloudFront** handles single-domain path-based routing (`/` -> React SPA, `/api/*` & `/s/*` -> Express API), both `CLIENT_URL` and `SERVER_URL` should point to the exact same public domain face:

#### Scenario A: Using Custom Domain / Subdomain (e.g. `dev.ideategudy.tech`)
- **`CLIENT_URL`**: `https://dev.ideategudy.tech`
  - Used by Express for **CORS origin validation** (`cors({ origin: CLIENT_URL, credentials: true })`).
- **`SERVER_URL`**: `https://dev.ideategudy.tech`
  - Used by Express as the **Shortener Base URL** to generate complete short links (e.g. `https://dev.ideategudy.tech/s/abc1234`). Clicking the short link hits CloudFront's `/s/*` rule, which routes directly to Express!

#### Scenario B: Using Default CloudFront Domain (No Custom Domain)
- **`CLIENT_URL`**: `https://d123456789.cloudfront.net` *(from `terraform output cloudfront_domain_name`)*
- **`SERVER_URL`**: `https://d123456789.cloudfront.net`

> ⚠️ **Note**: Do **NOT** set `SERVER_URL` to your raw ALB DNS name (`http://little-list-alb-1234.eu-north-1.elb.amazonaws.com`). Doing so would bypass SSL/HTTPS and break CORS cookies! CloudFront acts as the unified SSL reverse proxy for both frontend and backend.

## 🔄 Multi-Environment Support (`dev` vs `prod`)

All AWS resources are dynamically named using `${var.project_name}-${var.environment}` (e.g. `little-list-dev-alb` vs `little-list-production-alb`).

### Option A: Using `.tfvars` Files
```bash
cd infra

# Deploy Development Stack
terraform apply -var-file="dev.tfvars"

# Deploy Production Stack
terraform apply -var-file="prod.tfvars"
```

### Option B: Using Terraform Workspaces
```bash
cd infra

# Development
terraform workspace new dev
terraform apply -var="environment=dev" -var="domain_name=dev.ideategudy.tech"

# Production
terraform workspace new production
terraform apply -var="environment=production" -var="domain_name=ideategudy.tech"
```

---

## ⚡ Automated CI/CD Pipeline (`deploy.yml`)

The `.github/workflows/deploy.yml` workflow runs **two parallel jobs** upon pushing to `main`. For full step-by-step pipeline documentation, security architecture, and best practices, see [.github/workflows/README.md](file:///c:/Users/HP/Desktop/little-list/.github/workflows/README.md).

### 1. `deploy-frontend` Job:
- Builds React SPA in `client/`.
- Authenticates keylessly to AWS via OIDC.
- Syncs compiled files to private S3 bucket (`client/dist` -> `s3://$FRONTEND_BUCKET`).
- Invalidates CloudFront edge caches (`/*`).

### 2. `deploy-backend` Job:
- Authenticates keylessly to AWS via OIDC and logs into ECR.
- Builds & pushes Docker image (`server/`) to Amazon ECR.
- Syncs application secrets securely into AWS SSM Parameter Store (`/little-list/production/...`).
- Triggers zero-downtime container updates across EC2 ASG fleet via SSM `RunShellScript`.

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Provision AWS Infrastructure
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Ensure aws_region = "eu-north-1" (or your preferred region) in terraform.tfvars
# Fill in github_org, github_repo, and domain_name="ideategudy.tech"
terraform init
terraform plan
terraform apply
```

### Step 2: Configure GitHub Repository Variables & Secrets
Go to **GitHub Repo -> Settings -> Secrets and variables -> Actions**:

#### Repository Secrets:
- `MONGODB_URI`: MongoDB connection string
- `ACCESS_TOKEN_SECRET`: JWT access secret
- `REFRESH_TOKEN_SECRET`: JWT refresh secret

#### Repository Variables:
- `AWS_ROLE_ARN`: Output `github_actions_role_arn`
- `AWS_REGION`: `eu-north-1`
- `ECR_REPOSITORY`: Output `ecr_repository_name`
- `FRONTEND_BUCKET`: Output `frontend_bucket`
- `CLOUDFRONT_DISTRIBUTION_ID`: Output `cloudfront_distribution_id`
- `API_ASG_NAME`: Output `api_asg_name`
- `SSM_PREFIX`: Output `ssm_prefix`
- `CLIENT_URL`: `https://ideategudy.tech`
- `SERVER_URL`: `https://ideategudy.tech`

### Step 3: Trigger Deployment
Push changes to the `main` branch to kick off the automated CI/CD pipeline:
```bash
git add .
git commit -m "Deploy infrastructure & application"
git push origin main
```
