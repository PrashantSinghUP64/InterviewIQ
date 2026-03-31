import { NextResponse } from "next/server";
import { generateGroqAnalysis } from "@/utils/groqClient";

export async function POST(req) {
  try {
    const { weakAnswers, userEmail } = await req.json();

    if (!weakAnswers || !weakAnswers.length || !userEmail) {
      return NextResponse.json({ error: "No weak areas detected or missing data." }, { status: 400 });
    }

    const unrolledWeaknesses = weakAnswers.map((w, index) => {
      return `Weakness ${index + 1}: Question: "${w.question}" | Score: ${w.rating}/10 | Feedback Received: "${w.feedback}"`;
    }).join('\n\n');

    const systemPrompt = "You are an expert career coach. Your task is to analyze a candidate's lowest-scoring interview answers and generate a specialized, highly actionable 3-day practice plan to fix these specific weaknesses.";
    
    const prompt = `Here are the candidate's worst performing answers from recent mock interviews:
    
${unrolledWeaknesses}

Please provide a "3-Day Weak Area Practice Plan" in Markdown. 
Format:
**Day 1: Concept Review & Reconstruction**
[What should the candidate study based on these specific weaknesses?]

**Day 2: Drilling & Structuring**
[How should they structure answers better for these types of questions?]

**Day 3: Application & Mock Scenarios**
[Give them 3 new, similar questions to practice and exactly what to focus on.]`;

    const groqResponse = await generateGroqAnalysis(prompt, systemPrompt);

    return NextResponse.json({ success: true, plan: groqResponse });
  } catch (error) {
    console.error("Weak Area API Error:", error);
    return NextResponse.json({ error: "Failed to generate weak area plan" }, { status: 500 });
  }
}
