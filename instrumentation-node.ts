// Separated from instrumentation.ts so the Edge Runtime bundle never has to resolve this Node-only module.
export async function register() {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await import("process");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
