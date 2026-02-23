import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const s3 = new S3Client({ region: 'us-east-1' });
const IDENTITY_BUCKET = process.env.IDENTITY_BUCKET_NAME || 'complaint-system-identities-raka123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-it';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, password } = JSON.parse(event.body || '{}');

        if (!email || !password) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Email and password are required' })
            };
        }

        const emailKey = `users/${email.toLowerCase()}.json`;

        let userRecord;
        try {
            const response = await s3.send(new GetObjectCommand({
                Bucket: IDENTITY_BUCKET,
                Key: emailKey
            }));
            const body = await response.Body?.transformToString();
            userRecord = body ? JSON.parse(body) : null;
        } catch (e: any) {
            if (e.name === 'NoSuchKey') {
                return {
                    statusCode: 401,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ message: 'Invalid email or password' })
                };
            }
            throw e;
        }

        if (!userRecord || !(await bcrypt.compare(password, userRecord.passwordHash))) {
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Invalid email or password' })
            };
        }

        const token = jwt.sign(
            {
                userId: userRecord.userId,
                email: userRecord.email,
                role: userRecord.role,
                department: userRecord.department
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: 'Login successful',
                token,
                user: {
                    userId: userRecord.userId,
                    name: userRecord.name,
                    email: userRecord.email,
                    role: userRecord.role,
                    department: userRecord.department
                }
            })
        };
    } catch (error) {
        console.error('Login Error:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
