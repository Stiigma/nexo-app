import { describe, expect, it } from "vitest";
import { BASE_URL } from "./api-client";

describe("API base URL", () => {
  it("honors the configured backend URL during local development", () => {
    expect(BASE_URL).toBe("http://localhost:3000/api/v1");
  });
});
