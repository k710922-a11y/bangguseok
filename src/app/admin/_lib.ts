import "server-only";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-auth";

/** 서버 액션 첫 줄에서 호출 — 소유자가 아니면 로그인으로 */
export async function requireAdmin() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/login?denied=1");
  return ctx;
}

export function str(f: FormData, k: string): string | null {
  const v = f.get(k);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function num(f: FormData, k: string): number | null {
  const v = str(f, k);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** 어드민 공통 클래스 */
export const ui = {
  input: "w-full h-11 px-3 rounded-md bg-[#0B0907] border border-line text-fg text-[14px] outline-none focus:border-accent2",
  textarea: "w-full px-3 py-2 rounded-md bg-[#0B0907] border border-line text-fg text-[14px] outline-none focus:border-accent2 min-h-[88px]",
  label: "text-[12px] font-bold text-muted",
  btn: "inline-flex items-center justify-center min-h-10 px-4 rounded-md bg-accent text-on-accent font-bold text-[14px] cursor-pointer",
  btn2: "inline-flex items-center justify-center min-h-10 px-4 rounded-md bg-accent2 text-on-accent2 font-bold text-[14px] cursor-pointer",
  ghost: "inline-flex items-center justify-center min-h-10 px-4 rounded-md border border-line text-fg font-bold text-[14px] cursor-pointer hover:border-accent2",
  danger: "inline-flex items-center justify-center min-h-10 px-3 rounded-md border border-accent/60 text-accent font-bold text-[13px] cursor-pointer hover:bg-accent hover:text-on-accent",
  card: "rounded-xl border border-line bg-panel p-5",
  h1: "m-0 font-han font-normal text-[30px]",
  th: "text-left text-[12px] font-bold text-muted px-3 py-2 border-b border-line",
  td: "px-3 py-2.5 border-b border-line text-[14px] align-top",
};
