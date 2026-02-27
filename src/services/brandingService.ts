import type { BrandProject, BrandBranding, BrandProposal, BrandColor, BrandIcon, Message } from '../types';

// API Configuration
// Usar URL de Vercel en Producción, o localhost en desarrollo
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = `${BASE_URL}/generate`;

// Helper to call backend API
async function callBackend(data: any): Promise<any> {
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Initialize Gemini (Kept for UI compatibility but logic removed)
export function initializeAI(_apiKey: string): void {
  console.log('✅ AI service ready (using backend)');
}

// Check if AI is initialized (Always true if we assume backend is there)
export function isAIInitialized(): boolean {
  return true;
}

// Helper function to add delay between API calls
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate a summary from chat messages
export function generateContextSummary(messages: { role: string; content: string }[]): string {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join('\n');

  const assistantMessages = messages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)
    .join('\n');

  return `
Conversación del usuario:
${userMessages}

Respuestas del asistente:
${assistantMessages}
  `.trim();
}

// ===== GENERATE BRANDING WITH MULTI-AGENT SYSTEM =====
export async function generateBranding(
  brandName: string,
  description: string,
  industry?: string,
  targetAudience?: string,
  chatContext?: string
): Promise<BrandBranding> {

  try {
    console.log('🎨 Starting Backend Branding Generation...', { brandName, industry });

    // ===== AGENTE 1: DIRECTOR CREATIVO =====
    const directorPrompt = `Actúa como un Director Creativo Senior de una agencia de branding de clase mundial.
 
ANÁLISIS DE MARCA:
- Nombre: ${brandName}
- Industria: ${industry || 'General'}
- Descripción: ${description}
- Público objetivo: ${targetAudience || 'General'}
${chatContext ? `\nContexto detallado de la entrevista: ${chatContext}` : ''}
 
Tu tarea: Define 5 direcciones creativas RADICALMENTE DISTINTAS entre sí para esta marca.
 
REQUERIMIENTOS POR PROPUESTA:
1. **Nombre Creativo**: Título sugerente para la propuesta.
2. **Mood/Estilo**: Debe ser uno de estos 5 (sin repetir): [Moderno/Tech, Clásico/Elegante, Minimalista/Puro, Audaz/Rebelde, Innovador/Futurista].
3. **Concepto**: Explicación de 2 oraciones del porqué de este estilo para el negocio.
4. **Paleta de Colores**: 6 colores HEX con nombres y usos (ej: Primario, Secundario, Acento, Fondo 1, Fondo 2, Complemento). Las paletas deben variar en temperatura y contraste.
5. **Tipografías**: PAREJA ÚNICA de Google Fonts (título y cuerpo). Usa fuentes diversas como [Inter, Montserrat, Playfair Display, Roboto Mono, Sora, Outfit, Fraunces]. No repitas fuentes en las 5 propuestas.
6. **Descripción Visual del Logo**: Detalles para un diseñador sobre formas, símbolos y composición.
7. **Estilo de Iconografía**: Describe cómo deben ser los iconos (ej: "Líneas finas minimalistas", "3D Glassmorphism colorido", "Geométrico sólido").
 
Responde ESTRICTAMENTE en este formato JSON (sin markdown, sin texto extra):
{
  "proposals": [
    {
      "name": "...",
      "mood": "...",
      "description": "...",
      "colors": [ {"name": "...", "hex": "#...", "usage": "..."} ],
      "typography": { "titulo": "Font Name", "cuerpo": "Font Name" },
      "logoDescription": "...",
      "iconStyle": "..."
    }
  ]
}`;

    console.log('🎭 Agent 1: Director Creativo (Backend)...');
    const { result: creativeDirections } = await callBackend({
      type: "text",
      prompt: directorPrompt
    });
    console.log("RAW CREATIVE RESPONSE:", creativeDirections);
    // Clean JSON
    let cleanedJson = creativeDirections.trim();

    // Eliminar bloques markdown si la IA los incluyó a pesar de la instrucción
    cleanedJson = cleanedJson.replace(/```json/g, '').replace(/```/g, '');

    const creativeData = JSON.parse(cleanedJson);
    console.log('✅ Creative data parsed with diversity');

    // ===== AGENTE 2: DISEÑADOR GRÁFICO (Genera Logos con Imagen 3 via Backend) =====
    console.log('🎨 Agent 2: Graphic Designer (Backend Imagen 3)...');

    const proposals = [];
    let directions: any[] = [];

    if (creativeData.proposals && Array.isArray(creativeData.proposals)) {
      directions = creativeData.proposals;
    } else if (Array.isArray(creativeData)) {
      directions = creativeData;
    } else if (typeof creativeData === "object" && creativeData !== null) {
      const possibleArray = Object.values(creativeData).find(v => Array.isArray(v));
      if (possibleArray) directions = possibleArray as any[];
    }

    if (!directions.length) {
      throw new Error("No se generaron propuestas desde el backend");
    }

    for (let i = 0; i < Math.min(5, directions.length); i++) {
      const direction = directions[i];

      const rawColors = direction.colors || direction.paleta_colores || null;
      let normalizedColors: BrandColor[] | undefined;

      if (Array.isArray(rawColors)) {
        normalizedColors = rawColors.map((c: any) => ({
          name: c.name || c.nombre || "Color",
          hex: c.hex || c.hexadecimal || (typeof c === 'string' ? c : "#6366f1"),
          usage: c.usage || c.uso || "Uso general"
        }));
      }

      const rawTypography = direction.typography || direction.tipografias || null;
      let normalizedTypography = rawTypography;

      if (rawTypography && typeof rawTypography === "object") {
        const titleFont = rawTypography.titulo || rawTypography.titulos || "Inter";
        const bodyFont = rawTypography.cuerpo || "DM Sans";
        normalizedTypography = {
          heading: {
            name: titleFont,
            fontFamily: `${titleFont}, sans-serif`,
            usage: "Títulos",
            googleFont: titleFont.replace(/\s+/g, '+')
          },
          body: {
            name: bodyFont,
            fontFamily: `${bodyFont}, sans-serif`,
            usage: "Cuerpo",
            googleFont: bodyFont.replace(/\s+/g, '+')
          }
        };
      }

      const normalizedDirection = {
        ...direction,
        colors: normalizedColors,
        typography: normalizedTypography,
        visualDescription: direction.logoDescription || direction.descripcion_logo || direction.logo || 'Modern and professional design',
        iconStyle: direction.iconStyle || direction.sistema_iconos || "Flat design"
      };

      let logoImageUrl = '';

      if (i === 0) {
        const logoPrompt = `Professional logo design for "${brandName}". ${normalizedDirection.visualDescription}. 
Style: ${normalizedDirection.mood || 'modern'}. 
Colors: ${normalizedDirection.colors?.map((c: any) => c.hex).join(', ') || '#6366f1, #8b5cf6'}. 
Industry: ${industry || 'technology'}. No text, vector style, white background.`;

        try {
          const imageRes = await callBackend({ type: "image", prompt: logoPrompt });
          logoImageUrl = imageRes.logo;
        } catch (error) {
          logoImageUrl = generatePlaceholderLogo(brandName, normalizedDirection.colors?.[0]?.hex || '#6366f1');
        }
      } else {
        logoImageUrl = generatePlaceholderLogo(brandName, normalizedDirection.colors?.[0]?.hex || '#6366f1');
      }

      const icons: BrandIcon[] = [];

      if (i === 0) {
        let iconDefinitions = [];
        try {
          const serviceDiscoveryPrompt = `
            Marca: "${brandName}". Descripción: "${description}".
            Entrevista: "${chatContext || ''}".
            Identifica los 6 servicios clave de este negocio para crear iconos para su web.
            Usa nombres reales de servicios (ej: "Soporte Técnico", "Diseño", "SEO").
            Responde en JSON: {"services": [{"name": "...", "description": "..."}]}
          `;
          const discoveryRes = await callBackend({ type: "chat", prompt: serviceDiscoveryPrompt });
          const discoveryJson = discoveryRes.result || discoveryRes;
          const discoveryData = typeof discoveryJson === 'string'
            ? JSON.parse(discoveryJson.replace(/```json/g, '').replace(/```/g, ''))
            : discoveryJson;
          iconDefinitions = (discoveryData.services || []).slice(0, 6);
        } catch (e) {
          iconDefinitions = [
            { name: 'Servicio 1', description: 'Descripción 1' },
            { name: 'Servicio 2', description: 'Descripción 2' },
            { name: 'Servicio 3', description: 'Descripción 3' },
            { name: 'Servicio 4', description: 'Descripción 4' },
            { name: 'Servicio 5', description: 'Descripción 5' },
            { name: 'Servicio 6', description: 'Descripción 6' }
          ];
        }

        for (let j = 0; j < iconDefinitions.length; j++) {
          const def = iconDefinitions[j];
          const primaryHex = normalizedDirection.colors?.[0]?.hex || '#6366f1';

          const iconPrompt = `
            Modern Web Service Icon for "${def.name}".
            Visual concept: ${def.description || def.name}.
            Industry Context: ${industry}.
            Design Style: High-quality modern glassmorphism or 3D render style but simplified, soft shadows, vibrant ${primaryHex} gradients.
            Shape: Perfectly centered inside a soft rounded square background.
            Composition: Clean vector-like lines, minimalist but premium.
            Output: High definition, professional web illustration, centered, NO text.
            Background: Transparent background.
          `;

          try {
            const iconRes = await callBackend({
              type: "image",
              prompt: iconPrompt
            });
            icons.push({
              name: def.name,
              svg: iconRes.logo,
              description: def.description || `Icono de ${def.name}`
            });
            console.log(`✅ Icon ${j + 1}/6 (${def.name}) generated`);
            await delay(400); // Guard delay
          } catch (error) {
            console.error(`❌ Error generating icon ${j}:`, error);
            icons.push(generateFallbackIcon(def.name.toLowerCase()));
          }
        }
      } else {
        // Fallback for secondary proposals icons
        const fallbackIconNames = ['home', 'search', 'user', 'settings', 'heart', 'star'];
        for (const iconName of fallbackIconNames) {
          icons.push(generateFallbackIcon(iconName));
        }
      }

      // HELPER: Saneado de strings para evitar que objetos de la IA crasheen React
      const safeStr = (val: any, fallback: string = ""): string => {
        if (!val) return fallback;
        if (typeof val === 'string') return val;
        // Si la IA devolvió un objeto con keys como {nombre, estilo} o {texto, valor}
        if (typeof val === 'object') {
          return val.nombre || val.texto || val.name || val.text || val.valor || val.value || JSON.stringify(val);
        }
        return String(val);
      };

      proposals.push({
        id: i + 1,
        name: safeStr(normalizedDirection.name, `Propuesta ${i + 1}`),
        description: safeStr(normalizedDirection.description, `Diseño para ${brandName}`),
        mood: safeStr(normalizedDirection.mood, 'moderno'),
        logo: logoImageUrl,
        colorScheme: normalizedDirection.colors?.map((c: any) => c.hex || c) || ['#6366f1', '#8b5cf6', '#ec4899', '#f9fafb', '#111827', '#ffffff'],
        colors: normalizedDirection.colors || generateFallbackColors(),
        typography: normalizedDirection.typography || {
          heading: { name: 'Inter', fontFamily: 'Inter, sans-serif', usage: 'Títulos', googleFont: 'Inter' },
          body: { name: 'DM Sans', fontFamily: 'DM Sans, sans-serif', usage: 'Cuerpo', googleFont: 'DM+Sans' }
        },
        icons: icons,
        applications: ['Website', 'Redes sociales', 'Tarjetas de presentación', 'Email firma', 'Empaque'],
      });
    }

    if (!proposals.length) {
      throw new Error("No se generaron propuestas desde el backend");
    }

    const mainProposal = proposals[0];

    const brandingResult = {
      brandName,
      tagline: generateTagline(brandName, description),
      logo: mainProposal.logo,
      colors: mainProposal.colors,
      typography: mainProposal.typography,
      icons: mainProposal.icons,
      proposals: proposals.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        colorScheme: p.colorScheme,
        typography: {
          titulo: p.typography?.heading?.name || 'Inter',
          cuerpo: p.typography?.body?.name || 'DM Sans'
        },
        mood: p.mood,
        applications: p.applications,
        logo: p.logo,
        icons: p.icons
      })),
    };

    return brandingResult;

  } catch (error) {
    console.error('❌ Error in backend branding generation:', error);
    return generateFallbackBranding(brandName, description);
  }
}

