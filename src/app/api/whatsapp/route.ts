import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { anthropic, SALON_SYSTEM_PROMPT } from "@/lib/claude";
import { supabase } from "@/lib/supabase";
import type { Json } from "@/types/database";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

type Message = { role: "user" | "assistant"; content: string };

// GET: Twilio webhook verification
export async function GET(req: NextRequest) {
  return new NextResponse("OK", { status: 200 });
}

// POST: Incoming WhatsApp message
export async function POST(req: NextRequest) {
  const body = await req.formData();
  const from = body.get("From") as string; // e.g. "whatsapp:+971501234567"
  const text = body.get("Body") as string;
  const phone = from?.replace("whatsapp:", "");

  if (!phone || !text) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  try {
    // Get or create conversation
    const { data: existing } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .eq("phone", phone)
      .single();

    const history: Message[] = existing ? (existing.messages as Message[]) : [];

    // Look up client by WhatsApp number
    const { data: client } = await supabase
      .from("clients")
      .select("id, name, language_preference")
      .or(`whatsapp.eq.${phone},phone.eq.${phone}`)
      .single();

    // Build personalised system prompt
    const systemPrompt = client
      ? `${SALON_SYSTEM_PROMPT}\n\nYou are speaking with ${client.name}. Preferred language: ${client.language_preference === "ar" ? "Arabic" : "English"}.`
      : SALON_SYSTEM_PROMPT;

    // Add user message to history
    const messages: Message[] = [...history, { role: "user", content: text }];

    // Get AI response
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    });

    const reply = (response.content[0] as { type: string; text: string }).text;

    // Add assistant reply to history (keep last 20 messages)
    const updatedMessages: Message[] = ([...messages, { role: "assistant" as const, content: reply }] as Message[]).slice(-20);

    // Upsert conversation
    await supabase.from("whatsapp_conversations").upsert({
      phone,
      client_id: client?.id || null,
      messages: updatedMessages as unknown as Json,
      last_message_at: new Date().toISOString(),
      status: "active",
    }, { onConflict: "phone" });

    // Send WhatsApp reply via Twilio
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: from,
      body: reply,
    });

    return new NextResponse("OK", { status: 200 });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
