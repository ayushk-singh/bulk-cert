import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_KEY});

export async function POST(req: NextRequest) {
  try {
    const { feedbacks } = await req.json();

    if (!feedbacks || !Array.isArray(feedbacks) || feedbacks.length === 0) {
      return NextResponse.json(
        { error: "Invalid feedback data" },
        { status: 400 }
      );
    }

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are a student event feedback analyst. Analyze the following feedback collected after a college event and return structured data in JSON format. Your analysis should include:

1. Top Positive Comments (List 3–5 key points)
2. Main Complaints or Issues (List 3–5 key points)
3. Suggestions for Improvement (List 3–5 actionable items)
4. Overall Sentiment (Choose one: Positive, Neutral, or Negative)
5. Sentiment Distribution Chart Data:
   - Return percentage of feedback that is Positive, Neutral, or Negative in this format:
   {
     "Positive": 60,
     "Neutral": 25,
     "Negative": 15
   }
Format the full response as a JSON object only. Do not include any explanation or commentary. Input feedback:
---
${feedbacks.join("\n")}
---
`,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
