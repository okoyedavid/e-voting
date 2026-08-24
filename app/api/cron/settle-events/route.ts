import { NextResponse } from "next/server";
import { settleExpiredEvents } from "@/lib/settlement";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production" && authorization !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settled = await settleExpiredEvents();
  return NextResponse.json({ settled: settled.length, processedAt: new Date().toISOString() });
}
