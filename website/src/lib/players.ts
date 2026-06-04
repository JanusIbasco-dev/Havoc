import { WithId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { resolveSeasonNumber } from "@/lib/seasons";
import { skinModelFromTextureValue, skinUrlFromTextureValue } from "@/lib/skin";
import type { LeaderboardPlayer, PlayerActivityEvent, PlayerHistoryEvent, PlayerProfile } from "@/types/player";

const collectionName = "players";

type PlayerDocument = {
  uuid: string;
  username: string;
  platform?: "java" | "bedrock";
  minecraftType?: "java" | "bedrock" | "cracked" | "unknown";
  javaUuid?: string | null;
  bedrockXuid?: string | null;
  xuid?: string | null;
  floodgateUuid?: string | null;
  skinUrl?: string | null;
  skinTexture?: string | null;
  skinTextureValue?: string | null;
  skinTextureSignature?: string | null;
  skinProvider?: "mojang" | "elyby" | "offline" | "unknown";
  skinModel?: "classic" | "slim";
  skinUpdatedAt?: string;
  lastSkinFetchAt?: string;
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

    const leaderboard = players.map(toLeaderboardPlayer).map((player, index) => ({ ...player, rank: index + 1 }));
    return await Promise.all(leaderboard.map(cacheResolvedSkin));
  } catch {
    return [];
  }
}

export async function getPlayer(uuid: string, season?: string | number): Promise<LeaderboardPlayer | null> {
  try {
    const db = await getDatabase();
    const player = await db.collection<PlayerDocument>(collectionName).findOne({ uuid, season: resolveSeasonNumber(season) }, { projection: { _id: 0 } });
    return player ? cacheResolvedSkin(toLeaderboardPlayer(player)) : null;
  } catch {
    return null;
  }
}

