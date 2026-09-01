"use client";

import useSWR from "swr";
import type { Game } from "@/types";
import { hasLiveGame } from "@/utils/liveGames";

export type ScoresResponse = {
  games: Game[];
  isLive: boolean;
  updatedAt: string | null;
};

const POLL_INTERVAL_MS = 15_000;

async function fetcher(url: string): Promise<ScoresResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`scores fetch failed: ${response.status}`);
  }
  return response.json();
}

// Polls our own /api/scores, never the third-party API. `enabled` gates whether polling starts at all; refreshInterval then stops it once the latest payload has no live game left.
export function useLiveScores(enabled: boolean) {
  return useSWR<ScoresResponse>(enabled ? "/api/scores" : null, fetcher, {
    refreshInterval: (latestData) => (hasLiveGame(latestData?.games) ? POLL_INTERVAL_MS : 0),
  });
}
