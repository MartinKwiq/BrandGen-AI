import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const IMAGEN_KEY = process.env.GOOGLE_IMAGEN_API_KEY;

console.log("=".repeat(60));
console.log("🔍 DIAGNÓSTICO DE APIS - BrandGen AI");
console.log("=".repeat(60));
console.log("\n📋 Claves encontradas en .env:");
console.log(`  GEMINI_API_KEY      : ${GEMINI_KEY ? GEMINI_KEY.substring(0, 15) + "..." : "❌ NO ENCONTRADA"}`);
console.log(`  GOOGLE_IMAGEN_KEY   : ${IMAGEN_KEY ? IMAGEN_KEY.substring(0, 15) + "..." : "❌ NO ENCONTRADA"}`);
console.log("");

// TEST 1: Gemini Chat/Text (conversacional)
async function testGeminiChat(apiKey, keyName) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`🤖 TEST 1: Gemini Chat/Text (${keyName})`);
    console.log(`${"─".repeat(50)}`);

    if (!apiKey) {
        console.log("❌ OMITIDO: No hay API Key configurada.");
        return false;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: "Responde solo: 'API OK'" }] }],
        });
        console.log("✅ ÉXITO - Gemini Chat funciona correctamente");
        console.log(`   Respuesta: ${response.text}`);
        return true;
    } catch (err) {
        console.log("❌ ERROR en Gemini Chat:");
        console.log(`   ${err.message}`);

        if (err.message.includes("API_KEY_INVALID") || err.message.includes("401")) {
            console.log("   ⚠️  CAUSA: API Key inválida o eliminada.");
        } else if (err.message.includes("quota") || err.message.includes("429")) {
            console.log("   ⚠️  CAUSA: Quota excedida (límite de uso).");
        } else if (err.message.includes("403")) {
            console.log("   ⚠️  CAUSA: Acceso denegado. El modelo puede no estar habilitado.");
        }
        return false;
    }
}

// TEST 2: Google Imagen REST API
async function testImagenREST(apiKey, keyName) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`🖼️  TEST 2: Google Imagen 4.0 REST (${keyName})`);
    console.log(`${"─".repeat(50)}`);

    if (!apiKey) {
        console.log("❌ OMITIDO: No hay API Key configurada.");
        return false;
    }

    const model = "imagen-4.0-fast-generate-001";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: "A simple red circle on white background" }],
                parameters: { sampleCount: 1 }
            })
        });

        const data = await response.json();

        if (response.ok && data.predictions?.[0]?.bytesBase64Encoded) {
            console.log("✅ ÉXITO - Imagen 4.0 genera imágenes correctamente");
            console.log(`   Imagen recibida: ${data.predictions[0].bytesBase64Encoded.length} bytes base64`);
            return true;
        } else if (data.error) {
            console.log("❌ ERROR en Imagen REST:");
            console.log(`   Código: ${data.error.code}`);
            console.log(`   Mensaje: ${data.error.message}`);

            if (data.error.code === 400 && data.error.message.includes("billing")) {
                console.log("   ⚠️  CAUSA: Imagen 4.0 requiere billing activo en Google Cloud.");
            } else if (data.error.code === 401 || data.error.code === 403) {
                console.log("   ⚠️  CAUSA: API Key inválida para Imagen.");
            } else if (data.error.code === 404) {
                console.log("   ⚠️  CAUSA: Modelo no disponible para esta key.");
            }
            return false;
        } else {
            console.log("⚠️  Respuesta HTTP:", response.status);
            console.log("   Datos:", JSON.stringify(data).substring(0, 200));
            return false;
        }
    } catch (err) {
        console.log("❌ ERROR DE RED:");
        console.log(`   ${err.message}`);
        return false;
    }
}

// TEST 3: Verificar disponibilidad de modelos
async function listAvailableModels(apiKey) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`📋 TEST 3: Modelos disponibles para GEMINI_API_KEY`);
    console.log(`${"─".repeat(50)}`);

    if (!apiKey) {
        console.log("❌ OMITIDO: No hay API Key.");
        return;
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`;
        const resp = await fetch(url);
        const data = await resp.json();

        if (data.error) {
            console.log("❌ No se pudieron listar modelos:", data.error.message);
            return;
        }

        const models = data.models || [];
        const geminiModels = models.filter(m => m.name.includes("gemini") || m.name.includes("imagen"));

        if (geminiModels.length === 0) {
            console.log("⚠️  No se encontraron modelos Gemini/Imagen disponibles.");
        } else {
            console.log(`✅ ${geminiModels.length} modelos disponibles:`);
            geminiModels.forEach(m => {
                const supportsGen = m.supportedGenerationMethods?.join(", ") || "N/A";
                console.log(`   • ${m.name.replace("models/", "")} → ${supportsGen}`);
            });
        }
    } catch (err) {
        console.log("❌ Error listando modelos:", err.message);
    }
}

// RESUMEN FINAL
async function main() {
    const chat1 = await testGeminiChat(GEMINI_KEY, "GEMINI_API_KEY");
    const chat2 = IMAGEN_KEY !== GEMINI_KEY
        ? await testGeminiChat(IMAGEN_KEY, "IMAGEN_API_KEY")
        : Promise.resolve(null);

    const img1 = await testImagenREST(IMAGEN_KEY || GEMINI_KEY, "IMAGEN o GEMINI KEY");
    await listAvailableModels(GEMINI_KEY);

    console.log(`\n${"=".repeat(60)}`);
    console.log("📊 RESUMEN FINAL");
    console.log(`${"=".repeat(60)}`);
    console.log(`  Chat/Texto (GEMINI_KEY) : ${chat1 ? "✅ FUNCIONA" : "❌ FALLA"}`);
    console.log(`  Imagen REST (IMAGEN_KEY): ${img1 ? "✅ FUNCIONA" : "❌ FALLA"}`);
    console.log(`${"=".repeat(60)}\n`);

    if (!chat1 && !img1) {
        console.log("🚨 AMBAS APIS FALLAN - Necesitas generar nuevas API Keys.");
        console.log("   → Para Gemini (Chat): https://aistudio.google.com/app/apikey");
        console.log("   → Para Imagen: Misma key de AI Studio (si tienes billing habilitado)");
    } else if (!chat1) {
        console.log("🚨 SOLO EL CHAT FALLA - Regenera GEMINI_API_KEY en:");
        console.log("   https://aistudio.google.com/app/apikey");
    } else if (!img1) {
        console.log("🚨 SOLO IMAGEN FALLA - Verifica billing en Google Cloud.");
    } else {
        console.log("🎉 TODO FUNCIONA CORRECTAMENTE");
    }
}

main().catch(console.error);
