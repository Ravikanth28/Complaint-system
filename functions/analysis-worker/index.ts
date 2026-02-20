import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIJson } from '../../shared/utils';

const s3 = new S3Client({});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const STRUCTURED_BUCKET = process.env.STRUCTURED_BUCKET_NAME || 'complaint-system-analysis-results-raka123';

export const handler = async (event: S3Event): Promise<void> => {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;

        const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const bodyContents = await response.Body?.transformToString();
        const complaint = JSON.parse(bodyContents || '{}');

        // GenAI Analysis
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze this complaint:
    Title: ${complaint.title}
    Description: ${complaint.description}
    
    Provide output in JSON:
    {
      "summary": "short summary",
      "category": "one of [IT Support, Accounts, Hostel, Academic, Transport, Maintenance]",
      "urgency": "LOW, MEDIUM, or HIGH",
      "entities": ["list of key entities"]
    }`;

        const result = await model.generateContent(prompt);
        const aiOutput = JSON.parse(result.response.text());

        const enrichedComplaint = {
            ...complaint,
            analysis: aiOutput,
            status: 'ANALYZED'
        };

        // Store in structured bucket
        await s3.send(new PutObjectCommand({
            Bucket: STRUCTURED_BUCKET,
            Key: `analyzed/${complaint.complaintId}.json`,
            Body: JSON.stringify(enrichedComplaint),
            ContentType: 'application/json'
        }));
    }
};
