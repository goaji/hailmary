"use client"; // re-triggers native fragment targeting after a client-routed arrival

import { useEffect } from "react";

// history.pushState (what next-intl's Link uses) never runs the browser's fragment-target algorithm — reassigning the hash does.
export function TargetRefresh() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      return;
    }

    const alreadyTargeted = document.querySelector(":target")?.id === hash.slice(1);
    if (alreadyTargeted) {
      return;
    }

    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.location.hash = hash;
  }, []);

  return null;
}
