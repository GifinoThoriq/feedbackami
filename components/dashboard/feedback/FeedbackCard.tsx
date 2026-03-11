"use client";

import AvatarColor from "@/components/ui/avatar-color";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveComment } from "@/app/actions/commentActions";
import { toggleVote } from "@/app/actions/voteActions";
import { updatePostStatus, updatePostBoard } from "@/app/actions/postActions";
import {
  addTagToPost,
  removeTagFromPost,
  createTag,
} from "@/app/actions/tagActions";
import { IPost } from "@/interface/post.interface";
import { IComment } from "@/interface/comment.interface";
import { IVote } from "@/interface/vote.interface";
import { IStatus } from "@/interface/status.interface";
import { IBoard } from "@/interface/board.interface";
import { ITag } from "@/interface/tag.interface";
import {
  ArrowBigUpDash,
  Check,
  Copy,
  Link2,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { statusColorMap } from "@/lib/color";

interface IProps {
  selectedPost: IPost;
  authorId?: string;
  publicLink: string;
  comments: IComment[];
  votes: IVote[];
  statuses: IStatus[];
  boards: IBoard[];
  allTags: ITag[];
  onVoteToggle: (postId: string) => void;
  onCommentAdded: (postId: string) => void;
  onTagsChanged: (postId: string) => void;
  onPostUpdated: (postId: string) => void;
}

function CommentItem({
  comment,
  depth = 0,
  allComments,
  authorId,
  postId,
  onReply,
}: {
  comment: IComment;
  depth?: number;
  allComments: IComment[];
  authorId?: string;
  postId: string;
  onReply: (parentId: string) => void;
}) {
  const replies = allComments.filter((c) => c.parent_id === comment.id);
  const displayName = comment.profiles
    ? `${comment.profiles.first_name} ${comment.profiles.last_name}`
    : comment.guest_name ?? "Anonymous";

  return (
    <div
      className={cn("flex flex-col gap-2", depth > 0 && "ml-6 border-l pl-4")}
    >
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
          authorId={authorId}
          postId={postId}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

export default function FeedbackCard({
  selectedPost,
  authorId,
  publicLink,
  comments,
  votes,
  statuses,
  boards,
  allTags,
  onVoteToggle,
  onCommentAdded,
  onTagsChanged,
  onPostUpdated,
}: IProps) {
  const [isPending, startTransition] = useTransition();
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [copied, setCopied] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [, setTick] = useState(0);
  const inCooldown = Date.now() < cooldownUntil;

  useEffect(() => {
    if (!inCooldown) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      if (Date.now() >= cooldownUntil) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil, inCooldown]);

  useEffect(() => {
    const stored = localStorage.getItem("guest_vote_id");
    setGuestId(stored);
  }, []);

  function handleCopyLink() {
    navigator.clipboard.writeText(publicLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const voteCount = votes.length;

  const hasVoted = authorId
    ? votes.some((v) => v.user_id === authorId)
    : guestId
    ? votes.some((v) => v.guest_identifier === guestId)
    : false;

  const isOwner = authorId === selectedPost.user_id;
  const postTags = selectedPost.tags ?? [];
  const unusedTags = allTags.filter(
    (t) => !postTags.some((pt) => pt.id === t.id)
  );

  function handleVote() {
    startTransition(async () => {
      let resolvedGuestId: string | undefined;
      if (!authorId) {
        const key = "guest_vote_id";
        resolvedGuestId = localStorage.getItem(key) ?? undefined;
        if (!resolvedGuestId) {
          resolvedGuestId = crypto.randomUUID();
          localStorage.setItem(key, resolvedGuestId);
          setGuestId(resolvedGuestId);
        }
      }
      await toggleVote(selectedPost.id, resolvedGuestId);
      onVoteToggle(selectedPost.id);
    });
  }

  function handleComment() {
    if (!commentContent.trim() || inCooldown) return;
    startTransition(async () => {
      const result = await saveComment({
        post_id: selectedPost.id,
        content: commentContent,
        parent_id: replyToId ?? undefined,
        user_id: authorId,
        guest_name: authorId ? undefined : guestName || undefined,
        guest_email: authorId ? undefined : guestEmail || undefined,
      });
      if (!result.ok) {
        setCommentError(result.error);
        return;
      }
      setCommentError(null);
      setCommentContent("");
      setReplyToId(null);
      setCooldownUntil(Date.now() + 10_000);
      await onCommentAdded(selectedPost.id);
    });
  }

  function handleReply(id: string) {
    setReplyToId(id);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleStatusChange(statusId: string) {
    startTransition(async () => {
      await updatePostStatus(selectedPost.id, statusId);
      onPostUpdated(selectedPost.id);
    });
  }

  function handleBoardChange(boardId: string) {
    startTransition(async () => {
      await updatePostBoard(selectedPost.id, boardId);
      onPostUpdated(selectedPost.id);
    });
  }

  function handleAddExistingTag(tagId: string) {
    startTransition(async () => {
      await addTagToPost(selectedPost.id, tagId);
      onTagsChanged(selectedPost.id);
    });
  }

  function handleRemoveTag(tagId: string) {
    startTransition(async () => {
      await removeTagFromPost(selectedPost.id, tagId);
      onTagsChanged(selectedPost.id);
    });
  }

  function handleCreateAndAddTag() {
    if (!newTagName.trim()) return;
    startTransition(async () => {
      const res = await createTag(newTagName.trim(), newTagColor);
      if (res.ok) {
        // Refresh tags and re-fetch
        onTagsChanged(selectedPost.id);
        setNewTagName("");
        setShowTagInput(false);
      }
    });
  }

  return (
    <div>
      <div className="flex gap-4 items-start">
        <section className="rounded-md bg-card border grow">
          <div className="border-b p-4 flex gap-4 items-center">
            <button
              onClick={handleVote}
              disabled={isPending}
              className="flex flex-col items-center group shrink-0"
            >
              <ArrowBigUpDash
                fill={hasVoted ? "var(--primary)" : "transparent"}
                className="text-primary group-hover:scale-110 transition-transform"
              />
              <span className="text-sm font-bold">{voteCount}</span>
            </button>
            <h5 className="font-medium text-lg flex-1">{selectedPost.title}</h5>
            <button
              onClick={handleCopyLink}
              title="Copy shareable link"
              className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="size-3.5" />
                  Share
                </>
              )}
            </button>
          </div>

          <div className="p-4 min-h-[160px]">
            <div className="flex flex-row items-start gap-2">
              <AvatarColor
                profile_color={selectedPost.profiles.profile_color}
                first_name={selectedPost.profiles.first_name[0]}
                last_name={selectedPost.profiles.last_name[0]}
                size="small"
              />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedPost.profiles.first_name}{" "}
                  {selectedPost.profiles.last_name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selectedPost.details ??
                    "This post does not have additional details yet. Add a description so everyone has context."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2 border-t">
            {replyToId && (
              <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground">
                <span>
                  Replying to:{" "}
                  <span className="italic">
                    {(() => {
                      const target = comments.find((c) => c.id === replyToId);
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

            {!authorId && (
              <div className="flex gap-2 mb-2 mt-2 px-1">
                <Input
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="text-sm"
                />
                <Input
                  placeholder="Email (optional)"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}

            <Textarea
              ref={textareaRef}
              placeholder="Share feedback"
              className="mt-1 border-0 shadow-none"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-end gap-3">
              {commentError && (
                <p className="text-xs text-red-500">{commentError}</p>
              )}
              <Button
                size="sm"
                disabled={isPending || !commentContent.trim() || inCooldown}
                onClick={handleComment}
              >
                {inCooldown ? "Please wait…" : "Send"}
              </Button>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="rounded-md border bg-card p-5 w-100">
            <h3 className="text-sm font-semibold">Details</h3>
            <ul className="mt-2 space-y-4">
              <li className="flex flex-row justify-between items-center gap-3">
                <p className="text-sm text-muted-foreground shrink-0">
                  Public link
                </p>
                <a
                  href={publicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary underline underline-offset-2 truncate max-w-[160px]"
                  title={publicLink}
                >
                  {publicLink}
                </a>
              </li>
              <li className="flex flex-row justify-between items-center">
                <p className="mt-1 text-sm text-muted-foreground">Board</p>
                <Select
                  key={selectedPost.id}
                  defaultValue={selectedPost.board_id}
                  onValueChange={handleBoardChange}
                  disabled={!isOwner}
                >
                  <SelectTrigger className="border p-2 border-gray-300 rounded w-36">
                    <SelectValue placeholder="Board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
              <li className="flex flex-row justify-between items-center">
                <p className="mt-1 text-sm text-muted-foreground">Status</p>
                <Select
                  key={selectedPost.id}
                  defaultValue={selectedPost.status_id ?? undefined}
                  onValueChange={handleStatusChange}
                  disabled={!isOwner}
                >
                  <SelectTrigger className="border p-2 border-gray-300 rounded w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => {
                      const color = statusColorMap[s.name];
                      return (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-2">
                            {color && (
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  color.bg,
                                  color.border,
                                  "border"
                                )}
                              />
                            )}
                            {s.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </li>
            </ul>

            <h3 className="text-sm font-semibold mt-8">Voters</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              People who supported this idea.
            </p>
            {votes.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No votes yet.
              </p>
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {votes.slice(0, 5).map((vote, i) => (
                    <div
                      key={vote.id}
                      className="ring-2 ring-card rounded-full"
                      style={{ marginLeft: i === 0 ? 0 : -8, zIndex: i }}
                    >
                      {vote.profiles ? (
                        <AvatarColor
                          profile_color={vote.profiles.profile_color}
                          first_name={vote.profiles.first_name[0]}
                          last_name={vote.profiles.last_name[0]}
                          size="small"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                          <UserRound className="size-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {votes.length > 5 && (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-muted ring-2 ring-card text-xs font-semibold text-muted-foreground"
                      style={{ marginLeft: -8, zIndex: 5 }}
                    >
                      +{votes.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {votes.length} voter{votes.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="rounded-md border bg-card p-5 w-100 h-auto">
              <h3 className="text-sm font-semibold">Tags</h3>

              {postTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {postTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button onClick={() => handleRemoveTag(tag.id)}>
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {unusedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {unusedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddExistingTag(tag.id)}
                      className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium hover:bg-muted"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}

              {showTagInput ? (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="text-sm"
                    />
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleCreateAndAddTag}
                      disabled={isPending}
                    >
                      Create
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowTagInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => setShowTagInput(true)}
                >
                  <Tag className="size-4" />
                  Add tag
                </Button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Comments */}
      <section className="rounded-md border bg-card p-5 mt-4">
        <h3 className="text-sm font-semibold mb-4">
          Comments{comments.length > 0 && ` (${comments.length})`}
        </h3>
        {topLevelComments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {topLevelComments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                allComments={comments}
                authorId={authorId}
                postId={selectedPost.id}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
