"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthDialog } from "@/components/auth-dialog";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (!error) setEmail(null);
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto min-h-[50vh] max-w-3xl px-4 pb-16 pt-28 sm:px-8">
        <h1 className="text-3xl font-bold">Account</h1>
        {email ? (
          <div className="mt-6 space-y-4">
            <p className="text-muted-foreground">Signed in as {email}</p>
            <Button variant="secondary" onClick={signOut}>Sign out</Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-muted-foreground">Sign in or create an account to continue.</p>
            <Button onClick={() => setAuthOpen(true)}>Sign in</Button>
          </div>
        )}
      </section>
      <Footer />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </main>
  );
}