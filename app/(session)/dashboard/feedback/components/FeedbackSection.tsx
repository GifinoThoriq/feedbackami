"use client";

import { PostForm } from "@/components/dashboard/feedback/PostForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { IBoard } from "@/interface/board.interface";
import { IPost } from "@/interface/post.interface";
import {
  ArrowBigUp,
  ArrowBigUpDash,
  ArrowUpIcon,
  Link2,
  MessageSquare,
  PencilIcon,
  PlusIcon,
  Search,
  Tag,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface IProps {
  feedback: IPost[];
  boards: IBoard[];
}

const toDate = (value: string | Date) => {
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatAbsoluteDate = (value: string | Date) => {
  const date = toDate(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatRelativeTime = (value: string | Date) => {
  const date = toDate(value);
  const diff = Date.now() - date.getTime();
  if (!Number.isFinite(diff)) return "Just now";

  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(days / 365);
  return `${years}y ago`;
};

export default function FeedbackSection({ feedback, boards }: IProps) {
  const [isOpenModalPost, setIsOpenModalPost] = useState(false);
  const [listFilter, setListFilter] = useState<"default" | "trending">(
    "default"
  );
  const [searchValue, setSearchValue] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    feedback[0]?.id ?? null
  );

  const boardLookup = useMemo(
    () =>
      boards.reduce<Record<string, IBoard>>((acc, board) => {
        acc[board.id] = board;
        return acc;
      }, {}),
    [boards]
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    const sorted = [...feedback].sort((a, b) => {
      const aDate = new Date(
        listFilter === "trending" ? a.updated_at : a.created_at
      ).getTime();
      const bDate = new Date(
        listFilter === "trending" ? b.updated_at : b.created_at
      ).getTime();
      return bDate - aDate;
    });

    if (!normalizedQuery) return sorted;

    return sorted.filter((post) => {
      const boardName =
        boardLookup[post.board_id]?.name?.toLowerCase() ?? "unknown";
      const detailMatch =
        post.details?.toLowerCase().includes(normalizedQuery) ?? false;
      return (
        post.title.toLowerCase().includes(normalizedQuery) ||
        boardName.includes(normalizedQuery) ||
        detailMatch
      );
    });
  }, [boardLookup, feedback, listFilter, searchValue]);

  useEffect(() => {
    if (!filteredPosts.length) {
      if (selectedPostId !== null) setSelectedPostId(null);
      return;
    }

    if (
      !selectedPostId ||
      !filteredPosts.some((post) => post.id === selectedPostId)
    ) {
      setSelectedPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, selectedPostId]);

  const selectedPost =
    filteredPosts.find((post) => post.id === selectedPostId) ?? null;

  const selectedBoardName = selectedPost
    ? boardLookup[selectedPost.board_id]?.name ?? "Unassigned board"
    : "Select a post";

  const publicLink = selectedPost
    ? `https://feedbackami.app/p/${selectedPost.id}`
    : "";

  return (
    <>
      <PostForm
        open={isOpenModalPost}
        onOpenChange={setIsOpenModalPost}
        boards={boards}
      />
      {feedback.length > 0 ? (
        <>
          <aside className="col-span-3 flex flex-col border-r bg-background">
            <div className="border-b px-4 py-3 space-y-3">
              <div className="flex gap-2 items-center w-full">
                <div className="relative basis-11/12">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Search posts"
                    className="p-2 pl-9 text-sm rounded border border-gray-30 w-full"
                  />
                </div>

                <Button
                  className="rounded basis-1/12"
                  onClick={() => setIsOpenModalPost(true)}
                >
                  <PencilIcon />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={listFilter === "default" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setListFilter("default")}
                >
                  Default
                </Button>
                <Button
                  variant={listFilter === "trending" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setListFilter("trending")}
                >
                  <TrendingUp className="size-3.5" />
                  Trending
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              {filteredPosts.length ? (
                <ul className="space-y-2">
                  {filteredPosts.map((post) => {
                    const boardName =
                      boardLookup[post.board_id]?.name ?? "Unknown board";

                    return (
                      <li key={post.id}>
                        <button
                          onClick={() => setSelectedPostId(post.id)}
                          className={cn(
                            "w-full rounded-xl border px-3 py-3 text-left transition hover:border-primary/50 hover:bg-primary/5",
                            selectedPostId === post.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-transparent bg-muted/30"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">
                                {post.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {boardName} ·{" "}
                                {formatRelativeTime(post.created_at)}
                              </p>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {post.details ?? "No details yet."}
                          </p>
                          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3.5" />0
                            </span>
                            <span>
                              Updated {formatAbsoluteDate(post.updated_at)}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  No posts match your filters.
                </div>
              )}
            </div>
          </aside>
          <main className="col-span-7 flex flex-col bg-muted/10">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {selectedPost ? (
                <div>
                  <section className="rounded-md bg-card mb-6 border">
                    <div className="border-b p-4 flex gap-4 items-center">
                      <div className="flex flex-col items-center">
                        <ArrowBigUpDash className="text-primary" />
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <h5 className="font-medium text-lg">
                        {selectedPost.title}
                      </h5>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Details
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {selectedPost.details ??
                          "This post does not have additional details yet. Add a description so everyone has context."}
                      </p>
                    </div>

                    <div className="rounded-2xl border bg-muted/20 p-5">
                      <h4 className="text-sm font-semibold">Leave a comment</h4>
                      <Textarea
                        placeholder="Share feedback with your team..."
                        className="mt-3"
                        rows={3}
                      />
                      <div className="mt-3 flex justify-end">
                        <Button size="sm">Send</Button>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                      <h3 className="text-sm font-semibold">Tags</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Organize posts by theme or squads.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                      >
                        <Tag className="size-4" />
                        Add tag
                      </Button>
                    </div>

                    <div className="rounded-2xl border bg-card p-5 shadow-sm">
                      <h3 className="text-sm font-semibold">Voters</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        People who supported this idea.
                      </p>
                      <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          <UserRound className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">You</p>
                          <p className="text-xs text-muted-foreground">
                            Creator
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
                  Adjust your filters to see a post.
                </div>
              )}
            </div>
          </main>
        </>
      ) : (
        <>
          {" "}
          <main className="col-span-10">
            <div className="flex items-center justify-center flex-col min-h-full">
              <h6 className="text-sm font-bold">Nice View!</h6>
              <h6 className="text-sm font-light">
                Lead by example by creating your first few posts
              </h6>
              <div className="mt-6">
                <button
                  onClick={() => setIsOpenModalPost(true)}
                  className="border-primary border py-2 px-6 text-primary rounded-lg font-normal text-sm flex items-center gap-2 mb-2 w-full"
                >
                  <PlusIcon className="size-4" /> Create Post
                </button>
              </div>
            </div>
          </main>
        </>
      )}
    </>
  );
}
