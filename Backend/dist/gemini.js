import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiError } from './http.js';
export function getGeminiModelOrThrow() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new ApiError(502, 'GEMINI_API_KEY is not configured');
    }
    // Default model must support `generateContent` on the Gemini API v1beta.
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: modelName });
}
