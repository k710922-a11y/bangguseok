"use client";

import { useEffect, useMemo, useState } from "react";
import type { Theme } from "@/lib/themes";

/** public/data/ajae-dict.json 한 줄 — i 번호, c 분류, q 질문, a 정답, e 풀이, s 출처 */
type Gag = { i: number; c: string; q: string; a: string; e?: string; s?: string };

const PAGE = 24;
const ALL = "전체";
const FACE = {
  chunsik: "/img/faces/chunsik_smug.webp",
  chunsikLaugh: "/img/faces/chunsik_laugh.webp",
  deokgu: "/img/faces/deokgu_wrong.webp",
  deokguLaugh: "/img/faces/deokgu_laugh.webp",
};
const DEOKGU_WRONG = ["어… 몰라… 그냥 밥?", "그거 나 아는데… 까먹었어.", "음… 라면?", "정답은… 내일 알려줄게.", "아… 졸려…"];

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

function readUrl() {
  if (typeof window === "undefined") return { q: "", c: ALL };
  const p = new URLSearchParams(window.location.search);
  return { q: p.get("q") ?? "", c: p.get("c") ?? ALL };
}

export function AjaeDict({ theme }: { theme: Theme }) {
  const tv = theme === "tv";
  const [data, setData] = useState<Gag[] | null>(null);
  const [failed, setFailed] = useState(false);
  // 주소창의 ?q=&c= 로 시작 (목록은 데이터 로드 뒤에만 그려지므로 서버 렌더와 어긋나지 않음)
  const [query, setQuery] = useState(() => readUrl().q);
  const [cat, setCat] = useState(() => readUrl().c);
  const [limit, setLimit] = useState(PAGE);
  const [openAll, setOpenAll] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/data/ajae-dict.json")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Gag[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  // 검색어·분류를 주소에 남겨 공유할 수 있게
  useEffect(() => {
    if (!data) return;
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    if (cat !== ALL) p.set("c", cat);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [query, cat, data]);

  const cats = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of data ?? []) m.set(g.c, (m.get(g.c) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const list = useMemo(() => {
    if (!data) return [];
    const k = norm(query);
    return data.filter((g) => (cat === ALL || g.c === cat) && (!k || norm(g.q + g.a + (g.e ?? "")).includes(k)));
  }, [data, query, cat]);

  if (failed) {
    return <p className="text-muted">테이프가 씹혔다… 잠시 후 새로고침해 주세요.</p>;
  }
  if (!data) {
    return (
      <div className={tv ? "rounded-xl bg-panel p-10 text-center font-vt text-[28px] text-osd osd-glow" : "border-2 border-line bg-panel p-10 text-center font-myeongjo font-bold text-[20px]"}>
        {tv ? "◀◀ 테이프 감는 중…" : "윤전기 돌리는 중…"}
      </div>
    );
  }

  const toggle = (i: number) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const chip = (active: boolean) =>
    tv
      ? `shrink-0 min-h-10 px-3.5 rounded-full text-[14px] font-bold border ${active ? "bg-accent2 text-on-accent2 border-accent2" : "border-line text-muted hover:text-fg"}`
      : `shrink-0 min-h-10 px-3 text-[14px] font-bold border ${active ? "bg-accent2 text-on-accent2 border-accent2" : "border-line hover:bg-panel2"}`;

  return (
    <div className="flex flex-col gap-8">
      <TodayPick data={data} tv={tv} />

      {/* 검색 · 분류 */}
      <section className={tv ? "rounded-xl bg-panel p-5 sm:p-6 flex flex-col gap-4" : "border-2 border-line bg-panel p-5 flex flex-col gap-4"} aria-label="찾아보기">
        <div className="flex flex-wrap gap-2.5">
          <label htmlFor={`dict-q-${theme}`} className="sr-only-input">개그 검색</label>
          <input
            id={`dict-q-${theme}`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="낱말로 찾기 — 예: 바나나, 펭귄, 왕"
            className={`flex-1 min-w-[200px] h-12 px-4 text-[16px] outline-none ${tv ? "rounded-lg bg-bg border border-line text-fg placeholder:text-muted focus:border-accent2" : "bg-white border-2 border-line text-[#1B1612]"}`}
          />
          <button
            type="button"
            onClick={() => setOpenAll((v) => !v)}
            className={tv ? "h-12 px-4 rounded-lg border border-line font-bold text-[15px] hover:border-accent2" : "h-12 px-4 border-2 border-line font-bold text-[15px] hover:bg-panel2"}
          >
            {openAll ? "정답 다시 가리기" : "정답 다 펼치기"}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="분류">
          {[[ALL, data.length] as const, ...cats].map(([c, n]) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => {
                setCat(c);
                setLimit(PAGE);
              }}
              className={chip(cat === c)}
            >
              {c} <span className="opacity-70 font-normal">{n.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-baseline justify-between gap-3">
        <p className={`m-0 ${tv ? "font-vt text-[22px] text-osd" : "font-black text-[14px] text-accent"}`}>
          {tv ? `▶ ${list.length.toLocaleString()} 문제 재생 가능` : `${list.length.toLocaleString()}문제 수록`}
        </p>
        {(query || cat !== ALL) && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCat(ALL);
              setLimit(PAGE);
            }}
            className="text-[14px] font-bold underline text-muted hover:text-fg"
          >
            처음부터
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className={tv ? "rounded-xl bg-panel p-8 flex items-center gap-4" : "border-2 border-line bg-panel p-6 flex items-center gap-4"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FACE.deokgu} alt="덕구" className="w-16 h-auto" />
          <p className="m-0 text-[17px] font-bold">덕구: &ldquo;그런 개그는… 없는데? 다른 낱말로 찾아봐.&rdquo;</p>
        </div>
      ) : (
        <ul className={`list-none m-0 p-0 grid sm:grid-cols-2 lg:grid-cols-3 ${tv ? "gap-4" : "border-t-2 border-l-2 border-line"}`}>
          {list.slice(0, limit).map((g) => (
            <GagCard key={g.i} g={g} tv={tv} shown={openAll || open.has(g.i)} onToggle={() => toggle(g.i)} />
          ))}
        </ul>
      )}

      {limit < list.length && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE * 2)}
          className={`self-center min-h-12 px-8 font-black text-[16px] ${tv ? "rounded-lg bg-accent2 text-on-accent2" : "bg-accent2 text-on-accent2"}`}
        >
          {tv ? "▶▶ 빨리감기" : "다음 장 넘기기"} <span className="font-normal opacity-80">({(list.length - limit).toLocaleString()}개 남음)</span>
        </button>
      )}

      <p className="m-0 text-[13px] text-muted leading-relaxed">
        출처: 유튜브 아재개그 영상, 굿엔젤랭킹 아재개그 백과사전, 공개 GitHub 데이터, 폭스씨지·다음 카페·티스토리 넌센스 퀴즈 모음. 겹치는 문제는 하나만 남겼습니다.
      </p>
    </div>
  );
}

