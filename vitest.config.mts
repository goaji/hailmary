import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      "server-only": path.resolve(
        import.meta.dirname,
        "./utils/testing/server-only-shim.ts",
      ),
    },
  },
  test: {
    include: ["utils/**/*.test.ts"],
    environment: "node",
  },
});
