import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Supabase 미설정(로컬 미리보기·첫 빌드) — 세션 갱신 없이 통과
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 먼저 request에 반영
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // response 재생성 후 Set-Cookie + 캐시 방지 헤더 적용
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // 세션 쿠키 갱신 (만료 시 재발급) — response 반환 전에 반드시 호출
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    // 정적 자원·이미지 제외, 나머지 모든 경로에서 실행
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
