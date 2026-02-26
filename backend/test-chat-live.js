// test-chat-live.js — Test rápido del endpoint de chat del servidor
// Asegúrese de que el servidor esté corriendo antes de ejecutar este script.

async function testChatEndpoint() {
    const url = "http://localhost:5000/api/generate";

    console.log("🔍 Probando endpoint de chat en http://localhost:5000...\n");

    // Test 1: Chat conversacional
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "chat",
                prompt: "Responde solo con: 'CHAT BACKEND OK'",
                history: [{ role: "user", parts: [{ text: "Responde solo con: 'CHAT BACKEND OK'" }] }]
            })
        });
        const data = await res.json();
        if (data.result) {
            console.log("✅ CHAT ENDPOINT: Funcionando");
            console.log(`   Respuesta: ${data.result.trim()}`);
        } else {
            console.log("❌ CHAT ENDPOINT: Sin resultado");
            console.log("   Datos:", JSON.stringify(data));
        }
    } catch (err) {
        console.log("❌ ERROR DE CONEXIÓN AL SERVIDOR:", err.message);
        console.log("   ¿Está el servidor corriendo? Ejecuta: node server.js");
    }

    // Test 2: Texto simple
    console.log("");
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "text",
                prompt: "Di solo: 'TEXTO OK'"
            })
        });
        const data = await res.json();
        if (data.result) {
            console.log("✅ TEXT ENDPOINT: Funcionando");
            console.log(`   Respuesta: ${data.result.trim()}`);
        } else {
            console.log("❌ TEXT ENDPOINT: Sin resultado");
        }
    } catch (err) {
        console.log("❌ ERROR TEXT ENDPOINT:", err.message);
    }
}

testChatEndpoint();
