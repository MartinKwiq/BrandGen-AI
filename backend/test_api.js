import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    console.log("--- TEST DE CONEXIÓN GEMINI ---");
    if (!GEMINI_API_KEY) {
        console.error("❌ Error: GEMINI_API_KEY no encontrada.");
        return;
    }

    const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    });

    try {
        console.log("Enviando petición de prueba (gemini-1.5-flash-latest)...");
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash-latest",
            contents: [{ role: "user", parts: [{ text: "Hola, responde con la palabra 'OK' si escuchas." }] }],
        });

        console.log("✅ Respuesta recibida:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("❌ Error en la prueba:");
        console.error("Status:", error.status);
        console.error("Nombre:", error.name);
        console.error("Mensaje raw:", error.message);
        try {
            const errObj = JSON.parse(error.message);
            console.error("Detalles Error (JSON):", JSON.stringify(errObj, null, 2));
        } catch (e) {
            console.error("No se pudo parsear el mensaje como JSON.");
        }
    }
}

async function listModels() {
    console.log("\n--- MODELOS DISPONIBLES ---");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            data.models.forEach(m => {
                const name = m.name.replace("models/", "");
                console.log(`Model: ${name} | Methods: ${m.supportedGenerationMethods.join(", ")}`);
            });
        } else {
            console.log("Error en la respuesta:", JSON.stringify(data));
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

async function start() {
    await listModels();
}

start();
