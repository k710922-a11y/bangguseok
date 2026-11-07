"use server";

import { getAdminContext } from "@/lib/admin-auth";

/** 방금 로그인한 세션이 소유자(k710922@gmail.com)인지 서버에서 확인한다. */
export async function verifyAdminAccess(): Promise<boolean> {
  return (await getAdminContext()) !== null;
}
