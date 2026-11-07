import Link from "next/link";
import { AdminButton } from "@/components/AdminButton";
import { listEpisodes } from "@/lib/data";

export const dynamic = "force-dynamic";

/** 대문 — 두 개의 채널(시안 A · 시안 C) 중 하나를 골라 입장 */
export default async function Gateway() {
  const [latest] = await listEpisodes({ limit: 1 });

  return (
    <main className="relative min-h-screen flex flex-col" data-theme="tv">
      <h1 className="sr-only">방구석 춘식&amp;덕구 — 채널 선택</h1>
      <div className="absolute top-4 right-4 z-20">
        <AdminButton variant="ghost" />
      </div>

      <div className="flex-1 grid md:grid-cols-2">
        {/* ── A: 브라운관 TV ── */}
        <Link
          href="/tv"
          data-theme="tv"
          className="group relative flex flex-col items-center justify-center gap-8 px-6 py-16 bg-bg text-fg overflow-hidden"
        >
          <div className="absolute inset-0 noise noise-anim opacity-[0.07]" aria-hidden="true" />
          <span className="relative font-vt text-[26px] text-osd osd-glow">CH 03 ▶ 채널 고정!</span>
          <div className="relative w-full max-w-[520px] rounded-[30px] bg-[#3B2A1E] p-5 pb-4 shadow-[inset_0_0_0_2px_#5A4231] transition-transform duration-300 group-hover:scale-[1.02]">
            <div className="relative aspect-[1448/786] rounded-[22px] overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/hero_sofa.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 scan" aria-hidden="true" />
              <span className="absolute bottom-2 left-3 font-vt text-[20px] text-white">VHS SP</span>
            </div>
            <div className="flex items-center gap-3 pt-3" aria-hidden="true">
              <span className="font-vt text-[17px] text-[#D9C4A5] tracking-widest">BANGGUSEOK-TV</span>
              <span className="flex-1" />
              <span className="w-6 h-6 rounded-full bg-[#20160F] shadow-[inset_0_0_0_3px_#6E523C]" />
              <span className="w-6 h-6 rounded-full bg-[#20160F] shadow-[inset_0_0_0_3px_#6E523C]" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            </div>
          </div>
          <div className="relative text-center flex flex-col gap-2">
            <strong className="font-han font-normal text-[36px] md:text-[44px] leading-tight">채널 고정! 브라운관 TV</strong>
            <span className="text-muted text-[15px]">어두운 자취방에서 쇼츠를 TV로 본다</span>
          </div>
          <span className="relative inline-flex items-center min-h-12 px-6 rounded-md bg-accent2 text-on-accent2 font-black text-[16px]">
            TV 켜고 입장 →
          </span>
        </Link>

        {/* ── C: 방구석 일보 ── */}
        <Link
          href="/ilbo"
          data-theme="ilbo"
          className="group relative flex flex-col items-center justify-center gap-8 px-6 py-16 paper text-fg overflow-hidden border-t-4 md:border-t-0 md:border-l-4 border-[#1B1612]"
        >
          <span className="relative text-[13px] font-bold text-muted">제{latest ? latest.number + 100 : 101}호 · 1994년 (방 안 시계 기준) · 정가 0원</span>
          <div className="relative w-full max-w-[520px] bg-panel border border-line p-5 shadow-[6px_6px_0_#1B1612] transition-transform duration-300 group-hover:-rotate-1">
            <div className="rule2" />
            <div className="flex items-center justify-center gap-4 py-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/logo_chonti.webp" alt="" className="w-[62%] h-auto" />
              <span className="font-myeongjo font-extrabold text-[40px]">일보</span>
            </div>
            <div className="rule2" />
            <p className="font-myeongjo font-extrabold text-[22px] leading-snug pt-3">
              자취방 두 백수, 또 아재개그로 하루 탕진… &ldquo;뭔가 뿌듯하다&rdquo;
            </p>
          </div>
          <div className="relative text-center flex flex-col gap-2">
            <strong className="font-myeongjo font-extrabold text-[36px] md:text-[44px] leading-tight">방구석 일보</strong>
            <span className="text-muted text-[15px]">동네 신문으로 읽는 방구석 소식</span>
          </div>
          <span className="relative inline-flex items-center min-h-12 px-6 bg-accent text-on-accent font-black text-[16px]">
            신문 펼치기 →
          </span>
        </Link>
      </div>

      <footer className="bg-[#0B0907] text-[#CDBFA8] text-center text-[13px] py-4 px-4">
        [방구석] 춘식&amp;덕구 — 어느 채널로 들어와도 같은 방구석입니다. 안에서 언제든 채널을 바꿀 수 있어요.
      </footer>
    </main>
  );
}
