output "github_actions_role_arn" {
  value       = local.enabled ? aws_iam_role.github_actions[0].arn : null
  description = "IAM Role ARN to be assumed by GitHub Actions"
}
