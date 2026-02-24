import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseAIJson } from '../shared/utils';
import { classifyComplaint, classifyUrgency } from '../shared/classifier';

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
            // Respect official triage data if provided during submission (Phase 23)
            if (complaint.category && complaint.urgency && complaint.summary) {
                console.log(`Complaint ${complaint.complaintId} already has official triage data. Fast-tracking.`);
                await s3.send(new PutObjectCommand({
                    Bucket: STRUCTURED_BUCKET,
                    Key: `analyzed/${complaint.complaintId}.json`,
                    Body: JSON.stringify({
                        ...complaint,
                        status: 'ANALYZED',
                        fastTracked: true
                    }),
                    ContentType: 'application/json'
                }));
                continue; // Move to next record
            }

            const modelIdentifier = "gemini-1.5-flash";

            // 1. Perform Local ML Triage (High-Accuracy Keyword/Bayes)
            const predictedCategory = classifyComplaint(complaint.description);
            const predictedUrgency = classifyUrgency(complaint.description);

            console.log(`Local ML Prediction - Category: ${predictedCategory}, Urgency: ${predictedUrgency}`);

            // 2. Use Gemini for Intelligent Summarization and Validation
            const model = genAI.getGenerativeModel({ model: modelIdentifier });

            const prompt = `Analyze this civic complaint from India and provide a concise, professional summary for officials.
            
            Title: ${complaint.title}
            Description: ${complaint.description}
            Suggested Category: ${predictedCategory}
            
            Respond ONLY with a JSON object:
            {
              "summary": "A 1-2 sentence professional summary of the issue.",
              "isLegitimate": true/false (if it's a real grievance or spam),
              "aiImprovement": "A suggestion to the user on what more info is needed, if any (optional)"
            }`;

            console.log(`Invoking Gemini for complaint: ${complaint.complaintId}`);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiData = parseAIJson(response.text());
            console.log(`Gemini response: ${JSON.stringify(aiData)}`);

            // 3. Merge Local ML with AI Reasoning
            const enrichedComplaint = {
                ...complaint,
                category: predictedCategory,
                urgency: predictedUrgency,
                summary: aiData.summary || complaint.description.substring(0, 100) + "...",
                isLegitimate: aiData.isLegitimate ?? true,
                aiSuggestions: aiData.aiImprovement || null,
                status: 'ANALYZED',
                timestamp: new Date().toISOString()
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
