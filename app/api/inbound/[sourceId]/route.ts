import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  const { sourceId } = await params;
  const supabase = createServiceClient();

  // Validate Authorization header
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  const { data: source, error } = await supabase
    .from("inbound_sources")
    .select("id, board_id, source_type, secret_token")
    .eq("id", sourceId)
    .maybeSingle();

  if (error || !source || source.secret_token !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  // Slack URL verification challenge
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Slack message event
  if (body.type === "event_callback" && body.event?.type === "message") {
    const event = body.event;
    if (!event.text) return NextResponse.json({ ok: true });

    await supabase.from("raw_feedback").insert({
      source_id: source.id,
      board_id: source.board_id,
      content: event.text,
      author: event.user ?? null,
      platform_message_id: event.ts ?? null,
    });

    return NextResponse.json({ ok: true });
  }

  // Discord / Custom — expect { content, author? }
  const content: string = body.content ?? body.text ?? "";
  if (!content.trim()) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  await supabase.from("raw_feedback").insert({
    source_id: source.id,
    board_id: source.board_id,
    content: content.trim(),
    author: body.author ?? body.username ?? null,
    platform_message_id: body.id ?? null,
  });

  return NextResponse.json({ ok: true });
}
