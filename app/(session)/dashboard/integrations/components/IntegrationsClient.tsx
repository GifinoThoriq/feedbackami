"use client";

import { IBoard } from "@/interface/board.interface";
import { useEffect, useState, useTransition } from "react";
import {
  saveIntegration,
  getIntegration,
  deleteIntegration,
  Integration,
} from "@/app/actions/integrationActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Check } from "lucide-react";

interface IProps {
  boards: IBoard[];
}

type Platform = "discord" | "slack" | "custom";

const PLATFORM_HELP: Record<Platform, { label: string; instructions: string[] }> = {
  discord: {
    label: "Discord",
    instructions: [
      "Open your Discord server → go to the channel you want notifications in.",
      "Click the gear icon (Edit Channel) → Integrations → Webhooks → New Webhook.",
      'Give it a name (e.g. "Feedbackami"), copy the Webhook URL.',
      "Paste it above and click Save.",
    ],
  },
  slack: {
    label: "Slack",
    instructions: [
      "Go to api.slack.com/apps → create or select your app.",
      "Enable Incoming Webhooks → Add New Webhook to Workspace.",
      "Pick the channel → copy the Webhook URL.",
      "Paste it above and click Save.",
    ],
  },
  custom: {
    label: "Custom / Generic",
    instructions: [
      "Paste any HTTPS URL. Feedbackami will POST JSON to it when new feedback arrives.",
      "Works with Zapier (Webhooks by Zapier), Make (HTTP module), n8n (Webhook node), Microsoft Teams, or any custom backend.",
      `Payload: { "event": "new_post", "board_id": "uuid", "post": { "id", "title", "details", "created_at" } }`,
    ],
  },
};

export default function IntegrationsClient({ boards }: IProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    boards[0]?.id ?? ""
  );
  const [platform, setPlatform] = useState<Platform>("discord");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [existing, setExisting] = useState<Integration | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const iframeSnippet = selectedBoardId
    ? `<iframe src="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com"}/embed/${selectedBoardId}" width="100%" height="600" frameborder="0"></iframe>`
    : "";

  useEffect(() => {
    if (!selectedBoardId) return;
    setExisting(null);
    setWebhookUrl("");
    setMessage(null);
    getIntegration(selectedBoardId).then((data) => {
      if (data) {
        setExisting(data);
        setPlatform(data.type);
        setWebhookUrl(data.webhook_url);
      }
    });
  }, [selectedBoardId]);

  function handleCopy() {
    navigator.clipboard.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSave() {
    if (!webhookUrl.trim() || !selectedBoardId) return;
    startTransition(async () => {
      const result = await saveIntegration(selectedBoardId, platform, webhookUrl);
      if (result.ok) {
        setMessage("Integration saved.");
        const updated = await getIntegration(selectedBoardId);
        setExisting(updated);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    });
  }

  function handleRemove() {
    if (!selectedBoardId) return;
    startTransition(async () => {
      const result = await deleteIntegration(selectedBoardId);
      if (result.ok) {
        setExisting(null);
        setWebhookUrl("");
        setPlatform("discord");
        setMessage("Integration removed.");
      } else {
        setMessage(`Error: ${result.error}`);
      }
    });
  }

  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <p className="text-lg">No boards yet.</p>
        <p className="text-sm mt-1">Create a board first to set up integrations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Embed your feedback widget and receive webhook notifications.
        </p>
      </div>

      {/* Board selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Board</label>
        <div className="flex flex-wrap gap-2">
          {boards.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBoardId(b.id)}
              className={`px-3 py-1.5 rounded-md text-sm border transition ${
                b.id === selectedBoardId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Section A: Embed Widget */}
      <section className="space-y-3 rounded-xl border p-5">
        <h2 className="font-semibold text-base">Embed Widget</h2>
        <p className="text-sm text-muted-foreground">
          Copy this snippet and paste it into any HTML page to embed your feedback board.
        </p>
        <div className="relative">
          <code className="block w-full rounded-md bg-muted p-3 text-xs font-mono break-all pr-10">
            {iframeSnippet}
          </code>
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 p-1.5 rounded hover:bg-background transition"
            title="Copy"
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <a
          href={`/embed/${selectedBoardId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="size-3.5" />
          Preview widget
        </a>
      </section>

      {/* Section B: Webhook Notifications */}
      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="font-semibold text-base">Webhook Notifications</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get notified when new feedback is submitted.
          </p>
        </div>

        {existing && (
          <div className="text-xs text-muted-foreground bg-muted rounded px-3 py-2">
            Active integration:{" "}
            <span className="font-medium capitalize">{existing.type}</span>
          </div>
        )}

        {/* Platform selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Platform</label>
          <div className="flex gap-2">
            {(["discord", "slack", "custom"] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 rounded-md text-sm border transition capitalize ${
                  platform === p
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {p === "custom" ? "Custom" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Webhook URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Webhook URL</label>
          <Input
            placeholder="https://..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={isPending || !webhookUrl.trim()}
            onClick={handleSave}
          >
            Save
          </Button>
          {existing && (
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>

        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}

        {/* Platform help */}
        <div className="mt-2 rounded-lg bg-muted/60 p-4 space-y-2">
          <p className="text-sm font-medium">
            How to get a {PLATFORM_HELP[platform].label} webhook URL
          </p>
          <ol className="list-decimal list-inside space-y-1">
            {PLATFORM_HELP[platform].instructions.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
