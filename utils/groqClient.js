import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateGroqAnalysis(prompt, systemPrompt = "You are an expert tech recruiter and interview coach.") {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2048,
    });
    
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error("Failed to generate analysis from Groq.");
  }
}
