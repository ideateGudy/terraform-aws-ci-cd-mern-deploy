# GitHub Actions CI/CD Deployment Workflow (`deploy.yml`)

This directory contains the automated CI/CD pipeline definition for building and deploying the **Little List** application.

---

## ⚡ Overview & Workflow Architecture

The workflow (`deploy.yml`) is designed using **2026 GitHub Actions best practices**:

```
                              Push to 'main'
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
       [deploy-frontend Job]               [deploy-backend Job]
                  │                                   │
       1. Checkout repository              1. Checkout repository
       2. Setup Node.js 20                 2. OIDC Keyless Auth to AWS
       3. Build React SPA (client/dist)    3. Login to ECR
       4. OIDC Keyless Auth to AWS         4. Setup Docker Buildx + GHA Cache
       5. Sync dist/ to S3 bucket          5. Build & Push image (SHA + latest)
       6. Invalidate CloudFront CDN        6. Sync Secrets to SSM Parameter Store
                                           7. Send SSM RunCommand to EC2 ASG Fleet
                                           8. Wait & Verify SSM Execution Status
```

---

## 🔑 Key 2026 Best Practices Implemented

1. **Keyless AWS Authentication (OIDC)**:
   - Eliminates long-lived AWS Access Keys (`AWS_ACCESS_KEY_ID`).
   - Uses `aws-actions/configure-aws-credentials@v4` with OpenID Connect (OIDC) federated web identities.
2. **Minimal Least Privilege Scoping**:
   - Explicitly scopes workflow permissions: `id-token: write` (for OIDC token generation) and `contents: read`.
3. **Deployment Concurrency Control**:
   - Uses `concurrency` with `cancel-in-progress: true` scoped to `deploy-${{ github.ref }}` so outdated/redundant pushes are automatically cancelled, avoiding deployment race conditions.
4. **Docker Buildx & GitHub Actions Layer Caching**:
   - Uses `docker/setup-buildx-action@v3` and `docker/build-push-action@v6`.
   - Utilizes `cache-from: type=gha` and `cache-to: type=gha,mode=max` to cache Docker build layers directly in GitHub Actions, reducing build times from minutes to seconds.
5. **Active Deployment Status Verification**:
   - Uses `aws ssm wait command-executed` to poll the SSM execution status across all instances in the Auto Scaling Group (ASG).
   - If any instance fails to restart the container, the GitHub Actions job fails explicitly instead of giving a false positive success.

---

## 🛠️ Detailed Job Breakdown

### 1. `deploy-frontend` Job
- **Trigger**: Runs in parallel with `deploy-backend` upon push to `main` or manual trigger.
- **Environment Requirements**: `FRONTEND_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `AWS_ROLE_ARN`, `AWS_REGION`.
- **Steps**:
  1. `actions/checkout@v4`: Clones the source repository.
  2. `actions/setup-node@v4`: Initializes Node.js 20 with `npm` dependency caching based on `client/package-lock.json`.
  3. `Build frontend SPA`: Runs `npm ci` and `npm run build` in `client/`, outputting static files into `client/dist`.
  4. `Configure AWS credentials`: Assumes the IAM OIDC Role (`AWS_ROLE_ARN`).
  5. `Publish static assets to S3`: Synchronizes `client/dist` to `s3://$FRONTEND_BUCKET` using `--delete` to prune removed files.
  6. `Invalidate CloudFront CDN cache`: Issue a wildcard `/*` invalidation to CloudFront so edge locations immediately serve the new SPA version.

---

### 2. `deploy-backend` Job
- **Trigger**: Runs in parallel with `deploy-frontend`.
- **Environment Requirements**: `ECR_REPOSITORY`, `API_ASG_NAME`, `SSM_PREFIX`, `AWS_ROLE_ARN`, `AWS_REGION`, `secrets.MONGODB_URI`, `secrets.ACCESS_TOKEN_SECRET`, `secrets.REFRESH_TOKEN_SECRET`.
- **Steps**:
  1. `actions/checkout@v4`: Clones source code.
  2. `Configure AWS credentials`: Assumes IAM OIDC Role.
  3. `aws-actions/amazon-ecr-login@v2`: Obtains temporary Docker login credentials for ECR.
  4. `docker/setup-buildx-action@v3`: Configures Docker Buildx engine.
  5. `docker/build-push-action@v6`: Builds `server/Dockerfile` using GHA layer caching and pushes `:latest` and `:${GITHUB_SHA}` image tags to Amazon ECR.
  6. `Sync runtime secrets`: Writes runtime environment variables into AWS SSM Parameter Store (`/little-list/production/...`) as `SecureString` types.
  7. `Trigger & verify container update`:
     - Sends `AWS-RunShellScript` command via SSM to all instances tagged with `Name=$API_ASG_NAME`.
     - Calls `/usr/local/bin/little-list-run.sh` on EC2 instances to pull `:latest` image and restart the container.
     - Runs `aws ssm wait command-executed` to verify all EC2 instances successfully execute the script.

---

## 🔒 Required GitHub Secrets & Variables

### Repository Secrets:
| Name | Description |
|---|---|
| `MONGODB_URI` | Production MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | JWT Access Token signing key |
| `REFRESH_TOKEN_SECRET` | JWT Refresh Token signing key |

### Repository Variables:
| Name | Value Source | Example |
|---|---|---|
| `AWS_ROLE_ARN` | Terraform output `github_actions_role_arn` | `arn:aws:iam::123456789012:role/little-list-production-github-actions` |
| `AWS_REGION` | Infrastructure Region | `eu-north-1` |
| `ECR_REPOSITORY` | Terraform output `ecr_repository_name` | `little-list-production` |
| `FRONTEND_BUCKET` | Terraform output `frontend_bucket` | `little-list-production-123456789012` |
| `CLOUDFRONT_DISTRIBUTION_ID` | Terraform output `cloudfront_distribution_id` | `E1ABC2DEF3GHIJ` |
| `API_ASG_NAME` | Terraform output `api_asg_name` | `little-list-production` |
| `SSM_PREFIX` | Terraform output `ssm_prefix` | `/little-list/production` |
| `CLIENT_URL` | Application Public URL | `https://ideategudy.tech` |
| `SERVER_URL` | Application Public URL | `https://ideategudy.tech` |
