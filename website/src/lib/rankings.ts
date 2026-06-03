import type { LeaderboardPlayer } from "@/types/player";

export function sortPlayers(players: LeaderboardPlayer[]) {
  return [...players].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    if (b.kills !== a.kills) {
      return b.kills - a.kills;
    }
    return a.deaths - b.deaths;
  });
}

export function getPlayerRank(players: LeaderboardPlayer[], uuid: string) {
  const index = sortPlayers(players).findIndex((player) => player.uuid === uuid);
  return index >= 0 ? index + 1 : null;
}

export function getRankMap(players: LeaderboardPlayer[]) {
  return new Map(sortPlayers(players).map((player, index) => [player.uuid, index + 1]));
}

export function topBy(players: LeaderboardPlayer[], key: "kills" | "deaths" | "points" | "hoursOfGameplay" | "playtimeHours") {
  return [...players].sort((a, b) => (b[key] || 0) - (a[key] || 0))[0] || null;
}