// Helper function to generate placeholder logo
function generatePlaceholderLogo(brandName: string, color: string): string {
  const initial = brandName.charAt(0).toUpperCase();
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" rx="40" fill="${color}"/>
    <text x="100" y="140" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
  </svg>`)}`;
}

// Helper function to generate fallback colors
function generateFallbackColors(): BrandColor[] {
  return [
    { name: 'Primario', hex: '#6366f1', usage: 'Color principal' },
    { name: 'Secundario', hex: '#8b5cf6', usage: 'Elementos de apoyo' },
    { name: 'Acento', hex: '#ec4899', usage: 'Llamadas a la acción' },
    { name: 'Fondo Claro', hex: '#f9fafb', usage: 'Backgrounds' },
    { name: 'Fondo Oscuro', hex: '#111827', usage: 'Texto sobre oscuro' },
    { name: 'Soporte', hex: '#ffffff', usage: 'Tarjetas' },
  ];
}

// Helper function to generate fallback icon
function generateFallbackIcon(name: string): BrandIcon {
  const iconPaths: Record<string, string> = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  };

  return {
    name,
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconPaths[name] || iconPaths.star}</svg>`,
    description: `Icono de ${name}`,
  };
}

// ===== AI CHAT RESPONSES (Via Backend) =====
export async function getAIResponse(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const history = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const systemInstruction = `Eres BrandGen AI, un Consultor de Branding de Élite de la agencia 'Brand Genius'.
Tu misión es guiar al usuario en una entrevista de branding 1-a-1 fluida para descubrir su esencia.

