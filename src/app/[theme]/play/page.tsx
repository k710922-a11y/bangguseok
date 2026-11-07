import type { Metadata } from "next";
import { JokeMachine } from "@/components/JokeMachine";
import { PageHead } from "@/components/PageHead";
import { TipForm } from "@/components/TipForm";
import { WrongAnswerBoard } from "@/components/WrongAnswerBoard";
import { jokeOfTheDay, listHallOfFame } from "@/lib/data";
import type { Theme } from "@/lib/themes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "놀이터 — 자판기·오답·제보" };

export default async function Play({ params }: { params: Promise<{ theme: string }> }) {
  const theme = (await params).theme as Theme;
  const [joke, hall] = await Promise.all([jokeOfTheDay(), listHallOfFame(10)]);
  const tv = theme === "tv";
  const h2 = `m-0 mb-4 text-[28px] ${tv ? "font-han font-normal" : "font-myeongjo font-extrabold"}`;

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 flex flex-col gap-12">
      <PageHead
        theme={theme}
        kicker={tv ? "ARCADE ▷ INSERT COIN" : "퍼즐 · 독자 투고 · 제보"}
        title={tv ? "카운터 옆 놀이터" : "퍼즐과 독자 투고"}
        sub="아재개그 자판기로 한 판, 더 어이없는 오답은 명예의 전당에, 황당 뉴스는 제보함에."
      />
      <section>
        <h2 className={h2}>아재개그 자판기</h2>
        <JokeMachine initial={joke} theme={theme} />
      </section>
      <section>
        <h2 className={h2}>오답 명예의 전당</h2>
        <WrongAnswerBoard initial={hall} theme={theme} />
      </section>
      <section id="tip" className="scroll-mt-24">
        <h2 className={h2}>방구석 늬우스 제보함</h2>
        <div className={tv ? "rounded-xl bg-panel p-6" : "border-2 border-line bg-panel p-5"}>
          <TipForm theme={theme} />
        </div>
      </section>
    </main>
  );
}
