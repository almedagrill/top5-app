"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignInForm({ redirectTo = "/feed" }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-center p-3 rounded-lg" style={{
          background: "rgba(220, 38, 38, 0.1)",
          color: "#dc2626"
        }}>
          {error}
        </p>
      )}

      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
          style={{ width: "100%" }}
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
          style={{ width: "100%" }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-3 rounded-lg transition-colors text-sm font-medium"
        style={{
          background: "transparent",
          border: "1px solid var(--warm)",
          color: "var(--warm)",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
