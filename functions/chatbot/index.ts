import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withAuth, AuthUser } from '../shared/auth';
import { classifyComplaint, classifyUrgency } from '../shared/classifier';

const s3 = new S3Client({ region: 'us-east-1' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

const chatHandler = async (event: APIGatewayProxyEvent, user: AuthUser): Promise<APIGatewayProxyResult> => {
    try {
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
                // Continue without context if it fails
            }
        }

        // Check if this is a Triage request (from the form)
        const isTriageRequest = query.toLowerCase().includes('analyze this for triage') || query.toLowerCase().includes('return only a json object');

        let localCategory = "";
        let localUrgency = "";

        if (isTriageRequest) {
            // Extract the description from the query if possible, or use full query
            const descMatch = query.match(/Description: ([\s\S]*)/i);
            const textToAnalyze = descMatch ? descMatch[1] : query;
            localCategory = classifyComplaint(textToAnalyze);
            localUrgency = classifyUrgency(textToAnalyze);
            console.log(`Chatbot Local Triage - Category: ${localCategory}, Urgency: ${localUrgency}`);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `You are an Intelligent Assistant/Triage Bot for the Indian Complaint System.
    Context Data (Current Case): ${context || "No specific case selected."}
    User Query: ${query}
    Authenticated User: ${user.name} (${user.role})
    ${localCategory ? `Local Prediction: Category ${localCategory}, Urgency ${localUrgency}` : ''}
    
    If the user asks for triage analysis, provide a JSON response exactly in this format:
    {"category": "${localCategory || '...'} ", "urgency": "${localUrgency || '...'} ", "summary": "..."}
    
    Otherwise, provide helpful insights, response drafts, or escalate as needed. Be concise but professional. Use Indian context where applicable.`;

        console.log('Invoking Gemini...');
        const result = await model.generateContent(prompt);
        const reply = result.response.text();
        console.log('Gemini response received');

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply })
        };
    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};

export const handler = withAuth(chatHandler, 'USER');