export async function getPlayerByUsername(username: string, season?: string | number): Promise<LeaderboardPlayer | null> {
  try {
    const db = await getDatabase();
    const player = await db.collection<PlayerDocument>(collectionName).findOne({ username, season: resolveSeasonNumber(season) }, { projection: { _id: 0 } });
    return player ? cacheResolvedSkin(toLeaderboardPlayer(player)) : null;
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
    return player ? cacheResolvedSkin(toLeaderboardPlayer(player)) : null;
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
    setFields.lastSkinFetchAt = now;
  }
  if (typeof player.skinTexture === "string" && player.skinTexture.trim()) {
    setFields.skinTexture = player.skinTexture.trim();
    setFields.skinUpdatedAt = now;
    setFields.lastSkinFetchAt = now;
  }
  if (typeof player.skinTextureValue === "string" && player.skinTextureValue.trim()) {
    setFields.skinTextureValue = player.skinTextureValue.trim();
    setFields.skinUpdatedAt = now;
    setFields.lastSkinFetchAt = now;
  }
  if (typeof player.skinTextureSignature === "string" && player.skinTextureSignature.trim()) {
    setFields.skinTextureSignature = player.skinTextureSignature.trim();
    setFields.skinUpdatedAt = now;
  }
  if (player.skinProvider === "mojang" || player.skinProvider === "elyby" || player.skinProvider === "offline" || player.skinProvider === "unknown") {
    setFields.skinProvider = player.skinProvider;
    setFields.skinUpdatedAt = now;
  }
  if (player.platform === "java" || player.platform === "bedrock") {
    setFields.platform = player.platform;
    setFields.xuid = typeof player.xuid === "string" && player.xuid.trim() ? player.xuid.trim() : null;
    setFields.floodgateUuid = typeof player.floodgateUuid === "string" && player.floodgateUuid.trim() ? player.floodgateUuid.trim() : null;
  }
  if (player.minecraftType === "java" || player.minecraftType === "bedrock" || player.minecraftType === "cracked" || player.minecraftType === "unknown") {
    setFields.minecraftType = player.minecraftType;
  }
  if (typeof player.javaUuid === "string" && player.javaUuid.trim()) {
    setFields.javaUuid = player.javaUuid.trim();
  }
  if (typeof player.bedrockXuid === "string" && player.bedrockXuid.trim()) {
    setFields.bedrockXuid = player.bedrockXuid.trim();
  }
  if (player.skinModel === "classic" || player.skinModel === "slim") {
    setFields.skinModel = player.skinModel;
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
        ...(typeof player.skinTexture === "string" && player.skinTexture.trim() ? { skinTexture: player.skinTexture.trim(), skinUpdatedAt: now, lastSkinFetchAt: now } : {}),
        ...(typeof player.skinTextureValue === "string" && player.skinTextureValue.trim() ? { skinTextureValue: player.skinTextureValue.trim(), skinUpdatedAt: now, lastSkinFetchAt: now } : {}),
        ...(typeof player.skinTextureSignature === "string" && player.skinTextureSignature.trim() ? { skinTextureSignature: player.skinTextureSignature.trim(), skinUpdatedAt: now } : {}),
        ...(player.skinProvider === "mojang" || player.skinProvider === "elyby" || player.skinProvider === "offline" || player.skinProvider === "unknown" ? { skinProvider: player.skinProvider, skinUpdatedAt: now } : {}),
        ...(player.platform === "java" || player.platform === "bedrock"
          ? {
              platform: player.platform,
              xuid: typeof player.xuid === "string" && player.xuid.trim() ? player.xuid.trim() : null,
              floodgateUuid: typeof player.floodgateUuid === "string" && player.floodgateUuid.trim() ? player.floodgateUuid.trim() : null
            }
          : {}),
        ...(player.minecraftType === "java" || player.minecraftType === "bedrock" || player.minecraftType === "cracked" || player.minecraftType === "unknown" ? { minecraftType: player.minecraftType } : {}),
        ...(typeof player.javaUuid === "string" && player.javaUuid.trim() ? { javaUuid: player.javaUuid.trim() } : {}),
        ...(typeof player.bedrockXuid === "string" && player.bedrockXuid.trim() ? { bedrockXuid: player.bedrockXuid.trim() } : {}),
        ...(player.skinModel === "classic" || player.skinModel === "slim" ? { skinModel: player.skinModel } : {}),
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
  eventId: string;
  killerUuid: string;
  killerUsername: string;
  victimUuid: string;
  victimUsername: string;
  season: number;
  timestamp: string;
  pointsAwarded?: number;
}): Promise<{ player: LeaderboardPlayer | null; duplicate: boolean }> {
  const db = await getDatabase();
  const pointsAwarded = event.pointsAwarded ?? 15;
  const now = new Date().toISOString();

  await Promise.all([
    upsertPlayer({ uuid: event.killerUuid, username: event.killerUsername, season: event.season }),
    upsertPlayer({ uuid: event.victimUuid, username: event.victimUsername, season: event.season })
  ]);

  const existingEvent = await db.collection("kill_events").findOne({ eventId: event.eventId }, { projection: { _id: 0 } });
  if (existingEvent) {
    console.log(`[LeaderboardHavoc] duplicate kill ignored eventId=${event.eventId}`);
    const existingKiller = await db.collection<PlayerDocument>(collectionName).findOne({ uuid: event.killerUuid, season: event.season }, { projection: { _id: 0 } });
    return { player: existingKiller ? toLeaderboardPlayer(existingKiller) : null, duplicate: true };
  }

  try {
    await db.collection("kill_events").insertOne({
      eventId: event.eventId,
      killerUuid: event.killerUuid,
      killerUsername: event.killerUsername,
      victimUuid: event.victimUuid,
      victimUsername: event.victimUsername,
      pointsAwarded,
      season: event.season,
      timestamp: event.timestamp,
      receivedAt: now
    });

    const killerUpdate = await db.collection<PlayerDocument>(collectionName).findOneAndUpdate(
      { uuid: event.killerUuid, season: event.season },
      {
        $inc: { kills: 1, points: pointsAwarded },
        $set: { username: event.killerUsername, lastSeen: now, updatedAt: now }
      },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    await db.collection("kill_events").updateOne({ eventId: event.eventId }, {
      $set: {
        killerUpdatedTotalPoints: killerUpdate?.points ?? pointsAwarded,
        processedAt: new Date().toISOString()
      }
    });

    console.log(`[LeaderboardHavoc] processed kill eventId=${event.eventId} killer=${event.killerUsername} +1 kill +${pointsAwarded} points victim=${event.victimUsername}`);
    return { player: killerUpdate ? toLeaderboardPlayer(killerUpdate) : null, duplicate: false };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      console.log(`[LeaderboardHavoc] duplicate kill ignored eventId=${event.eventId}`);
      const existingKiller = await db.collection<PlayerDocument>(collectionName).findOne({ uuid: event.killerUuid, season: event.season }, { projection: { _id: 0 } });
      return { player: existingKiller ? toLeaderboardPlayer(existingKiller) : null, duplicate: true };
    }
    throw error;
  }
}

