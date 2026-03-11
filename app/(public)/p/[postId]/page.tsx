import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AvatarColor from "@/components/ui/avatar-color";
import { statusColorMap } from "@/lib/color";
import { cn } from "@/lib/utils";
import PublicCommentThread from "./PublicCommentThread";
import PublicVoteButton from "./PublicVoteButton";
import PublicNavbar from "./PublicNavbar";

interface IProps {
  params: Promise<{ postId: string }>;
}

export default async function PublicPostPage({ params }: IProps) {
  const { postId } = await params;
  const supabase = createClient(cookies());

  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles (first_name, last_name, profile_color),
      post_tags (
        tags (id, name, color)
      ),
      status (id, name)
    `
    )
    .eq("id", postId)
    .single();

  if (!post) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Own post → redirect to dashboard with this post pre-selected
  if (user && post.user_id === user.id) {
    redirect(`/dashboard/feedback?postId=${postId}`);
  }

  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      profiles (first_name, last_name, profile_color)
    `
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const { data: votes } = await supabase
    .from("votes")
    .select("id")
    .eq("post_id", postId);

  // Auth non-owner: fetch profile and check if they voted
  let profile = null;
  let userHasVoted = false;
  if (user) {
    const [{ data: profileData }, { data: myVote }] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name, profile_color")
        .eq("id", user.id)
        .single(),
      supabase
        .from("votes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    profile = profileData;
    userHasVoted = !!myVote;
  }

  const tags = (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean);
  const voteCount = votes?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {user && profile && <PublicNavbar profile={profile} />}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-xl border bg-card shadow-sm">
          {/* Header */}
          <div className="border-b p-5 flex gap-4 items-center">
            <PublicVoteButton
              postId={postId}
              initialCount={voteCount}
              isAuthenticated={!!user}
              initialHasVoted={userHasVoted}
            />
            <div className="flex grow items-start justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="font-semibold text-xl flex-1">{post.title}</h1>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {post.status &&
                (() => {
                  const color = statusColorMap[post.status.name];
                  return (
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0",
                        color
                          ? `${color.bg} ${color.text} ${color.border}`
                          : "text-muted-foreground"
                      )}
                    >
                      {post.status.name}
                    </span>
                  );
                })()}
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="flex items-start gap-3">
              <AvatarColor
                profile_color={post.profiles.profile_color}
                first_name={post.profiles.first_name[0]}
                last_name={post.profiles.last_name[0]}
                size="small"
              />
              <div>
                <p className="text-sm font-semibold">
                  {post.profiles.first_name} {post.profiles.last_name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {post.details ?? "No additional details."}
                </p>
              </div>
            </div>
          </div>

          <PublicCommentThread postId={postId} initialComments={comments ?? []} />
        </div>
      </div>
    </div>
  );
}
