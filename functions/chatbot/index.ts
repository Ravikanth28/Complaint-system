import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAuth, AuthUser } from '../shared/auth';

const s3 = new S3Client({ region: 'us-east-1' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

const chatHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
        console.log('Chatbot handler started');
        const body = JSON.parse(event.body || '{}');
        const { query, complaintId } = body;
        console.log(`Chatbot request from ${user.name} (${user.role}): query="${query}", id="${complaintId}"`);

        if (!query) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Query is required' })
            };
        }

        let context = "";
        if (complaintId) {
            try {
                console.log(`Fetching context for complaint: ${complaintId}`);
                const response = await s3.send(new GetObjectCommand({
                    Bucket: STRUCTURED_BUCKET,
                    Key: `analyzed/${complaintId}.json`
                }));
                context = await response.Body?.transformToString() || "";
                console.log('Context retrieved successfully');
            } catch (s3Error: any) {
                console.warn(`Could not fetch context for ${complaintId}: ${s3Error.message}`);
            }
        }

        console.log('Configuring Gemini model...');

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `You are an Intelligent Assistant/Triage Bot for the Indian Complaint System.
    Context Data (Current Case): ${context || "No specific case selected."}
    User Query: ${query}
    Authenticated User: ${user.name} (${user.role})
    
    If the user asks for triage analysis, provide a JSON response as requested. 
    Otherwise, provide helpful insights, response drafts, or escalate as needed. Be concise but professional. Use Indian context where applicable.`;

        console.log('Invoking Gemini API...');
        try {
            const result = await model.generateContent(prompt);
            const reply = result.response.text();
            console.log('Gemini raw response:', reply);

            // If it looks like a triage request, try to parse it
            let structuredResponse: any = { reply };
            if (query.toLowerCase().includes('json') || query.toLowerCase().includes('triage')) {
                const jsonMatch = reply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        structuredResponse = { ...structuredResponse, ...parsed };
                        console.log('Parsed triage data from AI:', parsed);
                    } catch (e) {
                        console.warn('AI returned text that looked like JSON but was unparsable:', e);
                    }
                }
            }

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(structuredResponse)
            };
        } catch (geminiError: any) {
            console.error('Gemini API Error:', geminiError);
            throw geminiError;
        }
    } catch (error: any) {
        console.error('CRITICAL Chatbot error:', error);
        console.error('Error Stack:', error.stack);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: 'Internal Server Error',
                error: error.message,
                stack: error.stack
            })
        };
    }
};

export const handler = withAuth(chatHandler, 'USER');
