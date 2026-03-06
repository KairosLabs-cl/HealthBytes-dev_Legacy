#!/usr/bin/env bash
# Creates the ECR repository for the backend image.
# Usage: AWS_REGION=us-east-1 ./ecr-setup.sh
set -euo pipefail
AWS_REGION="${AWS_REGION:-us-east-1}"
REPO_NAME="healthbytes-backend"

echo "=== ECR Setup for HealthBytes ==="
echo "Region: $AWS_REGION"
echo "Repository: $REPO_NAME"
echo ""

# Check if repository already exists
if aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$AWS_REGION" 2>/dev/null; then
    echo "Repository already exists: $REPO_NAME"
else
    echo "Creating repository..."
    aws ecr create-repository \
      --repository-name "$REPO_NAME" \
      --region "$AWS_REGION" \
      --image-scanning-configuration scanOnPush=true \
      --encryption-configuration encryptionType=AES256
    echo "Repository created."
fi

URI=$(aws ecr describe-repositories \
  --repository-names "$REPO_NAME" \
  --region "$AWS_REGION" \
  --query 'repositories[0].repositoryUri' \
  --output text)

echo ""
echo "=== Repository Ready ==="
echo "URI: $URI"
echo ""
echo "To build and push the image:"
echo "  docker build -t $URI:latest ./backend"
echo "  docker push $URI:latest"
