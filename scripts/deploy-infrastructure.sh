#!/bin/bash
# Script to create S3 buckets and configure them for the Complaint System

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

REGION=${AWS_REGION:-us-east-1}
RAW=${RAW_BUCKET_NAME:-complaint-system-raw-data}
PROCESSED=${PROCESSED_BUCKET_NAME:-complaint-system-processed-data}
STRUCTURED=${STRUCTURED_BUCKET_NAME:-complaint-system-analysis-results}

echo "🚀 Creating S3 Buckets in $REGION..."

create_bucket() {
  local name=$1
  if aws s3api head-bucket --bucket "$name" 2>/dev/null; then
    echo "✅ Bucket $name already exists."
  else
    echo "📦 Creating $name..."
    aws s3 mb "s3://$name" --region "$REGION"
  fi
}

create_bucket "$RAW"
create_bucket "$PROCESSED"
create_bucket "$STRUCTURED"

echo "✨ All buckets ready."
