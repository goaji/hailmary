"use client"; // reads location.hash and keeps a data-target attribute in sync with it

import { useEffect } from "react";

function markTarget() {
  document.querySelectorAll("[data-target]").forEach((el) => el.removeAttribute("data-target"));
  document.getElementById(window.location.hash.slice(1))?.setAttribute("data-target", "");
}

// CSS :target never fires after a pushState-based arrival (what next-intl's Link uses) — RuleSection keys its highlight off this attribute instead, which this keeps in sync on mount and on every hashchange.
export function TargetRefresh() {
  useEffect(() => {
    markTarget();
    window.addEventListener("hashchange", markTarget);
    return () => window.removeEventListener("hashchange", markTarget);
  }, []);

  return null;
}
