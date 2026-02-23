import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

const listDeptComplaintsHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
        if (user.role !== 'DEPARTMENT' || !user.department) {
            return {
                statusCode: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Forbidden: Department access required' })
            };
        }

        console.log(`Listing complaints for department: ${user.department}`);

        const listCommand = new ListObjectsV2Command({
            Bucket: STRUCTURED_BUCKET,
            Prefix: 'analyzed/',
        });

        const listResponse = await s3.send(listCommand);
        const contents = listResponse.Contents || [];

        const complaints = await Promise.all(contents
            .filter(item => item.Key && item.Key.endsWith('.json'))
            .map(async (item) => {
                try {
                    const getObj = new GetObjectCommand({
                        Bucket: STRUCTURED_BUCKET,
                        Key: item.Key,
                    });
                    const response = await s3.send(getObj);
                    const body = await response.Body?.transformToString();
                    const data = body ? JSON.parse(body) : null;

                    // Filter by department (case-insensitive)
                    if (data && data.category && user.department &&
                        data.category.toLowerCase() === user.department.toLowerCase()) {
                        return data;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            }));

        const departmentComplaints = complaints.filter(c => c !== null);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(departmentComplaints)
        };
    } catch (error: any) {
        console.error('Error listing department complaints:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};

export const handler = withAuth(listDeptComplaintsHandler, 'DEPARTMENT');
