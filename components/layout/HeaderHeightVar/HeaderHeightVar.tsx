"use client"; // measures the sticky header's rendered height via ResizeObserver

import { useEffect } from "react";

// SiteHeader's height isn't fixed (it wraps at narrow widths and grows
// again when the mobile nav opens — see SiteNav's .navRegionOpen), so
// anything that needs to sit just below the now-sticky header (currently
// ScrollProgress) reads this instead of a hardcoded pixel value.
export function HeaderHeightVar() {
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) {
      return;
    }

    function updateHeight() {
      document.documentElement.style.setProperty(
        "--header-height",
        `${header!.getBoundingClientRect().height}px`,
      );
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return null;
}
