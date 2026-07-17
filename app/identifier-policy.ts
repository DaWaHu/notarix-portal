export type PermanentRecordKind = "ClientProfile" | "NotaryProfile" | "Order";

export type PermanentIdentifierInput = {
  kind: PermanentRecordKind;
  jurisdiction: string;
  effectiveDateUtc: Date;
  sequence: number;
};

const recordPrefixes: Record<PermanentRecordKind, "NSC" | "NSN" | "ORD"> = {
  ClientProfile: "NSC",
  NotaryProfile: "NSN",
  Order: "ORD",
};

export function normalizeJurisdictionCode(jurisdiction: string): string {
  const normalized = jurisdiction.trim().toUpperCase().replace(/[^A-Z]/g, "");
  return normalized.slice(0, 2).padEnd(2, "X");
}

export function formatYearMonthCode(effectiveDateUtc: Date): string {
  const year = String(effectiveDateUtc.getUTCFullYear()).slice(-2);
  const month = String(effectiveDateUtc.getUTCMonth() + 1).padStart(2, "0");
  return `${year}${month}`;
}

export function formatFourDigitSequence(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 9999) {
    throw new RangeError("Permanent identifier sequence must be 1 through 9999.");
  }

  return String(sequence).padStart(4, "0");
}

export function formatCompactAccountCode(input: Omit<PermanentIdentifierInput, "kind">): string {
  return [
    normalizeJurisdictionCode(input.jurisdiction),
    formatYearMonthCode(input.effectiveDateUtc),
    formatFourDigitSequence(input.sequence),
  ].join("");
}

export function formatPermanentRecordIdentifier(input: PermanentIdentifierInput): string {
  return [
    recordPrefixes[input.kind],
    normalizeJurisdictionCode(input.jurisdiction),
    formatYearMonthCode(input.effectiveDateUtc),
    formatFourDigitSequence(input.sequence),
  ].join("-");
}

export const identifierPolicyExamples = {
  clientProfile: "NSC-TX-2607-1234",
  clientCompactCode: "TX26071234",
  nextClientCompactCode: "TX26071235",
  notaryProfile: "NSN-NC-2607-0001",
  order: "ORD-NC-2607-0001",
} as const;
