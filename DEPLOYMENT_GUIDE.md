# 🚀 Deployment Guide - Little List

This document provides step-by-step instructions for deploying the **Little List** full-stack application. It covers initial infrastructure provisioning with **Terraform**, configuring continuous integration & delivery with **GitHub Actions**, and manual execution/troubleshooting steps.

---

## 📋 Prerequisites

Ensure you have the following installed and configured before starting:

1. **AWS CLI** (v2+) authenticated with an active IAM user/role with administrator/provisioning permissions.
   ```bash
   aws sts get-caller-identity
   ```
2. **Terraform** (`>= 1.10.0`)
   ```bash
   terraform version
   ```
3. **Docker & Docker Buildx** (for local testing/building)
   ```bash
   docker --version
   ```
4. **Node.js 20+** & **npm**
   ```bash
   node -v
   ```
5. **Git** repository access with Admin/Settings permissions to set secrets & variables.

---

## 🏗️ Step 1: Infrastructure Provisioning (Terraform)

All infrastructure (VPC, Subnets, Security Groups, ALB, EC2 Auto Scaling Group, S3, CloudFront, ECR, IAM OIDC Roles, SSM Parameters) is managed via Terraform under the [`infra/`](file:///c:/Users/HP/Desktop/little-list/infra) directory.

### 1.1 Navigate to Infrastructure Directory
```bash
cd infra
```

### 1.2 Initialize Terraform
Initialize the provider plugins and backend state configuration:
```bash
terraform init
```

### 1.3 Configure Variables
Copy the example variable template and populate your environment-specific values:
```bash
cp terraform.tfvars.example terraform.tfvars
```
Key parameters to inspect and configure in `terraform.tfvars` (or `dev.tfvars`):
- `aws_region`: AWS target region (e.g., `eu-north-1` or `us-east-1`).
- `environment`: `dev`, `staging`, or `prod`.
- `github_org` / `github_repo`: Your GitHub username or organization and repository name for keyless OIDC authentication.
- `domain_name` (optional): Custom domain name for Route 53, ACM SSL certificates, and CloudFront (e.g. `dev.ideategudy.tech`).
- `create_route53_zone` (optional, default `true`): Automatically creates a Route 53 DNS Hosted Zone for `domain_name`.
- `route53_zone_id` (optional, default `""`): Only needed if `create_route53_zone = false` and you wish to use an existing pre-created Route 53 zone.
- `ssh_key_name` (optional, default `null`): Key pair for traditional SSH port 22 access. Not required as AWS SSM Session Manager provides secure keyless shell access by default.

### 1.4 Plan & Review
Verify the infrastructure resources to be created:
```bash
terraform plan -var-file="terraform.tfvars"
```

### 1.5 Apply Infrastructure Setup
Provision the AWS infrastructure:
```bash
terraform apply -var-file="terraform.tfvars" -auto-approve
```

### 1.6 Note Outputs
Upon successful application, record the output values provided by Terraform (or run `terraform output`):
- `aws_role_arn` (GitHub Actions OIDC IAM Role)
- `frontend_bucket_name`
- `cloudfront_distribution_id`
- `ecr_repository_url`
- `ecr_repository_name`
- `api_asg_name`
- `ssm_parameter_prefix`
- `alb_dns_name` / `api_custom_domain`

---

## 🔑 Step 2: Configure GitHub Actions CI/CD Secrets & Variables

The deployment pipeline defined in [`.github/workflows/deploy.yml`](file:///c:/Users/HP/Desktop/little-list/.github/workflows/deploy.yml) uses GitHub OIDC (keyless AWS authentication).

Go to your repository on GitHub: **Settings** -> **Secrets and variables** -> **Actions**.

### 2.1 Repository Variables (**Variables** tab)

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `AWS_REGION` | AWS region deployment target | `eu-north-1` |
| `AWS_ROLE_ARN` | IAM Role ARN provisioned by Terraform | `arn:aws:iam::123456789012:role/little-list-github-actions-role` |
| `FRONTEND_BUCKET` | S3 bucket name for SPA static hosting | `little-list-frontend-prod-12345` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront Distribution ID | `E1A2B3C4D5E6F7` |
| `ECR_REPOSITORY` | ECR repository name | `little-list-api` |
| `API_ASG_NAME` | Name of the EC2 Auto Scaling Group | `little-list-api-asg` |
| `SSM_PREFIX` | Prefix path for AWS SSM Parameter Store | `/little-list/prod` |
| `CLIENT_URL` | Frontend public URL for CORS validation | `https://dev.ideategudy.tech` (or `https://d1234.cloudfront.net`) |
| `SERVER_URL` | Backend URL for Shortener Base URL | `https://dev.ideategudy.tech` (or `https://d1234.cloudfront.net`) |

### 2.2 Repository Secrets (**Secrets** tab)

| Secret Name | Description | Note |
| :--- | :--- | :--- |
| `MONGODB_URI` | Production MongoDB connection string | e.g. MongoDB Atlas Connection URI |
| `ACCESS_TOKEN_SECRET` | Secret key for JWT Access Token verification | Random string (32+ chars) |
| `REFRESH_TOKEN_SECRET` | Secret key for JWT Refresh Token verification | Random string (32+ chars) |

---

## ⚡ Step 3: Triggering Automated Deployment

The CI/CD workflow runs automatically on every push to `main` branch or can be run manually.

### Automated Trigger (Git Push)
```bash
git add .
git commit -m "feat: deployment setup complete"
git push origin main
```

### Manual Trigger (GitHub UI)
1. Go to the **Actions** tab in your GitHub repository.
2. Select the **Deploy** workflow.
3. Click **Run workflow** -> Select `main` -> Click **Run workflow**.

---

## 🔍 Step 4: Pipeline Execution Summary

The pipeline executes two parallel/sequential stages:

### Stage A: Frontend Deployment (`deploy-frontend`)
1. Installs Node.js dependencies and executes `npm run build` inside [`client/`](file:///c:/Users/HP/Desktop/little-list/client).
2. Authenticates to AWS using keyless OIDC credentials.
3. Syncs static dist files to S3 bucket (`aws s3 sync client/dist s3://$FRONTEND_BUCKET --delete`).
4. Invalidates CloudFront edge caches (`aws cloudfront create-invalidation`).

### Stage B: Backend Deployment (`deploy-backend`)
1. Authenticates to Amazon ECR.
2. Builds the multi-stage Docker container image defined in [`server/Dockerfile`](file:///c:/Users/HP/Desktop/little-list/server/Dockerfile).
3. Pushes tagged docker images (`latest` & `$GITHUB_SHA`) to ECR repository.
4. Updates runtime secrets (`MONGODB_URI`, `ACCESS_TOKEN_SECRET`, etc.) in AWS SSM Parameter Store as `SecureString` types.
5. Invokes AWS Systems Manager (SSM) Run Command to trigger image pull & container restart script across all active EC2 instances in the Auto Scaling Group.

---

## 🛠️ Step 5: Verification & Health Checks

### 1. Backend API Health Check
Test the CloudFront or ALB health endpoint:
```bash
curl -i https://dev.ideategudy.tech/healthz
```
*Expected response:* `HTTP/1.1 200 OK` with `{"status":"ok"}`.

### 2. Testing API Subpaths vs Root API
- **Valid API Subpath**: `https://dev.ideategudy.tech/api/auth/profile` -> returns `401 Unauthorized` / API JSON response.
- **Bare GET `/api` or `/api/`**: Plain GET to root `/api` returns 404 / React SPA fallback because API routes are defined on specific subpaths (`/api/auth/*`, `/api/diary/*`, `/api/shortener/*`).

### 3. Frontend Accessibility Check
Navigate to your domain in the browser:
```bash
https://dev.ideategudy.tech
```

### 3. Verify Container Deployment via AWS SSM
To inspect SSM deployment logs on instances manually:
```bash
aws ssm list-command-invocations --details --region eu-north-1
```

---

## 🧹 Tear Down / Cleanup

To decommission all AWS cloud resources created by Terraform and avoid ongoing costs:

```bash
cd infra
terraform destroy -var-file="terraform.tfvars"
```
*Note: Make sure S3 bucket contents are emptied if bucket removal is blocked.*
