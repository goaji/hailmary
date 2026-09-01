import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // next/image's optimizer 400s on any .svg src unless this is set. All
    // SVGs served here are our own (logos, placeholders) — none are
    // user-uploaded — so the usual XSS-via-SVG risk doesn't apply, but we
    // still keep the CSP/sandbox belt-and-suspenders Next recommends.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  sassOptions: {
    // loadPaths, not the legacy includePaths — modern Dart Sass silently ignores the old name.
    loadPaths: [path.join(__dirname, "styles")],
  },
  // Still used by `next dev` — the build (package.json) forces --webpack instead, after a Turbopack runtime EEXIST on Hostinger.
  turbopack: {
    // Turbopack ignores sassOptions.includePaths, so nested components'
    // `@use "variables" as v;` / `@use "mixins" as mix;` need an explicit
    // alias to resolve without ../../../ traversal.
    resolveAlias: {
      variables: "./styles/_variables.scss",
      mixins: "./styles/_mixins.scss",
    },
  },
};

const withNextIntl = createNextIntlPlugin("./i18n-request.ts"); // not i18n.ts — see i18n-request.ts for why

export default withNextIntl(nextConfig);
