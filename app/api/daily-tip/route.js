import { NextResponse } from "next/server";
import { generateGroqAnalysis } from "@/utils/groqClient";

export async function GET() {
  try {
    const systemPrompt = "You are an expert career coach. Provide exactly one short, actionable interview tip. DO NOT use introductory phrases, markdown formatting, emojis, or bullet points. Just the pure text tip.";
    const prompts = [
      "Give me a short interview tip focused purely on body language.",
      "Give me a short interview tip focused purely on structuring behavioral answers.",
      "Give me a short interview tip about avoiding common technical interview mistakes.",
      "Give me a short interview tip about negotiating salary or asking questions at the end.",
      "Give me a psychological hack for appearing extra confident in a job interview."
    ];
    // Randomize the prompt slightly so we get good variety every day
    const randomTopic = prompts[Math.floor(Math.random() * prompts.length)];

    const groqResponse = await generateGroqAnalysis(randomTopic, systemPrompt);

    return NextResponse.json({ success: true, tip: groqResponse.trim() });
  } catch (error) {
    console.error("Daily Tip API Error:", error);
    return NextResponse.json({ error: "Failed to generate daily tip" }, { status: 500 });
  }
}
