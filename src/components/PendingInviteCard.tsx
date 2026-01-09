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

  async function handleCancel() {
    if (!confirm(`Cancel invite to ${invite.email}?`)) return;

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
      <span style={{ color: "var(--ink)" }}>{invite.email}</span>
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
