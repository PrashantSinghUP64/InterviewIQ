import { NextResponse } from "next/server";
import { generateGroqAnalysis } from "@/utils/groqClient";
import { db } from "@/utils/db";
import { InterviewDebrief } from "@/utils/schema";
import moment from "moment";

export async function POST(req) {
  try {
    const { companyName, role, questionsAsked, userEmail } = await req.json();

    if (!companyName || !questionsAsked || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = "You are an expert tech recruiter, a senior engineer, and a career coach. Given the questions asked in a real interview, provide a highly structured, critical, and actionable preparation plan for the next round. Focus on identifying the core themes tested and suggest specific study topics.";
    
    const prompt = `I just had a real interview at ${companyName} for the role of ${role}.
Here are the questions they asked me:
${questionsAsked}

Please provide a detailed 'Next Round Preparation Plan'. 
Use Markdown formatting. Include:
1. Core Themes Tested (What skills are they actually checking?)
2. Suggested Study Topics for Next Round
3. 3 Mock Questions they might ask next based on this trajectory.`;

    const groqResponse = await generateGroqAnalysis(prompt, systemPrompt);

    const newRecord = await db.insert(InterviewDebrief).values({
      companyName,
      role,
      questionsAsked,
      userEmail,
      groqAnalysis: groqResponse,
      createdAt: moment().format('DD-MM-YYYY'),
    }).returning({ id: InterviewDebrief.id });

    return NextResponse.json({ success: true, id: newRecord[0].id });

  } catch (error) {
    console.error("Debrief API Error:", error);
    return NextResponse.json({ error: "Failed to generate debrief" }, { status: 500 });
  }
}
