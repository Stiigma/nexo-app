import { describe, expect, it } from "vitest";
import config from "../vercel.json";

describe("Vercel routing", () => {
  it("proxies the fixed API path before filesystem and SPA fallback", () => {
    expect(config.routes).toEqual([
      {
        src: "/api/v1/(.*)",
        dest: "${BACKEND_ORIGIN}/api/v1/$1",
        env: ["BACKEND_ORIGIN"],
        transforms: [
          {
            type: "request.headers",
            op: "set",
            target: { key: "ngrok-skip-browser-warning" },
            args: "1",
          },
        ],
      },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ]);
  });
});
