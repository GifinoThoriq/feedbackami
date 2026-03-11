"use server";

import { getBoards } from "@/app/actions/boardActions";
import { getStatus } from "@/app/actions/statusActions";
import { getMyPosts } from "@/app/actions/postActions";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import FeedbackPageClient from "./components/FeedbackPageClient";

export default async function Feedback({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string }>;
}) {
  const supabase = createClient(cookies());
  const { postId } = await searchParams;

  const [boards, status, feedback, { data: auth }] = await Promise.all([
    getBoards(),
    getStatus(),
    getMyPosts(),
    supabase.auth.getUser(),
  ]);

  return (
    <FeedbackPageClient
      boards={boards}
      statuses={status}
      feedback={feedback}
      author={auth.user}
      initialPostId={postId}
    />
  );
}
