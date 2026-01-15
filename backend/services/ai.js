// const { GoogleGenerativeAI } = require("@google/generative-ai");
// require('dotenv').config();

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// const SYSTEM_INSTRUCTION = `
// ROLE: You are ResiliNet-AI, an autonomous disaster triage engine.
// OBJECTIVE: Analyze the victim's help request and return structured JSON data.

// RULES:
// 1. Return ONLY valid JSON. Do not use Markdown code blocks.
// 2. urgency: "Critical" (Life Threat), "High" (Serious), "Medium" (Property), "Low" (Spam).
// 3. category: "Medical", "Rescue", "Fire", "Food/Water", "Infrastructure", "Other".
// 4. summary: Max 5 words. Active verbs.
// 5. resources: Array of strings (e.g. ["Boat", "Ambulance", "Generator"]).
// `;

// async function analyzeRequest(userText) {
//   const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nINPUT: "${userText}"\nOUTPUT:`;

//   try {
//     const result = await model.generateContent(fullPrompt);
//     const response = await result.response;
//     let text = response.text();

//     // Clean up markdown if Gemini adds it
//     text = text.replace(/```json|```/g, "").trim();
    
//     return JSON.parse(text);
//   } catch (error) {
//     console.error("AI Service Error:", error);
//     // Fail-safe fallback so the app doesn't crash
//     return {
//       urgency: "Medium",
//       category: "General",
//       summary: "Manual check required",
//       resources: []
//     };
//   }
// }

// module.exports = { analyzeRequest };const { GoogleGenerativeAI } = require("@google/generative-ai");

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ⚠️ Model must exist for the API key owner
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

const SYSTEM_INSTRUCTION = `
ROLE: You are ResiliNet-AI, an autonomous disaster triage engine.
OBJECTIVE: Analyze the help request and return structured JSON.

RULES:
1. OUTPUT FORMAT: strictly JSON. No Markdown.

2. URGENCY LEVELS (Lowercase):
   - "critical": Immediate threat to life (trapped, fire, heavy bleeding).
   - "high": Serious threat (broken bone, stranded, insulin needed).
   - "medium": Property/Quality of life (power out, food low).
   - "low": Info requests, spam, donations.

3. CATEGORIES (Lowercase, Exact Match):
   - "medical", "rescue", "fire", "food_water", "shelter", "infrastructure", "logistics", "other".

4. CONFIDENCE SCORE:
   - 0.0 to 1.0 (Float).
   - 1.0 = Explicit request ("I need an ambulance").
   - 0.5 = Vague request ("It is bad here").

5. MAPPING LOGIC:
   - "Gas leak" -> category: "fire", urgency: "critical"
   - "Insulin needed" -> category: "medical", urgency: "high"
   - "Tree fell on road" -> category: "infrastructure", urgency: "medium"
   - "Trapped in basement" -> category: "rescue", urgency: "critical"
   - "Baby needs milk" -> category: "food_water", urgency: "high"

JSON STRUCTURE:
{
  "urgency": "string",
  "category": "string",
  "summary": "string (max 5 words, active verbs)",
  "resources": ["string", "string"],
  "confidence": number
}
`;

async function analyzeRequest(userText) {
  const prompt = `
${SYSTEM_INSTRUCTION}

INPUT:
"${userText}"

OUTPUT:
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("AI Service Error:", error);
    return {
      urgency: "Medium",
      category: "Other",
      summary: "Manual review required",
      resources: []
    };
  }
}

module.exports = { analyzeRequest };
