"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function EditPostForm({
  postId,
  initialItems,
}: {
  postId: string;
  initialItems: string[];
}) {
  const router = useRouter();
  const defaultItems = [...initialItems, "", "", "", "", ""].slice(0, 5);
  const [items, setItems] = useState<string[]>(defaultItems);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateItem(index: number, value: string) {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const filledItems = items.filter((item) => item.trim());
    if (filledItems.length === 0) {
      setError("Add at least one item");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items
            .map((item, index) => ({
              title: item,
              rank: index + 1,
            }))
            .filter((item) => item.title.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      router.push("/feed");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const filledCount = items.filter((i) => i.trim()).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex items-center gap-3">
              <span className="five text-lg w-5 text-right opacity-30">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder="Add something..."
                className="flex-1 p-3 rounded-lg transition-all duration-200"
                style={{
                  background: item ? "var(--paper)" : "var(--paper-dark)",
                  border: "1px solid",
                  borderColor: item ? "var(--warm-light)" : "transparent",
                  color: "var(--ink)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm" style={{ color: "#B85A45" }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm"
          style={{ color: "var(--ink-faint)" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || filledCount === 0}
          className="btn btn-primary disabled:opacity-40"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
