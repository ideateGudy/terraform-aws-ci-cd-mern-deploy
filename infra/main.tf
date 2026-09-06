data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "alb" {
  name   = "${local.name}-alb"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 80  to_port = 80  protocol = "tcp" cidr_blocks = ["0.0.0.0/0"] }
  egress  { from_port = 0   to_port = 0   protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "api" {
  name   = "${local.name}-api"
  vpc_id = aws_vpc.main.id
  ingress { from_port = 3000 to_port = 3000 protocol = "tcp" security_groups = [aws_security_group.alb.id] }
  egress  { from_port = 0    to_port = 0    protocol = "-1"  cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_lb" "api" {
  name               = substr("${local.name}-alb", 0, 32)
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "api" {
  name     = substr("${local.name}-tg", 0, 32)
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id
  health_check { path = "/healthz" matcher = "200" }
}

resource "aws_lb_listener" "api" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"
  default_action { type = "forward" target_group_arn = aws_lb_target_group.api.arn }
}

resource "aws_ecr_repository" "api" {
  name                 = local.name
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
}

resource "aws_iam_role" "ec2" {
  name = "${local.name}-ec2"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy" "ec2_runtime" {
  role = aws_iam_role.ec2.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
    { Effect = "Allow", Action = ["ecr:BatchCheckLayerAvailability", "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage"], Resource = aws_ecr_repository.api.arn },
    { Effect = "Allow", Action = ["ssm:GetParameter", "ssm:GetParameters"], Resource = "arn:aws:ssm:${var.aws_region}:*:parameter${local.ssm_prefix}/*" }
  ] })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name}-ec2"
  role = aws_iam_role.ec2.name
}

resource "aws_launch_template" "api" {
  name_prefix   = "${local.name}-"
  image_id      = data.aws_ami.al2023.id
  instance_type = var.api_instance_type
  key_name      = var.ssh_key_name
  vpc_security_group_ids = [aws_security_group.api.id]
  iam_instance_profile { name = aws_iam_instance_profile.ec2.name }
  user_data = base64encode(templatefile("${path.module}/user_data.sh.tftpl", {
    project_name       = var.project_name
    aws_region         = var.aws_region
    ecr_repository_url = aws_ecr_repository.api.repository_url
    ssm_prefix         = local.ssm_prefix
  }))
  tag_specifications { resource_type = "instance" tags = { Name = local.name } }
}

resource "aws_autoscaling_group" "api" {
  name                = local.name
  min_size            = var.api_min_size
  max_size            = var.api_max_size
  desired_capacity    = var.api_desired_capacity
  vpc_zone_identifier = aws_subnet.public[*].id
  target_group_arns   = [aws_lb_target_group.api.arn]
  health_check_type   = "ELB"
  launch_template { id = aws_launch_template.api.id version = "$Latest" }
  tag { key = "Name" value = local.name propagate_at_launch = true }
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name}-${data.aws_caller_identity.current.account_id}"
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = local.name
  description                       = "CloudFront access to the private SPA bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = var.domain_name == "" ? [] : [var.domain_name]
  depends_on          = [aws_acm_certificate_validation.app]

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "s3-frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    domain_name = aws_lb.api.dns_name
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
    forwarded_values { query_string = true cookies { forward = "none" } }
  }

  dynamic "ordered_cache_behavior" {
    for_each = ["/api/*", "/s/*", "/healthz"]
    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = "alb-api"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods         = ["GET", "HEAD", "OPTIONS"]
      forwarded_values { query_string = true cookies { forward = "all" } }
      min_ttl     = 0
      default_ttl = 0
      max_ttl     = 0
    }
  }

  restrictions { geo_restriction { restriction_type = "none" } }
  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == ""
    acm_certificate_arn            = var.domain_name == "" ? null : aws_acm_certificate.app[0].arn
    ssl_support_method             = var.domain_name == "" ? null : "sni-only"
    minimum_protocol_version       = var.domain_name == "" ? null : "TLSv1.2_2021"
  }
  custom_error_response { error_code = 403 response_code = 200 response_page_path = "/index.html" }
  custom_error_response { error_code = 404 response_code = 200 response_page_path = "/index.html" }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "cloudfront.amazonaws.com" }, Action = "s3:GetObject", Resource = "${aws_s3_bucket.frontend.arn}/*", Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.app.arn } } }] })
}

resource "aws_acm_certificate" "app" {
  count             = var.domain_name == "" ? 0 : 1
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"
}

resource "aws_route53_record" "certificate" {
  count   = var.domain_name == "" || var.route53_zone_id == "" ? 0 : 1
  zone_id = var.route53_zone_id
  name    = tolist(aws_acm_certificate.app[0].domain_validation_options)[0].resource_record_name
  type    = tolist(aws_acm_certificate.app[0].domain_validation_options)[0].resource_record_type
  records = [tolist(aws_acm_certificate.app[0].domain_validation_options)[0].resource_record_value]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "app" {
  count                   = var.domain_name == "" || var.route53_zone_id == "" ? 0 : 1
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.app[0].arn
  validation_record_fqdns = [aws_route53_record.certificate[0].fqdn]
}

resource "aws_route53_record" "app" {
  count   = var.domain_name == "" || var.route53_zone_id == "" ? 0 : 1
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"
  alias { name = aws_cloudfront_distribution.app.domain_name zone_id = aws_cloudfront_distribution.app.hosted_zone_id evaluate_target_health = false }
}

locals {
  ssm_prefix = "/${var.project_name}/${var.environment}"
}
