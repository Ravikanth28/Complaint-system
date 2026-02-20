import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const RAW_BUCKET = process.env.RAW_BUCKET_NAME || 'complaint-system-raw-data-raka123';

const submitHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const complaintId = uuidv4();
    const timestamp = new Date().toISOString();

    const complaint = {
      complaintId,
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      title: body.title,
      description: body.description,
      location: body.location,
      timestamp,
      status: 'RAW'
    };

    await s3.send(new PutObjectCommand({
      Bucket: RAW_BUCKET,
      Key: `complaints/${complaintId}.json`,
      Body: JSON.stringify(complaint),
      ContentType: 'application/json'
    }));

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Complaint submitted successfully',
        complaintId
      })
    };
  } catch (error) {
    console.error('Submission Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};

export const handler = withAuth(submitHandler, 'USER');
