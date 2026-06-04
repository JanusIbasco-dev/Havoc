export type LeaderboardPlayer = {
  uuid: string;
  username: string;
  platform?: "java" | "bedrock";
  minecraftType?: "java" | "bedrock" | "cracked" | "unknown";
  javaUuid?: string | null;
  bedrockXuid?: string | null;
  xuid?: string | null;
  floodgateUuid?: string | null;
  skinTextureUrl?: string | null;
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
  season: number;
  firstJoin?: string;
  firstJoinTimestamp?: string;
  lastSeen?: string;
  updatedAt?: string;
  rank?: number;
};

export type KillEventPayload = {
  killerUuid: string;
  killerUsername: string;
  victimUuid: string;
  victimUsername: string;
  pointsAwarded: number;
  killerUpdatedTotalPoints: number;
  timestamp: string;
};

export type DeathEventPayload = {
  playerUuid: string;
  playerUsername: string;
  pointsDeducted: number;
  timestamp: string;
};

export type PlayerHistoryEvent = {
  type: "kill" | "death";
  timestamp?: string;
  season?: number;
  opponentUuid?: string;
  opponentUsername?: string;
  pointsChanged?: number;
};

export type PlayerActivityEvent = {
  type: "kill" | "death" | "join";
  text: string;
  timestamp?: string;
  season?: number;
  opponentUuid?: string;
  opponentUsername?: string;
  pointsChanged?: number;
};

export type PlayerProfile = {
  player: LeaderboardPlayer;
  rank: number | null;
  kdRatio: string;
  recentActivity: PlayerActivityEvent[];
};
