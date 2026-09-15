// Separated from instrumentation.ts so the Edge Runtime bundle never has to resolve this Node-only module.
//
// Hostinger's Passenger runtime sometimes hasn't finished wiring up stdin when
// the process boots — the first ESM import of the "process" builtin lazily
// evaluates its `stdin` getter to build the module facade, and that throws
// `open EEXIST` if it lands before Passenger's pipe is ready. Retrying gives a
// real startup race a chance to clear; if the budget still runs out, stub
// `process.stdin` with an inert stream so the same crash can never resurface
// later on a real request — a web server has no legitimate use for real
// stdin, so this is a fully safe fallback, not a workaround with side effects.
export async function register() {
  const MAX_ATTEMPTS = 15;
  const RETRY_DELAY_MS = 300;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      await import("process");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  try {
    const { Readable } = await import("stream");
    const stub = new Readable({ read() {} });
    Object.defineProperty(stub, "isTTY", { value: false });
    Object.defineProperty(process, "stdin", {
      value: stub,
      configurable: true,
      writable: true,
      enumerable: true,
    });
  } catch {
    // Best-effort safety net — if even this fails, a later touch crashes exactly as before.
  }
}
