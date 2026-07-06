import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/** Absolute path to the @vibe11/kit templates directory. */
export function kitTemplatesDir(): string {
  const kitPkg = require.resolve("@vibe11/kit/package.json");
  return path.join(path.dirname(kitPkg), "templates");
}
