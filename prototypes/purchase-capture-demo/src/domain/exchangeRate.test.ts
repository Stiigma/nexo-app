import { afterEach, describe, expect, it, vi } from "vitest";
import { createDemoExchangeRateProvider } from "./exchangeRate";

describe("createDemoExchangeRateProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a local editable demo value without calling network", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("Network should not be called."));
    const provider = createDemoExchangeRateProvider(
      () => new Date("2026-07-01T12:00:00.000Z"),
    );

    const quote = await provider.getUsdMxnRate();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(quote).toEqual({
      pair: "USD/MXN",
      rate: 18.25,
      label: "Tipo de cambio demo editable, no oficial.",
      source: "local-demo",
      retrievedAt: "2026-07-01T12:00:00.000Z",
    });
  });
});
