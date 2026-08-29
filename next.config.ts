import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  sassOptions: {
    // Webpack's Sass loader honors this load path.
    includePaths: [path.join(__dirname, "styles")],
  },
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

const withNextIntl = createNextIntlPlugin("./i18n.ts");

export default withNextIntl(nextConfig);
