import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';

const s3 = new S3Client({});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { query, complaintId } = JSON.parse(event.body || '{}');

        let context = "";
        if (complaintId) {
            const response = await s3.send(new GetObjectCommand({
                Bucket: STRUCTURED_BUCKET,
                Key: `analyzed/${complaintId}.json`
            }));
            context = await response.Body?.transformToString() || "";
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are an Admin Assistant for the Complaint System.
    Context Data: ${context}
    User Query: ${query}
    
    Provide insights, response drafts, or escalate as needed.`;

        const result = await model.generateContent(prompt);
        const answer = result.response.text();

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ answer })
        };
    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
