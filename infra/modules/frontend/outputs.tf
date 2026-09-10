output "frontend_bucket" {
  value       = aws_s3_bucket.frontend.bucket
  description = "Name of the S3 bucket storing frontend static build"
}

output "frontend_bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "ARN of the S3 bucket storing frontend static build"
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.app.id
  description = "ID of the CloudFront distribution"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.app.domain_name
  description = "Domain name of the CloudFront distribution"
}

output "route53_nameservers" {
  value       = local.has_domain && var.create_route53_zone ? aws_route53_zone.primary[0].name_servers : []
  description = "List of Route 53 Nameservers to set in Namecheap Custom DNS"
}

output "acm_validation_records" {
  value = local.has_domain ? [
    for dvo in aws_acm_certificate.app[0].domain_validation_options : {
      domain_name = dvo.domain_name
      cname_name  = dvo.resource_record_name
      cname_value = dvo.resource_record_value
    }
  ] : []
  description = "CNAME records for ACM DNS validation to add to your DNS provider (if managing DNS outside Route 53)"
}
