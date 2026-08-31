"use client"; // tracks window scroll position

import { useEffect, useState } from "react";
import styles from "./ScrollProgress.module.scss";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
    }

    // Reflects scroll restored by the browser on reload/back-nav, not just
    // the next scroll event.
    updateProgress();

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={styles.bar}
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
