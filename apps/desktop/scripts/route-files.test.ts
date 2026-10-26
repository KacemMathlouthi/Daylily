import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROUTES = join(
  import.meta.dirname,
  "..",
  "src",
  "renderer",
  "src",
  "routes"
);

describe("the screens' route files", () => {
  // The router's tooling fills a route file it sees empty with a placeholder;
  // a file caught mid-write in development once lost a whole screen that way
  it.each(
    readdirSync(ROUTES).filter(
      (name) => name.endsWith(".tsx") && !name.startsWith("__")
    )
  )("%s holds its screen, not the router's placeholder", (name) => {
    const source = readFileSync(join(ROUTES, name), "utf8");
    expect(source).not.toContain("function RouteComponent");
    expect(source).not.toContain('Hello "/');
  });
});
