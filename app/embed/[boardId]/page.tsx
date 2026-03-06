import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import EmbedFeedback from "./components/EmbedFeedback";

interface IProps {
  params: Promise<{ boardId: string }>;
}

export default async function EmbedPage({ params }: IProps) {
  const { boardId } = await params;
  const supabase = createClient(cookies());

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (first_name, last_name, profile_color)
    `)
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  const { data: votes } = await supabase
    .from("votes")
    .select("id, post_id")
    .in("post_id", (posts ?? []).map((p: any) => p.id));

  return (
    <EmbedFeedback
      posts={posts ?? []}
      initialVotes={votes ?? []}
      boardId={boardId}
    />
  );
}
