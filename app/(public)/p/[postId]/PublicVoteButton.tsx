"use client";

import { useState } from "react";
import { ArrowBigUpDash } from "lucide-react";
import { toggleVote } from "@/app/actions/voteActions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IProps {
  postId: string;
  initialCount: number;
  isAuthenticated: boolean;
  initialHasVoted: boolean;
}

export default function PublicVoteButton({
  postId,
  initialCount,
  isAuthenticated,
  initialHasVoted,
}: IProps) {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      setDialogOpen(true);
      return;
    }

    // Optimistic update
    const newHasVoted = !hasVoted;
    setHasVoted(newHasVoted);
    setCount((c) => c + (newHasVoted ? 1 : -1));

    const result = await toggleVote(postId);
    if (!result.ok) {
      // Revert on failure
      setHasVoted(hasVoted);
      setCount(initialCount);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex flex-col items-center group"
        aria-label={hasVoted ? "Remove vote" : "Vote for this post"}
      >
        <ArrowBigUpDash
          className={
            hasVoted
              ? "text-primary fill-primary"
              : "text-muted-foreground group-hover:text-primary"
          }
        />
        <span className="text-sm font-bold">{count}</span>
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Login to vote</DialogTitle>
            <DialogDescription>
              You need an account to vote on posts. Log in or create a free
              account to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Button asChild>
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Create account</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