export async function recordDeathAndUpdatePlayer(event: {
  eventId: string;
  playerUuid: string;
  playerUsername: string;
  season: number;
  timestamp: string;
  pointsDeducted?: number;
}): Promise<{ player: LeaderboardPlayer | null; duplicate: boolean }> {
  const db = await getDatabase();
  const pointsDeducted = event.pointsDeducted ?? 13;
  const now = new Date().toISOString();

  await upsertPlayer({ uuid: event.playerUuid, username: event.playerUsername, season: event.season });

  const existingEvent = await db.collection("death_events").findOne({ eventId: event.eventId }, { projection: { _id: 0 } });
  if (existingEvent) {
    console.log(`[LeaderboardHavoc] duplicate death ignored eventId=${event.eventId}`);
    const existingPlayer = await db.collection<PlayerDocument>(collectionName).findOne({ uuid: event.playerUuid, season: event.season }, { projection: { _id: 0 } });
    return { player: existingPlayer ? toLeaderboardPlayer(existingPlayer) : null, duplicate: true };
  }

  try {
    await db.collection("death_events").insertOne({
      eventId: event.eventId,
      playerUuid: event.playerUuid,
      playerUsername: event.playerUsername,
      pointsDeducted,
      season: event.season,
      timestamp: event.timestamp,
      receivedAt: now
    });

    const playerUpdate = await db.collection<PlayerDocument>(collectionName).findOneAndUpdate(
      { uuid: event.playerUuid, season: event.season },
      {
        $inc: { deaths: 1, points: -pointsDeducted },
        $set: { username: event.playerUsername, lastSeen: now, updatedAt: now }
      },
      { returnDocument: "after", projection: { _id: 0 } }
    );

    await db.collection("death_events").updateOne({ eventId: event.eventId }, {
      $set: {
        updatedTotalPoints: playerUpdate?.points ?? -pointsDeducted,
        processedAt: new Date().toISOString()
      }
    });

    console.log(`[LeaderboardHavoc] processed death eventId=${event.eventId} player=${event.playerUsername} +1 death -${pointsDeducted} points`);
    return { player: playerUpdate ? toLeaderboardPlayer(playerUpdate) : null, duplicate: false };
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      console.log(`[LeaderboardHavoc] duplicate death ignored eventId=${event.eventId}`);
      const existingPlayer = await db.collection<PlayerDocument>(collectionName).findOne({ uuid: event.playerUuid, season: event.season }, { projection: { _id: 0 } });
      return { player: existingPlayer ? toLeaderboardPlayer(existingPlayer) : null, duplicate: true };
    }
    throw error;
  }
}

function isDuplicateKeyError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === 11000;
}

