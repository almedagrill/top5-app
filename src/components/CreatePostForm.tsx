"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface PostItem {
  title: string;
  url: string;
  imageUrl: string;
}

const emptyItem: PostItem = { title: "", url: "", imageUrl: "" };

export function CreatePostForm() {
  const router = useRouter();
  const [items, setItems] = useState<PostItem[]>([
    { ...emptyItem },
    { ...emptyItem },
    { ...emptyItem },
    { ...emptyItem },
    { ...emptyItem },
  ]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateItem(index: number, field: keyof PostItem, value: string) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  }

  function toggleExpand(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const filledItems = items.filter((item) => item.title.trim());
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
              title: item.title,
              description: "",
              url: item.url || "",
              imageUrl: item.imageUrl || "",
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

  const filledCount = items.filter((i) => i.title.trim()).length;

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
      <div className="space-y-3">
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
              <span className="five text-lg w-5 text-right opacity-30 mt-3">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder="Add something..."
                    className="flex-1 p-3 rounded-lg transition-all duration-200"
                    style={{
                      background: item.title ? "var(--paper)" : "var(--paper-dark)",
                      border: "1px solid",
                      borderColor: item.title ? "var(--warm-light)" : "transparent",
                      color: "var(--ink)",
                    }}
                    onFocus={(e) => {
                      e.target.style.background = "var(--paper)";
                      e.target.style.borderColor = "var(--warm)";
                    }}
                    onBlur={(e) => {
                      if (!item.title) {
                        e.target.style.background = "var(--paper-dark)";
                        e.target.style.borderColor = "transparent";
                      } else {
                        e.target.style.borderColor = "var(--warm-light)";
                      }
                    }}
                  />
                  {item.title && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(index)}
                      className="px-3 py-3 rounded-lg transition-colors"
                      style={{
                        background: expandedIndex === index ? "var(--warm-light)" : "var(--paper-dark)",
                        color: "var(--ink-light)",
                      }}
                      title="Add link or image"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Expanded fields */}
                {expandedIndex === index && (
                  <div className="space-y-2 pl-0">
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => updateItem(index, "url", e.target.value)}
                      placeholder="Add link (optional)"
                      className="w-full p-2.5 text-sm rounded-lg"
                      style={{
                        background: "var(--paper-dark)",
                        border: "1px solid var(--warm-faint)",
                        color: "var(--ink)",
                      }}
                    />
                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                      placeholder="Add image URL (optional)"
                      className="w-full p-2.5 text-sm rounded-lg"
                      style={{
                        background: "var(--paper-dark)",
                        border: "1px solid var(--warm-faint)",
                        color: "var(--ink)",
                      }}
                    />
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Show indicators if link/image added */}
                {!expandedIndex && (item.url || item.imageUrl) && (
                  <div className="flex gap-2 text-xs" style={{ color: "var(--ink-faint)" }}>
                    {item.url && <span>link added</span>}
                    {item.imageUrl && <span>image added</span>}
                  </div>
                )}
              </div>
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
