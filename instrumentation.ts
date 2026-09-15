import type { Instrumentation } from "next";

// TEMPORARY diagnostic: production error responses omit the real message, so this
// logs the full server-side error (message, stack, digest, route) to stderr —
// visible via hPanel's Node.js app log viewer. Remove once /program's 500 is
// root-caused. console.error needs no Node-builtin import, so this stays safe
// to bundle for the Edge runtime too.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;
  console.error(
    "onRequestError:",
    JSON.stringify({ message, stack, digest, request, context }, null, 2),
  );
};
