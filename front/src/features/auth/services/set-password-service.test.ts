import { beforeEach, describe, expect, it, vi } from "vitest";

const { get, post } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/common/services/api-client", () => ({
  api: { get, post },
}));

import { checkEmail } from "./set-password-service";

describe("set-password service", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });

  it("calls the backend check-email GET route with a query parameter", async () => {
    get.mockResolvedValue({ message: "ok" });

    await checkEmail("admin@nexo.com");

    expect(get).toHaveBeenCalledWith("/auth/check-email", {
      email: "admin@nexo.com",
    });
    expect(post).not.toHaveBeenCalled();
  });
});
