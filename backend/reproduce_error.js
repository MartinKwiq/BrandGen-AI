import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testChat() {
    console.log("--- REPRODUCIENDO ERROR DE CHAT ---");
    const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
    });

    const systemInstruction = `Eres BrandGen AI, un Consultor de Branding de Élite.
Tu misión es guiar al usuario en una charla 1-a-1 fluida para descubrir su marca.

REGLAS DE ORO (INCUMPLIMIENTO = ERROR CRÍTICO):
1. **PROHIBIDO EL BOMBARDEO**: NUNCA hagas más de UNA (1) pregunta por mensaje.
2. **SIN LISTAS NI CUESTIONARIOS**: No uses viñetas, números ni guiones para listar preguntas. Solo texto plano y directo.
3. **BREVEDAD RADICAL**: Máximo 15-20 palabras por respuesta. Sé un estratega, no un locutor.
4. **PREGUNTA DE SERVICIOS**: Si aún no lo sabes, pregunta específicamente por los servicios/productos que ofrece.

FLUJO:
- Identifica Servicios -> Público -> Estilo Visual.
- Si el usuario dice el nombre del negocio, responde solo con UNA pregunta sobre lo que hacen.

FINALIZACIÓN:
Solo cuando tengas todo, di EXACTAMENTE:
"¡Excelente! Tengo una visión clara de lo que necesitamos. Tu identidad de marca está lista para nacer. Por favor, haz clic en el botón **'✨ Generar Branding'** que ha aparecido aquí abajo para ver las 5 propuestas exclusivas que he diseñado para ti."`;

    const contents = [{ role: "user", parts: [{ text: "Hola, mi marca se llama AMG Web Solutions" }] }];

    try {
        console.log("Llamando a ai.models.generateContent con systemInstruction (gemini-2.0-flash)...");
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            systemInstruction: systemInstruction,
            contents: contents,
        });

        console.log("✅ Éxito:", response.text);
    } catch (error) {
        console.error("❌ ERROR DETECTADO:");
        console.error("Nombre:", error.name);
        console.error("Mensaje:", error.message);
        if (error.stack) console.error("Stack:", error.stack);
    }
}

testChat();
