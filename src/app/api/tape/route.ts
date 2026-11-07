import { NextResponse } from "next/server";
import { getEpisodeByCode, normalizeTapeCode } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SEED_BONUS } from "@/lib/seed-data";
import type { EpisodeBonus } from "@/lib/types";

export const dynamic = "force-dynamic";

/** 테이프 코드 입력 → 회차 + 보너스(Q2 해설·숨은 파리 정답) */
export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code || code.length > 20) {
    return NextResponse.json({ ok: false, message: "테이프 코드를 입력해 주세요." }, { status: 400 });
  }
  const ep = await getEpisodeByCode(code);
  if (!ep) {
    return NextResponse.json(
      { ok: false, message: `「${normalizeTapeCode(code)}」 테이프는 우리 가게에 없습니다. 쇼츠 마지막 장면을 다시 확인해 보세요.` },
      { status: 404 }
    );
  }

  let bonus: EpisodeBonus | null = SEED_BONUS[ep.tape_code] ?? null;
  const admin = createSupabaseAdminClient();
  if (admin && !ep.id.startsWith("seed-")) {
    const { data } = await admin
      .from("episode_bonus")
      .select("q1_answer,q2_answer,q2_explain,fly_count,note,unlock_count")
      .eq("episode_id", ep.id)
      .maybeSingle();
    if (data) {
      bonus = data as EpisodeBonus;
      await admin
        .from("episode_bonus")
        .update({ unlock_count: ((data as { unlock_count?: number }).unlock_count ?? 0) + 1 })
        .eq("episode_id", ep.id);
    }
  }

  return NextResponse.json({
    ok: true,
    episode: { tape_code: ep.tape_code, title: ep.title, q1: ep.q1, q2: ep.q2, youtube_id: ep.youtube_id },
    bonus,
  });
}
