"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ConnectionWithFriend = {
  id: string;
  status: string;
  friend: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

export function ConnectionCard({
  connection,
}: {
  connection: ConnectionWithFriend;
}) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);

  const initial = connection.friend.name?.[0]?.toUpperCase() ||
    connection.friend.email[0].toUpperCase();

  async function handleRemove() {
    if (!confirm("Remove this connection?")) return;

    setIsRemoving(true);

    try {
      const response = await fetch(`/api/connections/${connection.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      router.refresh();
    } catch {
      alert("Failed to remove");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="card p-4 flex items-center gap-4 group">
      {connection.friend.image ? (
        <img
          src={connection.friend.image}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm"
          style={{ background: "var(--warm-light)", color: "var(--ink)" }}
        >
          {initial}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="truncate" style={{ color: "var(--ink)" }}>
          {connection.friend.name || connection.friend.email}
        </p>
        {connection.friend.name && (
          <p className="text-sm truncate" style={{ color: "var(--ink-faint)" }}>
            {connection.friend.email}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`status-dot ${
            connection.status === "ACCEPTED" ? "status-connected" : "status-pending"
          }`}
        />
        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="opacity-0 group-hover:opacity-100 btn-ghost text-sm disabled:opacity-40"
          style={{ color: "var(--ink-faint)" }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
