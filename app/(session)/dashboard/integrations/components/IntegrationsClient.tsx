"use client";

import { IBoard } from "@/interface/board.interface";
import { IInboundSource } from "@/interface/inbound.interface";
import { useEffect, useState, useTransition } from "react";
import {
  saveIntegration,
  getIntegration,
  deleteIntegration,
  Integration,
} from "@/app/actions/integrationActions";
import {
  getInboundSources,
  saveInboundSource,
  deleteInboundSource,
} from "@/app/actions/inboundActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, Check, Trash2, Info } from "lucide-react";

interface IProps {
  boards: IBoard[];
}

type Platform = "discord" | "slack" | "custom";
type InboundType = "slack" | "discord" | "custom";

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

const INBOUND_HELP: Record<InboundType, { label: string; instructions: string[] }> = {
  slack: {
    label: "Slack",
    instructions: [
      "Go to api.slack.com/apps → create a new app.",
      "Enable Event Subscriptions → set Request URL to your endpoint URL below.",
      "Subscribe to bot events: message.channels",
      "Install the app to your workspace and invite it to the target channel.",
    ],
  },
  discord: {
    label: "Discord",
    instructions: [
      "Discord doesn't have native outgoing webhooks.",
      "Use Zapier, Make (formerly Integromat), or n8n to listen to Discord messages.",
      "Configure the automation to POST to your endpoint URL with body: { \"content\": \"...\", \"author\": \"...\" }",
      "Add Authorization: Bearer <token> header.",
    ],
  },
  custom: {
    label: "Custom HTTP",
    instructions: [
      "POST JSON to your endpoint URL with Authorization: Bearer <token>.",
      `Body: { "content": "feedback text", "author": "optional name" }`,
      "Example: curl -X POST <endpoint> -H \"Authorization: Bearer <token>\" -H \"Content-Type: application/json\" -d '{\"content\":\"Add dark mode\"}'",
    ],
  },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-muted transition"
      title="Copy"
    >
      {copied ? (
        <Check className="size-3.5 text-green-500" />
      ) : (
        <Copy className="size-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export default function IntegrationsClient({ boards }: IProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    boards[0]?.id ?? ""
  );
  // Outbound webhook state
  const [platform, setPlatform] = useState<Platform>("discord");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [existing, setExisting] = useState<Integration | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Inbound sources state
  const [inboundSources, setInboundSources] = useState<IInboundSource[]>([]);
  const [inboundType, setInboundType] = useState<InboundType>("custom");
  const [inboundLabel, setInboundLabel] = useState("");
  const [inboundBoardId, setInboundBoardId] = useState<string>("");
  const [inboundResult, setInboundResult] = useState<{ endpointUrl: string; token: string } | null>(null);
  const [inboundMessage, setInboundMessage] = useState<string | null>(null);
  const [inboundPending, startInboundTransition] = useTransition();
  const [showInboundHelp, setShowInboundHelp] = useState<InboundType>("custom");

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const iframeSnippet = selectedBoardId
    ? `<iframe src="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com"}/embed/${selectedBoardId}" width="100%" height="600" frameborder="0"></iframe>`
    : "";

  useEffect(() => {
    if (!selectedBoardId) return;
    setExisting(null);
    setWebhookUrl("");
    setMessage(null);
    setInboundResult(null);
    setInboundMessage(null);
    getIntegration(selectedBoardId).then((data) => {
      if (data) {
        setExisting(data);
        setPlatform(data.type);
        setWebhookUrl(data.webhook_url);
      }
    });
    getInboundSources(selectedBoardId).then(setInboundSources);
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

  function handleAddInbound() {
    startInboundTransition(async () => {
      const result = await saveInboundSource(inboundBoardId || null, inboundType, inboundLabel);
      if (result.ok) {
        setInboundResult({ endpointUrl: result.endpointUrl, token: result.token });
        setInboundLabel("");
        setInboundMessage(null);
        if (inboundBoardId) {
          const updated = await getInboundSources(inboundBoardId);
          setInboundSources(updated);
        }
      } else {
        setInboundMessage(`Error: ${result.error}`);
      }
    });
  }

  function handleDeleteInbound(sourceId: string) {
    startInboundTransition(async () => {
      const result = await deleteInboundSource(sourceId);
      if (result.ok) {
        setInboundSources((prev) => prev.filter((s) => s.id !== sourceId));
      } else {
        setInboundMessage(`Error: ${result.error}`);
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
          <h2 className="font-semibold text-base">Webhook Notifications (Outbound)</h2>
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

      {/* Section C: Collect Feedback (Inbound) */}
      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="font-semibold text-base">Collect Feedback (Inbound)</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Receive feedback from Slack, Discord, or any HTTP client. Messages are
            grouped by AI and staged for your review before publishing.
          </p>
        </div>

        {/* Existing sources */}
        {inboundSources.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Active Sources</p>
            {inboundSources.map((src) => {
              const siteUrl =
                process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourdomain.com";
              const endpointUrl = `${siteUrl}/api/inbound/${src.id}`;
              return (
                <div
                  key={src.id}
                  className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                        {src.source_type}
                      </span>
                      {src.label && (
                        <span className="text-muted-foreground text-xs truncate">
                          {src.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted rounded px-2 py-0.5 truncate max-w-xs">
                        {endpointUrl}
                      </code>
                      <CopyButton text={endpointUrl} />
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted rounded px-2 py-0.5 truncate max-w-xs">
                        Token: {src.secret_token}
                      </code>
                      <CopyButton text={src.secret_token} />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteInbound(src.id)}
                    disabled={inboundPending}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                    title="Delete source"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add new source */}
        <div className="space-y-3 pt-1">
          <p className="text-sm font-medium">Add New Source</p>

          {/* Source type selector */}
          <div className="flex gap-2">
            {(["slack", "discord", "custom"] as InboundType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setInboundType(t); setShowInboundHelp(t); }}
                className={`px-3 py-1.5 rounded-md text-sm border transition capitalize ${
                  inboundType === t
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {t === "custom" ? "Custom" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Board assignment (optional) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Board <span className="text-muted-foreground font-normal">(optional)</span></label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={inboundBoardId}
              onChange={(e) => setInboundBoardId(e.target.value)}
            >
              <option value="">No board (global — assign when processing)</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <Input
            placeholder="Label (optional, e.g. #product-feedback)"
            value={inboundLabel}
            onChange={(e) => setInboundLabel(e.target.value)}
          />

          <Button
            size="sm"
            disabled={inboundPending}
            onClick={handleAddInbound}
          >
            Generate Endpoint
          </Button>

          {inboundMessage && (
            <p className="text-sm text-muted-foreground">{inboundMessage}</p>
          )}
        </div>

        {/* Newly generated result */}
        {inboundResult && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 space-y-2">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Endpoint created! Save these credentials — the token won&apos;t be shown again.
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted rounded px-2 py-1 flex-1 break-all">
                  {inboundResult.endpointUrl}
                </code>
                <CopyButton text={inboundResult.endpointUrl} />
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted rounded px-2 py-1 flex-1 break-all">
                  Bearer {inboundResult.token}
                </code>
                <CopyButton text={inboundResult.token} />
              </div>
            </div>
          </div>
        )}

        {/* Setup instructions */}
        <div className="rounded-lg bg-muted/60 p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-muted-foreground" />
            <p className="text-sm font-medium">
              How to connect {INBOUND_HELP[showInboundHelp].label}
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-1">
            {INBOUND_HELP[showInboundHelp].instructions.map((step, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-xs text-muted-foreground">
          After collecting feedback,{" "}
          <a href="/dashboard/staged" className="text-primary hover:underline">
            go to the Staging area
          </a>{" "}
          to process and review AI-grouped drafts.
        </p>
      </section>
    </div>
  );
}
