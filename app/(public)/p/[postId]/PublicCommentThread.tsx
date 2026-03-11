"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AvatarColor from "@/components/ui/avatar-color";
import { saveComment } from "@/app/actions/commentActions";
import { X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CommentProfile {
  first_name: string;
  last_name: string;
  profile_color: string;
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  parent_id: string | null;
  guest_name: string | null;
  profiles: CommentProfile | null;
}

interface IProps {
  postId: string;
  initialComments: Comment[];
}

function CommentItem({
  comment,
  depth = 0,
  allComments,
  onReply,
}: {
  comment: Comment;
  depth?: number;
  allComments: Comment[];
  onReply: (id: string) => void;
}) {
  const replies = allComments.filter((c) => c.parent_id === comment.id);
  const displayName = comment.profiles
    ? `${comment.profiles.first_name} ${comment.profiles.last_name}`
    : comment.guest_name ?? "Anonymous";

  return (
    <div className={cn("flex flex-col gap-2", depth > 0 && "ml-6 border-l pl-4")}>
      <div className="flex items-start gap-2">
        {comment.profiles ? (
          <AvatarColor
            profile_color={comment.profiles.profile_color}
            first_name={comment.profiles.first_name[0]}
            last_name={comment.profiles.last_name[0]}
            size="small"
          />
        ) : (
          <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
            {displayName[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{comment.content}</p>
          <button
            onClick={() => onReply(comment.id)}
            className="text-xs text-muted-foreground hover:text-foreground mt-1"
          >
            Reply
          </button>
        </div>
      </div>
      {replies.map((r) => (
        <CommentItem
          key={r.id}
          comment={r}
          depth={depth + 1}
          allComments={allComments}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

export default function PublicCommentThread({ postId, initialComments }: IProps) {
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [, setTick] = useState(0);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const inCooldown = Date.now() < cooldownUntil;

  useEffect(() => {
    if (!inCooldown) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil, inCooldown]);

  function handleReply(id: string) {
    setReplyToId(id);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleSubmit() {
    if (!content.trim() || !name.trim() || inCooldown) return;
    startTransition(async () => {
      const result = await saveComment({
        post_id: postId,
        content,
        parent_id: replyToId ?? undefined,
        guest_name: name,
        guest_email: email || undefined,
      });
      if (!result.ok) {
        setCommentError(result.error);
        return;
      }
      setCommentError(null);
      setContent("");
      setReplyToId(null);
      setCooldownUntil(Date.now() + 10_000);
      router.refresh();
    });
  }

  const topLevelComments = initialComments.filter((c) => !c.parent_id);

  return (
    <>
      {topLevelComments.length > 0 && (
        <div className="border-t px-5 py-4 space-y-4">
          <h2 className="text-sm font-semibold">Comments</h2>
          {topLevelComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              allComments={initialComments}
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      <div className="border-t p-2">
        {replyToId && (
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
            <span>
              Replying to:{" "}
              <span className="italic">
                {(() => {
                  const target = initialComments.find((c) => c.id === replyToId);
                  const text = target?.content ?? "";
                  return text.length > 60 ? text.slice(0, 60) + "…" : text;
                })()}
              </span>
            </span>
            <button
              onClick={() => setReplyToId(null)}
              className="hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-2 mt-2 px-1">
          <Input
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm"
          />
        </div>

        <Textarea
          ref={textareaRef}
          placeholder="Share your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="border-0 shadow-none resize-none"
          rows={3}
        />

        <div className="mt-2 flex items-center justify-end gap-3">
          {commentError && (
            <p className="text-xs text-red-500">{commentError}</p>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || !content.trim() || !name.trim() || inCooldown}
          >
            {inCooldown ? "Please wait…" : "Send"}
          </Button>
        </div>
      </div>
    </>
  );
}