function toLeaderboardPlayer(player: WithId<PlayerDocument> | PlayerDocument): LeaderboardPlayer {
  const playtimeHours = player.playtimeHours ?? player.hoursOfGameplay ?? 0;
  return {
    uuid: player.uuid,
    username: player.username,
    platform: player.platform ?? "java",
    minecraftType: player.minecraftType ?? player.platform ?? "unknown",
    javaUuid: player.javaUuid ?? (player.platform === "java" ? player.uuid : ""),
    bedrockXuid: player.bedrockXuid ?? player.xuid ?? "",
    xuid: player.xuid ?? "",
    floodgateUuid: player.floodgateUuid ?? "",
    skinUrl: player.skinUrl ?? "",
    skinTexture: player.skinTexture ?? "",
    skinTextureValue: player.skinTextureValue ?? "",
    skinTextureSignature: player.skinTextureSignature ?? "",
    skinProvider: player.skinProvider ?? "unknown",
    skinModel: player.skinModel ?? "classic",
    skinUpdatedAt: player.skinUpdatedAt,
    lastSkinFetchAt: player.lastSkinFetchAt,
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

async function cacheResolvedSkin(player: LeaderboardPlayer): Promise<LeaderboardPlayer> {
  const now = new Date().toISOString();
  const cachedSkinUrl = typeof player.skinUrl === "string" && player.skinUrl.trim() ? player.skinUrl.trim() : "";
  const cachedTexture = typeof player.skinTexture === "string" && player.skinTexture.trim() ? player.skinTexture.trim() : "";
  const cachedTextureValue = typeof player.skinTextureValue === "string" && player.skinTextureValue.trim() ? player.skinTextureValue.trim() : "";

  if (cachedSkinUrl || cachedTexture) {
    return player;
  }

  if (cachedTextureValue) {
    const decodedSkinUrl = skinUrlFromTextureValue(cachedTextureValue);
    const decodedModel = skinModelFromTextureValue(cachedTextureValue);
    if (decodedSkinUrl) {
      await updateCachedSkin(player, {
        skinUrl: decodedSkinUrl,
        ...(decodedModel ? { skinModel: decodedModel } : {}),
        skinProvider: player.skinProvider === "unknown" ? "offline" : player.skinProvider,
        skinUpdatedAt: now,
        lastSkinFetchAt: now
      });
      return { ...player, skinUrl: decodedSkinUrl, skinModel: decodedModel ?? player.skinModel, skinProvider: player.skinProvider === "unknown" ? "offline" : player.skinProvider, skinUpdatedAt: now, lastSkinFetchAt: now };
    }
  }

  if (!shouldFetchSkin(player.lastSkinFetchAt)) {
    return player;
  }

  const savedJavaUuid = normalizeUuid(player.javaUuid || "");
  if (savedJavaUuid) {
    const resolved = await fetchMojangSkinByUuid(savedJavaUuid);
    const skinUrl = resolved?.skinUrl || `https://crafatar.com/skins/${savedJavaUuid}`;
    const fields = {
      skinUrl,
      javaUuid: savedJavaUuid,
      minecraftType: "java" as const,
      skinProvider: "mojang" as const,
      ...(resolved?.skinTextureValue ? { skinTextureValue: resolved.skinTextureValue } : {}),
      ...(resolved?.skinTextureSignature ? { skinTextureSignature: resolved.skinTextureSignature } : {}),
      ...(resolved?.skinModel ? { skinModel: resolved.skinModel } : {}),
      skinUpdatedAt: now,
      lastSkinFetchAt: now
    };
    await updateCachedSkin(player, fields);
    return { ...player, ...fields };
  }

  const mojangUuid = await resolveMojangUuidFromUsername(player);
  if (mojangUuid) {
    const resolved = await fetchMojangSkinByUuid(mojangUuid);
    const skinUrl = resolved?.skinUrl || `https://crafatar.com/skins/${mojangUuid}`;
    const fields = {
      skinUrl,
      javaUuid: mojangUuid,
      minecraftType: "java" as const,
      platform: "java" as const,
      skinProvider: "mojang" as const,
      ...(resolved?.skinTextureValue ? { skinTextureValue: resolved.skinTextureValue } : {}),
      ...(resolved?.skinTextureSignature ? { skinTextureSignature: resolved.skinTextureSignature } : {}),
      ...(resolved?.skinModel ? { skinModel: resolved.skinModel } : {}),
      skinUpdatedAt: now,
      lastSkinFetchAt: now
    };
    await updateCachedSkin(player, fields);
    return { ...player, ...fields };
  }

  const bedrockXuid = (player.bedrockXuid || player.xuid || "").trim();
  if (bedrockXuid) {
    const bedrockSkin = await fetchBedrockSkin(bedrockXuid);
    if (bedrockSkin?.skinUrl) {
      await updateCachedSkin(player, {
        bedrockXuid,
        minecraftType: "bedrock",
        skinUrl: bedrockSkin.skinUrl,
        skinTextureValue: bedrockSkin.value,
        skinModel: bedrockSkin.model,
        skinUpdatedAt: now,
        lastSkinFetchAt: now
      });
      return {
        ...player,
        bedrockXuid,
        minecraftType: "bedrock",
        skinUrl: bedrockSkin.skinUrl,
        skinTextureValue: bedrockSkin.value,
        skinModel: bedrockSkin.model,
        skinUpdatedAt: now,
        lastSkinFetchAt: now
      };
    }

    await updateCachedSkin(player, { bedrockXuid, minecraftType: "bedrock", lastSkinFetchAt: now });
    return { ...player, bedrockXuid, minecraftType: "bedrock", lastSkinFetchAt: now };
  }

  const elyBySkin = await fetchElyBySkin(player);
  if (elyBySkin?.skinUrl) {
    const fields = {
      skinUrl: elyBySkin.skinUrl,
      skinTextureValue: elyBySkin.skinTextureValue,
      skinTextureSignature: elyBySkin.skinTextureSignature,
      skinModel: elyBySkin.skinModel,
      skinProvider: "elyby" as const,
      skinUpdatedAt: now,
      lastSkinFetchAt: now
    };
    await updateCachedSkin(player, fields);
    return { ...player, ...fields };
  }

  const offlineSkin = await fetchConfiguredOfflineSkin(player);
  if (offlineSkin?.skinUrl) {
    const fields = {
      skinUrl: offlineSkin.skinUrl,
      skinTextureValue: offlineSkin.skinTextureValue,
      skinModel: offlineSkin.skinModel,
      skinProvider: "offline" as const,
      skinUpdatedAt: now,
      lastSkinFetchAt: now
    };
    await updateCachedSkin(player, fields);
    return { ...player, ...fields };
  }

  const inferredType = inferMinecraftType(player);
  await updateCachedSkin(player, { minecraftType: inferredType, lastSkinFetchAt: now });
  return { ...player, minecraftType: inferredType, lastSkinFetchAt: now };
}

async function updateCachedSkin(player: LeaderboardPlayer, fields: Partial<PlayerDocument>) {
  try {
    const db = await getDatabase();
    await db.collection<PlayerDocument>(collectionName).updateOne({ uuid: player.uuid, season: player.season }, { $set: fields });
  } catch {
  }
}

async function fetchBedrockSkin(xuid: string) {
  try {
    const response = await fetch(`https://api.geysermc.org/v2/skin/${encodeURIComponent(xuid)}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { value?: unknown; is_steve?: unknown };
    if (typeof payload.value !== "string" || !payload.value.trim()) {
      return null;
    }

    const skinUrl = skinUrlFromTextureValue(payload.value);
    if (!skinUrl) {
      return null;
    }

    return {
      skinUrl,
      value: payload.value,
      model: payload.is_steve === false ? ("slim" as const) : ("classic" as const)
    };
  } catch {
    return null;
  }
}

async function resolveMojangUuidFromUsername(player: LeaderboardPlayer) {
  if (!canUseMojangUsernameLookup(player)) {
    return null;
  }

  try {
    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(player.username)}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { id?: unknown; name?: unknown };
    const mojangUuid = typeof payload.id === "string" ? normalizeUuid(payload.id) : null;
    if (!mojangUuid) {
      return null;
    }

    const savedUuid = normalizeUuid(player.uuid);
    return !savedUuid || savedUuid === mojangUuid ? mojangUuid : null;
  } catch {
    return null;
  }
}

async function fetchMojangSkinByUuid(uuid: string) {
  try {
    const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${encodeURIComponent(uuid)}?unsigned=false`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { properties?: Array<{ name?: unknown; value?: unknown; signature?: unknown }> };
    const textures = payload.properties?.find((property) => property.name === "textures");
    if (typeof textures?.value !== "string") {
      return null;
    }

    const skinUrl = skinUrlFromTextureValue(textures.value);
    if (!skinUrl) {
      return null;
    }

    return {
      skinUrl,
      skinTextureValue: textures.value,
      skinTextureSignature: typeof textures.signature === "string" ? textures.signature : undefined,
      skinModel: skinModelFromTextureValue(textures.value) ?? "classic" as const
    };
  } catch {
    return null;
  }
}

async function fetchElyBySkin(player: LeaderboardPlayer) {
  if (!canUseElyByLookup(player)) {
    return null;
  }

  try {
    const response = await fetch(`https://skinsystem.ely.by/textures/signed/${encodeURIComponent(player.username)}`, { cache: "no-store" });
    if (response.status === 204 || response.status === 404 || !response.ok) {
      return null;
    }

    const payload = (await response.json()) as { properties?: Array<{ name?: unknown; value?: unknown; signature?: unknown }> };
    const textures = payload.properties?.find((property) => property.name === "textures");
    if (typeof textures?.value !== "string") {
      return null;
    }

    const skinUrl = skinUrlFromTextureValue(textures.value);
    if (!skinUrl) {
      return null;
    }

    return {
      skinUrl,
      skinTextureValue: textures.value,
      skinTextureSignature: typeof textures.signature === "string" ? textures.signature : undefined,
      skinModel: skinModelFromTextureValue(textures.value) ?? "classic" as const
    };
  } catch {
    return null;
  }
}

async function fetchConfiguredOfflineSkin(player: LeaderboardPlayer) {
  const template = process.env.OFFLINE_SKIN_PROVIDER_URL || process.env.LAUNCHER_SKIN_PROVIDER_URL || process.env.NEXT_PUBLIC_OFFLINE_SKIN_PROVIDER_URL;
  if (!template || !canUseOfflineLookup(player)) {
    return null;
  }

  try {
    const response = await fetch(expandSkinProviderTemplate(template, player), { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.startsWith("image/")) {
      return { skinUrl: response.url, skinModel: "classic" as const };
    }

    const payload = (await response.json()) as { skinUrl?: unknown; url?: unknown; skinTexture?: unknown; textureValue?: unknown; skinTextureValue?: unknown; model?: unknown };
    const textureValue = typeof payload.skinTextureValue === "string" ? payload.skinTextureValue : typeof payload.textureValue === "string" ? payload.textureValue : null;
    const skinUrl = typeof payload.skinUrl === "string" ? payload.skinUrl : typeof payload.url === "string" ? payload.url : typeof payload.skinTexture === "string" ? payload.skinTexture : textureValue ? skinUrlFromTextureValue(textureValue) : null;

    if (!skinUrl || !isUsableSkinUrl(skinUrl)) {
      return null;
    }

    return {
      skinUrl: normalizeSkinUrl(skinUrl),
      skinTextureValue: textureValue || undefined,
      skinModel: payload.model === "slim" || skinModelFromTextureValue(textureValue) === "slim" ? "slim" as const : "classic" as const
    };
  } catch {
    return null;
  }
}

function normalizeUuid(value?: string | null) {
  const normalized = (value || "").replace(/-/g, "").trim();
  return /^[0-9a-fA-F]{32}$/.test(normalized) ? normalized : null;
}

function canUseMojangUsernameLookup(player: LeaderboardPlayer) {
  const minecraftType = inferMinecraftType(player);
  const username = player.username.trim();
  if (minecraftType === "bedrock" || minecraftType === "cracked" || username.startsWith(".") || username.startsWith("*")) {
    return false;
  }

  return player.platform === "java" || minecraftType === "java";
}

function canUseElyByLookup(player: LeaderboardPlayer) {
  const minecraftType = inferMinecraftType(player);
  return player.skinProvider === "elyby" || minecraftType === "cracked";
}

function canUseOfflineLookup(player: LeaderboardPlayer) {
  const minecraftType = inferMinecraftType(player);
  return player.skinProvider === "offline" || minecraftType === "cracked" || minecraftType === "unknown";
}

function inferMinecraftType(player: LeaderboardPlayer): "java" | "bedrock" | "cracked" | "unknown" {
  if (player.minecraftType === "java" || player.minecraftType === "bedrock" || player.minecraftType === "cracked") {
    return player.minecraftType;
  }

  if (player.platform === "bedrock" || player.username.startsWith(".") || player.username.startsWith("*") || player.bedrockXuid || player.xuid) {
    return "bedrock";
  }

  if (player.platform === "java") {
    return "java";
  }

  return "unknown";
}

function expandSkinProviderTemplate(template: string, player: LeaderboardPlayer) {
  const values: Record<string, string> = {
    username: player.username,
    uuid: player.uuid,
    javaUuid: player.javaUuid || "",
    bedrockXuid: player.bedrockXuid || player.xuid || "",
    xuid: player.xuid || player.bedrockXuid || ""
  };

  return template.replace(/\{(username|uuid|javaUuid|bedrockXuid|xuid)\}/g, (_, key: string) => encodeURIComponent(values[key] || ""));
}

function isUsableSkinUrl(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("https://") || trimmed.startsWith("http://") || trimmed.startsWith("data:image/");
}

function normalizeSkinUrl(value: string) {
  return value.trim()
    .replace(/^http:\/\/textures\.minecraft\.net\//, "https://textures.minecraft.net/")
    .replace(/^http:\/\/ely\.by\//, "https://ely.by/");
}

function shouldFetchSkin(value?: string) {
  if (!value) {
    return true;
  }

  const lastFetch = new Date(value).getTime();
  return Number.isNaN(lastFetch) || Date.now() - lastFetch > 24 * 60 * 60 * 1000;
}
