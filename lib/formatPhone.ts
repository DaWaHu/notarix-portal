export function digitsOnly(value: string | null | undefined): string {
  return String(value || "").replace(/\D/g, "");
}

export function formatPhone(value: string | null | undefined): string | null {
  const digits = digitsOnly(value);

  if (!digits) return null;

  if (digits.length === 11 && digits.startsWith("1")) {
    const trimmed = digits.slice(1);
    return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 6)}-${trimmed.slice(6, 10)}`;
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  return String(value || "").trim() || null;
}