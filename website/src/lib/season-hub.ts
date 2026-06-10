export type SeasonHubEntry = {
  id: string;
  title: string;
  heroTitle: string;
  logo: string;
  status: "ACTIVE" | "COMING SOON" | "ENDED";
  summary: string;
  description: string;
  championSteps: string[];
  rewardTitle: string;
  rewardDescription: string;
};

export const seasons: SeasonHubEntry[] = [
  {
    id: "season-1",
    title: "Season One",
    heroTitle: "HAVOC SMP SEASON 1",
    logo: "/S1logo.png",
    status: "ACTIVE",
    summary: "Earn points through PvP battles, climb the leaderboard, and become Champion.",
    description:
      "Fight your way to the top in Havoc SMP Season 1. Earn points by eliminating other players and climb the leaderboard. Every kill rewards points while every death can set you back. Form alliances, wage wars, conquer your enemies, and survive the chaos. At the end of the season, the player with the highest points will be crowned the Season Champion and earn a permanent place in Havoc history.",
    championSteps: [
      "Earn points by killing players.",
      "Avoid deaths to protect your ranking.",
      "Climb the leaderboard.",
      "Build alliances or wage war against other teams.",
      "Stay active throughout the season.",
      "Finish the season with the highest total points."
    ],
    rewardTitle: "Champion Reward",
    rewardDescription:
      "The player who finishes Season 1 with the highest point total will be crowned the Havoc Season Champion. Champions earn permanent recognition and secure their place in Havoc history."
  }
];

export function getSeasonById(id: string) {
  return seasons.find((season) => season.id === id) || null;
}
