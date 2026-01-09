import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { CreatePostForm } from "@/components/CreatePostForm";

export default async function CreatePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--paper)" }}>
      <Navigation />

      <main className="max-w-2xl mx-auto px-6 pt-20 sm:pt-24 pb-24">
        <div className="mb-8">
          <h1 className="text-2xl" style={{ color: "var(--ink)" }}>
            What shaped your week?
          </h1>
          <p className="mt-2" style={{ color: "var(--ink-light)" }}>
            Share up to 5 things
          </p>
        </div>

        <CreatePostForm />
      </main>
    </div>
  );
}
