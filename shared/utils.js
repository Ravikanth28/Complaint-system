"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAIJson = parseAIJson;
/**
 * Utility to extract and parse JSON from GenAI responses
 * which might be wrapped in markdown code blocks.
 */
function parseAIJson(text) {
    try {
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    }
    catch (e) {
        console.error("Failed to parse AI JSON:", text);
        throw new Error("Invalid AI Response Format");
    }
}