function GagCard({ g, tv, shown, onToggle }: { g: Gag; tv: boolean; shown: boolean; onToggle: () => void }) {
  const no = String(g.i).padStart(4, "0");
  return (
    <li className={tv ? "rounded-xl bg-panel border border-line hover:border-[#6E5A47]" : "border-r-2 border-b-2 border-line bg-panel/60 hover:bg-panel"}>
      <button type="button" onClick={onToggle} aria-expanded={shown} className="w-full h-full text-left p-5 flex flex-col gap-3">
        <span className="flex items-center justify-between gap-2">
          <span className={tv ? "font-vt text-[20px] text-osd" : "font-black text-[12px] text-accent tracking-wide"}>{tv ? `Q.${no}` : `제${g.i}문`}</span>
          <span className={tv ? "text-[12px] text-muted border border-line rounded px-1.5 py-0.5" : "text-[12px] text-muted border border-line px-1.5 py-0.5"}>{g.c}</span>
        </span>
        <span className={`text-[18px] leading-snug ${tv ? "font-bold" : "font-myeongjo font-extrabold"}`}>{g.q}</span>
        {shown ? (
          <span className="flex flex-col gap-1.5" role="status">
            <span className={`text-[20px] font-black ${tv ? "text-accent2" : "text-accent"}`}>→ {g.a}</span>
            {g.e && <span className="text-[14px] text-muted leading-relaxed">{g.e}</span>}
            {g.s && <span className="text-[12px] text-muted opacity-80">출처 · {g.s}</span>}
          </span>
        ) : (
          <span className={`text-[14px] font-bold ${tv ? "text-muted" : "text-muted underline"}`}>{tv ? "▶ 눌러서 정답 재생" : "정답은 뒤집어서 →"}</span>
        )}
      </button>
    </li>
  );
}

