import Link from "next/link";
import { CharacterChip, EpisodeCard, YouTubeEmbed } from "@/components/Cards";
import { JokeMachine } from "@/components/JokeMachine";
import { TapeCodeForm } from "@/components/TapeCodeForm";
import { WrongAnswerBoard } from "@/components/WrongAnswerBoard";
import type { HomeData } from "./types";

const WRAP = "max-w-[1240px] mx-auto px-4 sm:px-8";
const KICKER = "font-black text-[13px] text-accent";

export function IlboHome({ d }: { d: HomeData }) {
  const latest = d.episodes[0];
  const sTitle = (slug: string) => d.series.find((s) => s.slug === slug)?.title ?? slug;
  const news = d.episodes.find((e) => e.series_slug === "news");
  const newsSeries = d.series.find((s) => s.slug === "news");
  const ads = d.characters.filter((c) => c.spinoff).slice(0, 3);

  return (
    <main>
      {/* ── 1면 ── */}
      <section className={`${WRAP} py-7 flex flex-wrap gap-8`}>
        <article className="flex-[999_1_620px] min-w-0 flex flex-col gap-3.5">
          {latest && (
            <span className="self-start bg-accent text-on-accent font-black text-[13px] px-2.5 py-1">
              속보 · {sTitle(latest.series_slug)} EP.#{String(latest.number).padStart(2, "0")}
            </span>
          )}
          <h1 className="m-0 font-myeongjo font-extrabold text-[36px] sm:text-[50px] leading-[1.2] tracking-tight">
            자취방 두 백수, 또 아재개그로 하루 탕진… &ldquo;{d.settings.hero_headline.replace(/[.。]$/, "")}&rdquo;
          </h1>
          <p className="m-0 font-myeongjo text-[19px] leading-relaxed text-muted">
            {latest?.summary ?? d.settings.hero_sub}
          </p>
          <figure className="m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/hero_sofa.webp" alt="소파에 앉은 춘식과 덕구" className="w-full h-auto block border border-line sepia-[.25]" />
            <figcaption className="text-[13px] text-muted pt-1.5">▲ 사건 현장. 라면 냄비 받침으로 쓰인 1994년판 전화번호부가 눈에 띈다.</figcaption>
          </figure>
          {latest && (
            <div className="flex flex-wrap gap-3">
              <Link href={`/ilbo/tapes/${latest.tape_code}`} className="inline-flex items-center min-h-12 px-6 bg-accent2 text-on-accent2 font-black text-[16px]">
                ▶ 영상으로 보기 ({latest.duration_sec ?? 58}초)
              </Link>
              <Link href="/ilbo/tapes" className="inline-flex items-center min-h-12 px-6 border border-line font-bold text-[16px]">
                지난 호 모아 보기
              </Link>
            </div>
          )}
        </article>

        <aside className="flex-[1_1_340px] min-w-0 flex flex-col gap-6 md:border-l md:border-line md:pl-7">
          <div className="border-2 border-dashed border-line bg-panel p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <strong className="font-han font-normal text-[26px]">✂ 테이프 응모권</strong>
              <span className="text-[12px] text-muted">오려서 쓰세요</span>
            </div>
            <p className="m-0 text-[14px] leading-relaxed text-muted">
              쇼츠 마지막 장면의 테이프 코드를 적으면 Q2 해설과 숨은 파리 정답을 보내 드립니다.
            </p>
            <TapeCodeForm theme="ilbo" />
          </div>
          {latest?.youtube_id && (
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-myeongjo font-extrabold text-[22px] border-b-2 border-line pb-1.5">이번 호 영상</h2>
              <YouTubeEmbed id={latest.youtube_id} title={latest.title} />
            </div>
          )}
        </aside>
      </section>

      <div className={WRAP}><div className="rule2" /></div>

      {/* ── 2면: 늬우스 · 지난 호 · 투고 ── */}
      <section className={`${WRAP} py-7 grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-8`}>
        <article className="flex flex-col gap-2.5">
          <span className={KICKER}>방구석 늬우스 · {news ? `${news.number}호` : "창간 예고"}</span>
          {news ? (
            <>
              <h2 className="m-0 font-myeongjo font-extrabold text-[28px] leading-snug">{news.q1 ?? news.title}</h2>
              <p className="m-0 text-[15px] leading-relaxed text-muted">{news.summary}</p>
              <Link href={`/ilbo/tapes/${news.tape_code}`} className="font-bold text-[15px] text-accent">기사 전문(영상) →</Link>
            </>
          ) : (
            <>
              <h2 className="m-0 font-myeongjo font-extrabold text-[28px] leading-snug">합판 뉴스데스크, 곧 첫 방송</h2>
              <p className="m-0 text-[15px] leading-relaxed text-muted">
                {newsSeries?.summary ?? "검증된 황당 뉴스 한 건을 1970년대 앵커처럼 전합니다."} 춘식 앵커는 &ldquo;별일 아닌 큰일&rdquo;을 예고했다.
              </p>
              <Link href="/ilbo/play#tip" className="font-bold text-[15px] text-accent">황당 뉴스 제보하기 →</Link>
            </>
          )}
        </article>
        <article className="flex flex-col gap-2.5">
          <span className={KICKER}>연재 · 지난 호</span>
          <div className="grid grid-cols-3 gap-2.5">
            {d.episodes.slice(0, 3).map((ep) => (
              <EpisodeCard key={ep.id} ep={ep} theme="ilbo" seriesTitle={sTitle(ep.series_slug)} />
            ))}
          </div>
        </article>
        <WrongAnswerBoard initial={d.hall} theme="ilbo" episodeCode={latest?.tape_code} />
      </section>

      <div className={WRAP}><div className="rule2" /></div>

      {/* ── 퍼즐란 ── */}
      <section className={`${WRAP} py-7`}>
        <h2 className="m-0 mb-4 font-myeongjo font-extrabold text-[32px]">오늘의 퍼즐: 아재개그</h2>
        <JokeMachine initial={d.joke} theme="ilbo" />
      </section>

      <div className={WRAP}><div className="rule2" /></div>

      {/* ── 인물 열전 ── */}
      <section className={`${WRAP} py-7`}>
        <div className="flex flex-wrap items-baseline gap-3.5 mb-4">
          <h2 className="m-0 font-myeongjo font-extrabold text-[32px]">동네 인물 열전</h2>
          <span className="text-[15px] text-muted">방구석 반경 300m에 사는 {d.characters.length}인</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] border-t border-l border-line">
          {d.characters.map((c) => (
            <CharacterChip key={c.slug} c={c} theme="ilbo" />
          ))}
        </div>
      </section>

      {/* ── 광고란 (스핀오프 예고) ── */}
      {ads.length > 0 && (
        <section className={`${WRAP} pb-8`}>
          <div className="font-black text-[13px] tracking-[0.3em] text-center py-2 border-y border-line mb-4">광 고</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
            {ads.map((c) => (
              <Link key={c.slug} href={`/ilbo/people/${c.slug}`} className="border-[3px] border-double border-line bg-panel p-5 flex flex-col gap-2 text-center text-fg">
                <strong className="font-han font-normal text-[28px]">{c.spinoff}</strong>
                <span className="text-[14px] leading-relaxed">&ldquo;{c.quote}&rdquo;</span>
                <span className="text-[13px] text-accent font-bold">{c.name} 주연 스핀오프 · 준비 중</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