REGLAS DE ORO (INCUMPLIMIENTO = DESPIDO INMEDIATO):
1. **PROHIBIDO EL BOMBARDEO**: NUNCA, bajo ningún concepto, hagas más de UNA (1) pregunta por mensaje.
2. **SIN LISTAS NI CUESTIONARIOS**: No uses viñetas, números, guiones ni párrafos con múltiples preguntas. Si detecto un signo de interrogación secundario, es un fallo crítico.
3. **DESCUBRIMIENTO DE SERVICIOS**: Es OBLIGATORIO preguntar específicamente: "¿Qué servicios o productos ofreces exactamente?" al inicio. Necesitamos esto para diseñar los iconos de la web.
4. **BREVEDAD ESTRATÉGICA**: Máximo 15 palabras por respuesta. Sé directo, profesional e incisivo.
5. **NO REPETIR**: Si el usuario ya dio un dato, no lo pidas otra vez.

FLUJO DE ENTREVISTA:
- Paso 1: Nombre y Servicios (Prioritario).
- Paso 2: Público objetivo.
- Paso 3: Valores o Mood (Moderno, Clásico, Innovador, etc.).

FINALIZACIÓN (Solo tras tener los servicios específicos):
Di EXACTAMENTE:
"¡Excelente! Tengo una visión clara de lo que necesitamos. Tu identidad de marca está lista para nacer. Por favor, haz clic en el botón **'✨ Generar Branding'** que ha aparecido aquí abajo para ver las 5 propuestas exclusivas que he diseñado para ti."`;

    const { result } = await callBackend({
      type: "chat",
      history,
      systemInstruction
    });

    return result;

  } catch (error) {
    console.error('❌ Error in backend AI chat:', error);
    return getFallbackChatResponse(messages);
  }
}

// ===== FALLBACK FUNCTIONS (When AI not available) =====
function generateFallbackBranding(brandName: string, description: string): BrandBranding {
  const colors: BrandColor[] = [
    { name: 'Primario', hex: '#6366f1', usage: 'Color principal de marca' },
    { name: 'Secundario', hex: '#8b5cf6', usage: 'Elementos de apoyo' },
    { name: 'Acento', hex: '#ec4899', usage: 'Llamadas a la acción' },
    { name: 'Fondo Claro', hex: '#f9fafb', usage: 'Fondos y backgrounds' },
    { name: 'Fondo Oscuro', hex: '#111827', usage: 'Texto sobre fondos oscuros' },
    { name: 'Soporte', hex: '#ffffff', usage: 'Tarjetas y contenedores' },
  ];

  const typography = {
    heading: {
      name: 'Inter',
      fontFamily: 'Inter, sans-serif',
      usage: 'Títulos y encabezados',
      googleFont: 'Inter'
    },
    body: {
      name: 'DM Sans',
      fontFamily: 'DM Sans, sans-serif',
      usage: 'Texto de párrafos',
      googleFont: 'DM+Sans'
    },
  };

  const icons: BrandIcon[] = [
    { name: 'home', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>', description: 'Home' },
    { name: 'search', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>', description: 'Search' },
    { name: 'user', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', description: 'User' },
    { name: 'settings', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/></svg>', description: 'Settings' },
    { name: 'heart', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>', description: 'Favorite' },
    { name: 'star', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', description: 'Star' },
  ];

  // Generate a simple logo based on brand name
  const initial = brandName.charAt(0).toUpperCase();
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1"/>
        <stop offset="100%" style="stop-color:#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="40" fill="url(#grad)"/>
    <text x="100" y="140" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
  </svg>`;

  const moods = ['modern', 'classic', 'minimalist', 'bold', 'elegant'];
  const proposalNames = ['Innovador', 'Tradicional', 'Puro', 'Audaz', 'Sofisticado'];

  const proposals: BrandProposal[] = moods.map((mood, i) => ({
    id: i + 1,
    name: `${proposalNames[i]} ${brandName}`,
    description: `Una propuesta ${mood} que captura la esencia de ${brandName}. ${description}`,
    colorScheme: colors.map(c => c.hex),
    typography: {
      titulo: 'Inter',
      cuerpo: 'DM Sans'
    },
    mood,
    applications: ['Website', 'Business cards', 'Social media', 'Email signature'],
  }));

  return {
    brandName,
    tagline: generateTagline(brandName, description),
    logo,
    colors,
    typography,
    icons,
    proposals,
  };
}

