"use client";

import { useState } from "react";

export function InviteForm({ currentCount, userId }: { currentCount: number; userId: string }) {
  const [copied, setCopied] = useState(false);

  const canInvite = currentCount < 5;
  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/${userId}`
    : `/join/${userId}`;

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
      <p className="text-sm mb-3" style={{ color: "var(--ink-light)" }}>
        Share your invite link
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
          className="btn btn-primary"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-3 text-xs" style={{ color: "var(--ink-faint)" }}>
        Anyone with this link can join your Top 5
      </p>
    </div>
  );
}
