"use client";

import { useState, useTransition } from "react";
import { IBoard } from "@/interface/board.interface";
import { IStagedPost } from "@/interface/inbound.interface";
import {
  approveStagedPost,
  discardStagedPost,
  triggerProcess,
} from "@/app/actions/stagedPostActions";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Zap } from "lucide-react";

interface IProps {
  boards: IBoard[];
  initialStagedByBoard: Record<string, IStagedPost[]>;
}

export default function StagedClient({ boards, initialStagedByBoard }: IProps) {
  const [stagedByBoard, setStagedByBoard] = useState(initialStagedByBoard);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function setMsg(boardId: string, msg: string) {
    setMessages((prev) => ({ ...prev, [boardId]: msg }));
  }

  function handleApprove(staged: IStagedPost) {
    startTransition(async () => {
      const result = await approveStagedPost(staged.id, staged.board_id);
      if (result.ok) {
        setStagedByBoard((prev) => ({
          ...prev,
          [staged.board_id]: prev[staged.board_id].filter((s) => s.id !== staged.id),
        }));
        setMsg(staged.board_id, "Post published.");
      } else {
        setMsg(staged.board_id, `Error: ${result.error}`);
      }
    });
  }

  function handleDiscard(staged: IStagedPost) {
    startTransition(async () => {
      const result = await discardStagedPost(staged.id);
      if (result.ok) {
        setStagedByBoard((prev) => ({
          ...prev,
          [staged.board_id]: prev[staged.board_id].filter((s) => s.id !== staged.id),
        }));
      } else {
        setMsg(staged.board_id, `Error: ${result.error}`);
      }
    });
  }

  function handleProcess(boardId: string) {
    startTransition(async () => {
      setMsg(boardId, "Processing…");
      const result = await triggerProcess(boardId);
      if (result.ok) {
        // Refresh staged posts for this board
        const { getStagedPosts } = await import("@/app/actions/stagedPostActions");
        const updated = await getStagedPosts(boardId);
        setStagedByBoard((prev) => ({ ...prev, [boardId]: updated }));
        setMsg(boardId, updated.length > (stagedByBoard[boardId]?.length ?? 0)
          ? "New drafts created."
          : "Processing done — no new groups found.");
      } else {
        setMsg(boardId, `Error: ${result.error}`);
      }
    });
  }

  const totalDrafts = Object.values(stagedByBoard).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Staging Area</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review AI-grouped feedback drafts before publishing to your board.
        </p>
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
          <p>No boards yet. Create a board first.</p>
        </div>
      ) : totalDrafts === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3 text-muted-foreground">
          <p className="text-base">No drafts yet — process incoming feedback to generate posts.</p>
          <p className="text-sm">
            Use the{" "}
            <a href="/dashboard/integrations" className="text-primary hover:underline">
              Integrations page
            </a>{" "}
            to set up inbound sources, then click &quot;Process new feedback&quot; below.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {boards.map((b) => (
              <Button
                key={b.id}
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => handleProcess(b.id)}
              >
                <Zap className="size-3.5 mr-1.5" />
                Process — {b.name}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {boards.map((board) => {
            const drafts = stagedByBoard[board.id] ?? [];
            return (
              <div key={board.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{board.name}</h2>
                    {drafts.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        {drafts.length} draft{drafts.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => handleProcess(board.id)}
                  >
                    <Zap className="size-3.5 mr-1.5" />
                    Process new feedback
                  </Button>
                </div>

                {messages[board.id] && (
                  <p className="text-xs text-muted-foreground">{messages[board.id]}</p>
                )}

                {drafts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No drafts for this board.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {drafts.map((staged) => (
                      <div
                        key={staged.id}
                        className="rounded-xl border p-4 space-y-3"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{staged.title}</p>
                          {staged.details && (
                            <p className="text-sm text-muted-foreground">
                              {staged.details}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {staged.raw_feedback_ids.length} source message
                            {staged.raw_feedback_ids.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() => handleApprove(staged)}
                          >
                            <Check className="size-3.5 mr-1.5" />
                            Approve & Publish
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => handleDiscard(staged)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5 mr-1.5" />
                            Discard
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
