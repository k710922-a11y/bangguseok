import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  const c = db();
  if (!id || !c) return NextResponse.json({ ok: false }, { status: 400 });
  const { data, error } = await c.rpc("vote_wrong_answer", { p_id: id });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true, votes: data });
}
