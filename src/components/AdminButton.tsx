import Link from "next/link";

/** 모든 프론트 우측 상단의 운영자 진입 버튼 — /admin 이 소유자 세션을 검사하고 아니면 /login 으로 보낸다 */
export function AdminButton({ variant = "solid" }: { variant?: "solid" | "ghost" }) {
  return (
    <Link
      href="/admin"
      title="운영자 페이지 (k710922@gmail.com 전용)"
      aria-label="운영자 페이지"
      className={
        variant === "solid"
          ? "inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md text-[13px] font-bold bg-panel2 text-fg border border-line hover:border-accent transition-colors"
          : "inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-md text-[13px] font-bold text-white/90 border border-white/30 bg-black/30 backdrop-blur hover:bg-black/50 transition-colors"
      }
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      운영
    </Link>
  );
}
