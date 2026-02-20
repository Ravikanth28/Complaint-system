import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIJson } from '../../shared/utils';

const s3 = new S3Client({});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const handler = async (event: S3Event): Promise<void> => {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;

        const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const bodyContents = await response.Body?.transformToString();
        const complaint = JSON.parse(bodyContents || '{}');

        // Semantic Triage Reasoning
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `Act as a Semantic Triage Agent. Based on the complaint and its initial analysis, determine the best department.
    
    Complaint: ${complaint.description}
    Initial Category: ${complaint.analysis.category}
    Initial Urgency: ${complaint.analysis.urgency}
    
    Available Departments: IT Support, Accounts, Hostel Office, Academic Office, Transport Office, Maintenance.
    
    Provide reasoning and a confidence score.
    Output JSON:
    {
      "department": "Department Name",
      "reasoning": "Explain why based on hidden intent",
      "confidence": 0.95
    }`;

        const result = await model.generateContent(prompt);
        const triageResult = parseAIJson(result.response.text());

        const triagedComplaint = {
            ...complaint,
            triage: triageResult,
            status: 'TRIAGED'
        };

        // Update complaint record in S3
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: JSON.stringify(triagedComplaint),
            ContentType: 'application/json'
        }));
    }
};
