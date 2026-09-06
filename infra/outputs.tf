output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

output "ecr_repository_name" {
  value = aws_ecr_repository.api.name
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.app.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.app.domain_name
}

output "api_asg_name" {
  value = aws_autoscaling_group.api.name
}

output "ssm_prefix" {
  value = local.ssm_prefix
}

output "github_actions_role_arn" {
  value = var.github_org != "" && var.github_repo != "" ? aws_iam_role.github_actions[0].arn : null
}
