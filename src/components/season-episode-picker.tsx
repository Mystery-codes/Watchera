"use client";

import { cn } from "@/lib/utils";

interface SeasonData {
  season: number;
  episodes: number;
}

interface SeasonEpisodePickerProps {
  seasons: SeasonData[];
  selectedSeason: number;
  selectedEpisode: number;
  onSeasonChange: (season: number) => void;
  onEpisodeChange: (episode: number) => void;
}

export function SeasonEpisodePicker({
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeChange,
}: SeasonEpisodePickerProps) {
  if (!seasons.length) return null;

  const currentSeason = seasons.find((s) => s.season === selectedSeason) ?? seasons[0];
  const episodeCount = currentSeason?.episodes ?? 1;

  return (
    <div className="space-y-4">
      {/* Season tabs */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Seasons
        </span>
        <div className="flex flex-wrap gap-2">
          {seasons.map((s) => (
            <button
              key={s.season}
              onClick={() => onSeasonChange(s.season)}
              className={cn(
                "rounded-md border-2 px-4 py-2 text-sm font-bold transition-all",
                selectedSeason === s.season
                  ? "border-primary bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_#7f040b]"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/60 hover:text-white"
              )}
            >
              {s.season}
            </button>
          ))}
        </div>
      </div>

      {/* Episode grid */}
      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Episodes — Season {selectedSeason}
        </span>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
          {Array.from({ length: episodeCount }, (_, i) => i + 1).map((ep) => (
            <button
              key={ep}
              onClick={() => onEpisodeChange(ep)}
              className={cn(
                "rounded-md border-2 px-3 py-2 text-center text-sm font-bold transition-all",
                selectedEpisode === ep
                  ? "border-primary bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_#7f040b]"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/60 hover:text-white"
              )}
            >
              {ep}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
