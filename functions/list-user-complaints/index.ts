import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const RAW_BUCKET = process.env.RAW_BUCKET_NAME || 'complaint-system-raw-data-raka123';
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

const listUserComplaintsHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
        console.log(`Listing complaints for user: ${user.userId}`);

        // List all raw complaints (they contain the metadata)
        const listCommand = new ListObjectsV2Command({
            Bucket: RAW_BUCKET,
            Prefix: 'complaints/',
        });

        const listResponse = await s3.send(listCommand);
        const contents = listResponse.Contents || [];

        // Fetch and filter by userId
        const complaints = await Promise.all(contents
            .filter(item => item.Key && item.Key.endsWith('.json'))
            .map(async (item) => {
                const complaintId = item.Key?.split('/').pop()?.replace('.json', '');

                try {
                    // Try getting analyzed version first to get full details
                    const getAnalyzed = new GetObjectCommand({
                        Bucket: STRUCTURED_BUCKET,
                        Key: `analyzed/${complaintId}.json`,
                    });
                    const analyzedResponse = await s3.send(getAnalyzed);
                    const body = await analyzedResponse.Body?.transformToString();
                    const data = body ? JSON.parse(body) : null;

                    // Filter by authenticated user's ID
                    if (data && data.userId === user.userId) {
                        return data;
                    }
                    return null;
                } catch (e) {
                    // Fallback to raw version and check userId
                    const getRaw = new GetObjectCommand({
                        Bucket: RAW_BUCKET,
                        Key: item.Key,
                    });
                    const rawResponse = await s3.send(getRaw);
                    const body = await rawResponse.Body?.transformToString();
                    const data = body ? JSON.parse(body) : null;

                    if (data && data.userId === user.userId) {
                        return { ...data, status: data.status || 'PENDING', urgency: data.urgency || 'MEDIUM' };
                    }
                    return null;
                }
            }));

        const userComplaints = complaints.filter(c => c !== null);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userComplaints)
        };
    } catch (error: any) {
        console.error('Error listing user complaints:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};

export const handler = withAuth(listUserComplaintsHandler);
