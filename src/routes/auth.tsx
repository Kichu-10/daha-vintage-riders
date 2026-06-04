import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign In — DAHA Vintage MC" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, brother.");
        router.invalidate();
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 grain">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="font-stencil text-xs tracking-[0.5em] text-accent mb-4">DAHA · VINTAGE · MC</div>
          <h1 className="font-display text-5xl">{mode === "signin" ? "ENTER GARAGE" : "JOIN BROTHERHOOD"}</h1>
          <p className="font-body text-sm text-muted-foreground mt-3">
            Admin & member access only. Public visitors can browse the homepage.
          </p>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full mb-6 py-3 border border-foreground/30 hover:border-accent hover:text-accent transition font-body uppercase tracking-widest text-sm flex items-center justify-center gap-3"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.65 4.4-5.35 4.4a6.2 6.2 0 1 1 0-12.4c1.97 0 3.3.84 4.06 1.56l2.77-2.67C16.95 3.55 14.7 2.6 12 2.6 6.74 2.6 2.5 6.84 2.5 12.1S6.74 21.6 12 21.6c6.92 0 11.5-4.86 11.5-11.7 0-.8-.08-1.4-.15-1.8z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-background px-3 text-muted-foreground">or</span></div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              required
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border focus:border-accent outline-none font-body"
            />
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border focus:border-accent outline-none font-body"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-card border border-border focus:border-accent outline-none font-body"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent text-accent-foreground hover:bg-accent/90 transition font-body uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {loading ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 font-body text-sm text-muted-foreground">
          {mode === "signin" ? "Need an account?" : "Already a member?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-accent hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>

        <div className="text-center mt-8">
          <a href="/" className="font-stencil text-xs tracking-[0.4em] text-muted-foreground hover:text-accent">← BACK TO HOME</a>
        </div>
      </div>
    </div>
  );
}