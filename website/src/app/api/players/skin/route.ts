import { NextRequest, NextResponse } from "next/server";
import { getPlayerByUuidOrUsername } from "@/lib/players";
import { getCurrentSeason } from "@/lib/season-data";
import { resolvePlayerSkin } from "@/lib/skin-resolver";
import { resolveSeasonNumber } from "@/lib/seasons";
import type { LeaderboardPlayer } from "@/types/player";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username")?.trim() || "";
  const uuid = request.nextUrl.searchParams.get("uuid")?.trim() || "";
  const type = request.nextUrl.searchParams.get("type")?.trim() || "unknown";
  const seasonParam = request.nextUrl.searchParams.get("season");

  if (!username && !uuid) {
    return NextResponse.json({ ok: false, error: "username or uuid is required" }, { status: 400 });
  }

  const currentSeason = await getCurrentSeason();
  const season = resolveSeasonNumber(seasonParam || currentSeason.season);
  const player = (uuid ? await getPlayerByUuidOrUsername(uuid, season) : null) || (username ? await getPlayerByUuidOrUsername(username, season) : null) || fallbackPlayer(username, uuid, type, season);
  const resolved = await resolvePlayerSkin(player);

  return NextResponse.json({
    skinUrl: resolved.skinUrl,
    skinTextureUrl: resolved.skinTextureUrl,
    skinModel: resolved.skinModel,
    provider: resolved.skinProvider,
    fallbackUsed: resolved.fallbackUsed
  });
}

function fallbackPlayer(username: string, uuid: string, type: string, season: number): LeaderboardPlayer {
  return {
    uuid: uuid || username || "unknown",
    username: username || uuid || "unknown",
    minecraftType: type === "java" || type === "bedrock" || type === "cracked" || type === "offline" ? type : "unknown",
    kills: 0,
    deaths: 0,
    points: 0,
    playtimeHours: 0,
    hoursOfGameplay: 0,
    season
  };
}
