"use client";

import { useState, useTransition } from "react";
import { IBoard } from "@/interface/board.interface";
import { IStagedPost } from "@/interface/inbound.interface";
import {
  approveStagedPost,
  discardStagedPost,
  discardAllStagedPosts,
  triggerProcess,
  getAllStagedPosts,
} from "@/app/actions/stagedPostActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, Trash2, Zap } from "lucide-react";

interface IProps {
  boards: IBoard[];
  initialStagedPosts: IStagedPost[];
}

export default function StagedClient({ boards, initialStagedPosts }: IProps) {
  const [stagedPosts, setStagedPosts] = useState<IStagedPost[]>(initialStagedPosts);
  const [processMessage, setProcessMessage] = useState<string | null>(null);
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    staged: IStagedPost | null;
    selectedBoardId: string;
  }>({
    open: false,
    staged: null,
    selectedBoardId: boards[0]?.id ?? "",
  });
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const [discardAllDialog, setDiscardAllDialog] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleApproveOpen(staged: IStagedPost) {
    setApproveDialog({
      open: true,
      staged,
      selectedBoardId: boards[0]?.id ?? "",
    });
  }

  function handleApproveConfirm() {
    const { staged, selectedBoardId } = approveDialog;
    if (!staged || !selectedBoardId) return;
    setApproveDialog((p) => ({ ...p, open: false }));
    startTransition(async () => {
      const result = await approveStagedPost(staged.id, selectedBoardId);
      if (result.ok) {
        setStagedPosts((prev) => prev.filter((s) => s.id !== staged.id));
      } else {
        setErrorDialog({ open: true, message: result.error ?? "Something went wrong." });
      }
    });
  }

  function handleDiscard(staged: IStagedPost) {
    startTransition(async () => {
      const result = await discardStagedPost(staged.id);
      if (result.ok) {
        setStagedPosts((prev) => prev.filter((s) => s.id !== staged.id));
      } else {
        setErrorDialog({ open: true, message: result.error ?? "Something went wrong." });
      }
    });
  }

  function handleDiscardAll() {
    setDiscardAllDialog(false);
    startTransition(async () => {
      const result = await discardAllStagedPosts();
      if (result.ok) {
        setStagedPosts([]);
      } else {
        setErrorDialog({ open: true, message: result.error ?? "Something went wrong." });
      }
    });
  }

  function handleProcess() {
    startTransition(async () => {
      setProcessMessage("Processing…");
      const result = await triggerProcess();
      if (result.ok) {
        const updated = await getAllStagedPosts();
        setStagedPosts(updated);
        setProcessMessage(
          updated.length > stagedPosts.length
            ? "New drafts created."
            : "Processing done — no new groups found."
        );
      } else {
        setProcessMessage(null);
        setErrorDialog({ open: true, message: result.error ?? "Something went wrong." });
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Staging Area</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review AI-grouped feedback drafts before publishing to your board.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {stagedPosts.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              disabled={pending}
              onClick={() => setDiscardAllDialog(true)}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Discard all
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={pending} onClick={handleProcess}>
            <Zap className="size-3.5 mr-1.5" />
            Process new feedback
          </Button>
        </div>
      </div>

      {processMessage && (
        <p className="text-xs text-muted-foreground">{processMessage}</p>
      )}

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-muted-foreground">
          <p>No boards yet. Create a board first.</p>
        </div>
      ) : stagedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3 text-muted-foreground">
          <p className="text-base">No drafts yet — process incoming feedback to generate posts.</p>
          <p className="text-sm">
            Use the{" "}
            <a href="/dashboard/integrations" className="text-primary hover:underline">
              Integrations page
            </a>{" "}
            to set up inbound sources, then click &quot;Process new feedback&quot; above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stagedPosts.map((staged) => (
            <div key={staged.id} className="rounded-xl border p-4 space-y-3">
              <div className="space-y-1">
                <p className="font-medium text-sm">{staged.title}</p>
                {staged.details && (
                  <p className="text-sm text-muted-foreground">{staged.details}</p>
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
                  onClick={() => handleApproveOpen(staged)}
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

      {/* Approve dialog — board picker */}
      <Dialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog((p) => ({ ...p, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to board</DialogTitle>
            <DialogDescription>
              Choose which board to publish this feedback post to.
            </DialogDescription>
          </DialogHeader>
          {approveDialog.staged && (
            <p className="text-sm font-medium truncate">{approveDialog.staged.title}</p>
          )}
          <select
            className="w-full border rounded-md px-3 py-2 text-sm my-2 bg-background"
            value={approveDialog.selectedBoardId}
            onChange={(e) =>
              setApproveDialog((p) => ({ ...p, selectedBoardId: e.target.value }))
            }
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialog((p) => ({ ...p, open: false }))}
            >
              Cancel
            </Button>
            <Button
              disabled={!approveDialog.selectedBoardId || pending}
              onClick={handleApproveConfirm}
            >
              <Check className="size-3.5 mr-1.5" />
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error dialog */}
      <Dialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Something went wrong</DialogTitle>
            <DialogDescription>{errorDialog.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Discard all dialog */}
      <Dialog open={discardAllDialog} onOpenChange={setDiscardAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard all drafts?</DialogTitle>
            <DialogDescription>
              This will permanently delete all staged drafts.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardAllDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDiscardAll}>
              Discard all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
