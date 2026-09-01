"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLiveScores } from "@/components/schedule/useLiveScores";
import styles from "./LiveScoreStatus.module.scss";

type LiveScoreStatusProps = {
  /** Whether the server already served real (non-fixture) data. */
  initialIsLive: boolean;
  /** Whether any game on this page was live/halftime at render time — gates whether it's worth polling for errors/staleness at all. */
  hasLiveGames: boolean;
};

const STALE_THRESHOLD_MS = 90_000;
const STALE_CHECK_INTERVAL_MS = 10_000;

// Same notice as the server-rendered empty-store case (step 2), reused
// here for two more cases a page load alone can't see: the client poll
// failing, or the store going stale mid-session.
export function LiveScoreStatus({ initialIsLive, hasLiveGames }: LiveScoreStatusProps) {
  const t = useTranslations("schedulePage");
  const { data, error } = useLiveScores(hasLiveGames);
  // 0 rather than Date.now(): an impure call isn't allowed directly during
  // render — the interval below corrects it within STALE_CHECK_INTERVAL_MS.
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), STALE_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const isStale = data?.updatedAt ? now - new Date(data.updatedAt).getTime() > STALE_THRESHOLD_MS : false;

  if (initialIsLive && !error && !isStale) {
    return null;
  }

  return <p className={styles.notice}>{t("liveUnavailableNotice")}</p>;
}
