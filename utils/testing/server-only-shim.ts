// Vitest runs in plain Node, not Next's RSC bundling, so the real
// "server-only" package (which throws outside that context) is aliased to
// this no-op in vitest.config.mts. The real package still guards the
// actual app build — this shim only exists for the test runner.
export {};
