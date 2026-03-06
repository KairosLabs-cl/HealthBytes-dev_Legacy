#!/usr/bin/env bash
# Populates AWS SSM Parameter Store with all production secrets.
# Usage: AWS_REGION=us-east-1 ./secrets-setup.sh
# Prompts for each secret interactively — never hardcodes values.
set -euo pipefail
REGION="${AWS_REGION:-us-east-1}"
PREFIX="/healthbytes/prod"

put_secret() {
  local name="$1"
  local description="$2"
  read -r -s -p "Enter value for $name ($description): " value
  echo ""
  if [ -z "$value" ]; then
    echo "  SKIP $PREFIX/$name (empty value)"
    return
  fi
  VERSION=$(aws ssm put-parameter \
    --name "$PREFIX/$name" \
    --value "$value" \
    --type "SecureString" \
    --overwrite \
    --region "$REGION" \
    --description "$description" \
    --output text --query "Version")
  echo "  OK   $PREFIX/$name (version $VERSION)"
}

echo "=== HealthBytes Production Secrets Setup ==="
echo "Region: $REGION | Prefix: $PREFIX"
echo ""

put_secret "***REDACTED_DATABASE_URL***
put_secret "JWT_SECRET"                  "JWT signing secret — min 32 characters"
put_secret "CLERK_PUBLISHABLE_KEY"       "Clerk prod publishable key (pk_live_...)"
put_secret "***REDACTED_CLERK_SECRET_KEY***
put_secret "***REDACTED_MERCADOPAGO_TOKEN***
put_secret "MERCADO_PAGO_WEBHOOK_SECRET" "Mercado Pago webhook HMAC secret"
put_secret "***REDACTED_RESEND_KEY***
put_secret "EMAIL_FROM_ADDRESS"          "From address e.g. HealthBytes <no-reply@healthbytes.cl>"
put_secret "BACKEND_URL"                 "Backend URL e.g. https://api.healthbytes.cl (no trailing slash)"
put_secret "FRONTEND_URL"               "Frontend URL e.g. https://healthbytes.cl (no trailing slash)"
put_secret "ENVIRONMENT"                 "Must be exactly: production"
put_secret "SENTRY_DSN"                  "Sentry DSN for error tracking"

echo ""
echo "=== All secrets stored. Verify with: ==="
echo "aws ssm get-parameters-by-path --path $PREFIX --with-decryption --region $REGION --query 'Parameters[*].Name'"
