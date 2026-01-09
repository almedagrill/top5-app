type PostItem = {
  id: string;
  title: string;
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

const urlRegex = /(https?:\/\/[^\s]+)/g;

function TextWithLinks({ text }: { text: string }) {
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline break-all"
              style={{ color: "var(--warm)" }}
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

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

      {/* Items - simple list */}
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <div key={item.id} className="flex gap-4">
            <span
              className="five text-xl w-4 text-right opacity-30"
            >
              {item.rank}
            </span>
            <p style={{ color: "var(--ink)" }}>
              <TextWithLinks text={item.title} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
