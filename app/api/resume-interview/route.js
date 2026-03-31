import { NextResponse } from "next/server";
import { chatSession } from "@/utils/GeminiAIModal";

export async function POST(req) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText?.trim()) {
      return NextResponse.json({ success: false, error: "Resume text is required" }, { status: 400 });
    }

    const prompt = `You are an expert technical interviewer. A candidate has shared their resume. 
Analyze the resume and generate 5 targeted interview questions that probe their specific experiences, projects, and technical decisions mentioned.

RESUME:
${resumeText.substring(0, 3000)}

Generate questions that:
- Reference specific technologies, projects, or experiences from their resume
- Ask them to explain their technical decisions and trade-offs
- Include situational questions about real challenges they likely faced
- Probe leadership/impact if mentioned

Return ONLY a JSON array with this format (no markdown, no extra text):
[
  {
    "question": "Specific question referencing their resume",
    "answer": "What a strong candidate should answer, referencing the resume context"
  }
]`;

    const result = await chatSession.generateContent(prompt);
    const raw = await result.response.text();
    const cleaned = raw.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No valid JSON array in response");

    const questions = JSON.parse(match[0]);
    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Resume interview error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate questions" }, { status: 500 });
  }
}
