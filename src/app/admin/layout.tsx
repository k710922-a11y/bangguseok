import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAdminContext } from "@/lib/admin-auth";
import { AdminLogout } from "@/components/AdminLogout";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "운영 콘솔", robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/episodes", label: "회차 관리" },
  { href: "/admin/sync", label: "유튜브 동기화" },
  { href: "/admin/characters", label: "캐릭터 관리" },
  { href: "/admin/jokes", label: "자판기 문제" },
  { href: "/admin/wrong-answers", label: "오답 심사" },
  { href: "/admin/tips", label: "늬우스 제보함" },
  { href: "/admin/series", label: "시리즈·편성" },
  { href: "/admin/settings", label: "사이트 설정" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // getUser() 로 JWT 를 서버 검증 + 소유자 이메일 확인 (해동기공·A.D.I 와 동일)
  const ctx = await getAdminContext();
  if (!ctx) redirect("/login?denied=1");

  return (
    <div data-theme="admin" className="min-h-screen bg-bg text-fg flex flex-col md:flex-row">
      <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-line bg-panel flex flex-col">
        <div className="h-14 flex items-center gap-2 px-4 border-b border-line">
          <Link href="/admin" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logo_bang.webp" alt="방구석" className="h-8 w-auto" />
            <span className="font-vt text-[18px] text-osd">ADMIN</span>
          </Link>
        </div>
        <nav className="flex md:flex-col flex-wrap gap-0.5 p-2.5" aria-label="어드민 메뉴">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="px-3 py-2.5 rounded-md text-[14px] font-bold text-muted hover:text-fg hover:bg-panel2">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-3 border-t border-line flex flex-col gap-1 text-[13px]">
          <Link href="/tv" target="_blank" className="px-2 py-1.5 text-muted hover:text-fg">↗ 공개 사이트 · TV</Link>
          <Link href="/ilbo" target="_blank" className="px-2 py-1.5 text-muted hover:text-fg">↗ 공개 사이트 · 일보</Link>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-line bg-panel flex items-center justify-between px-5">
          <span className="text-[13px] text-muted">
            {ctx.user.email} <span className="text-accent2">· 소유자</span>
          </span>
          <AdminLogout />
        </header>
        <main className="flex-1 p-5 sm:p-7 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
