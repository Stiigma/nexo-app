export type DemoExchangeRateQuote = {
  pair: "USD/MXN";
  rate: number;
  label: string;
  source: "local-demo";
  retrievedAt: string;
};

export type ExchangeRateProvider = {
  getUsdMxnRate(): Promise<DemoExchangeRateQuote>;
};

export function createDemoExchangeRateProvider(
  clock: () => Date = () => new Date(),
): ExchangeRateProvider {
  return {
    async getUsdMxnRate() {
      return {
        pair: "USD/MXN",
        rate: 18.25,
        label: "Tipo de cambio demo editable, no oficial.",
        source: "local-demo",
        retrievedAt: clock().toISOString(),
      };
    },
  };
}
