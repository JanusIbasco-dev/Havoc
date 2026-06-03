import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "havoc_leaderboard";

type MongoGlobal = typeof globalThis & {
  _havocMongoClientPromise?: Promise<MongoClient>;
  _havocMongoInitialized?: Promise<void>;
};

const mongoGlobal = globalThis as MongoGlobal;

export const clientPromise = {
  then<TResult1 = MongoClient, TResult2 = never>(
    onfulfilled?: ((value: MongoClient) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return getMongoClient().then(onfulfilled, onrejected);
  },
  catch<TResult = never>(onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null) {
    return getMongoClient().catch(onrejected);
  },
  finally(onfinally?: (() => void) | null) {
    return getMongoClient().finally(onfinally);
  },
  [Symbol.toStringTag]: "Promise"
} as Promise<MongoClient>;

export function getDatabaseName() {
  return databaseName;
}

export async function getMongoClient() {
  if (!uri || !uri.trim()) {
    throw new Error("MONGODB_URI is not configured. Add it to website/.env.local.");
  }

  if (!mongoGlobal._havocMongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000
    });

    mongoGlobal._havocMongoClientPromise = client.connect().catch((error) => {
      mongoGlobal._havocMongoClientPromise = undefined;
      throw new Error(`MongoDB connection failed: ${error instanceof Error ? error.message : String(error)}`);
    });
  }

  return mongoGlobal._havocMongoClientPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();
  const db = client.db(databaseName);
  await ensureCollections(db);
  return db;
}

export async function ensureCollections(db: Db) {
  if (!mongoGlobal._havocMongoInitialized) {
    mongoGlobal._havocMongoInitialized = initializeCollections(db).catch((error) => {
      mongoGlobal._havocMongoInitialized = undefined;
      throw new Error(`MongoDB initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    });
  }

  await mongoGlobal._havocMongoInitialized;
}

async function initializeCollections(db: Db) {
  const existingCollections = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((collection) => collection.name));

  for (const collectionName of ["players", "kill_events", "death_events", "seasons"]) {
    if (!existingCollections.has(collectionName)) {
      await db.createCollection(collectionName);
    }
  }

  await Promise.all([
    db.collection("players").createIndex({ uuid: 1, season: 1 }, { unique: true }),
    db.collection("players").createIndex({ username: 1, season: 1 }),
    db.collection("players").createIndex({ season: 1, points: -1, kills: -1, deaths: 1 }),
    db.collection("kill_events").createIndex({ timestamp: -1 }),
    db.collection("kill_events").createIndex({ killerUuid: 1, timestamp: -1 }),
    db.collection("kill_events").createIndex({ victimUuid: 1, timestamp: -1 }),
    db.collection("death_events").createIndex({ timestamp: -1 }),
    db.collection("death_events").createIndex({ playerUuid: 1, timestamp: -1 }),
    db.collection("seasons").createIndex({ season: 1 }, { unique: true }),
    db.collection("seasons").createIndex({ status: 1, season: -1 })
  ]);
}
