import dotenv from "dotenv";
dotenv.config();

const k = process.env.GEMINI_API_KEY;

async function run() {
    try {
        console.log("--- TEST REST v1beta ---");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${k}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'ping' }] }]
            })
        });
        const data = await response.json();
        if (data.candidates) {
            console.log("✅ REST v1beta gemini-1.5-flash is WORKING:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("❌ REST v1beta failed:", JSON.stringify(data));
        }
    } catch (e) {
        console.error(e);
    }
}

run();
