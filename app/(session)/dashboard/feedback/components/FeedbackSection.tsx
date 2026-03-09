"use client";

import { PostForm } from "@/components/dashboard/feedback/PostForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IBoard } from "@/interface/board.interface";
import { IPost } from "@/interface/post.interface";
import { IStatus } from "@/interface/status.interface";
import { IComment } from "@/interface/comment.interface";
import { IVote } from "@/interface/vote.interface";
import { ITag } from "@/interface/tag.interface";
import { getCommentsByPost } from "@/app/actions/commentActions";
import { getVotesByPost } from "@/app/actions/voteActions";
import { getTags } from "@/app/actions/tagActions";
import { getMyPosts } from "@/app/actions/postActions";
import {
  MessageSquare,
  PencilIcon,
  PlusIcon,
  Search,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import FeedbackCard from "@/components/dashboard/feedback/FeedbackCard";
import { User } from "@supabase/supabase-js";
import { type DateRange } from "react-day-picker";

interface IProps {
  feedback: IPost[];
  boards: IBoard[];
  statuses: IStatus[];
  author: User | null;
  selectedBoardIds: string[];
  selectedStatusIds: string[];
  dateRange: DateRange | undefined;
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

export default function FeedbackSection({
  feedback: initialFeedback,
  boards,
  statuses,
  author,
  selectedBoardIds,
  selectedStatusIds,
  dateRange,
}: IProps) {
  const [isOpenModalPost, setIsOpenModalPost] = useState(false);
  const [listFilter, setListFilter] = useState<"default" | "trending">("default");
  const [searchValue, setSearchValue] = useState("");
  const [feedback, setFeedback] = useState<IPost[]>(initialFeedback);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    initialFeedback[0]?.id ?? null
  );

  const [comments, setComments] = useState<IComment[]>([]);
  const [votes, setVotes] = useState<IVote[]>([]);
  const [allTags, setAllTags] = useState<ITag[]>([]);

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

    return sorted.filter((post) => {
      // Board filter
      if (selectedBoardIds.length > 0 && !selectedBoardIds.includes(post.board_id)) {
        return false;
      }

      // Status filter
      if (selectedStatusIds.length > 0) {
        if (!post.status_id || !selectedStatusIds.includes(post.status_id)) {
          return false;
        }
      }

      // Date range filter — compare by local calendar day to avoid UTC offset issues
      if (dateRange?.from || dateRange?.to) {
        const d = new Date(post.created_at);
        const postDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (dateRange.from) {
          const fromDay = new Date(
            dateRange.from.getFullYear(),
            dateRange.from.getMonth(),
            dateRange.from.getDate()
          );
          if (postDay < fromDay) return false;
        }
        if (dateRange.to) {
          const toDay = new Date(
            dateRange.to.getFullYear(),
            dateRange.to.getMonth(),
            dateRange.to.getDate()
          );
          if (postDay > toDay) return false;
        }
      }

      // Search filter
      if (normalizedQuery) {
        const boardName = boardLookup[post.board_id]?.name?.toLowerCase() ?? "unknown";
        const detailMatch = post.details?.toLowerCase().includes(normalizedQuery) ?? false;
        if (
          !post.title.toLowerCase().includes(normalizedQuery) &&
          !boardName.includes(normalizedQuery) &&
          !detailMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [boardLookup, feedback, listFilter, searchValue, selectedBoardIds, selectedStatusIds, dateRange]);

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

  const publicLink = selectedPost
    ? `${typeof window !== "undefined" ? window.location.origin : "https://feedbackami.app"}/p/${selectedPost.id}`
    : "";

  // Load comments + votes + tags when selected post changes
  useEffect(() => {
    if (!selectedPostId) return;
    getCommentsByPost(selectedPostId).then(setComments);
    getVotesByPost(selectedPostId).then(setVotes);
    getTags().then(setAllTags);
  }, [selectedPostId]);

  const refreshPostList = useCallback(async () => {
    const fresh = await getMyPosts();
    setFeedback(fresh);
  }, []);

  const handleVoteToggle = useCallback(async (postId: string) => {
    const updated = await getVotesByPost(postId);
    setVotes(updated);
  }, []);

  const handleCommentAdded = useCallback(async (postId: string) => {
    const updated = await getCommentsByPost(postId);
    setComments(updated);
  }, []);

  const handleTagsChanged = useCallback(async (postId: string) => {
    await refreshPostList();
    const tags = await getTags();
    setAllTags(tags);
  }, [refreshPostList]);

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
                <FeedbackCard
                  selectedPost={selectedPost}
                  authorId={author?.id}
                  publicLink={publicLink}
                  comments={comments}
                  votes={votes}
                  statuses={statuses}
                  boards={boards}
                  allTags={allTags}
                  onVoteToggle={handleVoteToggle}
                  onCommentAdded={handleCommentAdded}
                  onTagsChanged={handleTagsChanged}
                />
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
