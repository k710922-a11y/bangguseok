import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EpisodeCard } from "@/components/Cards";
import { getCharacter, listEpisodes, listSeries } from "@/lib/data";
import type { Theme } from "@/lib/themes";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ theme: string; slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const c = await getCharacter((await params).slug);
  return c ? { title: `${c.name} — ${c.tagline}`, description: c.quote, openGraph: { images: [c.sheet_url ?? c.face_url] } } : {};
}

export default async function Person({ params }: P) {
  const { theme: t, slug } = await params;
  const theme = t as Theme;
  const c = await getCharacter(slug);
  if (!c) notFound();
  const [episodes, series] = await Promise.all([listEpisodes({ character: c.slug }), listSeries()]);
  const sTitle = (s: string) => series.find((x) => x.slug === s)?.title ?? s;
  const tv = theme === "tv";
  const rows: [string, string | null][] = [
    ["나이", c.age ? `${c.age}세` : null],
    ["직업", c.job],
    ["성격", c.personality],
    ["웃음 기능", c.comic],
    ["고정 소품", c.props],
    ["스핀오프", c.spinoff],
  ];

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <Link href={`/${theme}/people`} className="text-[14px] font-bold text-muted">← {tv ? "방구석 사람들" : "인물 열전"}</Link>
      <div className="flex flex-wrap gap-8 mt-5 items-start">
        <div className="flex-[0_1_300px] min-w-[220px] flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.face_url} alt={c.name} className="w-full max-w-[280px] h-auto" />
        </div>
        <div className="flex-[1_1_480px] min-w-0 flex flex-col gap-4">
          <span className={tv ? "font-vt text-[24px] text-osd" : "font-black text-[13px] text-accent"}>{c.tagline}</span>
          <h1 className="m-0 font-han font-normal text-[56px] leading-none" style={{ color: c.role === "main" ? "var(--accent)" : undefined }}>
            {c.name}
          </h1>
          <blockquote className={`m-0 text-[20px] leading-relaxed font-bold ${tv ? "" : "font-myeongjo"}`}>&ldquo;{c.quote}&rdquo;</blockquote>
          <dl className={`m-0 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[15px] ${tv ? "rounded-xl bg-panel p-5" : "border-y-2 border-line py-4"}`}>
            {rows.filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-muted font-bold">{k}</dt>
                <dd className="m-0 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {c.sheet_url && (
        <figure className="mt-10 mb-0">
          <h2 className={`m-0 mb-3 text-[24px] ${tv ? "font-han font-normal" : "font-myeongjo font-extrabold"}`}>캐릭터시트</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.sheet_url} alt={`${c.name} 캐릭터시트 — 정면·3/4면·표정·소품`} className={`w-full h-auto ${tv ? "rounded-xl" : "border border-line"}`} />
        </figure>
      )}

      <section className="mt-10">
        <h2 className={`m-0 mb-4 text-[24px] ${tv ? "font-han font-normal" : "font-myeongjo font-extrabold"}`}>출연작</h2>
        {episodes.length ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5">
            {episodes.map((ep) => <EpisodeCard key={ep.id} ep={ep} theme={theme} seriesTitle={sTitle(ep.series_slug)} />)}
          </div>
        ) : (
          <p className="text-[16px] text-muted">아직 출연 대기 중입니다. {c.spinoff ? `「${c.spinoff}」로 데뷔 예정.` : ""}</p>
        )}
      </section>
    </main>
  );
}
