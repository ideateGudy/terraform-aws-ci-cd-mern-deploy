# AWS deployment

This stack provisions the deployment platform, not MongoDB. MongoDB remains an external service and is supplied to EC2 through SSM Parameter Store.

## Architecture

- S3 stores the Vite SPA build.
- CloudFront serves S3 and forwards `/api/*`, `/s/*`, and `/healthz` to the ALB. Browser routes such as `/shortener` stay on the SPA.
- A public ALB routes to an EC2 Auto Scaling Group running the Express Docker image from ECR.
- EC2 reads runtime secrets from SSM Parameter Store.
- Route 53 and ACM are created only when `domain_name` and `route53_zone_id` are provided.
- GitHub Actions uses OIDC; no long-lived AWS access keys are required.

## Bootstrap

1. Copy `terraform.tfvars.example` to `terraform.tfvars` and set the AWS region, project, and GitHub repository.
2. Run `terraform init`, `terraform plan`, and `terraform apply` from this directory.
3. Add the Terraform `github_actions_role_arn` as the GitHub variable `AWS_ROLE_ARN`.
4. Add these GitHub secrets: `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.
5. Add these GitHub variables: `CLIENT_URL`, `PUBLIC_URL`, `ECR_REPOSITORY`, `FRONTEND_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `API_ASG_NAME`, and `SSM_PREFIX`.
   - Use the CloudFront output while testing.
   - Use the Route 53 hostname after setting a custom domain.
   - Set `ECR_REPOSITORY` to the `ecr_repository_name` output, not the full URL.
   - Copy the other values from `terraform output`.
6. Run the `Deploy` workflow.

The workflow writes the secrets to SecureString parameters, builds and pushes the API image, deploys the SPA to S3, invalidates CloudFront, and restarts the API on every ASG instance through SSM.
