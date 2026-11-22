import type { Metadata } from "next";
import { AjaeDict } from "@/components/AjaeDict";
import { PageHead } from "@/components/PageHead";
import type { Theme } from "@/lib/themes";

export const metadata: Metadata = {
  title: "아재개그 백과 — 5,601문제",
  description: "춘식과 덕구가 자취방 소파에서 모아 온 아재개그·넌센스 퀴즈 5,601개. 검색하고, 분류로 고르고, 눌러서 정답 확인.",
};

export default async function Dict({ params }: { params: Promise<{ theme: string }> }) {
  const theme = (await params).theme as Theme;
  const tv = theme === "tv";

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 flex flex-col gap-8">
      <PageHead
        theme={theme}
        kicker={tv ? "VHS-DICT ▷ 전편 수록" : "특별 부록 · 아재개그 대사전"}
        title={tv ? "아재개그 백과" : "방구석 아재개그 대사전"}
        sub="춘식과 덕구가 30년 묵은 자취방에서 긁어모은 아재개그·넌센스 퀴즈. 문제를 누르면 정답이 나온다. 먼저 맞혀 보고 눌러라."
      />
      <AjaeDict theme={theme} />
    </main>
  );
}
