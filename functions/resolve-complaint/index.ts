import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';
const PROOF_BUCKET = process.env.PROOF_BUCKET_NAME || 'complaint-system-resolution-proofs-raka123';

const resolveComplaintHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
        if (user.role !== 'DEPARTMENT' || !user.department) {
            return {
                statusCode: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Forbidden: Department access required' })
            };
        }

        const body = JSON.parse(event.body || '{}');
        const { complaintId, proofData, fileName } = body;

        if (!complaintId || !proofData) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'ComplaintId and proofData are required' })
            };
        }

        console.log(`Resolving complaint ${complaintId} by department ${user.department}`);

        // 1. Fetch current complaint data
        let complaint;
        try {
            const getObj = new GetObjectCommand({
                Bucket: STRUCTURED_BUCKET,
                Key: `analyzed/${complaintId}.json`,
            });
            const response = await s3.send(getObj);
            const content = await response.Body?.transformToString();
            complaint = JSON.parse(content || '{}');
        } catch (e: any) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Complaint not found' })
            };
        }

        // 2. Upload proof to S3
        const proofBuffer = Buffer.from(proofData.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        const proofKey = `proofs/${complaintId}_${fileName || 'resolution.jpg'}`;

        await s3.send(new PutObjectCommand({
            Bucket: PROOF_BUCKET,
            Key: proofKey,
            Body: proofBuffer,
            ContentType: 'image/jpeg' // Assuming JPEG for simplicity, could be dynamic
        }));

        const proofUrl = `https://${PROOF_BUCKET}.s3.us-east-1.amazonaws.com/${proofKey}`;

        // 3. Update complaint status
        const updatedComplaint = {
            ...complaint,
            status: 'RESOLVED',
            resolvedBy: user.name,
            resolutionDept: user.department,
            resolutionTimestamp: new Date().toISOString(),
            proofUrl: proofUrl
        };

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
            body: JSON.stringify({ message: 'Complaint marked as RESOLVED', proofUrl })
        };
    } catch (error: any) {
        console.error('Error resolving complaint:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
        };
    }
};

export const handler = withAuth(resolveComplaintHandler, 'DEPARTMENT');
