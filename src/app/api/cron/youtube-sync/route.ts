import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncYouTube } from "@/lib/youtube-sync";

export const dynamic = "force-dynamic";

/**
 * Coolify Scheduled Task 가 30분마다 호출:
 *   curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/youtube-sync
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || (auth !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ ok: false, message: "unauthorized" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ ok: false, message: "SUPABASE_SERVICE_ROLE_KEY 없음" }, { status: 500 });
  try {
    const result = await syncYouTube(admin);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error).message }, { status: 500 });
  }
}
