import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });
const RAW_BUCKET = process.env.RAW_BUCKET_NAME || 'complaint-system-raw-data-raka123';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const listCommand = new ListObjectsV2Command({
            Bucket: RAW_BUCKET,
            Prefix: 'complaints/',
        });

        const listResponse = await s3.send(listCommand);
        const contents = listResponse.Contents || [];

        // Fetch each complaint's content
        const complaints = await Promise.all(contents
            .filter(item => item.Key && item.Key.endsWith('.json'))
            .map(async (item) => {
                const getCommand = new GetObjectCommand({
                    Bucket: RAW_BUCKET,
                    Key: item.Key,
                });
                const getResponse = await s3.send(getCommand);
                const body = await getResponse.Body?.transformToString();
                return body ? JSON.parse(body) : null;
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
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
