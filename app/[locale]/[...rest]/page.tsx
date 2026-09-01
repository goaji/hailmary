import { notFound } from "next/navigation";

// Next only runs a nested not-found.tsx boundary for an explicit notFound()
// thrown within a matched route — a URL that matches nothing at all falls
// through to the built-in default instead. This catch-all exists purely to
// give every otherwise-unmatched path under /[locale]/* something to match,
// so it can throw notFound() itself and trigger the real, styled,
// locale-aware app/[locale]/not-found.tsx.
export default function CatchAll(): never {
  notFound();
}
