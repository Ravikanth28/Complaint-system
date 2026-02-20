# AWS Deployment Guide

To make this system functional, you must deploy the services to your AWS account.

## 1. Prerequisites
- AWS CLI installed and configured.
- Node.js & NPM installed.
- A Google Gemini API Key.

## 2. Infrastructure Setup
Use the [s3-buckets.json](./infrastructure/s3-buckets.json) to create your buckets:
```bash
aws s3 mb s3://complaint-system-raw-data
aws s3 mb s3://complaint-system-processed-data
aws s3 mb s3://complaint-system-analysis-results
```

## 3. Deploying Lambda Functions
For each function in `/functions`:
1. Navigate to the directory.
2. Run `npm install`.
3. Build the TypeScript to JavaScript.
4. Upload to AWS Lambda.
   - Set environment variables: `GEMINI_API_KEY`, `RAW_BUCKET_NAME`, etc.
   - Configure S3 Event Triggers as defined in the [implementation_plan.md](../../brain/962fcbf5-03ab-4a43-93b3-a9067eaf7e4f/implementation_plan.md).

## 4. Glue & Spark Setup
1. **Upload Script**: Upload [normalize-complaints.py](./glue/jobs/normalize-complaints.py) to a separate S3 bucket, e.g., `s3://your-artifacts-bucket/scripts/`.
2. **Create Crawler**:
   - Go to AWS Glue Console > Crawlers.
   - Create a crawler pointing to `s3://complaint-system-raw-data`.
   - Set output to a new database `complaint_db`.
3. **Create Job**:
   - Go to AWS Glue Console > ETL Jobs > Spark script editor.
   - Copy content of `normalize-complaints.py`.
   - Add Job Parameters: `--RAW_BUCKET` and `--PROCESSED_BUCKET`.

## 5. Connecting API Gateway
1. **Create API**: Go to API Gateway > Create REST API.
2. **Create Resource**: Create `/submit` resource.
3. **Create Method**: Add `POST` method.
   - Integration type: Lambda Function.
   - Lambda Function: `submit-complaint`.
4. **Deploy**: Actions > Deploy API. Create a stage (e.g., `prod`).
5. **CORS**: Enable CORS on the `/submit` resource to allow your frontend to call it.

## 6. S3 Event Triggers
1. **Raw to Glue**: Go to S3 `complaint-system-raw-data` > Properties > Event notifications.
   - Create notification for `All object create events`.
   - Destination: Lambda (you may need a small bridge lambda or use EventBridge) or trigger Glue directly via EventBridge.
2. **Processed to Analysis**: S3 `complaint-system-processed-data` > Properties > Event notifications.
   - Destination: `analysis-worker` Lambda.
3. **Structured to Triage**: S3 `complaint-system-analysis-results` > Properties > Event notifications.
   - Destination: `triage-agent` Lambda.
