import * as natural from 'natural';

// Define the departments consistent with the dashboard and mobile app
export type Department = 'PWD' | 'Police' | 'Fire' | 'Health' | 'Electricity' | 'Water & Sewage' | 'Transport' | 'Others';
export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const classifier = new natural.BayesClassifier();
const urgencyClassifier = new natural.BayesClassifier();

// 1. Seed Data for Category Classification (Professional Hybrid Approach)
const trainingData: { text: string, category: Department }[] = [
    { text: "Pot holes on the main road are very large and dangerous", category: "PWD" },
    { text: "Street light is not working in our lane", category: "Electricity" },
    { text: "Water supply is muddy and smells bad", category: "Water & Sewage" },
    { text: "Garbage is piled up near the house", category: "Water & Sewage" },
    { text: "High voltage fluctuation burned my AC", category: "Electricity" },
    { text: "Broken sewage pipe overflow on street", category: "Water & Sewage" },
    { text: "Power cut for last 5 hours in summer", category: "Electricity" },
    { text: "Bus drivers are driving very rashly", category: "Transport" },
    { text: "Auto rickshas are overcharging for short distance", category: "Transport" },
    { text: "Loud speaker playing till late night in marriage hall", category: "Police" },
    { text: "Chain snatching incident at the corner", category: "Police" },
    { text: "Huge fire in the chemical warehouse", category: "Fire" },
    { text: "Smoke coming out of the electrical meter box", category: "Fire" },
    { text: "Doctors not available at primary health center", category: "Health" },
    { text: "Dengue cases rising due to open drains", category: "Health" },
    { text: "Stray dog bit a child in the park", category: "Health" },
    { text: "Encroachment on public footpath by shopkeepers", category: "PWD" },
    { text: "Illegal parking blocking traffic in market", category: "Police" },
    { text: "Short circuit fire in apartment block", category: "Fire" },
    { text: "Leaking pipeline wasting water on road", category: "Water & Sewage" },
    { text: "Broken manhole cover on busy road", category: "PWD" },
    { text: "Transformers making loud blast sound", category: "Electricity" },
    { text: "No metro frequency during morning peak hours", category: "Transport" },
    { text: "Fogging needed for malaria prevention", category: "Health" }
];

// 2. Seed Data for Urgency Classification
const urgencyData: { text: string, urgency: Urgency }[] = [
    { text: "Massive fire spreading rapidly", urgency: "CRITICAL" },
    { text: "Gas leakage smell in building", urgency: "CRITICAL" },
    { text: "Someone is having a heart attack", urgency: "CRITICAL" },
    { text: "Electricity wire fallen on wet ground", urgency: "CRITICAL" },
    { text: "Water pipe broken and flooding house", urgency: "HIGH" },
    { text: "Complete power blackout in hospital", urgency: "CRITICAL" },
    { text: "Street light flickering occasionally", urgency: "LOW" },
    { text: "Garbage collector didn't come today", urgency: "LOW" },
    { text: "Pothole on my residential street", urgency: "MEDIUM" },
    { text: "Traffic jam due to narrow road", urgency: "MEDIUM" },
    { text: "Theft reported in neighborhood", urgency: "HIGH" }
];

// Initialize and Train
trainingData.forEach(item => classifier.addDocument(item.text, item.category));
classifier.train();

urgencyData.forEach(item => urgencyClassifier.addDocument(item.text, item.urgency));
urgencyClassifier.train();

/**
 * Predicts the department for a given complaint description
 */
export function classifyComplaint(text: string): Department {
    if (!text || text.length < 5) return 'Others';
    return classifier.classify(text) as Department;
}

/**
 * Predicts the urgency level for a given complaint description
 */
export function classifyUrgency(text: string): Urgency {
    if (!text || text.length < 5) return 'MEDIUM';
    // Weighted logic for critical terms
    const criticalKeywords = ['fire', 'blast', 'leak', 'accident', 'dead', 'critical', 'danger', 'shook', 'blood', 'heart'];
    const lowerText = text.toLowerCase();

    if (criticalKeywords.some(word => lowerText.includes(word))) {
        return 'CRITICAL';
    }

    return urgencyClassifier.classify(text) as Urgency;
}
