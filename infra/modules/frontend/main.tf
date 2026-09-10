terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = "~> 6.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

locals {
  name           = "${var.project_name}-${var.environment}"
  has_domain     = var.domain_name != ""
  is_subdomain   = local.has_domain && length(split(".", var.domain_name)) > 2
  www_domain     = local.has_domain && !local.is_subdomain ? "www.${var.domain_name}" : ""
  domain_aliases = local.has_domain ? (local.is_subdomain ? [var.domain_name] : [var.domain_name, local.www_domain]) : []
}

# --- Optional Route 53 Hosted Zone ---
resource "aws_route53_zone" "primary" {
  count = local.has_domain && var.create_route53_zone ? 1 : 0
  name  = var.domain_name
}

locals {
  has_route53 = local.has_domain && (var.create_route53_zone || var.route53_zone_id != "")
  zone_id     = local.has_domain ? (var.create_route53_zone ? aws_route53_zone.primary[0].zone_id : var.route53_zone_id) : ""
}

# --- S3 Bucket for Static Frontend ---
resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name}-${var.account_id}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- CloudFront Origin Access Control (OAC) ---
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = local.name
  description                       = "CloudFront access to the private SPA bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --- CloudFront Distribution ---
resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = local.domain_aliases
  depends_on          = [aws_acm_certificate.app]

  # S3 SPA Origin
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  # ALB Backend Origin
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "alb-api"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    forwarded_values {
      query_string = true
      cookies { forward = "none" }
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = ["/api/*", "/s/*", "/healthz"]
    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = "alb-api"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods         = ["GET", "HEAD", "OPTIONS"]
      forwarded_values {
        query_string = true
        cookies { forward = "all" }
      }
      min_ttl     = 0
      default_ttl = 0
      max_ttl     = 0
    }
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = !local.has_domain
    acm_certificate_arn            = local.has_domain ? aws_acm_certificate.app[0].arn : null
    ssl_support_method             = local.has_domain ? "sni-only" : null
    minimum_protocol_version       = local.has_domain ? "TLSv1.2_2021" : null
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.app.arn
        }
      }
    }]
  })
}

# --- ACM SSL Certificate ---
resource "aws_acm_certificate" "app" {
  count                     = local.has_domain ? 1 : 0
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = local.www_domain != "" ? [local.www_domain] : []
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# --- Route 53 Validation Records (if Route 53 zone exists) ---
resource "aws_route53_record" "certificate_validation" {
  for_each = local.has_route53 ? {
    for dvo in aws_acm_certificate.app[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = local.zone_id
}

resource "aws_acm_certificate_validation" "app" {
  count                   = local.has_route53 ? 1 : 0
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.app[0].arn
  validation_record_fqdns = [for record in aws_route53_record.certificate_validation : record.fqdn]
}

# --- Route 53 Alias Records ---
resource "aws_route53_record" "apex" {
  count   = local.has_route53 ? 1 : 0
  zone_id = local.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.app.domain_name
    zone_id                = aws_cloudfront_distribution.app.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  count   = local.has_route53 && local.www_domain != "" ? 1 : 0
  zone_id = local.zone_id
  name    = local.www_domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.app.domain_name
    zone_id                = aws_cloudfront_distribution.app.hosted_zone_id
    evaluate_target_health = false
  }
}
