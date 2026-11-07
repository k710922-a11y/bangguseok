import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getSettings } from "@/lib/data";
import { isTheme, THEMES } from "@/lib/themes";

export function generateStaticParams() {
  return THEMES.map((theme) => ({ theme }));
}

export default async function ThemeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ theme: string }>;
}) {
  const { theme } = await params;
  if (!isTheme(theme)) notFound();
  const settings = await getSettings();

  return (
    <div data-theme={theme} className={`min-h-screen flex flex-col text-fg ${theme === "ilbo" ? "paper" : "bg-bg"}`}>
      <SiteHeader theme={theme} />
      {settings.notice ? (
        <div className="bg-accent text-on-accent text-center text-[14px] font-bold px-4 py-2">{settings.notice}</div>
      ) : null}
      <div className="flex-1">{children}</div>
      <SiteFooter theme={theme} settings={settings} />
    </div>
  );
}
