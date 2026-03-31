import { db } from "@/utils/db";
import { TopCompany } from "@/utils/schema";
import { NextResponse } from "next/server";
import { chatSession } from "@/utils/GeminiAIModal";
import { eq } from "drizzle-orm";

const STATIC_COMPANIES = [
  { name: "Google", category: "Big Tech", logoUrl: "G" },
  { name: "Amazon", category: "Big Tech", logoUrl: "A" },
  { name: "Microsoft", category: "Big Tech", logoUrl: "M" },
  { name: "Meta", category: "Big Tech", logoUrl: "M" },
  { name: "Apple", category: "Big Tech", logoUrl: "A" },
  { name: "Netflix", category: "Big Tech", logoUrl: "N" },
  { name: "TCS", category: "WITCH", logoUrl: "T" },
  { name: "Infosys", category: "WITCH", logoUrl: "I" },
  { name: "Wipro", category: "WITCH", logoUrl: "W" },
  { name: "HCLTech", category: "WITCH", logoUrl: "H" },
  { name: "Cognizant", category: "WITCH", logoUrl: "C" },
  { name: "Uber", category: "Unicorn", logoUrl: "U" },
  { name: "Airbnb", category: "Unicorn", logoUrl: "A" },
  { name: "Stripe", category: "FinTech", logoUrl: "S" },
  { name: "Paypal", category: "FinTech", logoUrl: "P" },
  { name: "Goldman Sachs", category: "FinTech", logoUrl: "G" },
  { name: "JPMorgan Chase", category: "FinTech", logoUrl: "J" },
  { name: "Flipkart", category: "Unicorn", logoUrl: "F" },
  { name: "Zomato", category: "Unicorn", logoUrl: "Z" },
  { name: "Swiggy", category: "Unicorn", logoUrl: "S" }
];

export async function GET(req) {
  try {
    let companies = await db.select().from(TopCompany);
    
    // Auto-seed if empty
    if (companies.length === 0) {
      await db.insert(TopCompany).values(STATIC_COMPANIES);
      companies = await db.select().from(TopCompany);
    }
    
    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error("Failed to fetch companies", error);
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    
    // Check if we already have the JSON parsed in DB
    const existing = await db.select().from(TopCompany).where(eq(TopCompany.name, name));
    if (existing[0]?.processJson) {
      return NextResponse.json({ success: true, data: JSON.parse(existing[0].processJson) });
    }

    // Generate with Groq
    const prompt = `Provide a brief JSON summary for the interview process at ${name}. 
      Return ONLY a JSON object exactly like this, no markdown formatting outsite of it:
      {
        "rounds": ["Round 1 summary", "Round 2 summary"],
        "techStack": "Primary programming languages and frameworks used.",
        "culture": "One sentence about their engineering culture.",
        "commonTopics": ["Topic 1", "Topic 2"]
      }`;
    
    const result = await chatSession.generateContent(prompt);
    const raw = await result.response.text();
    const match = raw.match(/\{[\s\S]*\}/);
    
    if (match) {
      const parsedString = match[0];
      await db.update(TopCompany).set({ processJson: parsedString }).where(eq(TopCompany.name, name));
      return NextResponse.json({ success: true, data: JSON.parse(parsedString) });
    }
    
    throw new Error("Invalid output from AI");
  } catch (error) {
    console.error("Failed to fetch insight", error);
    return NextResponse.json({ success: false, error: "Failed to fetch insight" }, { status: 500 });
  }
}
