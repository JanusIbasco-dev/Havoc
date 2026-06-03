import { getDatabase } from "@/lib/mongodb";
import type { SeasonDocument } from "@/types/season";

const collectionName = "seasons";

export const defaultSeasonDocument: SeasonDocument = {
  season: 1,
  name: "Season 1",
  status: "active",
  worldBorderStatus: "Stable",
  worldBorderSize: 10000
};

export async function getCurrentSeason(): Promise<SeasonDocument> {
  const db = await getDatabase();
  const collection = db.collection<SeasonDocument>(collectionName);
  const currentSeason =
    (await collection.findOne({ status: "active" }, { projection: { _id: 0 }, sort: { season: -1 } })) ||
    (await collection.findOne({ status: "starting_soon" }, { projection: { _id: 0 }, sort: { season: -1 } })) ||
    (await collection.findOne({}, { projection: { _id: 0 }, sort: { season: -1 } }));

  if (currentSeason) {
    return normalizeSeason(currentSeason);
  }

  await collection.updateOne(
    { season: defaultSeasonDocument.season },
    { $setOnInsert: defaultSeasonDocument },
    { upsert: true }
  );

  return defaultSeasonDocument;
}

export function getSeasonStatusLabel(season: SeasonDocument) {
  if (season.status === "starting_soon") {
    return "Starting Soon";
  }

  if (season.status === "ended") {
    return "Season Ended";
  }

  return `${season.name} Active`;
}

export function getDaysRemaining(season: SeasonDocument) {
  if (season.status !== "active" || !season.endsAt) {
    return null;
  }

  const endDate = new Date(season.endsAt);
  if (Number.isNaN(endDate.getTime())) {
    return null;
  }

  return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86_400_000));
}

function normalizeSeason(season: SeasonDocument): SeasonDocument {
  return {
    season: season.season,
    name: season.name || `Season ${season.season}`,
    status: season.status || "active",
    startsAt: season.startsAt,
    endsAt: season.endsAt,
    worldBorderStatus: season.worldBorderStatus || "Stable",
    worldBorderSize: season.worldBorderSize || 10000
  };
}
