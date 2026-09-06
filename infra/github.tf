data "tls_certificate" "github" {
  count = var.github_org != "" && var.github_repo != "" ? 1 : 0
  url   = "https://token.actions.githubusercontent.com/.well-known/openid-configuration"
}

resource "aws_iam_openid_connect_provider" "github" {
  count           = var.github_org != "" && var.github_repo != "" ? 1 : 0
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.github[0].certificates[0].sha1_fingerprint]
}

resource "aws_iam_role" "github_actions" {
  count = var.github_org != "" && var.github_repo != "" ? 1 : 0
  name  = "${local.name}-github-actions"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Federated = aws_iam_openid_connect_provider.github[0].arn }, Action = "sts:AssumeRoleWithWebIdentity", Condition = { StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }, StringLike = { "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main" } } }] })
}

resource "aws_iam_role_policy" "github_actions" {
  count = var.github_org != "" && var.github_repo != "" ? 1 : 0
  role  = aws_iam_role.github_actions[0].id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Action = ["ecr:GetAuthorizationToken"], Resource = "*" },
    { Effect = "Allow", Action = ["ecr:BatchCheckLayerAvailability", "ecr:CompleteLayerUpload", "ecr:InitiateLayerUpload", "ecr:PutImage", "ecr:UploadLayerPart"], Resource = aws_ecr_repository.api.arn },
    { Effect = "Allow", Action = ["s3:ListBucket"], Resource = aws_s3_bucket.frontend.arn },
    { Effect = "Allow", Action = ["s3:DeleteObject", "s3:GetObject", "s3:PutObject"], Resource = "${aws_s3_bucket.frontend.arn}/*" },
    { Effect = "Allow", Action = ["cloudfront:CreateInvalidation"], Resource = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${aws_cloudfront_distribution.app.id}" },
    { Effect = "Allow", Action = ["ssm:PutParameter", "ssm:SendCommand", "ssm:GetCommandInvocation"], Resource = "*" },
    { Effect = "Allow", Action = ["autoscaling:DescribeAutoScalingGroups", "ec2:DescribeInstances", "ssm:DescribeInstanceInformation"], Resource = "*" }
  ] })
}
