import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const s3 = new S3Client({ region: 'us-east-1' });
const IDENTITY_BUCKET = process.env.IDENTITY_BUCKET_NAME || 'complaint-system-identities-raka123';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { name, email, password } = JSON.parse(event.body || '{}');

        if (!name || !email || !password) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Name, email, and password are required' })
            };
        }

        const emailKey = `users/${email.toLowerCase()}.json`;

        // Check if user already exists
        try {
            await s3.send(new HeadObjectCommand({
                Bucket: IDENTITY_BUCKET,
                Key: emailKey
            }));
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'User already exists' })
            };
        } catch (e: any) {
            if (e.name !== 'NotFound') {
                throw e;
            }
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        const userRecord = {
            userId,
            name,
            email: email.toLowerCase(),
            passwordHash,
            role: 'USER',
            createdAt: new Date().toISOString()
        };

        await s3.send(new PutObjectCommand({
            Bucket: IDENTITY_BUCKET,
            Key: emailKey,
            Body: JSON.stringify(userRecord),
            ContentType: 'application/json'
        }));

        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'User registered successfully', userId })
        };
    } catch (error) {
        console.error('Registration Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
