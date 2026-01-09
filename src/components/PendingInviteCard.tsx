"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PendingInviteCardProps {
  invite: {
    id: string;
    email: string;
  };
}

export function PendingInviteCard({ invite }: PendingInviteCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isLinkInvite = invite.email.endsWith("@invite.local");
  const displayText = isLinkInvite ? "Invite link" : invite.email;

  async function handleCancel() {
    if (!confirm(isLinkInvite ? "Cancel this invite link?" : `Cancel invite to ${invite.email}?`)) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/invites/${invite.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to cancel invite:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="card p-4 flex items-center justify-between">
      <span style={{ color: "var(--ink)" }}>{displayText}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          className="text-sm transition-colors"
          style={{ color: "var(--ink-faint)" }}
        >
          {isDeleting ? "..." : "Cancel"}
        </button>
        <span className="status-dot status-pending" />
      </div>
    </div>
  );
}
