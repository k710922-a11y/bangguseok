import Link from "next/link";
import { CharacterChip, EpisodeCard, shortTitle } from "@/components/Cards";
import { JokeMachine } from "@/components/JokeMachine";
import { TapeCodeForm } from "@/components/TapeCodeForm";
import { WrongAnswerBoard } from "@/components/WrongAnswerBoard";
import type { HomeData } from "./types";

const H2 = "m-0 font-han font-normal text-[32px] sm:text-[36px]";

export function TvHome({ d }: { d: HomeData }) {
  const latest = d.episodes[0];
  const main = d.characters.filter((c) => c.role === "main");
  const support = d.characters.filter((c) => c.role !== "main");
  const sTitle = (slug: string) => d.series.find((s) => s.slug === slug)?.title ?? slug;
  const next = latest ? `${latest.tape_code.slice(0, -2)}${String(latest.number + 1).padStart(2, "0")}` : "VHS-0101";

  return (
    <main>
      {/* ── 히어로: 브라운관 ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-10 flex flex-wrap gap-10 items-center">
        <div className="flex-[999_1_560px] min-w-0">
          <div className="rounded-[34px] bg-[#3B2A1E] p-5 sm:p-7 pb-4 shadow-[inset_0_0_0_2px_#5A4231]">
            <Link href={latest ? `/tv/tapes/${latest.tape_code}` : "/tv/tapes"} className="relative block rounded-[26px] overflow-hidden bg-black aspect-[1448/786]" aria-label="최신화 보기">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/hero_sofa.webp" alt="자취방 소파에 널브러진 춘식과 덕구" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 scan" aria-hidden="true" />
              <span className="absolute top-3 left-4 font-vt text-[26px] sm:text-[34px] text-osd osd-glow">CH 03 ▶ 재생</span>
              <span className="absolute bottom-2.5 left-4 font-vt text-[20px] sm:text-[26px] text-white">VHS SP</span>
              {latest && (
                <span className="absolute bottom-2.5 right-4 font-vt text-[20px] sm:text-[26px] text-white">
                  EP.#{String(latest.number).padStart(2, "0")} 00:{String(latest.duration_sec ?? 58).padStart(2, "0")}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3 pt-3.5" aria-hidden="true">
              <span className="font-vt text-[20px] text-[#D9C4A5] tracking-[2px]">BANGGUSEOK-TV</span>
              <span className="flex-1" />
              <span className="w-8 h-8 rounded-full bg-[#20160F] shadow-[inset_0_0_0_3px_#6E523C]" />
              <span className="w-8 h-8 rounded-full bg-[#20160F] shadow-[inset_0_0_0_3px_#6E523C]" />
              <span className="w-3 h-3 rounded-full bg-accent" />
            </div>
          </div>
        </div>
        <div className="flex-[1_1_340px] min-w-0 flex flex-col gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo_main.webp" alt="방구석 춘식&덕구" className="w-[260px] h-auto" />
          <h1 className="m-0 font-han font-normal text-[40px] sm:text-[46px] leading-[1.15] whitespace-pre-line">{d.settings.hero_headline}</h1>
          <p className="m-0 text-[17px] leading-[1.75] text-[#CDBFA8]">{d.settings.hero_sub}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={latest ? `/tv/tapes/${latest.tape_code}` : "/tv/tapes"} className="inline-flex items-center min-h-12 px-6 rounded-md bg-accent2 text-on-accent2 font-black text-[16px]">
              최신화 보기
            </Link>
            <a href="#code" className="inline-flex items-center min-h-12 px-6 rounded-md border border-[#6E5A47] font-bold text-[16px]">
              테이프 코드 입력
            </a>
          </div>
        </div>
      </section>

      {/* ── 테이프 코드 ── */}
      <section id="code" className="bg-panel border-y border-line scroll-mt-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-9 flex flex-wrap gap-8 items-center">
          <div className="flex-[1_1_380px] min-w-0">
            <div className="font-vt text-[24px] text-osd">INPUT ▷ TAPE CODE</div>
            <h2 className="mt-1.5 mb-2 font-han font-normal text-[30px]">쇼츠 마지막 장면의 테이프 코드를 넣어라</h2>
            <p className="m-0 text-[15px] text-muted leading-relaxed">코드를 넣으면 Q2 해설, 숨은 파리 정답, 비하인드가 열립니다.</p>
          </div>
          <div className="flex-[1_1_420px] min-w-0">
            <TapeCodeForm theme="tv" />
          </div>
        </div>
      </section>

      {/* ── 지금 방송 중 ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-16 pb-6">
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <h2 className={H2}>지금 방송 중</h2>
          <span className="text-[15px] text-muted">유튜브에 올리면 자동으로 여기에도 걸립니다</span>
          <span className="flex-1" />
          <Link href="/tv/tapes" className="font-bold text-[15px] text-accent2">비디오가게에서 전체 보기 →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 sm:gap-5">
          {d.episodes.slice(0, 3).map((ep, i) => (
            <EpisodeCard key={ep.id} ep={ep} theme="tv" seriesTitle={sTitle(ep.series_slug)} isNew={i === 0} />
          ))}
          <div className="rounded-xl overflow-hidden bg-panel flex flex-col">
            <div className="noise noise-anim aspect-[9/16] flex items-center justify-center">
              <span className="bg-black/75 font-han text-[24px] px-4 py-2.5 rounded-md">다음 화 준비 중</span>
            </div>
            <div className="px-4 pt-3.5 pb-4 flex flex-col gap-1.5">
              <span className="font-vt text-[20px] text-muted">{next}</span>
              <strong className="text-[16px]">Q1 미리보기는 최신화 엔딩에서</strong>
              <a href={d.settings.youtube_url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-muted underline">구독하고 알림 받기</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 편성표 ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-6">
        <h2 className={`${H2} mb-6`}>편성표</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
          {d.series.map((s) => (
            <Link
              key={s.slug}
              href={`/tv/tapes?series=${s.slug}`}
              className={`rounded-xl bg-panel p-7 flex gap-5 items-center text-fg ${s.status === "live" ? "border-2 border-accent2" : "border-2 border-transparent"}`}
            >
              <span className={`font-vt text-[56px] leading-none ${s.status === "live" ? "text-accent2" : "text-muted"}`}>{s.channel}</span>
              <span className="flex flex-col gap-1.5">
                <strong className="text-[20px]">{s.title}</strong>
                <span className="text-[14px] text-muted leading-relaxed">{s.summary}</span>
                <span className={`text-[13px] font-bold ${s.status === "live" ? "text-osd" : s.status === "coming" ? "text-accent2" : "text-muted"}`}>
                  {s.status === "live" ? `● 방송 중 · ${s.format}` : s.status === "coming" ? "곧 첫 방송" : "준비 중"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 방구석 사람들 ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-6">
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <h2 className={H2}>방구석 사람들</h2>
          <span className="text-[15px] text-muted">얼굴을 누르면 프로필과 출연작이 나옵니다</span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 mb-5">
          {main.map((c) => (
            <Link key={c.slug} href={`/tv/people/${c.slug}`} className="rounded-xl bg-panel2 px-6 py-5 flex gap-5 items-center text-fg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.face_url} alt="" className="w-[130px] h-auto" />
              <span className="flex flex-col gap-1.5">
                <strong className="font-han font-normal text-[30px] text-logo-red">
                  {c.name} <span className="font-sans text-[15px] text-muted">{c.age} · {c.tagline}</span>
                </strong>
                <span className="text-[15px] leading-relaxed">&ldquo;{c.quote}&rdquo;</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
          {support.map((c) => (
            <CharacterChip key={c.slug} c={c} theme="tv" />
          ))}
        </div>
      </section>

      {/* ── 놀이터 ── */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-16">
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <h2 className={H2}>놀이터</h2>
          <Link href="/tv/play" className="font-bold text-[15px] text-accent2">제보함·더 놀기 →</Link>
        </div>
        <div className="flex flex-wrap gap-5">
          <div className="flex-[2_1_520px] min-w-0">
            <JokeMachine initial={d.joke} theme="tv" />
          </div>
          <div className="flex-[1_1_320px] min-w-0">
            <WrongAnswerBoard initial={d.hall} theme="tv" episodeCode={latest?.tape_code} />
          </div>
        </div>
        {latest && (
          <p className="mt-6 text-[13px] text-muted">
            최신 방송: {shortTitle(latest, sTitle(latest.series_slug))} · {latest.tape_code}
          </p>
        )}
      </section>
    </main>
  );
}
