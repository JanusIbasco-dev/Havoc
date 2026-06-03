import { WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { resolveSeasonNumber } from "@/lib/seasons";
import type { LeaderboardPlayer, PlayerActivityEvent, PlayerHistoryEvent, PlayerProfile } from "@/types/player";

const collectionName = "players";

type PlayerDocument = {
  uuid: string;
  username: string;
  skinUrl?: string | null;
  skinTextureValue?: string | null;
  skinTextureSignature?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  skinUpdatedAt?: string;
  kills: number;
  deaths: number;
  points: number;
  playtimeHours: number;
  hoursOfGameplay?: number;
  season: number | string;
  firstJoin?: string;
  firstJoinTimestamp?: string;
  lastSeen?: string;
  updatedAt?: string;
};

export async function getPlayers(season?: string | number): Promise<LeaderboardPlayer[]> {
  return getLeaderboard(resolveSeasonNumber(season));
}

export async function getLeaderboard(season: number): Promise<LeaderboardPlayer[]> {
  try {
    const db = await getDatabase();
    const players = await db
      .collection<PlayerDocument>(collectionName)
      .find({ season }, { projection: { _id: 0 } })
      .sort({ points: -1, kills: -1, deaths: 1 })
      .toArray();

    return players.map(toLeaderboardPlayer).map((player, index) => ({ ...player, rank: index + 1 }));
  } catch {
    return [];
  }
}

export async function getPlayer(uuid: string, season?: string | number): Promise<LeaderboardPlayer | null> {
  try {
    const db = await getDatabase();
    const player = await db.collection<PlayerDocument>(collectionName).findOne({ uuid, season: resolveSeasonNumber(season) }, { projection: { _id: 0 } });
    return player ? toLeaderboardPlayer(player) : null;
  } catch {
    return null;
  }
}

export async function getPlayerByUsername(username: string, season?: string | number): Promise<LeaderboardPlayer | null> {
  try {
    const db = await getDatabase();
    const player = await db.collection<PlayerDocument>(collectionName).findOne({ username, season: resolveSeasonNumber(season) }, { projection: { _id: 0 } });
    return player ? toLeaderboardPlayer(player) : null;
  } catch {
    return null;
  }
}

export async function getPlayerByUuidOrUsername(identifier: string, season?: string | number): Promise<LeaderboardPlayer | null> {
  try {
    const db = await getDatabase();
    const seasonNumber = resolveSeasonNumber(season);
    const player = await db.collection<PlayerDocument>(collectionName).findOne(
      {
        season: seasonNumber,
        $or: [{ uuid: identifier }, { username: identifier }]
      },
      { projection: { _id: 0 } }
    );
    return player ? toLeaderboardPlayer(player) : null;
  } catch {
    return null;
  }
}

export async function getPlayerHistory(uuid: string, season?: string | number): Promise<PlayerHistoryEvent[]> {
  try {
    const db = await getDatabase();
    const seasonNumber = resolveSeasonNumber(season);
    const [kills, deathsFromKills, deathEvents] = await Promise.all([
      db
        .collection("kill_events")
        .find({ killerUuid: uuid, season: seasonNumber }, { projection: { _id: 0 } })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray(),
      db
        .collection("kill_events")
        .find({ victimUuid: uuid, season: seasonNumber }, { projection: { _id: 0 } })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray(),
      db
        .collection("death_events")
        .find({ playerUuid: uuid, season: seasonNumber }, { projection: { _id: 0 } })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray()
    ]);

    return [
      ...kills.map((event) => ({
        type: "kill" as const,
        timestamp: typeof event.timestamp === "string" ? event.timestamp : undefined,
        season: typeof event.season === "number" ? event.season : resolveSeasonNumber(event.season as string | number | undefined),
        opponentUuid: typeof event.victimUuid === "string" ? event.victimUuid : undefined,
        opponentUsername: typeof event.victimUsername === "string" ? event.victimUsername : undefined,
        pointsChanged: typeof event.pointsAwarded === "number" ? event.pointsAwarded : undefined
      })),
      ...deathsFromKills.map((event) => ({
        type: "death" as const,
        timestamp: typeof event.timestamp === "string" ? event.timestamp : undefined,
        season: typeof event.season === "number" ? event.season : resolveSeasonNumber(event.season as string | number | undefined),
        opponentUuid: typeof event.killerUuid === "string" ? event.killerUuid : undefined,
        opponentUsername: typeof event.killerUsername === "string" ? event.killerUsername : undefined
      })),
      ...deathEvents.map((event) => ({
        type: "death" as const,
        timestamp: typeof event.timestamp === "string" ? event.timestamp : undefined,
        season: typeof event.season === "number" ? event.season : resolveSeasonNumber(event.season as string | number | undefined),
        pointsChanged: typeof event.pointsDeducted === "number" ? -event.pointsDeducted : undefined
      }))
    ]
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
      .slice(0, 10);
  } catch {
    return [];
  }
}

export async function getPlayerProfile(identifier: string, season?: string | number): Promise<PlayerProfile | null> {
  const player = await getPlayerByUuidOrUsername(identifier, season);

  if (!player) {
    return null;
  }

  const [players, history] = await Promise.all([getPlayers(player.season), getPlayerHistory(player.uuid, player.season)]);
  const rank = players.findIndex((item) => item.uuid === player.uuid) + 1;
  const kdRatio = player.deaths === 0 ? player.kills.toFixed(2) : (player.kills / player.deaths).toFixed(2);

  return {
    player,
    rank: rank > 0 ? rank : null,
    kdRatio,
    recentActivity: getRecentActivity(player, history)
  };
}

export function getRecentActivity(player: LeaderboardPlayer, history: PlayerHistoryEvent[]): PlayerActivityEvent[] {
  const activity: PlayerActivityEvent[] = history.map((event) => ({
    type: event.type,
    text: event.type === "kill"
      ? `${player.username} killed ${event.opponentUsername || "a player"}`
      : `${player.username} died to ${event.opponentUsername || "a player"}`,
    timestamp: event.timestamp,
    season: event.season,
    opponentUuid: event.opponentUuid,
    opponentUsername: event.opponentUsername,
    pointsChanged: event.pointsChanged
  }));

  const firstJoin = player.firstJoinTimestamp || player.firstJoin;
  if (firstJoin) {
    activity.push({
      type: "join",
      text: `${player.username} joined the server`,
      timestamp: firstJoin,
      season: player.season
    });
  }

  return activity
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, 10);
}

