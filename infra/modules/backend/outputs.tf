output "ecr_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "URL of the ECR repository"
}

output "ecr_repository_name" {
  value       = aws_ecr_repository.api.name
  description = "Name of the ECR repository"
}

output "ecr_repository_arn" {
  value       = aws_ecr_repository.api.arn
  description = "ARN of the ECR repository"
}

output "alb_dns_name" {
  value       = aws_lb.api.dns_name
  description = "DNS name of the ALB"
}

output "asg_name" {
  value       = aws_autoscaling_group.api.name
  description = "Name of the Auto Scaling Group"
}
