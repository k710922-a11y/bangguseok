"use client";

import { useState } from "react";
import type { WrongAnswer } from "@/lib/types";

/** 오답 명예의 전당 — 목록·투표 + 제출 폼 (제출은 승인 후 공개) */
export function WrongAnswerBoard({
  initial,
  theme,
  episodeCode,
}: {
  initial: WrongAnswer[];
  theme: "tv" | "ilbo";
  episodeCode?: string;
}) {
  const [list, setList] = useState(initial);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const tv = theme === "tv";

  async function vote(id: string) {
    if (voted[id]) return;
    setVoted((v) => ({ ...v, [id]: true }));
    const r = await fetch("/api/wrong-answers/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).then((x) => x.json()).catch(() => null);
    if (r?.ok) setList((l) => l.map((w) => (w.id === id ? { ...w, votes: r.votes ?? w.votes + 1 } : w)));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    const r = await fetch("/api/wrong-answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname, body, episode_code: episodeCode, website }),
    }).then((x) => x.json()).catch(() => ({ ok: false, message: "통신 오류" }));
    setMsg(r.message ?? (r.ok ? "접수 완료!" : "실패"));
    if (r.ok) setBody("");
    setBusy(false);
  }

  const card = tv ? "rounded-2xl bg-panel p-6 flex flex-col gap-4" : "border-t-2 border-line pt-4 flex flex-col gap-4";

  return (
    <div className={card}>
      <div className="flex items-center gap-2">
        <span className={tv ? "font-vt text-[24px] text-accent2" : "font-black text-[13px] text-accent"}>
          {tv ? "★ HALL OF 오답" : "독자 투고 · 오답 명예의 전당"}
        </span>
      </div>
      <p className="m-0 text-[14px] text-muted leading-relaxed">이번 주 1위 오답은 다음 화 엔딩에 닉네임이 나갑니다.</p>

      {list.length ? (
        <ol className="m-0 pl-0 list-none flex flex-col gap-2.5">
          {list.map((w, i) => (
            <li key={w.id} className="flex items-start gap-3">
              <span className={tv ? "font-vt text-[22px] text-accent2 w-6" : "font-myeongjo font-extrabold text-[20px] w-6"}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] leading-relaxed">&ldquo;{w.body}&rdquo;</div>
                <div className="text-[12px] text-muted">
                  {w.nickname}
                  {w.status === "featured" ? " · 이번 주 1위" : ""}
                  {w.episode_code ? ` · ${w.episode_code}` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => vote(w.id)}
                disabled={voted[w.id]}
                className={`shrink-0 min-h-11 px-3 text-[13px] font-bold border border-line ${tv ? "rounded-md" : ""} disabled:opacity-60`}
                aria-label={`${w.nickname}의 오답에 투표`}
              >
                👍 {w.votes}
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="m-0 text-[15px] text-muted">아직 올라온 오답이 없습니다. 첫 번째 명예를 차지하세요.</p>
      )}

      <form onSubmit={submit} className="flex flex-col gap-2.5 pt-2">
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <div className="flex flex-wrap gap-2.5">
          <label className="sr-only-input" htmlFor={`nick-${theme}`}>닉네임</label>
          <input
            id={`nick-${theme}`}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            placeholder="닉네임"
            required
            className={`w-36 h-12 px-3 bg-bg border border-line text-fg text-[15px] ${tv ? "rounded-md" : "bg-white"}`}
          />
          <label className="sr-only-input" htmlFor={`body-${theme}`}>오답</label>
          <input
            id={`body-${theme}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={200}
            placeholder="더 어이없는 오답을 적어라"
            required
            className={`flex-1 min-w-[200px] h-12 px-3 bg-bg border border-line text-fg text-[15px] ${tv ? "rounded-md" : "bg-white"}`}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className={`self-start min-h-12 px-5 font-black text-[15px] bg-accent text-on-accent disabled:opacity-50 ${tv ? "rounded-md" : ""}`}
        >
          {busy ? "접수 중…" : "내 오답 올리기"}
        </button>
        {msg && <p role="status" className="m-0 text-[14px] font-bold">{msg}</p>}
      </form>
    </div>
  );
}
