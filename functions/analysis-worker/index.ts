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
        try {
            const modelIdentifier = "gemini-2.5-flash";
            const model = genAI.getGenerativeModel({ model: modelIdentifier });
            const prompt = `Analyze this complaint:
        Title: ${complaint.title}
        Description: ${complaint.description}
        
        Provide output in JSON:
        {
          "summary": "short summary",
          "category": "one of [IT Support, Accounts, Hostel, Academic, Transport, Maintenance]",
          "urgency": "LOW, MEDIUM, HIGH, or CRITICAL (Use CRITICAL for immediate life-safety, fire, or severe infrastructure failure)",
          "entities": ["list of key entities"]
        }`;

            console.log(`Invoking Gemini for complaint: ${complaint.complaintId}`);
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            console.log(`Gemini response: ${responseText}`);
            const aiOutput = parseAIJson(responseText);

            const enrichedComplaint = {
                ...complaint,
                analysis: aiOutput,
                category: aiOutput.category,
                urgency: aiOutput.urgency,
                summary: aiOutput.summary,
                status: 'ANALYZED'
            };

            // Store in structured bucket
            await s3.send(new PutObjectCommand({
                Bucket: STRUCTURED_BUCKET,
                Key: `analyzed/${complaint.complaintId}.json`,
                Body: JSON.stringify(enrichedComplaint),
                ContentType: 'application/json'
            }));
            console.log(`Successfully analyzed and stored: ${complaint.complaintId}`);
        } catch (error: any) {
            console.error(`Analysis failed for ${complaint.complaintId}:`, error.message);
            // Even if AI fails, store basic info to avoid blocking dashboard
            const fallbackComplaint = {
                ...complaint,
                status: 'FAILED',
                urgency: 'MEDIUM'
            };
            await s3.send(new PutObjectCommand({
                Bucket: STRUCTURED_BUCKET,
                Key: `analyzed/${complaint.complaintId}.json`,
                Body: JSON.stringify(fallbackComplaint),
                ContentType: 'application/json'
            }));
        }
    }
};
