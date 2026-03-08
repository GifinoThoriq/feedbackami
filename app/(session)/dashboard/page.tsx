import { getBoards } from "@/app/actions/boardActions";
import { getMyPosts } from "@/app/actions/postActions";
import { getStatus } from "@/app/actions/statusActions";
import { statusColorMap } from "@/lib/color";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";
import Link from "next/link";
import { MessageSquare, ThumbsUp, FileText, LayoutGrid } from "lucide-react";

export default async function Dashboard() {
  const [boards, posts, statuses] = await Promise.all([
    getBoards(),
    getMyPosts(),
    getStatus(),
  ]);

  const postIds = posts.map((p) => p.id);

  let votesByPost: Record<string, number> = {};
  let commentsByPost: Record<string, number> = {};

  if (postIds.length > 0) {
    const supabase = createClient(cookies());
    const [votesRes, commentsRes] = await Promise.all([
      supabase.from("votes").select("post_id").in("post_id", postIds),
      supabase.from("comments").select("post_id").in("post_id", postIds),
    ]);

    for (const row of votesRes.data ?? []) {
      votesByPost[row.post_id] = (votesByPost[row.post_id] ?? 0) + 1;
    }
    for (const row of commentsRes.data ?? []) {
      commentsByPost[row.post_id] = (commentsByPost[row.post_id] ?? 0) + 1;
    }
  }

  const statusById = Object.fromEntries(statuses.map((s) => [s.id, s]));
  const boardById = Object.fromEntries(boards.map((b) => [b.id, b]));

  const totalVotes = Object.values(votesByPost).reduce((a, b) => a + b, 0);
  const totalComments = Object.values(commentsByPost).reduce((a, b) => a + b, 0);

  const postsByStatus: Record<string, number> = {};
  for (const post of posts) {
    if (post.status_id) {
      const name = statusById[post.status_id]?.name;
      if (name) postsByStatus[name] = (postsByStatus[name] ?? 0) + 1;
    }
  }

  const topPosts = [...posts]
    .sort((a, b) => (votesByPost[b.id] ?? 0) - (votesByPost[a.id] ?? 0))
    .slice(0, 5);

  const recentPosts = [...posts]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  const boardsWithCount = boards.map((board) => ({
    ...board,
    postCount: posts.filter((p) => p.board_id === board.id).length,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-bold text-3xl">Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          A summary of your boards and feedback.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<FileText className="size-4" />} label="Total Posts" value={posts.length} />
        <StatCard icon={<ThumbsUp className="size-4" />} label="Total Votes" value={totalVotes} />
        <StatCard icon={<MessageSquare className="size-4" />} label="Total Comments" value={totalComments} />
        <StatCard icon={<LayoutGrid className="size-4" />} label="Boards" value={boards.length} />
      </div>

      {/* Posts by Status */}
      {Object.keys(postsByStatus).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Posts by Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(postsByStatus).map(([name, count]) => {
              const colors = statusColorMap[name];
              return (
                <span
                  key={name}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
                    colors?.bg,
                    colors?.text,
                    colors?.border
                  )}
                >
                  {name} · {count}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {/* Top Posts by Votes */}
      {topPosts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Top Posts by Votes
          </h2>
          <div className="rounded-lg border divide-y">
            {topPosts.map((post) => {
              const status = post.status_id ? statusById[post.status_id] : null;
              const board = boardById[post.board_id];
              const colors = status ? statusColorMap[status.name] : null;
              return (
                <Link
                  key={post.id}
                  href="/dashboard/feedback"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {board?.name ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    {status && colors && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-medium",
                          colors.bg,
                          colors.text,
                          colors.border
                        )}
                      >
                        {status.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ThumbsUp className="size-3" />
                      {votesByPost[post.id] ?? 0}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Recent Posts
          </h2>
          <div className="rounded-lg border divide-y">
            {recentPosts.map((post) => {
              const status = post.status_id ? statusById[post.status_id] : null;
              const board = boardById[post.board_id];
              const colors = status ? statusColorMap[status.name] : null;
              const date = new Date(post.created_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              );
              return (
                <Link
                  key={post.id}
                  href="/dashboard/feedback"
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {board?.name ?? "—"} · {date}
                    </p>
                  </div>
                  {status && colors && (
                    <span
                      className={cn(
                        "ml-4 shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium",
                        colors.bg,
                        colors.text,
                        colors.border
                      )}
                    >
                      {status.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Your Boards */}
      <section>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Your Boards
        </h2>
        {boardsWithCount.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No boards yet.{" "}
            <Link href="/dashboard/board" className="text-primary underline">
              Create one
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boardsWithCount.map((board) => (
              <Link
                key={board.id}
                href={`/dashboard/feedback?board=${board.id}`}
                className="rounded-lg border px-4 py-4 hover:bg-muted/50 transition-colors flex flex-col gap-1"
              >
                <p className="font-medium text-sm">{board.name}</p>
                <p className="text-xs text-muted-foreground">
                  {board.postCount} {board.postCount === 1 ? "post" : "posts"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border px-4 py-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
