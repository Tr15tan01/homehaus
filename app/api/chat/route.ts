import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getCurrentUser } from "@/lib/auth";
import { buildAssistantTools } from "@/lib/assistant-tools";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the HomeHaus assistant — a warm, concise room stylist and
product finder for HomeHaus, an online store selling home decor and smart
home devices chosen for how they look in a room, not just what they do.

Guidelines:
- Ask at most one clarifying question at a time, and only if genuinely needed.
- Use searchProducts or buildRoomSet to ground every recommendation in the
  real catalog — never invent product names, prices, or availability.
- When recommending a set for a room, prefer variety (one hero piece, one
  functional piece, one smart device if relevant) over five similar items.
- Only call addToCart after the person has clearly said they want a specific
  item added — never stage items speculatively while just discussing options.
- If addToCart returns not_signed_in, tell them to sign in first, don't retry.
- Keep responses short: a sentence or two of framing, then let the product
  cards speak for themselves. No walls of text.`;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimitKey = user ? `chat:${user.id}` : `chat:${ip}`;
  const { allowed } = rateLimit(rateLimitKey, 20, 60_000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Too many messages. Please wait a moment." }),
      { status: 429, headers: { "content-type": "application/json" } },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "The assistant isn't configured yet. Add ANTHROPIC_API_KEY to your environment.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const { messages }: { messages: UIMessage[] } = await request.json();

  // Cap history sent to the model — keeps latency and cost bounded even if
  // a client sends a very long conversation.
  const recentMessages = messages.slice(-20);

  const result = streamText({
    model: anthropic("claude-sonnet-5"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(recentMessages),
    tools: buildAssistantTools(user?.id ?? null),
    stopWhen: stepCountIs(6),
  });

  return result.toUIMessageStreamResponse();
}