function getFallbackChatResponse(messages: { role: string; content: string }[]): string {
  const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
  const userMessageCount = messages.filter(m => m.role === 'user').length;

  if (userMessageCount === 0) {
    return "¡Hola! Soy BrandGen AI, tu asistente de branding. Cuéntame sobre tu empresa o marca. ¿Qué nombre tiene y a qué se dedica?";
  }

  if (lastMessage.includes('logo') || lastMessage.includes('diseño')) {
    return "¿Te gustaría un diseño moderno y minimalista, o prefieres algo más tradicional y elegante?";
  }

  if (lastMessage.includes('color')) {
    return "Perfecto con los colores. ¿Tienes alguna preferencia de tipografía? ¿Prefieres fuentes modernas o clásicas?";
  }

  if (userMessageCount < 3) {
    return "¿Hay algo más que deba saber sobre tu marca? Por ejemplo, ¿quién es tu público objetivo o qué valores quieres transmitir?";
  }

  const closingResponses = [
    "Tengo toda la información que necesito. ¿Listo para generar tu branding? Haz clic en '✨ Generar Branding'",
    "Perfecto, tu marca suena muy interesante. ¿Quieres que genere las propuestas de branding ahora?",
    "¡Excelente! Con toda esta información podré crear un branding perfecto para ti. ¿Generamos las propuestas?",
  ];

  return closingResponses[Math.floor(Math.random() * closingResponses.length)];
}

