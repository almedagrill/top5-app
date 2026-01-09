"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

function AutoExpandTextarea({
  value,
  onChange,
  placeholder,
  style,
  onFocus,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  style: React.CSSProperties;
  onFocus: () => void;
  onBlur: () => void;
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
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

const suggestions = [
  "podcast episode",
  "book or article",
  "song or album",
  "restaurant or meal",
  "workout or routine",
  "product you bought",
  "quote that stuck",
  "movie or show",
  "place you went",
  "app or tool",
  "recipe you made",
  "newsletter",
];

interface CreatePostFormProps {
  initialItems?: string[];
}

export function CreatePostForm({ initialItems = [] }: CreatePostFormProps) {
  const router = useRouter();

  // Pad with empty strings to always have 5 slots
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
      setError("Share at least one thing from your week");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const title = `Week of ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          periodType: "WEEKLY",
          items: items
            .map((item, index) => ({
              title: item,
              description: "",
              url: "",
              category: "OTHER",
              rank: index + 1,
            }))
            .filter((item) => item.title.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
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
      {/* Suggestions */}
      <div
        className="p-4 rounded-lg"
        style={{ background: "var(--paper-dark)" }}
      >
        <p className="text-xs font-medium mb-3" style={{ color: "var(--ink-faint)" }}>
          Ideas for things to share
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <span
              key={suggestion}
              className="text-xs px-2.5 py-1 rounded-full"
              style={{
                background: "var(--paper)",
                color: "var(--ink-light)",
                border: "1px solid var(--warm-faint)",
              }}
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="animate-in"
            style={{
              opacity: 0,
              animationDelay: `${index * 0.05}s`,
            }}
          >
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
                onFocus={() => {
                  const el = document.activeElement as HTMLTextAreaElement;
                  if (el) {
                    el.style.background = "var(--paper)";
                    el.style.borderColor = "var(--warm)";
                  }
                }}
                onBlur={() => {
                  const el = document.activeElement as HTMLTextAreaElement;
                  if (el && !item) {
                    el.style.background = "var(--paper-dark)";
                    el.style.borderColor = "transparent";
                  } else if (el) {
                    el.style.borderColor = "var(--warm-light)";
                  }
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

      {/* Submit */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm" style={{ color: "var(--ink-faint)" }}>
          {filledCount} of 5
        </span>
        <button
          type="submit"
          disabled={isSubmitting || filledCount === 0}
          className="btn btn-primary disabled:opacity-40"
        >
          {isSubmitting ? "Sharing..." : "Share"}
        </button>
      </div>
    </form>
  );
}
