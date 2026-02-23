/**
 * Utility to parse JSON from AI response which might be wrapped in markdown code blocks
 */
export function parseAIJson(text: string): any {
    try {
        // Remove markdown code blocks if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
        const cleanText = jsonMatch ? jsonMatch[1] : text;
        return JSON.parse(cleanText.trim());
    } catch (error) {
        console.error("Failed to parse AI JSON:", text);
        // Fallback for extremely malformed responses, try to extract anything that looks like JSON
        try {
            const partialMatch = text.match(/\{[\s\S]*\}/);
            if (partialMatch) return JSON.parse(partialMatch[0]);
        } catch (e) {
            console.error("Critical failure parsing AI JSON fallback");
        }
        throw new Error("Invalid AI JSON format");
    }
}
