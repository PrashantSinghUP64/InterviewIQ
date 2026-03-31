import { NextResponse } from "next/server";
import { generateGroqAnalysis } from "@/utils/groqClient";
import { db } from "@/utils/db";
import { StarStory } from "@/utils/schema";
import moment from "moment";

export async function POST(req) {
  try {
    const { storyTitle, rawStory, userEmail } = await req.json();

    if (!storyTitle || !rawStory || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = "You are an expert career coach and interview preparation specialist. Your job is to take raw, unorganized user stories and convert them into the perfect, highly impactful STAR method format (Situation, Task, Action, Result). Make the stories sound professional, confident, and highly structured, while preserving the user's authentic facts.";
    
    const prompt = `Here is a story about my experience. Please organize it into a powerful STAR method answer for behavioral interviews.

Story Title: ${storyTitle}
Raw Story: 
${rawStory}

Please use Markdown and format clearly with:
**Situation:** (Provide context, set the scene)
**Task:** (What was the challenge or objective?)
**Action:** (What specific steps did I take? Emphasize my contribution)
**Result:** (What was the outcome? Use metrics or strong qualitative results if implied, otherwise synthesize a strong conclusion)

Finally, include a short "Key Takeaway" sentence at the end.`;

    const groqResponse = await generateGroqAnalysis(prompt, systemPrompt);

    const newRecord = await db.insert(StarStory).values({
      storyTitle,
      rawStory,
      userEmail,
      starFormatted: groqResponse,
      createdAt: moment().format('DD-MM-YYYY'),
    }).returning({ id: StarStory.id });

    return NextResponse.json({ success: true, id: newRecord[0].id });

  } catch (error) {
    console.error("STAR Builder API Error:", error);
    return NextResponse.json({ error: "Failed to generate STAR story" }, { status: 500 });
  }
}
