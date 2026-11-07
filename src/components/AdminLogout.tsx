"use client";

import { createBrowserClient } from "@supabase/ssr";

export function AdminLogout() {
  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.assign("/login");
  }
  return (
    <button type="button" onClick={handleLogout} className="min-h-10 px-3 text-[13px] font-bold text-muted hover:text-accent">
      로그아웃
    </button>
  );
}
