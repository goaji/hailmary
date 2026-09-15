const { Readable } = require("node:stream");

// Hostinger Passenger can expose an invalid stdin descriptor. Next's first
// ESM import of node:process evaluates process.stdin and fails with EEXIST.
// The app never reads stdin, so install an inert stream before loading Next.
const stdin = new Readable({ read() {} });
Object.defineProperty(process, "stdin", {
  value: stdin,
  configurable: true,
  enumerable: true,
  writable: true,
});

if (process.argv[2] !== "start") {
  process.argv.splice(2, 0, "start");
}
require("next/dist/bin/next");
