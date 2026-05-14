"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { sanitizeInternalRedirect } from "@/lib/auth/sanitize-internal-redirect";
import { createClient } from "@/lib/supabase/client";
import { shouldSkipLiveSupabase } from "@/lib/supabase/should-skip-live-supabase";
import type { User } from "@supabase/supabase-js";
import type { User as UserProfile } from "@/types/database.types";

interface AuthState {
  user:               User | null;
  profile:            UserProfile | null;
  loading:            boolean;
  isAdmin:            boolean;
  isTipster:          boolean;
  signOut:            () => Promise<void>;
  signInWithGoogle:   (nextPath?: string) => Promise<void>;
}

export function useAuth(): AuthState {
  const skipLive = useMemo(() => shouldSkipLiveSupabase(), []);
  const supabase = useMemo(
    () => (skipLive ? null : createClient()),
    [skipLive],
  );

  const [user, setUser]         = useState<User | null>(null);
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [loading, setLoading]   = useState(!skipLive);

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      setProfile(data as UserProfile | null);
    },
    [supabase],
  );

  useEffect(() => {
    if (skipLive || !supabase) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [skipLive, supabase, fetchProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, [supabase]);

  const signInWithGoogle = useCallback(
    async (nextPath?: string) => {
      if (!supabase) return;
      const next = sanitizeInternalRedirect(
        nextPath,
        window.location.origin,
        "/meu-feed",
      );
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    },
    [supabase],
  );

  return {
    user,
    profile,
    loading,
    isAdmin:   profile?.role === "admin",
    isTipster: profile?.role === "tipster" || profile?.role === "admin",
    signOut,
    signInWithGoogle,
  };
}
