import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log("--- LISTA DE MODELOS ---");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        const data = await response.json();
        if (data.models) {
            data.models.forEach(model => {
                console.log(`- ${model.name.replace('models/', '')}`);
                console.log(`  DisplayName: ${model.displayName}`);
                console.log(`  Description: ${model.description}`);
                console.log(`  Capabilities: ${model.supportedGenerationMethods.join(', ')}`);
                console.log("---");
            });
        } else {
            console.log("No se encontraron modelos o la clave es inválida.");
            console.log("Respuesta:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
