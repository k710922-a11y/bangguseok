import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 어드민 소유자 이메일 — 이 계정만 /admin 에 들어올 수 있다. (해동기공·A.D.I 와 같은 방식)
 *
 * ⚠️ DB 쪽 public.is_owner() (supabase/schema.sql) 와 반드시 같은 값이어야 한다.
 */
export const OWNER_EMAIL = "k710922@gmail.com";

export function isOwnerEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === OWNER_EMAIL;
}

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export type AdminContext = {
  supabase: SupabaseClient;
  user: User;
};

/**
 * 쿠키 세션으로 호출자가 소유자인지 확인한다. 아니면 null.
 * getUser() 는 서버에서 JWT 를 검증하므로 신뢰할 수 있다.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  if (!supabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  if (!isOwnerEmail(user.email)) return null;
  return { supabase, user };
}
