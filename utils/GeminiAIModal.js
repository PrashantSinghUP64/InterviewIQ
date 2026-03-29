const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", //added 2.0 flash
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
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
  }
];

// Export the existing chatSession
export const chatSession = model.startChat({
  generationConfig,
  safetySettings,
});

// Add this function to create new chat sessions
export const getChatSession = () => {
  return model.startChat({
    generationConfig,
    safetySettings,
  });
};

/* ═══════════════════════════════════════════════════════════════════════════
   GEMINI RATE LIMIT RETRY WRAPPER
═══════════════════════════════════════════════════════════════════════════ */
export async function callGeminiWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Use dynamic chat session to avoid state sharing conflicts
      const session = getChatSession();
      const result = await session.sendMessage(prompt);
      return result;
    } catch (error) {
      console.warn(`Gemini API failed (Attempt ${i + 1}/${retries}). Retrying...`, error);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, 2000 * (i + 1))); // Exponential backoff (2s, 4s...)
      } else {
        throw error;
      }
    }
  }
}
