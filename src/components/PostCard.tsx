type PostItem = {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  rank: number;
};

type PostWithItems = {
  id: string;
  title: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  items: PostItem[];
};

export function PostCard({ post }: { post: PostWithItems }) {
  const sortedItems = [...post.items].sort((a, b) => a.rank - b.rank);
  const initial = post.user.name?.[0]?.toUpperCase() || "?";

  return (
    <div
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {post.user.image ? (
          <img
            src={post.user.image}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
            style={{
              background: "var(--warm-light)",
              color: "var(--ink)",
            }}
          >
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" style={{ color: "var(--ink)" }}>
            {post.user.name}
          </p>
          <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            <span
              className="five text-xl w-4 text-right opacity-30 shrink-0"
            >
              {item.rank}
            </span>
            <div className="flex-1 min-w-0">
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: "var(--ink)" }}
                >
                  {item.title}
                  <svg
                    className="inline-block ml-1 opacity-40"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ) : (
                <p style={{ color: "var(--ink)" }}>{item.title}</p>
              )}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="mt-2 w-full max-w-sm rounded-lg object-cover"
                  style={{ maxHeight: "200px" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
