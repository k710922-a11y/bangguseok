import { NextResponse } from "next/server";
import { listJokes } from "@/lib/data";

export const dynamic = "force-dynamic";

/** 아재개그 자판기 — 무작위 한 문제 (?not=<id> 로 직전 문제 제외) */
export async function GET(req: Request) {
  const not = new URL(req.url).searchParams.get("not");
  const jokes = (await listJokes()).filter((j) => j.id !== not);
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  return NextResponse.json(joke ?? null);
}
