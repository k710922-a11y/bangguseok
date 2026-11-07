import Link from "next/link";
import { AdminButton } from "./AdminButton";
import { THEME_INFO, navFor, type Theme } from "@/lib/themes";
import type { SiteSettings } from "@/lib/types";

function Socials({ settings, theme }: { settings: SiteSettings; theme: Theme }) {
  const links = [
    { href: settings.youtube_url, label: "YouTube" },
    { href: settings.tiktok_url, label: "TikTok" },
    { href: settings.instagram_url, label: "Instagram" },
  ].filter((l) => l.href);
  return (
    <>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center min-h-11 px-4 border font-bold text-[14px] ${
            theme === "tv" ? "rounded-md border-[#6E5A47] text-fg" : "border-[#8A7A60] text-[#EFE4CC]"
          }`}
        >
          {l.label}
        </a>
      ))}
    </>
  );
}

export function SiteHeader({ theme }: { theme: Theme }) {
  const nav = navFor(theme);
  const other = THEME_INFO[theme].other;

  if (theme === "ilbo") {
    return (
      <header className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          <span className="text-[13px] text-muted">1994년 (방 안 시계 기준) · 정가 0원</span>
          <div className="flex items-center gap-2">
            <Link href={`/${other}`} className="inline-flex items-center min-h-11 px-3 text-[13px] font-bold border border-line hover:bg-panel">
              📺 <span className="hidden sm:inline">TV로 보기</span><span className="sm:hidden">TV</span>
            </Link>
            <AdminButton />
          </div>
        </div>
        <div className="rule2" />
        <Link href="/ilbo" className="flex flex-wrap items-center justify-center gap-4 py-4" aria-label="방구석 일보 1면">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo_chonti.webp" alt="방구석 춘식&덕구" className="w-[min(480px,70vw)] h-auto" />
          <span className="font-myeongjo font-extrabold text-[44px] sm:text-[60px] tracking-tight">일보</span>
        </Link>
        <div className="rule2" />
        <nav className="flex flex-wrap justify-center gap-1 py-1 border-b border-line" aria-label="주요 메뉴">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap px-3.5 py-2.5 text-[15px] font-bold hover:text-accent">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
    );
  }

  return (
    <header className="border-b border-line bg-bg sticky top-0 z-40">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href="/tv" className="flex items-center" aria-label="방구석 TV 홈">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logo_bang.webp" alt="방구석" className="h-10 w-auto" />
        </Link>
        <nav className="order-last md:order-none basis-full md:basis-auto flex gap-0.5 md:flex-1 min-w-0 overflow-x-auto -mx-1" aria-label="주요 메뉴">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="shrink-0 whitespace-nowrap px-3 py-2.5 text-[15px] font-bold text-muted hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <Link href={`/${other}`} className="inline-flex items-center min-h-11 px-3 rounded-md text-[13px] font-bold text-muted border border-line hover:text-fg">
            📰 <span className="hidden sm:inline">신문으로 보기</span><span className="sm:hidden">신문</span>
          </Link>
          <AdminButton />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ theme, settings }: { theme: Theme; settings: SiteSettings }) {
  if (theme === "ilbo") {
    return (
      <footer className="bg-[#1B1612] text-[#EFE4CC] mt-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 flex flex-wrap gap-5 items-center">
          <div className="flex-1 min-w-[260px] flex flex-col gap-1">
            <strong className="font-myeongjo font-extrabold text-[20px]">발행인 춘식 · 편집인 덕구 (편집은 안 함)</strong>
            <span className="text-[14px] text-[#CFC2A6]">다음 호는 다음 쇼츠와 함께. 니들은 맞췄냐? 으헤헤</span>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="채널 링크">
            <Socials settings={settings} theme={theme} />
            <Link href="/" className="inline-flex items-center min-h-11 px-4 border border-[#8A7A60] font-bold text-[14px]">대문으로</Link>
          </nav>
        </div>
      </footer>
    );
  }
  return (
    <footer className="relative noise mt-8">
      <div className="bg-[rgba(10,8,6,.85)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-12 flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[260px] flex flex-col gap-2">
            <strong className="font-han font-normal text-[30px]">니들은 맞췄냐? 으헤헤</strong>
            <span className="text-[15px] text-[#CDBFA8]">더 어이없는 오답은 댓글로. 채널은 고정, 시계는 1994년.</span>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="채널 링크">
            <Socials settings={settings} theme={theme} />
            <Link href="/" className="inline-flex items-center min-h-11 px-4 rounded-md bg-accent2 text-on-accent2 font-black text-[14px]">↺ 처음 채널로</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
