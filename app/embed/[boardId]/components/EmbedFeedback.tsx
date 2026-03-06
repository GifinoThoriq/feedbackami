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

  if (selectedPost) {
    const topLevel = comments.filter((c) => !c.parent_id);
    return (
      <div className="p-4 font-sans text-sm">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-1 text-muted-foreground mb-4 hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => handleVote(selectedPost.id)}
            className="flex flex-col items-center"
            disabled={isPending}
          >
            <ArrowBigUpDash className="text-primary" />
            <span className="text-xs font-bold">{voteCountFor(selectedPost.id)}</span>
          </button>
          <h2 className="font-semibold text-base">{selectedPost.title}</h2>
        </div>

        <p className="text-muted-foreground mb-4">
          {selectedPost.details ?? "No additional details."}
        </p>

        {topLevel.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="font-semibold">Comments</h3>
            {topLevel.map((c) => (
              <div key={c.id} className="rounded border p-2">
                <p className="font-medium text-xs">
                  {c.profiles
                    ? `${c.profiles.first_name} ${c.profiles.last_name}`
                    : c.guest_name ?? "Anonymous"}
                </p>
                <p className="text-muted-foreground">{c.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">Leave a comment</h3>
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
          />
          <Button
            size="sm"
            disabled={isPending || !commentContent.trim() || !guestName.trim()}
            onClick={handleComment}
          >
            Send
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 font-sans text-sm space-y-2">
      {posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <button
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="w-full text-left rounded-lg border px-3 py-3 hover:border-primary/50 hover:bg-primary/5 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex flex-col items-center shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(post.id);
                }}
              >
                <ArrowBigUpDash className="text-primary size-5" />
                <span className="text-xs font-bold">{voteCountFor(post.id)}</span>
              </div>
              <div>
                <p className="font-semibold">{post.title}</p>
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
  );
}
