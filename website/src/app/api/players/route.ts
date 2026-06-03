import { NextRequest, NextResponse } from "next/server";
import { getPlayers } from "@/lib/players";
import { resolveSeasonNumber } from "@/lib/seasons";

export async function GET(request: NextRequest) {
  const season = request.nextUrl.searchParams.get("season") || undefined;
  const players = await getPlayers(resolveSeasonNumber(season));
  return NextResponse.json({ players });
}