function generateTagline(brandName: string, _description: string): string {
  const taglines = [
    `Innovación que transforma`,
    `Tu socio de confianza`,
    `Excelencia en cada detalle`,
    `Creatividad sin límites`,
    `Diseñado para ti`,
    `Calidad garantizada`,
    `El futuro de tu marca`,
  ];

  const index = Math.abs(brandName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % taglines.length;
  return taglines[index];
}

// ===== PROJECT MANAGEMENT (Via Backend) =====
export async function sendMessage(content: string, contextId: string = "default"): Promise<Message> {
  console.log(`💬 Enviando mensaje al backend... (Contexto: ${contextId})`);

  try {
    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content, contextId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Assuming the backend returns a Message object
    const messageResponse = await response.json();
    console.log('✅ Message sent and response received:', messageResponse);
    return messageResponse; // Return the actual message response
  } catch (error) {
    console.error('❌ Error sending message to backend:', error);
    // Fallback or error handling for sendMessage
    throw error; // Re-throw to indicate failure
  }
}

export async function saveProject(project: BrandProject): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });

    if (!response.ok) throw new Error('Error saving project to backend');

    // Al guardar, el backend devuelve el proyecto con las URLs de las imágenes actualizadas
    const savedProject = await response.json();
    console.log('✅ Project saved to backend:', savedProject.id);
  } catch (error) {
    console.error('❌ Error saving project:', error);
    // Fallback social to localStorage if backend fails
    const projects = await getProjects();
    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) projects[existingIndex] = project;
    else projects.push(project);
    localStorage.setItem('brandgen_projects', JSON.stringify(projects));
  }
}

export async function getProjects(): Promise<BrandProject[]> {
  try {
    const response = await fetch(`${BASE_URL}/projects`);
    if (!response.ok) throw new Error('Error fetching projects from backend');
    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    const stored = localStorage.getItem('brandgen_projects');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error deleting project from backend');
    console.log('✅ Project deleted from backend:', id);
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    const projects = (await getProjects()).filter(p => p.id !== id);
    localStorage.setItem('brandgen_projects', JSON.stringify(projects));
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== API KEY MANAGEMENT (UI Compatibility) =====
export function saveApiKey(apiKey: string): void {
  localStorage.setItem('brandgen_api_key', apiKey);
}

export function getApiKey(): string | null {
  return localStorage.getItem('brandgen_api_key');
}

export function deleteApiKey(): void {
  localStorage.removeItem('brandgen_api_key');
}
