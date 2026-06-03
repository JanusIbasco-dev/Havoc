import { NextResponse } from "next/server";
import { getCurrentSeason, getDaysRemaining, getSeasonStatusLabel } from "@/lib/season-data";

export async function GET() {
  const season = await getCurrentSeason();

  return NextResponse.json({
    season,
    label: getSeasonStatusLabel(season),
    daysRemaining: getDaysRemaining(season)
  });
}
