import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY must be set in .env" },
      { status: 503 }
    );
  }

  const { name, brand, model, category } = await req.json();

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: "web_search_20250305", name: "web_search" } as any],
    messages: [
      {
        role: "user",
        content: `Search YouTube for a hands-on demo, unboxing, or walkthrough video for this production equipment:

Name: ${name}
Brand: ${brand}
Model: ${model}
Category: ${category}

Requirements:
- Must be a real, specific video (demo, hands-on, unboxing, review, tutorial — NOT a promo trailer or ad)
- Prefer the manufacturer's official YouTube channel first, then reputable reviewers (e.g. B&H Photo, Adorama, Cinema5D, DSLR Video Shooter, Gerald Undone)
- The video should actually show the product being used or explained

Search for something like: "${brand} ${model} demo" or "${name} hands-on" or "${name} unboxing"

Reply with ONLY a JSON object — no other text:
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID", "title": "video title", "channel": "channel name" }`,
      },
    ],
  });

  // Extract the final text block (after Claude has searched and decided)
  const textBlock = response.content.findLast((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "No result from Claude" }, { status: 500 });
  }

  try {
    const match = textBlock.text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("No JSON found");
    const json = JSON.parse(match[0]);
    const videoId = extractVideoId(json.url);
    if (!videoId) throw new Error("Could not parse video ID");
    return NextResponse.json({ videoId, title: json.title, channelTitle: json.channel });
  } catch {
    return NextResponse.json({ error: "Could not parse a video URL from the response" }, { status: 500 });
  }
}
