import Link from "next/link";
import type { Character, Episode } from "@/lib/types";
import type { Theme } from "@/lib/themes";

export function thumbOf(ep: Episode): string {
  return ep.thumbnail_url || (ep.youtube_id ? `https://i.ytimg.com/vi/${ep.youtube_id}/hqdefault.jpg` : "/img/cuts/cut_05.webp");
}

export function shortTitle(ep: Episode, seriesTitle: string) {
  return `${seriesTitle} EP.#${String(ep.number).padStart(2, "0")}`;
}

export function EpisodeCard({ ep, theme, seriesTitle, isNew }: { ep: Episode; theme: Theme; seriesTitle: string; isNew?: boolean }) {
  const href = `/${theme}/tapes/${ep.tape_code}`;
  if (theme === "ilbo") {
    return (
      <Link href={href} className="flex flex-col gap-1.5 text-fg no-underline group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbOf(ep)} alt="" className="w-full aspect-[3/4] object-cover object-top border border-line sepia-[.2] group-hover:sepia-0 transition" />
        <strong className="text-[14px]">{shortTitle(ep, seriesTitle)}</strong>
        <span className="text-[12px] text-muted">{ep.tape_code}{ep.q1 ? ` · ${ep.q1}` : ""}</span>
      </Link>
    );
  }
  return (
    <Link href={href} className="flex flex-col rounded-xl overflow-hidden bg-panel text-fg no-underline group">
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbOf(ep)} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
        <div className="absolute inset-0 scan opacity-60" aria-hidden="true" />
        {isNew && <span className="absolute top-2.5 left-2.5 bg-accent text-on-accent text-[13px] font-black px-2 py-1 rounded">NEW</span>}
      </div>
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-1.5">
        <span className="font-vt text-[20px] text-osd">{ep.tape_code}{ep.duration_sec ? ` · 00:${String(ep.duration_sec).padStart(2, "0")}` : ""}</span>
        <strong className="text-[16px]">{shortTitle(ep, seriesTitle)}</strong>
        <span className="text-[13px] text-muted line-clamp-2">{ep.q1 ? `Q1. ${ep.q1}` : "유튜브 · 틱톡 · 릴스"}</span>
      </div>
    </Link>
  );
}

export function CharacterChip({ c, theme }: { c: Character; theme: Theme }) {
  const href = `/${theme}/people/${c.slug}`;
  if (theme === "ilbo") {
    return (
      <Link href={href} className="border-r border-b border-line p-3.5 flex flex-col gap-1.5 text-fg no-underline hover:bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.face_url} alt="" className="w-full aspect-[4/3] object-contain" />
        <strong className={`font-han font-normal text-[26px] ${c.role === "main" ? "text-accent" : ""}`}>{c.name}</strong>
        <span className="text-[12px] text-muted">{c.age ? `${c.age}세 · ` : ""}{c.job}</span>
        <span className="text-[13px] leading-snug">&ldquo;{c.quote}&rdquo;</span>
      </Link>
    );
  }
  return (
    <Link href={href} className="rounded-xl bg-panel p-3 text-center text-fg no-underline hover:bg-panel2 transition-colors">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.face_url} alt="" className="w-[88px] h-[88px] object-contain mx-auto" />
      <div className="font-bold text-[15px] mt-1.5">{c.name}</div>
      <div className="text-[12px] text-muted">{c.tagline}</div>
    </Link>
  );
}

export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  return (
    <div className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
