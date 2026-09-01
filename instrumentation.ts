// Best-effort: Hostinger's Passenger runtime sometimes hasn't finished wiring up stdin when the process boots, and the first ESM import of a Node builtin throws `open EEXIST` if it lands in that window — retrying (in instrumentation-node.ts) before real requests arrive lets a later successful attempt get cached for good.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await (await import("./instrumentation-node")).register();
  }
}
