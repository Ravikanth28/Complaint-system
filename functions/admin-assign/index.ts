import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

const adminAssignHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
        if (user.role !== 'ADMIN') {
            return {
                statusCode: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Forbidden: Admin access required' })
            };
        }

        const { complaintId, category } = JSON.parse(event.body || '{}');

        if (!complaintId || !category) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'ComplaintId and category are required' })
            };
        }

        console.log(`Admin re-assigning complaint ${complaintId} to department ${category}`);

        // 1. Fetch current complaint data
        const getObj = new GetObjectCommand({
            Bucket: STRUCTURED_BUCKET,
            Key: `analyzed/${complaintId}.json`,
        });
        const response = await s3.send(getObj);
        const content = await response.Body?.transformToString();
        const complaint = JSON.parse(content || '{}');

        // 2. Update category (Department)
        const updatedComplaint = {
            ...complaint,
            category: category,
            assignedBy: user.name,
            assignmentTimestamp: new Date().toISOString()
        };

        // 3. Save back to S3
        await s3.send(new PutObjectCommand({
            Bucket: STRUCTURED_BUCKET,
            Key: `analyzed/${complaintId}.json`,
            Body: JSON.stringify(updatedComplaint),
            ContentType: 'application/json'
        }));

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Complaint successfully re-assigned', category })
        };
    } catch (error: any) {
        console.error('Error re-assigning complaint:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};

export const handler = withAuth(adminAssignHandler, 'ADMIN');
