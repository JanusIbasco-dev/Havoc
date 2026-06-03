export type SeasonStatus = "starting_soon" | "active" | "ended";

export type SeasonDocument = {
  season: number;
  name: string;
  status: SeasonStatus;
  startsAt?: string;
  endsAt?: string;
  worldBorderStatus: string;
  worldBorderSize: number;
};