export async function upsertPlayer(player: Partial<LeaderboardPlayer> & { uuid: string; username: string }) {
  const db = await getDatabase();
  const season = resolveSeasonNumber(player.season);
  const now = new Date().toISOString();
  const setFields: Partial<PlayerDocument> = {
    username: player.username,
    season,
    lastSeen: player.lastSeen ?? now,
    updatedAt: now
  };

  if (typeof player.skinUrl === "string" && player.skinUrl.trim()) {
    setFields.skinUrl = player.skinUrl.trim();
    setFields.skinUpdatedAt = now;
  }
  if (typeof player.skinTextureValue === "string" && player.skinTextureValue.trim()) {
    setFields.skinTextureValue = player.skinTextureValue.trim();
    setFields.skinUpdatedAt = now;
  }
  if (typeof player.skinTextureSignature === "string" && player.skinTextureSignature.trim()) {
    setFields.skinTextureSignature = player.skinTextureSignature.trim();
    setFields.skinUpdatedAt = now;
  }
  if (player.skinProvider === "mojang" || player.skinProvider === "elyby" || player.skinProvider === "offline" || player.skinProvider === "unknown") {
    setFields.skinProvider = player.skinProvider;
  }
  if (typeof player.kills === "number") {
    setFields.kills = player.kills;
  }
  if (typeof player.deaths === "number") {
    setFields.deaths = player.deaths;
  }
  if (typeof player.points === "number") {
    setFields.points = player.points;
  }
  if (typeof player.playtimeHours === "number" || typeof player.hoursOfGameplay === "number") {
    setFields.playtimeHours = player.playtimeHours ?? player.hoursOfGameplay ?? 0;
  }

  const setOnInsertFields: Partial<PlayerDocument> = {
    uuid: player.uuid,
    firstJoin: player.firstJoin ?? player.firstJoinTimestamp ?? now
  };

  if (typeof setFields.kills !== "number") {
    setOnInsertFields.kills = 0;
  }
  if (typeof setFields.deaths !== "number") {
    setOnInsertFields.deaths = 0;
  }
  if (typeof setFields.points !== "number") {
    setOnInsertFields.points = 0;
  }
  if (typeof setFields.playtimeHours !== "number") {
    setOnInsertFields.playtimeHours = 0;
  }

  await db.collection<PlayerDocument>(collectionName).updateOne(
    { uuid: player.uuid, season },
    {
      $set: setFields,
      $setOnInsert: setOnInsertFields
    },
    { upsert: true }
  );
}

