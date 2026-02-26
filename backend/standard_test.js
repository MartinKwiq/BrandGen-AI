import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        console.log("--- TEST @google/generative-ai (Gemini 2.5) ---");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("ping");
        console.log("✅ Model gemini-2.5-flash is WORKING:", result.response.text());
    } catch (e) {
        console.log("❌ Model gemini-1.5-flash failed:", e.message);
    }
}

run();
