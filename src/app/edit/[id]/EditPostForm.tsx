"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

function AutoExpandTextarea({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  style: React.CSSProperties;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="flex-1 p-3 rounded-lg transition-all duration-200 resize-none overflow-hidden"
      style={{
        ...style,
        minHeight: "48px",
        lineHeight: "1.5",
      }}
    />
  );
}

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
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index}>
            <div className="flex items-start gap-3">
              <span className="five text-lg w-5 text-right opacity-30 pt-3">
                {index + 1}
              </span>
              <AutoExpandTextarea
                value={item}
                onChange={(value) => updateItem(index, value)}
                placeholder="What shaped your week? Share a thought, link, or recommendation..."
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
