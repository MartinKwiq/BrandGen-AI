import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
    try {
        console.log("--- MODELOS VIA SDK ---");
        // En @google/genai, no hay un listModels fácil, pero probaremos generateContent con un nombre común
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash-exp", "gemini-2.0-flash"];

        for (const m of models) {
            try {
                const res = await ai.models.generateContent({
                    model: m,
                    contents: [{ role: "user", parts: [{ text: "ping" }] }]
                });
                console.log(`✅ Model ${m} is WORKING`);
            } catch (e) {
                console.log(`❌ Model ${m} failed: ${e.status} ${e.message}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

run();
