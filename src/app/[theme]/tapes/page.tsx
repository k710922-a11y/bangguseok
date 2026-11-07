import Link from "next/link";
import type { Metadata } from "next";
import { EpisodeCard } from "@/components/Cards";
import { PageHead } from "@/components/PageHead";
import { TapeCodeForm } from "@/components/TapeCodeForm";
import { listEpisodes, listSeries } from "@/lib/data";
import type { Theme } from "@/lib/themes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "비디오가게 — 전체 회차" };

export default async function Tapes({
  params,
  searchParams,
}: {
  params: Promise<{ theme: string }>;
  searchParams: Promise<{ series?: string }>;
}) {
  const theme = (await params).theme as Theme;
  const { series: filter } = await searchParams;
  const [series, episodes] = await Promise.all([listSeries(), listEpisodes(filter ? { series: filter } : {})]);
  const sTitle = (slug: string) => series.find((s) => s.slug === slug)?.title ?? slug;
  const tv = theme === "tv";
  const pill = (active: boolean) =>
    `inline-flex items-center min-h-11 px-4 text-[14px] font-bold border ${tv ? "rounded-full" : ""} ${
      active ? "bg-accent text-on-accent border-accent" : "border-line text-fg"
    }`;

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <PageHead
        theme={theme}
        kicker={tv ? "VIDEO SHOP ▷ ALL TAPES" : "지난 호 모아 보기"}
        title={tv ? "방구석 비디오가게" : "지난 호 보관함"}
        sub="유튜브에 올라온 회차가 자동으로 꽂힙니다. 테이프 코드로 보너스를 꺼내 보세요."
      />
      <div className={`${tv ? "rounded-xl bg-panel p-5" : "border-2 border-dashed border-line bg-panel p-5"} mb-8 max-w-[720px]`}>
        <TapeCodeForm theme={theme} />
      </div>
      <nav className="flex flex-wrap gap-2 mb-7" aria-label="시리즈 필터">
        <Link href={`/${theme}/tapes`} className={pill(!filter)}>전체</Link>
        {series.map((s) => (
          <Link key={s.slug} href={`/${theme}/tapes?series=${s.slug}`} className={pill(filter === s.slug)}>
            {s.title}
          </Link>
        ))}
      </nav>
      {episodes.length ? (
        <div className={`grid gap-5 ${tv ? "grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]" : "grid-cols-[repeat(auto-fill,minmax(160px,1fr))]"}`}>
          {episodes.map((ep, i) => (
            <EpisodeCard key={ep.id} ep={ep} theme={theme} seriesTitle={sTitle(ep.series_slug)} isNew={!filter && i === 0} />
          ))}
        </div>
      ) : (
        <p className="text-[16px] text-muted">이 코너는 아직 입고 전입니다.</p>
      )}
    </main>
  );
}
