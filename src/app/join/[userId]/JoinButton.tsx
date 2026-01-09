"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinButton({ inviterId }: { inviterId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviterId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join");
      }

      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleJoin}
        disabled={isLoading}
        className="btn btn-primary w-full disabled:opacity-40"
      >
        {isLoading ? "Joining..." : "Join their circle"}
      </button>
      {error && (
        <p className="mt-3 text-sm" style={{ color: "#B85A45" }}>
          {error}
        </p>
      )}
    </div>
  );
}
