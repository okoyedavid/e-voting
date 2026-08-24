export const PLATFORM_FEE_BPS = 500;

export function splitPayment(grossAmountMinor: number) {
  if (!Number.isSafeInteger(grossAmountMinor) || grossAmountMinor < 1) {
    throw new Error("Invalid monetary amount");
  }
  const platformFeeMinor = Math.round(
    (grossAmountMinor * PLATFORM_FEE_BPS) / 10_000,
  );
  return {
    grossAmountMinor,
    platformFeeMinor,
    organizerAmountMinor: grossAmountMinor - platformFeeMinor,
  };
}

export function formatMoney(amountMinor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}
