import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-it';

export interface AuthUser {
    userId: string;
    email: string;
    name: string;
    role: 'USER' | 'ADMIN';
}

export type AuthenticatedHandler = (
    event: APIGatewayProxyEvent,
    user: AuthUser
) => Promise<APIGatewayProxyResult>;

export const withAuth = (handler: AuthenticatedHandler, requiredRole?: 'USER' | 'ADMIN') => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const authHeader = event.headers.Authorization || event.headers.authorization;
            if (!authHeader) {
                return {
                    statusCode: 401,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ message: 'Missing Authorization header' })
                };
            }

            const token = authHeader.replace('Bearer ', '');
            const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

            if (requiredRole && decoded.role !== requiredRole && decoded.role !== 'ADMIN') {
                return {
                    statusCode: 403,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                    body: JSON.stringify({ message: 'Forbidden: Insufficient permissions' })
                };
            }

            return await handler(event, decoded);
        } catch (error) {
            console.error('Auth Middleware Error:', error);
            return {
                statusCode: 401,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Invalid or expired token' })
            };
        }
    };
};
