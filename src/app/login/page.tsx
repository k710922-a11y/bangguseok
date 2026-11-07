"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { verifyAdminAccess } from "./actions";

const DENIED_MESSAGE = "운영자(소유자) 계정만 들어갈 수 있습니다.";
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY_ = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function browserClient() {
  return createBrowserClient(URL_!, KEY_!);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = Boolean(URL_ && KEY_);

  // 권한 없는 계정으로 /admin 에 들어왔다가 튕겨난 경우 — 세션을 끊고 안내 (해동기공과 동일)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("denied") !== "1") return;
    window.history.replaceState(null, "", "/login");
    if (!configured) return;
    browserClient()
      .auth.signOut()
      .finally(() => setError(DENIED_MESSAGE));
  }, [configured]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return;
    setError("");
    setLoading(true);
    const supabase = browserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }
    if (!(await verifyAdminAccess())) {
      await supabase.auth.signOut();
      setError(DENIED_MESSAGE);
      setLoading(false);
      return;
    }
    // Next 16 에서 router.push 직후 refresh 하면 전환이 취소되는 문제가 있어 하드 이동 (해동기공과 동일)
    window.location.assign("/admin");
  }

  const input =
    "h-12 px-4 rounded-md bg-[#0B0907] border border-line text-fg text-[15px] outline-none focus:border-accent2";

  return (
    <main data-theme="admin" className="min-h-screen bg-bg text-fg flex items-center justify-center px-5 relative">
      <div className="absolute inset-0 noise opacity-[0.05]" aria-hidden="true" />
      <div className="relative w-full max-w-[380px]">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo_main.webp" alt="방구석 춘식&덕구" className="w-[220px] h-auto" />
          <p className="m-0 font-vt text-[22px] text-osd">OPERATOR LOGIN</p>
        </div>

        <div className="rounded-xl border border-line bg-panel p-7">
          {!configured && (
            <p className="m-0 mb-4 text-[14px] text-accent2 leading-relaxed">
              Supabase 가 아직 연결되지 않았습니다. Coolify 환경변수(NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)를 넣고 재배포하세요.
            </p>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-bold text-muted">이메일</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={input} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pw" className="text-[13px] font-bold text-muted">비밀번호</label>
              <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={input} />
            </div>
            {error && <p role="alert" className="m-0 text-[14px] font-bold text-accent">{error}</p>}
            <button
              type="submit"
              disabled={loading || !configured}
              className="h-12 mt-1 rounded-md bg-accent text-on-accent font-black text-[16px] disabled:opacity-50"
            >
              {loading ? "로그인 중…" : "로그인 →"}
            </button>
          </form>
        </div>
        <p className="text-center mt-5 text-[13px]">
          <Link href="/" className="text-muted">← 대문으로</Link>
        </p>
      </div>
    </main>
  );
}
