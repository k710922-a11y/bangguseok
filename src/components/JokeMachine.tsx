"use client";

import { useState } from "react";
import type { Joke } from "@/lib/types";

const FACE: Record<string, string> = {
  chunsik: "/img/faces/chunsik_smug.webp",
  deokgu: "/img/faces/deokgu_wrong.webp",
};
const NAME: Record<string, string> = { chunsik: "춘식", deokgu: "덕구" };

/** 아재개그 자판기 — 출제자가 묻고, 내가 답하고, 상대가 오답으로 편을 든다 */
export function JokeMachine({ initial, theme }: { initial: Joke; theme: "tv" | "ilbo" }) {
  const [joke, setJoke] = useState(initial);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const tv = theme === "tv";
  const asker = joke.asker === "deokgu" ? "deokgu" : "chunsik";
  const other = asker === "chunsik" ? "deokgu" : "chunsik";
  const hit = revealed && guess.trim() && joke.answer.replace(/\s|\(.*\)/g, "").includes(guess.replace(/\s/g, ""));

  async function next() {
    setLoading(true);
    try {
      const j = await fetch(`/api/jokes/random?not=${encodeURIComponent(joke.id)}`).then((r) => r.json());
      if (j) setJoke(j);
      setGuess("");
      setRevealed(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={tv ? "rounded-2xl bg-[#F3E9D8] text-[#1B1612] p-6 sm:p-7 flex flex-col gap-4" : "bg-panel border border-line p-5 flex flex-col gap-4"}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={tv ? "bg-logo-red text-white font-black text-[13px] px-2.5 py-1 rounded" : "bg-accent text-on-accent font-black text-[13px] px-2.5 py-1"}>
          아재개그 자판기
        </span>
        <span className="text-[14px] text-[#5B4C3C]">맞히면 {NAME[asker]} 폭소, 틀리면 {NAME[other]}가 편들어 줌</span>
      </div>

      <div className="flex gap-4 items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FACE[asker]} alt={NAME[asker]} className="w-20 h-auto shrink-0" />
        <p className={`m-0 bg-white border-2 border-[#1B1612] rounded-2xl px-4 py-3 font-bold text-[18px] leading-relaxed ${tv ? "" : "font-myeongjo"}`}>
          &ldquo;잘 들어라. {joke.question} {asker === "chunsik" ? "키히히힉!" : "으헤헤…"}&rdquo;
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setRevealed(true);
        }}
        className="flex flex-wrap gap-2.5"
      >
        <label htmlFor={`guess-${theme}`} className="sr-only-input">내 답</label>
        <input
          id={`guess-${theme}`}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="내 답을 적어라"
          className="flex-1 min-w-[180px] h-12 px-4 border-2 border-[#1B1612] rounded-lg text-[16px] bg-white outline-none"
        />
        <button type="submit" className="h-12 px-5 rounded-lg bg-[#1B1612] text-[#F3E9D8] font-black text-[16px]">
          정답 공개
        </button>
        <button type="button" onClick={next} disabled={loading} className="h-12 px-4 rounded-lg border-2 border-[#1B1612] font-bold text-[15px] disabled:opacity-50">
          {loading ? "…" : "다른 문제"}
        </button>
      </form>

      {revealed && (
        <div className="flex flex-col gap-3" role="status">
          <div className="flex gap-3 items-start justify-end">
            <p className="m-0 bg-[#FFF4C9] border-2 border-dashed border-[#8A6D1E] rounded-2xl px-4 py-2.5 text-[16px] text-[#3B2F12]">
              {NAME[other]}: &ldquo;{joke.wrong_answer ?? "어… 몰라…"}&rdquo;
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FACE[other]} alt={NAME[other]} className="w-16 h-auto shrink-0" />
          </div>
          <p className="m-0 text-[18px] font-black">
            정답: <span className="text-logo-red">{joke.answer}</span>
            {guess.trim() ? (hit ? "  — 크하학! 맞혔다!" : "  — 틀렸어 임마… 으헤헤") : ""}
          </p>
        </div>
      )}
    </div>
  );
}
