import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EpisodeCard, YouTubeEmbed, shortTitle, thumbOf } from "@/components/Cards";
import { TapeCodeForm } from "@/components/TapeCodeForm";
import { WrongAnswerBoard } from "@/components/WrongAnswerBoard";
import { getEpisodeByCode, listCharacters, listEpisodes, listHallOfFame, listSeries } from "@/lib/data";
import type { Theme } from "@/lib/themes";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ theme: string; code: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { code } = await params;
  const ep = await getEpisodeByCode(code);
  if (!ep) return { title: "테이프 없음" };
  return {
    title: `${ep.tape_code} ${ep.q1 ?? ep.title}`,
    description: ep.summary ?? ep.title,
    openGraph: { images: [thumbOf(ep)] },
  };
}

export default async function TapePage({ params }: P) {
  const { theme: t, code } = await params;
  const theme = t as Theme;
  const ep = await getEpisodeByCode(code);
  if (!ep) notFound();
  const [series, all, characters, hall] = await Promise.all([listSeries(), listEpisodes(), listCharacters(), listHallOfFame(5)]);
  const sTitle = (slug: string) => series.find((s) => s.slug === slug)?.title ?? slug;
  const cast = characters.filter((c) => ep.cast.includes(c.slug));
  const sameSeries = all.filter((e) => e.series_slug === ep.series_slug).sort((a, b) => a.number - b.number);
  const idx = sameSeries.findIndex((e) => e.id === ep.id);
  const prev = sameSeries[idx - 1];
  const next = sameSeries[idx + 1];
  const castOthers = all.filter((e) => e.id !== ep.id && e.cast.some((c) => ep.cast.includes(c))).slice(0, 4);
  const tv = theme === "tv";
  const box = tv ? "rounded-xl bg-panel p-6" : "border border-line bg-panel p-5";

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <Link href={`/${theme}/tapes`} className="text-[14px] font-bold text-muted">← {tv ? "비디오가게" : "지난 호 보관함"}</Link>
      <div className="flex flex-wrap gap-8 mt-5">
        <div className="flex-[0_1_360px] min-w-[260px]">
          {ep.youtube_id ? (
            <YouTubeEmbed id={ep.youtube_id} title={ep.title} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbOf(ep)} alt="" className="w-full aspect-[9/16] object-cover rounded-xl" />
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {ep.youtube_id && (
              <a href={`https://www.youtube.com/shorts/${ep.youtube_id}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center min-h-11 px-4 font-bold text-[14px] bg-accent text-on-accent ${tv ? "rounded-md" : ""}`}>
                YouTube에서 보기
              </a>
            )}
            {ep.tiktok_url && (
              <a href={ep.tiktok_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center min-h-11 px-4 font-bold text-[14px] border border-line ${tv ? "rounded-md" : ""}`}>TikTok</a>
            )}
            {ep.reels_url && (
              <a href={ep.reels_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center min-h-11 px-4 font-bold text-[14px] border border-line ${tv ? "rounded-md" : ""}`}>Reels</a>
            )}
          </div>
        </div>

        <div className="flex-[1_1_480px] min-w-0 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className={tv ? "font-vt text-[26px] text-osd osd-glow" : "font-black text-[13px] text-accent"}>
              {ep.tape_code} · {sTitle(ep.series_slug)}
            </span>
            <h1 className={`m-0 ${tv ? "font-han font-normal text-[40px]" : "font-myeongjo font-extrabold text-[42px] tracking-tight"}`}>
              {shortTitle(ep, sTitle(ep.series_slug))}
            </h1>
            {ep.summary && <p className="m-0 text-[17px] leading-relaxed text-muted">{ep.summary}</p>}
            {ep.published_at && (
              <span className="text-[13px] text-muted">
                방송일 {new Date(ep.published_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}
                {ep.views !== null ? ` · 조회 ${ep.views.toLocaleString("ko-KR")}` : ""}
              </span>
            )}
          </div>

          {(ep.q1 || ep.q2) && (
            <div className={`${box} flex flex-col gap-3`}>
              {ep.q1 && <p className="m-0 text-[18px] font-bold">Q1. {ep.q1}</p>}
              {ep.q2 && <p className="m-0 text-[18px] font-bold">Q2. {ep.q2}</p>}
              <p className="m-0 text-[14px] text-muted">정답·해설은 아래 테이프 코드를 넣으면 열립니다.</p>
            </div>
          )}

          <div className={box}>
            <TapeCodeForm theme={theme} />
          </div>

          {cast.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className={`m-0 text-[20px] ${tv ? "font-han font-normal" : "font-myeongjo font-extrabold"}`}>출연</h2>
              <div className="flex flex-wrap gap-3">
                {cast.map((c) => (
                  <Link key={c.slug} href={`/${theme}/people/${c.slug}`} className={`flex items-center gap-3 pr-4 bg-panel border border-line ${tv ? "rounded-full" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.face_url} alt="" className="w-14 h-14 object-contain" />
                    <span className="font-bold text-[15px]">{c.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <nav className="flex flex-wrap gap-3" aria-label="이전·다음 화">
            {prev && <Link href={`/${theme}/tapes/${prev.tape_code}`} className={`inline-flex items-center min-h-12 px-5 border border-line font-bold ${tv ? "rounded-md" : ""}`}>← EP.#{String(prev.number).padStart(2, "0")}</Link>}
            {next && <Link href={`/${theme}/tapes/${next.tape_code}`} className={`inline-flex items-center min-h-12 px-5 font-black bg-accent2 text-on-accent2 ${tv ? "rounded-md" : ""}`}>다음 화 EP.#{String(next.number).padStart(2, "0")} →</Link>}
          </nav>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <WrongAnswerBoard initial={hall} theme={theme} episodeCode={ep.tape_code} />
        {castOthers.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className={`m-0 text-[22px] ${tv ? "font-han font-normal" : "font-myeongjo font-extrabold"}`}>같은 얼굴들 출연작</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
              {castOthers.map((e) => (
                <EpisodeCard key={e.id} ep={e} theme={theme} seriesTitle={sTitle(e.series_slug)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
