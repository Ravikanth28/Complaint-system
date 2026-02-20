import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({ region: 'us-east-1' });
const RAW_BUCKET = process.env.RAW_BUCKET_NAME || 'complaint-system-raw-data-raka123';

export const handler = async (event: any): Promise<any> => {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const complaintId = uuidv4();
    const timestamp = new Date().toISOString();

    const complaintData = {
      complaintId,
      ...body,
      timestamp,
      status: 'RAW'
    };

    await s3.send(new PutObjectCommand({
      Bucket: RAW_BUCKET,
      Key: `complaints/${complaintId}.json`,
      Body: JSON.stringify(complaintData),
      ContentType: 'application/json'
    }));

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'Complaint submitted successfully',
        complaintId
      })
    };
  } catch (error) {
    console.error('Error submitting complaint:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};
