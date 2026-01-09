"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteForm({ currentCount }: { currentCount: number }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canInvite = currentCount < 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInviteLink("");

    if (!email.trim()) {
      setError("Enter an email");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invite");
      }

      setInviteLink(data.inviteLink);
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
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
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="friend@email.com"
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary disabled:opacity-40"
        >
          {isSubmitting ? "..." : "Invite"}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm" style={{ color: "#B85A45" }}>
          {error}
        </p>
      )}

      {inviteLink && (
        <div className="mt-4 flex gap-2">
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
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
