"use server";

import { IPost } from "@/interface/post.interface";
import { createClient } from "@/lib/supabase/server";
import { createPostSchema } from "@/lib/validation/post";
import { cookies } from "next/headers";

function buildWebhookBody(
  integration: { type: string; webhook_url: string },
  boardId: string,
  boardName: string,
  post: { id: string; title: string; details: string | null; created_at: string }
): object {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const postLink = `${siteUrl}/p/${post.id}`;

  if (integration.type === "discord") {
    return {
      username: "Feedbackami",
      embeds: [
        {
          title: `📬 New Feedback — ${boardName}`,
          description: post.title,
          color: 0x55adfe,
          fields: post.details ? [{ name: "Details", value: post.details }] : [],
          timestamp: post.created_at,
          url: postLink,
        },
      ],
    };
  } else if (integration.type === "slack") {
    return {
      text: `New feedback on *${boardName}*`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*New Feedback — ${boardName}*\n*${post.title}*${
              post.details ? `\n${post.details}` : ""
            }\n<${postLink}|View post>`,
          },
        },
      ],
    };
  } else {
    return {
      event: "new_post",
      board_id: boardId,
      post: {
        id: post.id,
        title: post.title,
        details: post.details,
        created_at: post.created_at,
        link: postLink,
      },
    };
  }
}

async function fireWebhook(
  boardId: string,
  post: {
    id: string;
    title: string;
    details: string | null;
    created_at: string;
  },
  boardName: string
) {
  const supabase = createClient(cookies());

  // Fetch board-specific and global integrations in parallel
  const [{ data: boardIntegration }, { data: globalIntegration }] = await Promise.all([
    supabase.from("board_integrations").select("*").eq("board_id", boardId).maybeSingle(),
    supabase.from("board_integrations").select("*").is("board_id", null).maybeSingle(),
  ]);

  const integrations = [boardIntegration, globalIntegration].filter(Boolean);
  if (integrations.length === 0) return;

  for (const integration of integrations) {
    const body = buildWebhookBody(integration!, boardId, boardName, post);
    fetch(integration!.webhook_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }
}

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

export async function savePost(values: any): Promise<ActionResult> {
  const parsed = createPostSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid Data",
    };
  }

  const supabase = createClient(cookies());

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: inserted, error } = await supabase
    .from("posts")
    .insert([
      {
        board_id: parsed.data.board_id,
        title: parsed.data.title,
        details: parsed.data.details,
        user_id: user.id,
      },
    ])
    .select("id, title, details, created_at")
    .single();

  if (error) return { ok: false, error: error.message };

  if (inserted) {
    const { data: board } = await supabase
      .from("board")
      .select("name")
      .eq("id", parsed.data.board_id)
      .single();
    fireWebhook(parsed.data.board_id, inserted, board?.name ?? "Board");
  }

  return { ok: true, id: inserted!.id };
}

export async function getMyPosts(): Promise<IPost[]> {
  const supabase = createClient(cookies());

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles (
        first_name,
        last_name,
        profile_color
      ),
      post_tags (
        tags (
          id,
          name,
          color,
          user_id
        )
      ),
      comments(
      count
      )
    `
    )
    .eq("user_id", user.id);

  if (error) throw error;

  return data.map((post: any) => ({
    ...post,
    tags: (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean),
    comment_count: post.comments?.[0]?.count ?? 0,
  }));
}

export async function updatePostStatus(
  postId: string,
  statusId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("posts")
    .update({ status_id: statusId })
    .eq("id", postId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: postId };
}

export async function updatePostBoard(
  postId: string,
  boardId: string
): Promise<ActionResult> {
  const supabase = createClient(cookies());

  const { error } = await supabase
    .from("posts")
    .update({ board_id: boardId })
    .eq("id", postId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: boardId };
}
