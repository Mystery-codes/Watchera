"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const showGoogleSignIn = false;

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem("watchera_email");
      if (saved) setEmail(saved);
      setPassword("");
      setError(null);
      setMessage(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`;
    const { data, error } =
      mode === "sign-up"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      localStorage.setItem("watchera_email", email);
      if (mode === "sign-up" && !data.session) {
        setMessage("Check your email to confirm your account, then sign in.");
      } else {
        onOpenChange(false);
      }
    }

    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "sign-in" ? "Sign in to Watchera" : "Create your Watchera account"}</DialogTitle>
          <DialogDescription>
            {mode === "sign-in"
              ? "Enter your email and password to continue."
              : "Create an account with your email and a secure password."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 rounded-md bg-muted p-1">
          <Button
            type="button"
            variant={mode === "sign-in" ? "secondary" : "ghost"}
            onClick={() => setMode("sign-in")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === "sign-up" ? "secondary" : "ghost"}
            onClick={() => setMode("sign-up")}
          >
            Sign up
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            required
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-green-500">{message}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {showGoogleSignIn && (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            Google
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
