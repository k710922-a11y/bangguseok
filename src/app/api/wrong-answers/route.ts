import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

/** 오답 제출 — 승인 대기(pending)로 들어가고 어드민에서 승인해야 공개된다 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    nickname?: string; body?: string; episode_code?: string; website?: string;
  };
  // 허니팟(봇 차단): 사람에게 보이지 않는 칸이 채워져 있으면 조용히 성공 처리
  if (body.website) return NextResponse.json({ ok: true });

  const nickname = (body.nickname ?? "").trim().slice(0, 20);
  const text = (body.body ?? "").trim().slice(0, 200);
  if (!nickname || !text) {
    return NextResponse.json({ ok: false, message: "닉네임과 오답을 모두 적어 주세요." }, { status: 400 });
  }
  const c = db();
  if (!c) return NextResponse.json({ ok: false, message: "아직 접수 창구가 열리지 않았습니다." }, { status: 503 });

  const { error } = await c.from("wrong_answers").insert({
    nickname, body: text, episode_code: body.episode_code?.slice(0, 20) || null,
  });
  if (error) return NextResponse.json({ ok: false, message: "접수에 실패했습니다. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  return NextResponse.json({ ok: true, message: "접수 완료! 춘식이 검토 후 명예의 전당에 올립니다. 으헤헤" });
}
