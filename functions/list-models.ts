import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler = async (): Promise<any> => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    try {
        const result = await genAI.listModels();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };
    } catch (error: any) {
        return {
            statusCode: 500,
            body: error.message
        };
    }
};
