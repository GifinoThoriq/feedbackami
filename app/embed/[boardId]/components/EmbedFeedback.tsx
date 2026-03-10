"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveComment } from "@/app/actions/commentActions";
import { getCommentsByPost } from "@/app/actions/commentActions";
import { toggleVote, getVotesByPost } from "@/app/actions/voteActions";
import { IComment } from "@/interface/comment.interface";
import { ArrowBigUpDash, ArrowLeft } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

interface IPost {
  id: string;
  title: string;
  details: string | null;
  profiles: { first_name: string; last_name: string; profile_color: string };
}

interface IVoteMeta {
  id: string;
  post_id: string;
}

interface IProps {
  posts: IPost[];
  initialVotes: IVoteMeta[];
  boardId: string;
}

function getGuestId(): string {
  const key = "embed_guest_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function EmbedFeedback({ posts, initialVotes, boardId }: IProps) {
  const [votes, setVotes] = useState<IVoteMeta[]>(initialVotes);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const voteCountFor = (postId: string) =>
    votes.filter((v) => v.post_id === postId).length;

  useEffect(() => {
    if (!selectedPost) return;
    getCommentsByPost(selectedPost.id).then(setComments);
  }, [selectedPost]);

  function handleVote(postId: string) {
    startTransition(async () => {
      const guestId = getGuestId();
      await toggleVote(postId, guestId);
      const updated = await getVotesByPost(postId);
      setVotes((prev) => [
        ...prev.filter((v) => v.post_id !== postId),
        ...updated.map((v) => ({ id: v.id, post_id: v.post_id })),
      ]);
    });
  }

  function handleComment() {
    if (!commentContent.trim() || !selectedPost || !guestName.trim()) return;
    startTransition(async () => {
      await saveComment({
        post_id: selectedPost.id,
        content: commentContent,
        guest_name: guestName,
        guest_email: guestEmail || undefined,
      });
      setCommentContent("");
      const updated = await getCommentsByPost(selectedPost.id);
      setComments(updated);
    });
  }

  const brandColor = "#55adfe";

  if (selectedPost) {
    const topLevel = comments.filter((c) => !c.parent_id);
    return (
      <div className="flex flex-col min-h-screen font-sans text-sm">
        <div className="flex-1 p-5">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-1.5 text-muted-foreground mb-5 hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" /> Back to list
          </button>

          <div className="flex items-start gap-4 mb-4">
            <button
              onClick={() => handleVote(selectedPost.id)}
              disabled={isPending}
              className="flex flex-col items-center shrink-0 rounded-lg border px-2.5 py-1.5 hover:border-[#55adfe] transition"
              style={{ color: brandColor }}
            >
              <ArrowBigUpDash className="size-5" />
              <span className="text-xs font-bold leading-none mt-0.5">
                {voteCountFor(selectedPost.id)}
              </span>
            </button>
            <div>
              <h2 className="font-semibold text-base leading-snug">{selectedPost.title}</h2>
              <p className="text-muted-foreground mt-1.5">
                {selectedPost.details ?? "No additional details."}
              </p>
            </div>
          </div>

          {topLevel.length > 0 && (
            <div className="mb-5 space-y-2">
              <h3 className="font-semibold text-sm">Comments ({topLevel.length})</h3>
              {topLevel.map((c) => (
                <div key={c.id} className="rounded-lg border p-3">
                  <p className="font-medium text-xs mb-0.5">
                    {c.profiles
                      ? `${c.profiles.first_name} ${c.profiles.last_name}`
                      : c.guest_name ?? "Anonymous"}
                  </p>
                  <p className="text-muted-foreground text-xs">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            <h3 className="font-semibold text-sm">Leave a comment</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Name *"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <Input
                placeholder="Email (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Your comment"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <Button
              size="sm"
              disabled={isPending || !commentContent.trim() || !guestName.trim()}
              onClick={handleComment}
              style={{ backgroundColor: brandColor, borderColor: brandColor }}
            >
              Send
            </Button>
          </div>
        </div>

        <footer className="border-t py-3 px-5 text-center">
          <a
            href="https://feedbackami.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            Powered by <span style={{ color: brandColor }} className="font-medium">Feedbackami</span>
          </a>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-sm">
      <div className="flex-1 p-5 space-y-2">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No feedback yet. Be the first!</p>
        ) : (
          posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="w-full text-left rounded-xl border px-4 py-3.5 hover:border-[#55adfe]/60 hover:bg-[#55adfe]/5 transition group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex flex-col items-center shrink-0 rounded-lg border px-2 py-1 group-hover:border-[#55adfe] transition"
                  style={{ color: brandColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id);
                  }}
                >
                  <ArrowBigUpDash className="size-4" />
                  <span className="text-xs font-bold leading-none mt-0.5">{voteCountFor(post.id)}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{post.title}</p>
                  {post.details && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {post.details}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <footer className="border-t py-3 px-5 text-center">
        <a
          href="https://feedbackami.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          Powered by <span style={{ color: brandColor }} className="font-medium">Feedbackami</span>
        </a>
      </footer>
    </div>
  );
}