/** 오늘의 한 문제 — 날짜로 고정, '다른 문제'로 무작위 */
function TodayPick({ data, tv }: { data: Gag[]; tv: boolean }) {
  const [idx, setIdx] = useState(() => Math.floor(Date.now() / 86_400_000) % data.length);
  const [shown, setShown] = useState(false);
  const g = data[idx];
  const wrong = DEOKGU_WRONG[g.i % DEOKGU_WRONG.length];

  return (
    <section
      aria-label="오늘의 아재개그"
      className={tv ? "rounded-2xl bg-[#F3E9D8] text-[#1B1612] p-6 sm:p-7 flex flex-col gap-4" : "bg-panel border-2 border-line p-5 sm:p-6 flex flex-col gap-4"}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={tv ? "bg-logo-red text-white font-black text-[13px] px-2.5 py-1 rounded" : "bg-accent text-on-accent font-black text-[13px] px-2.5 py-1"}>
          오늘의 아재개그
        </span>
        <span className="text-[14px] text-[#5B4C3C]">
          {g.c} · {tv ? `Q.${String(g.i).padStart(4, "0")}` : `제${g.i}문`}
        </span>
      </div>
      <div className="flex gap-4 items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shown ? FACE.chunsikLaugh : FACE.chunsik} alt="춘식" className="w-20 h-auto shrink-0" />
        <p className={`m-0 bg-white border-2 border-[#1B1612] rounded-2xl px-4 py-3 font-bold text-[19px] leading-relaxed text-[#1B1612] ${tv ? "" : "font-myeongjo"}`}>
          &ldquo;{`잘 들어라. ${g.q} 키히히힉!`}&rdquo;
        </p>
      </div>
      {shown && (
        <div className="flex flex-col gap-3" role="status">
          <div className="flex gap-3 items-start justify-end">
            <p className="m-0 bg-[#FFF4C9] border-2 border-dashed border-[#8A6D1E] rounded-2xl px-4 py-2.5 text-[16px] text-[#3B2F12]">덕구: &ldquo;{wrong}&rdquo;</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FACE.deokgu} alt="덕구" className="w-16 h-auto shrink-0" />
          </div>
          <p className="m-0 text-[20px] font-black text-[#1B1612]">
            정답: <span className="text-logo-red">{g.a}</span>
          </p>
          {g.e && <p className="m-0 text-[15px] text-[#5B4C3C] leading-relaxed">{g.e}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2.5">
        <button type="button" onClick={() => setShown(true)} disabled={shown} className="h-12 px-5 rounded-lg bg-[#1B1612] text-[#F3E9D8] font-black text-[16px] disabled:opacity-40">
          정답 공개
        </button>
        <button
          type="button"
          onClick={() => {
            setIdx(Math.floor(Math.random() * data.length));
            setShown(false);
          }}
          className="h-12 px-4 rounded-lg border-2 border-[#1B1612] font-bold text-[15px] text-[#1B1612]"
        >
          다른 문제
        </button>
      </div>
    </section>
  );
}
