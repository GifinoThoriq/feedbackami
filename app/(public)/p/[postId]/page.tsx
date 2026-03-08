import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import AvatarColor from "@/components/ui/avatar-color";
import { ArrowBigUpDash } from "lucide-react";
import { statusColorMap } from "@/lib/color";
import { cn } from "@/lib/utils";
import PublicCommentForm from "./PublicCommentForm";

interface IProps {
  params: Promise<{ postId: string }>;
}

export default async function PublicPostPage({ params }: IProps) {
  const { postId } = await params;
  const supabase = createClient(cookies());

  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (first_name, last_name, profile_color),
      post_tags (
        tags (id, name, color)
      ),
      status (id, name)
    `)
    .eq("id", postId)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles (first_name, last_name, profile_color)
    `)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  const { data: votes } = await supabase
    .from("votes")
    .select("id")
    .eq("post_id", postId);

  const tags = (post.post_tags ?? []).map((pt: any) => pt.tags).filter(Boolean);
  const voteCount = votes?.length ?? 0;
  const topLevelComments = (comments ?? []).filter((c: any) => !c.parent_id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-xl border bg-card shadow-sm">
          {/* Header */}
          <div className="border-b p-5 flex gap-4 items-center">
            <div className="flex flex-col items-center">
              <ArrowBigUpDash className="text-primary" />
              <span className="text-sm font-bold">{voteCount}</span>
            </div>
            <h1 className="font-semibold text-xl flex-1">{post.title}</h1>
            {post.status && (() => {
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

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
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

          {/* Comments */}
          {topLevelComments.length > 0 && (
            <div className="border-t px-5 py-4 space-y-4">
              <h2 className="text-sm font-semibold">Comments</h2>
              {topLevelComments.map((c: any) => {
                const displayName = c.profiles
                  ? `${c.profiles.first_name} ${c.profiles.last_name}`
                  : c.guest_name ?? "Anonymous";
                return (
                  <div key={c.id} className="flex items-start gap-2">
                    {c.profiles ? (
                      <AvatarColor
                        profile_color={c.profiles.profile_color}
                        first_name={c.profiles.first_name[0]}
                        last_name={c.profiles.last_name[0]}
                        size="small"
                      />
                    ) : (
                      <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {displayName[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{displayName}</p>
                      <p className="text-sm text-muted-foreground">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Comment form */}
          <div className="border-t p-2">
            <PublicCommentForm postId={postId} />
          </div>
        </div>
      </div>
    </div>
  );
}
