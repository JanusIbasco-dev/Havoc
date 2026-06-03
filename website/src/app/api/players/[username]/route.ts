import { NextRequest, NextResponse } from "next/server";
import { getPlayerProfile } from "@/lib/players";
import { getCurrentSeason } from "@/lib/season-data";
import { resolveSeasonNumber } from "@/lib/seasons";

type PlayerProfileApiProps = {
  params: Promise<{ username: string }>;
};

export async function GET(request: NextRequest, { params }: PlayerProfileApiProps) {
  const { username } = await params;
  const seasonParam = request.nextUrl.searchParams.get("season");
  const currentSeason = await getCurrentSeason();
  const season = resolveSeasonNumber(seasonParam || currentSeason.season);
  const profile = await getPlayerProfile(decodeURIComponent(username), season);

  if (!profile) {
    return NextResponse.json({ ok: false, error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...profile });
}
