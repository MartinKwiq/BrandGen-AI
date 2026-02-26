// test-new-key.js - Verifica una API Key específica de Gemini
// USO: node test-new-key.js TU_NUEVA_KEY_AQUI

import { GoogleGenAI } from "@google/genai";

const NEW_KEY = process.argv[2];

if (!NEW_KEY) {
    console.log("USO: node test-new-key.js TU_NUEVA_KEY_AQUI");
    console.log("Ejemplo: node test-new-key.js AIzaSyXXXXXXXXXXXXXXXX");
    process.exit(1);
}

console.log(`\n🔍 Probando key: ${NEW_KEY.substring(0, 15)}...`);

async function testKey() {
    // TEST CHAT
    try {
        const ai = new GoogleGenAI({ apiKey: NEW_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: "Di solo: FUNCIONANDO" }] }],
        });
        console.log("✅ CHAT OK:", response.text.trim());
    } catch (err) {
        console.log("❌ CHAT FALLA:", err.message.substring(0, 150));
    }

    // TEST IMAGEN con misma key
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${NEW_KEY}`;
        const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: "red circle" }],
                parameters: { sampleCount: 1 }
            })
        });
        const d = await r.json();
        if (d.predictions?.[0]?.bytesBase64Encoded) {
            console.log("✅ IMAGEN OK: imagen generada correctamente");
        } else if (d.error) {
            console.log("⚠️  IMAGEN:", `(${d.error.code}) ${d.error.message.substring(0, 100)}`);
        }
    } catch (err) {
        console.log("❌ IMAGEN FALLA:", err.message.substring(0, 150));
    }
}

testKey();
