"use client"; // reads/writes the selected team to localStorage and provides it via context

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { DEFAULT_TEAM, getTeam } from "@/utils/teams";
import styles from "./TeamColorProvider.module.scss";

const STORAGE_KEY = "hm.team";

type TeamColorContextValue = {
  teamId: string;
  setTeam: (teamId: string) => void;
};

type AccentStyle = CSSProperties & {
  "--accent-1": string;
  "--accent-2": string;
};

const TeamColorContext = createContext<TeamColorContextValue | null>(null);

type TeamColorProviderProps = {
  children: ReactNode;
};

export function TeamColorProvider({ children }: TeamColorProviderProps) {
  const [teamId, setTeamId] = useState(DEFAULT_TEAM);

  // Runs before paint, so a persisted team never flashes the default first.
  // localStorage is unavailable during SSR, so this can't be a lazy initial
  // state — it has to run client-side only, which is what this effect is for.
  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Safe here: this isn't the "derive state from a prop/other state" anti-pattern the rule targets — teamId has no other source of truth
      // to derive from during render, since localStorage can't be read outside an effect. This is a one-time sync on mount, not a value
      // recomputed on every render, so it doesn't cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTeamId(getTeam(stored).slug);
    }
  }, []);

  function setTeam(id: string) {
    const resolved = getTeam(id).slug;
    setTeamId(resolved);
    window.localStorage.setItem(STORAGE_KEY, resolved);
  }

  const team = getTeam(teamId);
  const accentStyle: AccentStyle = {
    "--accent-1": team.accent1,
    "--accent-2": team.accent2,
  };

  return (
    <TeamColorContext.Provider value={{ teamId, setTeam }}>
      <div className={styles.wrapper} style={accentStyle}>
        {children}
      </div>
    </TeamColorContext.Provider>
  );
}

export function useTeamColor(): TeamColorContextValue {
  const context = useContext(TeamColorContext);
  if (!context) {
    throw new Error("useTeamColor must be used within a TeamColorProvider");
  }
  return context;
}
