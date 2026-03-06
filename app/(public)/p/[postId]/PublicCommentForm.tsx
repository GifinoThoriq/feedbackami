"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveComment } from "@/app/actions/commentActions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function PublicCommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    if (!content.trim() || !name.trim()) return;
    startTransition(async () => {
      await saveComment({
        post_id: postId,
        content,
        guest_name: name,
        guest_email: email || undefined,
      });
      setContent("");
      setName("");
      setEmail("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex gap-2 px-1 mb-2">
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
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border-0 shadow-none resize-none"
        rows={3}
      />
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !content.trim() || !name.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
