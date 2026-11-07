import Link from "next/link";
import type { Metadata } from "next";
import { CharacterChip } from "@/components/Cards";
import { PageHead } from "@/components/PageHead";
import { listCharacters } from "@/lib/data";
import type { Theme } from "@/lib/themes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "방구석 사람들" };

export default async function People({ params }: { params: Promise<{ theme: string }> }) {
  const theme = (await params).theme as Theme;
  const characters = await listCharacters();
  const main = characters.filter((c) => c.role === "main");
  const support = characters.filter((c) => c.role !== "main");
  const tv = theme === "tv";

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10">
      <PageHead
        theme={theme}
        kicker={tv ? "CAST ▷ 12" : "동네 인물 열전"}
        title={tv ? "방구석 사람들" : "방구석 반경 300m의 사람들"}
        sub="누렇게 벽지가 뜬 자취방과 그 동네에 사는 열두 명. 이름을 누르면 캐릭터시트와 출연작이 나옵니다."
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-8">
        {main.map((c) => (
          <Link key={c.slug} href={`/${theme}/people/${c.slug}`} className={`flex gap-5 items-center p-5 text-fg ${tv ? "rounded-xl bg-panel2" : "border-2 border-line bg-panel"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.face_url} alt="" className="w-[140px] h-auto" />
            <span className="flex flex-col gap-1.5">
              <strong className={`text-[32px] ${tv ? "font-han font-normal text-logo-red" : "font-myeongjo font-extrabold text-accent"}`}>{c.name}</strong>
              <span className="text-[14px] text-muted">{c.age}세 · {c.job}</span>
              <span className="text-[15px] leading-relaxed">&ldquo;{c.quote}&rdquo;</span>
            </span>
          </Link>
        ))}
      </div>
      {tv ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {support.map((c) => <CharacterChip key={c.slug} c={c} theme="tv" />)}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] border-t border-l border-line">
          {support.map((c) => <CharacterChip key={c.slug} c={c} theme="ilbo" />)}
        </div>
      )}
    </main>
  );
}
