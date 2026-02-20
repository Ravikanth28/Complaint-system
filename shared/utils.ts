/**
 * Utility to extract and parse JSON from GenAI responses
 * which might be wrapped in markdown code blocks.
 */
export function parseAIJson(text: string) {
    try {
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Failed to parse AI JSON:", text);
        throw new Error("Invalid AI Response Format");
    }
}
