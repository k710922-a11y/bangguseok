"use client";

import { useState } from "react";
import Link from "next/link";
import type { EpisodeBonus } from "@/lib/types";

type Result = {
  ok: boolean;
  message?: string;
  episode?: { tape_code: string; title: string; q1: string | null; q2: string | null };
  bonus?: EpisodeBonus | null;
};

/** 쇼츠 엔딩의 테이프 코드 입력 → 보너스 공개 (쇼츠 → 웹 랜딩의 핵심 장치) */
export function TapeCodeForm({ theme, defaultCode = "" }: { theme: "tv" | "ilbo"; defaultCode?: string }) {
  const [code, setCode] = useState(defaultCode);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const tv = theme === "tv";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setRes(null);
    try {
      const r = await fetch("/api/tape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      setRes(await r.json());
    } catch {
      setRes({ ok: false, message: "통신 오류. 안테나를 다시 맞춰 보세요." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-wrap gap-3">
        <label htmlFor={`tape-${theme}`} className="sr-only-input">테이프 코드</label>
        <input
          id={`tape-${theme}`}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="VHS-0101"
          autoComplete="off"
          className={
            tv
              ? "flex-1 min-w-[200px] h-14 px-5 rounded-md bg-[#0B0907] border-2 border-[#5A4231] text-osd font-vt text-[30px] tracking-[3px] outline-none focus:border-accent2"
              : "flex-1 min-w-[200px] h-13 px-4 bg-white border border-line text-fg text-[22px] font-bold tracking-[2px] outline-none focus:border-accent"
          }
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className={
            tv
              ? "h-14 px-7 rounded-md bg-accent text-on-accent font-black text-[17px] disabled:opacity-50"
              : "h-13 px-6 bg-accent text-on-accent font-black text-[16px] disabled:opacity-50"
          }
        >
          {busy ? "되감는 중…" : tv ? "▶ 재생" : "응모하기"}
        </button>
      </form>

      {res && !res.ok && <p role="alert" className="text-[15px] font-bold text-accent">{res.message}</p>}

      {res?.ok && res.episode && (
        <div
          role="status"
          className={tv ? "rounded-lg bg-[#0B0907] border border-[#5A4231] p-5 flex flex-col gap-3" : "bg-white border-2 border-dashed border-line p-5 flex flex-col gap-3"}
        >
          <div className={tv ? "font-vt text-[22px] text-osd osd-glow" : "text-[13px] font-black text-accent"}>
            {tv ? `PLAY ▶ ${res.episode.tape_code}` : `당첨! ${res.episode.tape_code}`}
          </div>
          <strong className="text-[17px]">{res.episode.title}</strong>
          {res.bonus ? (
            <dl className="grid gap-2 text-[15px] leading-relaxed">
              {res.episode.q1 && res.bonus.q1_answer && (
                <div><dt className="text-muted text-[13px]">Q1. {res.episode.q1}</dt><dd className="font-bold">→ {res.bonus.q1_answer}</dd></div>
              )}
              {res.episode.q2 && res.bonus.q2_answer && (
                <div><dt className="text-muted text-[13px]">Q2. {res.episode.q2}</dt><dd className="font-bold">→ {res.bonus.q2_answer}</dd></div>
              )}
              {res.bonus.q2_explain && <div><dt className="text-muted text-[13px]">해설</dt><dd>{res.bonus.q2_explain}</dd></div>}
              {res.bonus.fly_count !== null && res.bonus.fly_count !== undefined && (
                <div><dt className="text-muted text-[13px]">숨은 파리</dt><dd className="font-bold">{res.bonus.fly_count}마리</dd></div>
              )}
              {res.bonus.note && <div><dt className="text-muted text-[13px]">비하인드</dt><dd>{res.bonus.note}</dd></div>}
            </dl>
          ) : (
            <p className="text-[15px] text-muted">이 테이프의 보너스는 아직 준비 중입니다. 다음 화를 기다려 주세요.</p>
          )}
          <Link href={`/${theme}/tapes/${res.episode.tape_code}`} className="font-bold text-[15px] underline underline-offset-4">
            이 회차 페이지로 →
          </Link>
        </div>
      )}
    </div>
  );
}
