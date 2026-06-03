"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { defaultSeason, seasons } from "@/lib/seasons";

export function SeasonDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSeason = searchParams.get("season") || defaultSeason;

  function selectSeason(value: string, locked: boolean) {
    if (locked) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("season", value);
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="neon-hover rounded-md border border-purple-400/40 bg-purple-950/30 px-4 py-2 text-sm font-bold text-purple-100"
      >
        Seasons
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-purple-400/40 bg-[#11111c] p-2 shadow-[0_0_30px_rgba(168,85,247,0.25)]">
          {seasons.map((season) => (
            <button
              key={season.value}
              type="button"
              disabled={season.locked}
              onClick={() => selectSeason(season.value, season.locked)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                season.locked
                  ? "cursor-not-allowed text-purple-200/30"
                  : activeSeason === season.value
                    ? "bg-purple-500/25 text-purple-100"
                    : "text-purple-100/75 hover:bg-purple-500/15 hover:text-purple-100"
              }`}
            >
              {season.label}
              {season.locked ? <span className="float-right text-xs">Locked</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
