import { NextResponse } from "next/server";
import { chatSession } from "@/utils/GeminiAIModal";

export async function POST(req) {
  try {
    const { company, experience } = await req.json();

    const prompt = `You are a senior HR interviewer at ${company}. 
Generate 5 pure behavioural interview questions for a ${experience} level candidate applying to ${company}.

Requirements:
- Focus ONLY on behavioural/situational questions (NO technical or coding questions)
- Questions must be relevant to ${company}'s culture, values, and mission
- Include classic HR questions: motivation, teamwork, conflict, leadership, failure, growth
- Vary the difficulty based on experience: "${experience}"
- For freshers: simpler situational questions about college/internships
- For experienced: deeper leadership, impact, and decision-making questions
- Make the model answer a guide for what a STAR-format response should cover

Return ONLY a JSON array (no markdown, no extra text):
[
  {
    "question": "Behavioural question tailored to ${company}",
    "answer": "Strong STAR-format answer guide covering: Situation, Task, Action, Result"
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
    console.error("HR interview error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate HR questions" }, { status: 500 });
  }
}
