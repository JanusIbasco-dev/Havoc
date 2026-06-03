export type SeasonOption = {
  label: string;
  value: string;
  locked: boolean;
};

export const seasons: SeasonOption[] = [
  { label: "Season 1", value: "Season 1", locked: false },
  { label: "Season 2", value: "Season 2", locked: true },
  { label: "Season 3", value: "Season 3", locked: true },
  { label: "Season 4", value: "Season 4", locked: true }
];

export const defaultSeason = seasons[0].value;

export function resolveSeason(value?: string | null) {
  const season = seasons.find((item) => item.value === value && !item.locked);
  return season?.value || defaultSeason;
}

export function resolveSeasonNumber(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value));
  }

  if (!value) {
    return 1;
  }

  const directNumber = Number(value);
  if (Number.isFinite(directNumber) && directNumber > 0) {
    return Math.floor(directNumber);
  }

  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 1;
}
