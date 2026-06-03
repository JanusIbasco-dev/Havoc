import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

const env = loadEnv("website/.env.local");
const uri = env.MONGODB_URI;
const databaseName = env.MONGODB_DB || "havoc_leaderboard";
const devPlayerPattern = /^(Codex|Test|RedirectTest|LiveRedirectTest)/i;
const activityCollections = ["activity", "activity_records", "player_activity"];

if (!uri) {
  throw new Error("MONGODB_URI is not configured.");
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });

try {
  await client.connect();
  const db = client.db(databaseName);
  const existingCollections = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((collection) => collection.name));

  const players = await db
    .collection("players")
    .find({ username: devPlayerPattern }, { projection: { _id: 0, uuid: 1, username: 1 } })
    .toArray();

  const uuids = [...new Set(players.map((player) => player.uuid).filter(Boolean))];
  const usernames = [...new Set(players.map((player) => player.username).filter(Boolean))];

  const playerResult = await db.collection("players").deleteMany({ username: devPlayerPattern });
  const eventQuery = {
    $or: [
      { killerUuid: { $in: uuids } },
      { victimUuid: { $in: uuids } },
      { playerUuid: { $in: uuids } },
      { killerUsername: { $in: usernames } },
      { victimUsername: { $in: usernames } },
      { playerUsername: { $in: usernames } }
    ]
  };
  const killResult = await db.collection("kill_events").deleteMany(eventQuery);
  const deathResult = await db.collection("death_events").deleteMany(eventQuery);

  const activityResults = [];
  for (const collectionName of activityCollections) {
    if (!existingCollections.has(collectionName)) {
      continue;
    }

    const result = await db.collection(collectionName).deleteMany({
      $or: [
        { uuid: { $in: uuids } },
        { playerUuid: { $in: uuids } },
        { username: { $in: usernames } },
        { playerUsername: { $in: usernames } }
      ]
    });
    activityResults.push([collectionName, result.deletedCount]);
  }

  const remainingPlayers = await db
    .collection("players")
    .find({}, { projection: { _id: 0, uuid: 1, username: 1, season: 1, points: 1 } })
    .sort({ points: -1, username: 1 })
    .toArray();

  console.log(JSON.stringify({
    matchedPlayers: players,
    deleted: {
      players: playerResult.deletedCount,
      killEvents: killResult.deletedCount,
      deathEvents: deathResult.deletedCount,
      activity: Object.fromEntries(activityResults)
    },
    remainingPlayers
  }, null, 2));
} finally {
  await client.close();
}

function loadEnv(path) {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}
