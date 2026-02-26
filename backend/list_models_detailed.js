import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("🔍 Consultando modelos disponibles...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n--- MODELOS ENCONTRADOS ---");
            data.models.forEach(m => {
                console.log(`- ${m.name.replace("models/", "")} (${m.displayName})`);
            });
        } else {
            console.log("❌ No se encontraron modelos o la respuesta es inválida:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("❌ Error de red:", error.message);
    }
}

listModels();
