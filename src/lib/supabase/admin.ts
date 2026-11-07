import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서비스 롤 클라이언트 — RLS 를 우회한다.
 *
 * ⚠️ 서버 전용. 클라이언트 컴포넌트에서 절대 import 하지 말 것.
 *
 * 용도: 호출자가 admin 임을 쿠키 세션으로 이미 검증한 뒤,
 * 실제 쓰기(스토리지 업로드 등)를 세션 만료·쿠키 유실과 무관하게
 * 안정적으로 수행하기 위함.
 *
 * SUPABASE_SERVICE_ROLE_KEY 가 없으면 null 을 반환한다 →
 * 호출부는 기존의 세션 클라이언트로 폴백한다.
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasServiceRole(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
