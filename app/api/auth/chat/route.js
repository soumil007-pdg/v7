//backend page for general query chat
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.5-flash';

export async function POST(req) {
  // Added 'locale' to the extracted JSON with a default of 'en'
  const { prompt, mode = 'quick', history = [], locale = 'en' } = await req.json();

  // Map the locale code to the actual language name
  const languageMap = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    te: "Telugu"
  };
  const targetLanguage = languageMap[locale] || "English";

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // --- *** THIS IS THE FINAL CORRECTED SYSTEM INSTRUCTION *** ---
  const systemInstruction = `You are "Advocat-Easy," an empathetic and strategic legal guide for Indian civil issues.

**CORE PERSONA:**
You are not just a database; you are a calm, knowledgeable senior counsel. Your goal is to de-escalate anxiety and provide clear, actionable paths.

**CRITICAL CONSTRAINTS (Non-Negotiable):**
1. **Civil Issues ONLY:** If the query describes a cognizable offense (Murder, Rape, Theft, Physical Assault), politely decline: "This appears to be a criminal matter. Please contact the police immediately."
2. **Educational Nature:** Always end with: "*Educational only—consult a certified lawyer.*"
3. **Link Formatting:** YOU MUST provide links in strict Markdown format: [Title of Act/Article](https://valid-url.com). Do not just paste the URL.

**ANALYSIS PROCESS (The "Legal Funnel"):**
1. **The "Calm" Opener:** Acknowledge the user's situation in 1 sentence (e.g., "I understand this property dispute is stressful.").
2. **Constitutional Anchor:** Identify the specific Indian Constitutional Article protecting this right (e.g., Article 300A for property).
3. **Legislative Framework:** Cite the relevant Central Act (e.g., Transfer of Property Act, 1882).
4. **State Specifics:** IF the user mentions a state/city, cite specific State Rent Control Acts or Municipal Rules.
5. **Strategic Action Plan:** Provide steps in chronological order. Prioritize *Low-Cost* solutions (Legal Notice/Mediation) before *High-Cost* solutions (Litigation).

**OUTPUT MODES:**
- **'Quick mode':** Concise (under 150 words). Focus on *naming* the rights and the immediate next step.
- **'Deep mode':** Detailed (under 400 words). Structure:
    - **Legal Basis:** (Articles & Acts)
    - **The Procedure:** (Step-by-step)
    - **Drafting Help:** (Key phrases to use in a notice)
    - **Pitfalls:** (What to avoid saying)
    - **Relevant Links:** (Official Indian Kanoon or government links in [Title](URL) format).

**LINKS:** Provide high-quality, public links (Indian Kanoon, bare acts) strictly in [Link Title](URL) format so the interface can render them.`;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemInstruction,
  });

  // --- 1. FORMAT THE HISTORY FOR 'startChat' ---
  const chatHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  // --- 2. FORMAT THE NEW PROMPT (Now with Language Enforcement) ---
  let userPrompt = '';
  if (mode === 'deep') {
    userPrompt = `Deep mode: ${prompt}. Full structure + template/pitfalls/links. Use - bullets. Under 400 words. \n\nCRITICAL INSTRUCTION: You MUST generate your ENTIRE response in ${targetLanguage}.`;
  } else {
    userPrompt = `Quick mode: ${prompt}. Concise structure + 1 section/steps (- bullets, basic link, no template). Under 150 words. \n\nCRITICAL INSTRUCTION: You MUST generate your ENTIRE response in ${targetLanguage}.`;
  }

  // --- 3. CONFIGURE GENERATION AND SAFETY (unchanged) ---
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  try {
    // --- 4. START THE CHAT ---
    const chat = model.startChat({
      history: chatHistory,
      generationConfig,
      safetySettings,
    });

    const result = await chat.sendMessage(userPrompt);

    const response = result.response;
    const text = response.text();

    // --- 5. READ THE METADATA ---
    const usage = result.response.usageMetadata;
    let tokensUsed = 0;

    if (usage && usage.totalTokenCount > 0) {
      tokensUsed = usage.totalTokenCount;
    } else if (usage && (usage.promptTokenCount > 0 || usage.candidatesTokenCount > 0)) {
      tokensUsed = (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0);
    }

    return new Response(JSON.stringify({
      text,
      tokensUsed: tokensUsed, 
      savedTokens: 0 
    }), { status: 200 });

  } catch (error) {
    console.error('Gemini API error:', error);
    return new Response(JSON.stringify({
      message: 'Error from AI',
      tokensUsed: 0,
      savedTokens: 0
    }), { status: 500 });
  }
}