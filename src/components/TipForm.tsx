"use client";

import { useState } from "react";

/** 방구석 늬우스 제보함 — 출처 링크 필수 */
export function TipForm({ theme }: { theme: "tv" | "ilbo" }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const tv = theme === "tv";
  const field = `w-full px-3 bg-bg border border-line text-fg text-[15px] ${tv ? "rounded-md" : "bg-white"}`;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const f = new FormData(form);
    const r = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f.entries())),
    }).then((x) => x.json()).catch(() => ({ ok: false, message: "통신 오류" }));
    setMsg(r.message ?? "");
    if (r.ok) form.reset();
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <label htmlFor={`tip-h-${theme}`} className="text-[13px] font-bold">황당 뉴스 제목</label>
        <input id={`tip-h-${theme}`} name="headline" required maxLength={200} className={`${field} h-12`} placeholder="예) 소파 타고 도로 달리다 경찰에 멈춰 세워져" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`tip-u-${theme}`} className="text-[13px] font-bold">출처 링크 (필수)</label>
        <input id={`tip-u-${theme}`} name="source_url" type="url" required className={`${field} h-12`} placeholder="https://" />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1 w-40">
          <label htmlFor={`tip-n-${theme}`} className="text-[13px] font-bold">닉네임 (선택)</label>
          <input id={`tip-n-${theme}`} name="nickname" maxLength={20} className={`${field} h-12`} />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label htmlFor={`tip-m-${theme}`} className="text-[13px] font-bold">한마디 (선택)</label>
          <input id={`tip-m-${theme}`} name="note" maxLength={1000} className={`${field} h-12`} />
        </div>
      </div>
      <p className="m-0 text-[13px] text-muted">사망·중상·재난·범죄 피해·약자 조롱 소재는 다루지 않습니다.</p>
      <button type="submit" disabled={busy} className={`self-start min-h-12 px-5 font-black text-[15px] bg-accent2 text-on-accent2 disabled:opacity-50 ${tv ? "rounded-md" : ""}`}>
        {busy ? "접수 중…" : "제보하기"}
      </button>
      {msg && <p role="status" className="m-0 text-[14px] font-bold">{msg}</p>}
    </form>
  );
}
