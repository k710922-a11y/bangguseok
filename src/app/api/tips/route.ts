import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

/** 늬우스 제보 — 출처 링크 필수 */
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as {
    nickname?: string; headline?: string; source_url?: string; note?: string; website?: string;
  };
  if (b.website) return NextResponse.json({ ok: true });
  const headline = (b.headline ?? "").trim().slice(0, 200);
  const source = (b.source_url ?? "").trim().slice(0, 500);
  if (headline.length < 2 || !/^https?:\/\//i.test(source)) {
    return NextResponse.json({ ok: false, message: "제목과 출처 링크(https://…)를 적어 주세요." }, { status: 400 });
  }
  const c = db();
  if (!c) return NextResponse.json({ ok: false, message: "아직 제보함이 열리지 않았습니다." }, { status: 503 });
  const { error } = await c.from("tips").insert({
    nickname: (b.nickname ?? "").trim().slice(0, 20) || null,
    headline, source_url: source, note: (b.note ?? "").trim().slice(0, 1000) || null,
  });
  if (error) return NextResponse.json({ ok: false, message: "접수에 실패했습니다." }, { status: 500 });
  return NextResponse.json({ ok: true, message: "제보 접수! 확인은 천천히 하겠습니다." });
}
