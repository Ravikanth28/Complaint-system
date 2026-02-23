import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const RAW_BUCKET = process.env.RAW_BUCKET_NAME || 'complaint-system-raw-data-raka123';

const listHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: RAW_BUCKET,
            Prefix: 'complaints/',
        });

        const listResponse = await s3.send(listCommand);
        const contents = listResponse.Contents || [];

        const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

        // Fetch each complaint's content
        const complaints = await Promise.all(contents
            .filter(item => item.Key && item.Key.endsWith('.json'))
            .map(async (item) => {
                const complaintId = item.Key?.split('/').pop()?.replace('.json', '');

                try {
                    // Try getting analyzed version first
                    const getAnalyzed = new GetObjectCommand({
                        Bucket: STRUCTURED_BUCKET,
                        Key: `analyzed/${complaintId}.json`,
                    });
                    const analyzedResponse = await s3.send(getAnalyzed);
                    const body = await analyzedResponse.Body?.transformToString();
                    return body ? JSON.parse(body) : null;
                } catch (e) {
                    // Fallback to raw version
                    const getRaw = new GetObjectCommand({
                        Bucket: RAW_BUCKET,
                        Key: item.Key,
                    });
                    const rawResponse = await s3.send(getRaw);
                    const body = await rawResponse.Body?.transformToString();
                    return body ? { ...JSON.parse(body || '{}'), status: 'PENDING', urgency: 'MEDIUM' } : null;
                }
            }));

        const activeComplaints = complaints.filter(c => c !== null);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(activeComplaints)
        };
    } catch (error) {
        console.error('Error listing complaints:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};

export const handler = withAuth(listHandler, 'ADMIN');
