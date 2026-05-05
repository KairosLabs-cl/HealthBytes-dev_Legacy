# Staging Deployment — Setup Guide

This document describes the GitHub secrets and AWS resources needed to enable
automatic staging deployment via `.github/workflows/deploy.yml`.

## Required GitHub Repository Secrets

Set these in **Settings → Secrets and variables → Actions**:

| Secret | Description | Example |
|--------|-------------|---------|
| `STAGING_DATABASE_URL` | PostgreSQL connection string for staging DB | `postgresql://user:pass@host:5432/healthbytes_staging` |
| `STAGING_BACKEND_TASK_DEFINITION` | ECS task definition JSON (see below) | *(JSON string)* |
| `STAGING_ECS_CLUSTER` | Name of the ECS cluster for staging | `healthbytes-staging` |
| `STAGING_ECS_SERVICE` | Name of the ECS service for staging | `healthbytes-backend-staging` |
| `STAGING_URL` | Base URL of the staging backend (used for smoke tests) | `https://api-staging.healthbytes.cl` |
| `EXPO_TOKEN` | Expo/EAS access token for automated builds | *(from expo.dev → Account Settings → Access Tokens)* |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Google Play service account key (JSON) | *(from Google Play Console)* |
| `AWS_ACCESS_KEY_ID` | AWS credentials for ECR push + ECS deploy | *(IAM user with ECS + ECR permissions)* |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | *(IAM user secret)* |

## Creating the Staging ECS Task Definition

1. Copy `infra/ecs-task-definition-staging.json`
2. Replace `ACCOUNT_ID` with your AWS account ID:
   ```bash
   sed 's/ACCOUNT_ID/123456789012/g' infra/ecs-task-definition-staging.json > /tmp/staging-taskdef.json
   ```
3. Register it in AWS:
   ```bash
   aws ecs register-task-definition --cli-input-json file:///tmp/staging-taskdef.json --region us-east-1
   ```
4. Store the resulting JSON as the `STAGING_BACKEND_TASK_DEFINITION` GitHub secret:
   ```bash
   aws ecs describe-task-definition --task-definition healthbytes-backend-staging --region us-east-1 \
     --query taskDefinition | pbcopy
   ```

## Creating Staging SSM Secrets

```bash
# Populate staging secrets in SSM Parameter Store
aws ssm put-parameter --name "/healthbytes/staging/DATABASE_URL" --value "postgresql://..." --type SecureString --region us-east-1
aws ssm put-parameter --name "/healthbytes/staging/JWT_SECRET" --value "staging-secret-key" --type SecureString --region us-east-1
aws ssm put-parameter --name "/healthbytes/staging/CLERK_PUBLISHABLE_KEY" --value "pk_test_..." --type SecureString --region us-east-1
aws ssm put-parameter --name "/healthbytes/staging/CLERK_SECRET_KEY" --value "sk_test_..." --type SecureString --region us-east-1
aws ssm put-parameter --name "/healthbytes/staging/ENVIRONMENT" --value "staging" --type String --region us-east-1
```

## Triggering Staging Deploy

Staging deploys automatically on every push to `main` via `deploy.yml`.

Manual trigger:
```bash
gh workflow run deploy.yml -f environment=staging
```

## Smoke Test Verification

After deploy, `backend/scripts/smoke_tests.py` runs against `STAGING_URL`.
If smoke tests fail, the workflow fails and the staging service rolls back.

Ensure `backend/scripts/smoke_tests.py` exists and tests at minimum:
- `GET /health` → 200
- `GET /products` → 200