export async function setPlayerStats(player: Partial<LeaderboardPlayer> & { uuid: string; username: string }) {
  const db = await getDatabase();
  const season = resolveSeasonNumber(player.season);
  const now = new Date().toISOString();

  await db.collection<PlayerDocument>(collectionName).updateOne(
    { uuid: player.uuid, season },
    {
      $set: {
        username: player.username,
        ...(typeof player.skinUrl === "string" && player.skinUrl.trim() ? { skinUrl: player.skinUrl.trim(), skinUpdatedAt: now } : {}),
        ...(typeof player.skinTextureValue === "string" && player.skinTextureValue.trim() ? { skinTextureValue: player.skinTextureValue.trim(), skinUpdatedAt: now } : {}),
        ...(typeof player.skinTextureSignature === "string" && player.skinTextureSignature.trim() ? { skinTextureSignature: player.skinTextureSignature.trim(), skinUpdatedAt: now } : {}),
        ...(player.skinProvider === "mojang" || player.skinProvider === "elyby" || player.skinProvider === "offline" || player.skinProvider === "unknown" ? { skinProvider: player.skinProvider } : {}),
        kills: player.kills ?? 0,
        deaths: player.deaths ?? 0,
        points: player.points ?? 0,
        playtimeHours: player.playtimeHours ?? player.hoursOfGameplay ?? 0,
        season,
        lastSeen: player.lastSeen ?? now,
        updatedAt: now
      },
      $setOnInsert: {
        uuid: player.uuid,
        firstJoin: player.firstJoin ?? player.firstJoinTimestamp ?? now
      }
    },
    { upsert: true }
  );
}

export async function recordKillAndUpdatePlayers(event: {
  killerUuid: string;
  killerUsername: string;
  victimUuid: string;
  victimUsername: string;
  season: number;
  timestamp: string;
  pointsAwarded?: number;
}) {
  const db = await getDatabase();
  const pointsAwarded = event.pointsAwarded ?? 15;
  const now = new Date().toISOString();

  await Promise.all([
    upsertPlayer({ uuid: event.killerUuid, username: event.killerUsername, season: event.season }),
    upsertPlayer({ uuid: event.victimUuid, username: event.victimUsername, season: event.season })
  ]);

  const killerUpdate = await db.collection<PlayerDocument>(collectionName).findOneAndUpdate(
    { uuid: event.killerUuid, season: event.season },
    {
      $inc: { kills: 1, points: pointsAwarded },
      $set: { username: event.killerUsername, lastSeen: now, updatedAt: now }
    },
    { returnDocument: "after", projection: { _id: 0 } }
  );

  await db.collection("kill_events").insertOne({
    killerUuid: event.killerUuid,
    killerUsername: event.killerUsername,
    victimUuid: event.victimUuid,
    victimUsername: event.victimUsername,
    pointsAwarded,
    killerUpdatedTotalPoints: killerUpdate?.points ?? pointsAwarded,
    season: event.season,
    timestamp: event.timestamp,
    receivedAt: now
  });

  return killerUpdate ? toLeaderboardPlayer(killerUpdate) : null;
}

export async function recordDeathAndUpdatePlayer(event: {
  playerUuid: string;
  playerUsername: string;
  season: number;
  timestamp: string;
  pointsDeducted?: number;
}) {
  const db = await getDatabase();
  const pointsDeducted = event.pointsDeducted ?? 13;
  const now = new Date().toISOString();

  await upsertPlayer({ uuid: event.playerUuid, username: event.playerUsername, season: event.season });

  const playerUpdate = await db.collection<PlayerDocument>(collectionName).findOneAndUpdate(
    { uuid: event.playerUuid, season: event.season },
    {
      $inc: { deaths: 1, points: -pointsDeducted },
      $set: { username: event.playerUsername, lastSeen: now, updatedAt: now }
    },
    { returnDocument: "after", projection: { _id: 0 } }
  );

  await db.collection("death_events").insertOne({
    playerUuid: event.playerUuid,
    playerUsername: event.playerUsername,
    pointsDeducted,
    updatedTotalPoints: playerUpdate?.points ?? -pointsDeducted,
    season: event.season,
    timestamp: event.timestamp,
    receivedAt: now
  });

  return playerUpdate ? toLeaderboardPlayer(playerUpdate) : null;
}

function toLeaderboardPlayer(player: WithId<PlayerDocument> | PlayerDocument): LeaderboardPlayer {
  const playtimeHours = player.playtimeHours ?? player.hoursOfGameplay ?? 0;
  return {
    uuid: player.uuid,
    username: player.username,
    skinUrl: player.skinUrl ?? "",
    skinTextureValue: player.skinTextureValue ?? "",
    skinTextureSignature: player.skinTextureSignature ?? "",
    skinProvider: player.skinProvider ?? "unknown",
    skinUpdatedAt: player.skinUpdatedAt,
    kills: player.kills ?? 0,
    deaths: player.deaths ?? 0,
    points: player.points ?? 0,
    playtimeHours,
    hoursOfGameplay: playtimeHours,
    season: resolveSeasonNumber(player.season),
    firstJoin: player.firstJoin ?? player.firstJoinTimestamp ?? "",
    firstJoinTimestamp: player.firstJoin ?? player.firstJoinTimestamp ?? "",
    lastSeen: player.lastSeen ?? player.updatedAt ?? "",
    updatedAt: player.updatedAt
  };
}
