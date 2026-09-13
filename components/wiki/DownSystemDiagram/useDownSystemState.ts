"use client";

import { useCallback, useState } from "react";

type DownSystemOutcome = "none" | "first-down" | "turnover-on-downs" | "touchdown";

type DownSystemState = {
  down: number; // 1-4
  seriesStart: number; // 0-100, yard the current set of downs began
  ballOn: number; // 0-100, current ball position
  firstDownLine: number; // 0-100, capped at 100 (goal line)
  lastOutcome: DownSystemOutcome;
};

const FIELD_MAX = 100;

function initialState(): DownSystemState {
  return { down: 1, seriesStart: 20, ballOn: 20, firstDownLine: 30, lastOutcome: "none" };
}

/** The diagram's whole state machine — one down system, independent of how it's drawn. */
export function useDownSystemState() {
  const [state, setState] = useState<DownSystemState>(initialState);

  const play = useCallback((yards: number) => {
    setState((prev) => {
      if (prev.lastOutcome === "turnover-on-downs" || prev.lastOutcome === "touchdown") {
        return prev; // frozen until reset — matches a real turnover/score ending the series
      }

      const ballOn = Math.min(FIELD_MAX, Math.max(0, prev.ballOn + yards));

      if (ballOn >= FIELD_MAX) {
        return { ...prev, ballOn, lastOutcome: "touchdown" };
      }

      if (ballOn >= prev.firstDownLine) {
        return {
          down: 1,
          seriesStart: ballOn,
          ballOn,
          firstDownLine: Math.min(FIELD_MAX, ballOn + 10),
          lastOutcome: "first-down",
        };
      }

      if (prev.down >= 4) {
        return { ...prev, ballOn, lastOutcome: "turnover-on-downs" };
      }

      return { ...prev, ballOn, down: prev.down + 1, lastOutcome: "none" };
    });
  }, []);

  const reset = useCallback(() => setState(initialState()), []);

  return {
    state,
    yardsToGo: Math.max(0, Math.round(state.firstDownLine - state.ballOn)),
    isFrozen: state.lastOutcome === "turnover-on-downs" || state.lastOutcome === "touchdown",
    play,
    reset,
  };
}
