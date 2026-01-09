"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteForm({ currentCount }: { currentCount: number }) {
  const router = useRouter();
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const canInvite = currentCount < 5;

  async function getInviteLink() {
    setError("");
    setInviteLink("");
    setCopied(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      setInviteLink(data.inviteLink);

      // Auto-copy to clipboard
      await navigator.clipboard.writeText(data.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!canInvite) {
    return (
      <div
        className="card p-6 text-center"
        style={{ background: "var(--warm-faint)" }}
      >
        <span className="five text-2xl">5/5</span>
        <p className="mt-2" style={{ color: "var(--ink-light)" }}>
          Your circle is complete
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {!inviteLink ? (
        <>
          <button
            onClick={getInviteLink}
            disabled={isLoading}
            className="btn btn-primary w-full disabled:opacity-40"
          >
            {isLoading ? "Creating..." : "Get invite link"}
          </button>
          {error && (
            <p className="mt-3 text-sm text-center" style={{ color: "#B85A45" }}>
              {error}
            </p>
          )}
        </>
      ) : (
        <div>
          <p className="text-sm mb-3" style={{ color: "var(--ink-light)" }}>
            {copied ? "Copied!" : "Share this link:"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="input flex-1 text-sm"
              style={{ background: "var(--paper-dark)" }}
            />
            <button
              type="button"
              onClick={copyLink}
              className="btn btn-secondary"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setInviteLink("")}
            className="mt-4 text-sm w-full"
            style={{ color: "var(--ink-faint)" }}
          >
            Get another link
          </button>
        </div>
      )}
    </div>
  );
}
