import type { Theme } from "@/lib/themes";

export function PageHead({ theme, kicker, title, sub }: { theme: Theme; kicker: string; title: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-2 mb-7">
      <span className={theme === "tv" ? "font-vt text-[24px] text-osd" : "font-black text-[13px] text-accent"}>{kicker}</span>
      <h1 className={`m-0 ${theme === "tv" ? "font-han font-normal text-[38px] sm:text-[44px]" : "font-myeongjo font-extrabold text-[38px] sm:text-[46px] tracking-tight"}`}>
        {title}
      </h1>
      {sub && <p className="m-0 text-[16px] text-muted leading-relaxed">{sub}</p>}
    </div>
  );
}
